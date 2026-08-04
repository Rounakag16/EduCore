import { clerkClient } from "@clerk/express";

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req, res, next) => {
	try {
		const { userId } = await req.auth();
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const user = await clerkClient.users.getUser(userId);
		if (user.publicMetadata.role !== "educator") {
			return res.status(403).json({
				success: false,
				message: "Unauthorized Access",
			});
		}

		next();
	} catch (error) {
		return res.json({ success: false, message: error.message });
	}
};
