import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Shared by both event handlers below — marks a purchase complete and
// enrolls the student. Idempotent: safe to call more than once for the
// same purchaseId (Stripe can deliver the same event more than once, and
// a payment can trigger both checkout.session.completed AND
// payment_intent.succeeded).
const completePurchase = async (purchaseId) => {
	if (!purchaseId) {
		console.error("Webhook: no purchaseId in event metadata");
		return;
	}

	const purchaseData = await Purchase.findById(purchaseId);
	if (!purchaseData) {
		console.error(`Webhook: no Purchase found for id ${purchaseId}`);
		return;
	}
	if (purchaseData.status === "completed") {
		return; // already processed by an earlier/duplicate event
	}

	const userData = await User.findById(purchaseData.userId);
	const courseData = await Course.findById(purchaseData.courseId.toString());

	if (!userData || !courseData) {
		console.error(`Webhook: user or course missing for purchase ${purchaseId}`);
		return;
	}

	if (!courseData.enrolledStudents.includes(userData._id)) {
		courseData.enrolledStudents.push(userData._id);
		await courseData.save();
	}

	if (!userData.enrolledCourses.includes(courseData._id)) {
		userData.enrolledCourses.push(courseData._id);
		await userData.save();
	}

	purchaseData.status = "completed";
	await purchaseData.save();
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
		console.log(`Webhook signature verification failed.`, err.message);
		return res.sendStatus(400);
	}

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
