import Course from "../models/Course.js";
import User from "../models/User.js";
import DiscussionMessage from "../models/DiscussionMessage.js";
import { getPusher } from "../configs/pusher.js";

// Shared access check: only the course's educator or an enrolled student can
// read or post in a course's discussion. Never trust the client to already
// know this — always re-verify against the DB.
const canAccessDiscussion = async (userId, course) => {
	if (!course) return false;
	if (course.educator?.toString() === userId) return true;
	return course.enrolledStudents.some((id) => id.toString() === userId);
};

export const getDiscussionMessages = async (req, res) => {
	try {
		const userId = req.user.id;
		const { courseId } = req.params;

		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ success: false, message: "Course not found" });
		}
		if (!(await canAccessDiscussion(userId, course))) {
			return res.status(403).json({
				success: false,
				message: "You must be enrolled in this course to view its discussion",
			});
		}

		// Last 100 messages, oldest first (natural chat reading order)
		const messages = await DiscussionMessage.find({ courseId })
			.sort({ createdAt: -1 })
			.limit(100)
			.lean();

		res.json({ success: true, messages: messages.reverse() });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const postDiscussionMessage = async (req, res) => {
	try {
		const userId = req.user.id;
		const { courseId } = req.params;
		const { message } = req.body;

		const trimmed = (message || "").trim();
		if (!trimmed) {
			return res.status(400).json({ success: false, message: "Message can't be empty" });
		}
		if (trimmed.length > 2000) {
			return res.status(400).json({ success: false, message: "Message is too long" });
		}

		const [course, user] = await Promise.all([Course.findById(courseId), User.findById(userId)]);

		if (!course) {
			return res.status(404).json({ success: false, message: "Course not found" });
		}
		if (!(await canAccessDiscussion(userId, course))) {
			return res.status(403).json({
				success: false,
				message: "You must be enrolled in this course to post in its discussion",
			});
		}

		const saved = await DiscussionMessage.create({
			courseId,
			userId,
			userName: user.name,
			userImage: user.imageUrl,
			message: trimmed,
		});

		const payload = {
			_id: saved._id,
			courseId: saved.courseId,
			userId: saved.userId,
			userName: saved.userName,
			userImage: saved.userImage,
			message: saved.message,
			createdAt: saved.createdAt,
		};

		// Broadcast to everyone currently viewing this course's discussion.
		// If Pusher isn't configured, the message is still saved — other
		// clients just won't see it until they refresh/re-fetch.
		const pusher = getPusher();
		if (pusher) {
			pusher.trigger(`course-${courseId}`, "new-message", payload).catch((err) => {
				console.error("[pusher] Failed to broadcast message:", err.message);
			});
		} else {
			console.log("[pusher] Not configured — message saved but not broadcast live");
		}

		res.status(201).json({ success: true, message: payload });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};
