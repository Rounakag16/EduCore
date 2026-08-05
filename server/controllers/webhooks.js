import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
	try {
		const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
		await whook.verify(req.body, {
			"svix-id": req.headers["svix-id"],
			"svix-timestamp": req.headers["svix-timestamp"],
			"svix-signature": req.headers["svix-signature"],
		});

		const payload = JSON.parse(req.body.toString());
		const { data, type } = payload;

		switch (type) {
			case "user.created": {
				const userData = {
					_id: data.id,
					email: data.email_addresses[0].email_address,
					name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
					imageUrl: data.image_url,
				};
				const createdUser = await User.create(userData);
				console.log("Created user:", createdUser);

				return res.json({ success: true });
			}

			case "user.updated": {
				const userData = {
					email: data.email_addresses[0].email_address,
					name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
					imageUrl: data.image_url,
				};
				await User.findByIdAndUpdate(data.id, userData);
				console.log("User updated:", userData);

				return res.json({ success: true });
			}

			case "user.deleted": {
				await User.findByIdAndDelete(data.id);
				console.log("User data deleted: ", data.id);
				return res.json({ success: true });
			}

			default:
				break;
		}
	} catch (err) {
		console.error("Webhook Error:", err);

		return res.status(500).json({
			success: false,
			message: err.message,
		});
	}
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async (req, res) => {
	console.log(process.env.STRIPE_SECRET_KEY);
	let event;
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (endpointSecret) {
		// Get the signature sent by Stripe
		const signature = req.headers["stripe-signature"];
		try {
			event = stripeInstance.webhooks.constructEvent(req.body, signature, endpointSecret);
		} catch (err) {
			console.log(`Webhook signature verification failed.`, err.message);
			return res.sendStatus(400);
		}
	}

	// Handle the event
	switch (event.type) {
		case "payment_intent.succeeded": {
			const paymentIntent = event.data.object;
			const paymentIntentId = paymentIntent.id;

			const session = await stripeInstance.checkout.sessions.list({
				payment_intent: paymentIntentId,
			});

			const { purchaseId } = session.data[0].metadata;

			const purchaseData = await Purchase.findById(purchaseId);
			const userData = await User.findById(purchaseData.userId);
			const courseData = await Course.findById(purchaseData.courseId.toString());

			courseData.enrolledStudents.push(userData._id);
			await courseData.save();

			userData.enrolledCourses.push(courseData._id);
			await userData.save();

			purchaseData.status = "completed";
			await purchaseData.save();

			console.log(session.id);
			console.log(session.payment_status);
			console.log(session.url);

			break;
		}

		case "payment_intent.payment_failed": {
			const paymentIntent = event.data.object;
			const paymentIntentId = paymentIntent.id;

			const session = await stripeInstance.checkout.sessions.list({
				payment_intent: paymentIntentId,
			});

			const { purchaseId } = session.data[0].metadata;
			const purchaseData = await Purchase.findById(purchaseId);

			purchaseData.status = "failed";
			await purchaseData.save();

			console.log(session.id);
			console.log(session.payment_status);
			console.log(session.url);

			break;
		}

		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	console.log(session.id);
	console.log(session.payment_status);
	console.log(session.url);

	// Return a res to acknowledge receipt of the event
	res.json({ received: true });
};
