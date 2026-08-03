import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
	try {
		const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
		await whook.verify(req.body.toString(), {
			"svix-id": req.headers["svix-id"],
			"svix-timestamp": req.headers["svix-timestamp"],
			"svix-signature": req.headers["svix-signature"],
		});

		const { data, type } = req.body;

		switch (type) {
			case "user.created": {
				const userData = {
					_id: data.id,
					email: data.email_addresses[0].email_address,
					name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
					imageUrl: data.image_url,
				};
				console.log("User data create:", userData);

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
				console.log("User data update:", userData);

				await User.findByIdAndUpdate(data.id, userData);
				console.log("User updated:", userData);

				return res.json({ success: true });
			}

			case "user.deleted": {
				console.log("User data delete:", data.id);
				await User.findByIdAndDelete(data.id);
				console.log("User data deleted");
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
