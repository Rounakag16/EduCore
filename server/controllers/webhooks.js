import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import { sendEmail } from "../configs/email.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Shared by both event handlers below — marks a purchase complete and
// enrolls the student.
//
// This MUST be safe under concurrency: Stripe commonly fires both
// checkout.session.completed AND payment_intent.succeeded for the same
// payment within milliseconds of each other, so this can genuinely run
// twice in parallel for the same purchaseId. A "read status, check in JS,
// then save" pattern is NOT safe here — both concurrent calls can read
// status="pending" before either writes "completed", and both would then
// proceed to enroll the student, producing duplicate array entries. Every
// write below uses an atomic MongoDB operator specifically to close that gap.
const completePurchase = async (purchaseId) => {
	console.log(`[webhook] completePurchase called for purchaseId=${purchaseId}`);

	if (!purchaseId) {
		console.error("[webhook] ABORTED: no purchaseId in event metadata");
		return;
	}

	// Atomic compare-and-set: only the request that actually flips
	// pending -> completed gets a non-null result back. A concurrent/duplicate
	// call for the same purchaseId will find nothing to update and get null.
	const purchaseData = await Purchase.findOneAndUpdate(
		{ _id: purchaseId, status: { $ne: "completed" } },
		{ $set: { status: "completed" } },
	);

	if (!purchaseData) {
		console.log(
			`[webhook] Purchase ${purchaseId} already completed (or doesn't exist) — skipping ` +
				"(this is expected/normal when Stripe sends multiple events for one payment)",
		);
		return;
	}
	console.log(`[webhook] Purchase ${purchaseId} claimed for completion`);

	const userData = await User.findById(purchaseData.userId);
	const courseData = await Course.findById(purchaseData.courseId.toString());

	if (!userData) {
		console.error(`[webhook] ABORTED: no User found for id ${purchaseData.userId}`);
		return;
	}
	if (!courseData) {
		console.error(`[webhook] ABORTED: no Course found for id ${purchaseData.courseId}`);
		return;
	}

	// $addToSet is atomic and a no-op if the value is already present —
	// safe even if this somehow still ran more than once.
	await Promise.all([
		Course.updateOne({ _id: courseData._id }, { $addToSet: { enrolledStudents: userData._id } }),
		User.updateOne({ _id: userData._id }, { $addToSet: { enrolledCourses: courseData._id } }),
	]);
	console.log(`[webhook] Enrolled ${userData._id} in course ${courseData._id} ✅`);

	sendEmail({
		to: userData.email,
		subject: `You're enrolled in ${courseData.courseTitle}!`,
		html: `
			<div style="font-family: sans-serif; max-width: 480px;">
				<h2>Welcome aboard, ${userData.name}!</h2>
				<p>Your enrollment in <strong>${courseData.courseTitle}</strong> is confirmed.</p>
				<p>You can start learning right away from your "My Enrollments" page.</p>
				<p style="color: #6b7280; font-size: 13px; margin-top: 24px;">— The EduCore Team</p>
			</div>
		`,
	});
};

const failPurchase = async (purchaseId) => {
	if (!purchaseId) return;
	const purchaseData = await Purchase.findById(purchaseId);
	if (!purchaseData || purchaseData.status === "completed") return;
	purchaseData.status = "failed";
	await purchaseData.save();
};

export const stripeWebhooks = async (req, res) => {
	let event;
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!endpointSecret) {
		console.error("STRIPE_WEBHOOK_SECRET is not configured.");
		return res.status(500).send("Webhook secret not configured");
	}

	// Get the signature sent by Stripe
	const signature = req.headers["stripe-signature"];
	try {
		event = stripeInstance.webhooks.constructEvent(req.body, signature, endpointSecret);
	} catch (err) {
		console.log(`[webhook] Signature verification FAILED:`, err.message);
		console.log(
			"[webhook] This almost always means STRIPE_WEBHOOK_SECRET doesn't match the endpoint " +
				"that actually sent this request (e.g. using the Dashboard's secret while testing via " +
				"`stripe listen`, which issues its own separate secret — or vice versa).",
		);
		return res.sendStatus(400);
	}

	console.log(`[webhook] Received event: ${event.type} (id: ${event.id})`);

	try {
		switch (event.type) {
			// This is the event Stripe recommends listening for on one-time
			// Checkout payments — it fires as soon as checkout finishes,
			// straight from the Session object we set metadata on.
			case "checkout.session.completed": {
				const session = event.data.object;
				await completePurchase(session.metadata?.purchaseId);
				break;
			}

			// Kept as a redundant path in case the Stripe webhook endpoint is
			// only subscribed to payment_intent events, or as a backstop if
			// checkout.session.completed is ever missed. completePurchase()
			// is idempotent, so handling both is safe.
			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object;
				const sessions = await stripeInstance.checkout.sessions.list({
					payment_intent: paymentIntent.id,
				});
				await completePurchase(sessions.data[0]?.metadata?.purchaseId);
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object;
				await failPurchase(session.metadata?.purchaseId);
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object;
				const sessions = await stripeInstance.checkout.sessions.list({
					payment_intent: paymentIntent.id,
				});
				await failPurchase(sessions.data[0]?.metadata?.purchaseId);
				break;
			}

			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		// Acknowledge receipt of the event
		res.json({ received: true });
	} catch (error) {
		// Log loudly instead of failing silently — this is exactly the kind
		// of error that otherwise looks like "Stripe says success but the
		// DB never updates" with nothing in the logs to explain why.
		console.error("Webhook handler error:", error);
		res.status(500).json({ received: false, error: error.message });
	}
};
