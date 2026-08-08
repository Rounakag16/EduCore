import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Stripe from "stripe";

// Get user data
export const getUserData = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);

		if (!user) {
			return res.json({ success: false, message: "User not found" });
		}

		res.json({ success: true, user });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// User enrolled courses
export const userEnrolledCourses = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).populate("enrolledCourses");

		res.json({ success: true, enrolledCourses: user.enrolledCourses });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Purchase course
export const purchaseCourse = async (req, res) => {
	try {
		const { courseId } = req.body;
		const origin = req.headers.origin.replace(/\/$/, "");
		const userId = req.user.id;
		const userData = await User.findById(userId);
		const courseData = await Course.findById(courseId);

		if (!userData || !courseData) {
			return res.json({ success: false, message: "Data not found" });
		}

		if (userData.enrolledCourses.includes(courseId)) {
			return res.json({
				success: false,
				message: "Already enrolled in this course",
			});
		}

		const purchaseData = {
			courseId: courseData._id,
			userId,
			amount: (
				courseData.coursePrice -
				(courseData.discount * courseData.coursePrice) / 100
			).toFixed(2),
		};

		const newPurchase = await Purchase.create(purchaseData);

		// Stripe gateway
		const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
		const currency = process.env.CURRENCY.toLowerCase();

		const line_items = [
			{
				price_data: {
					currency,
					product_data: {
						name: courseData.courseTitle,
					},
					unit_amount: Math.round(Number(newPurchase.amount) * 100),
				},
				quantity: 1,
			},
		];

		console.log(line_items, currency);

		const session = await stripeInstance.checkout.sessions.create({
			success_url: `${origin}/loading/my-enrollments`,
			cancel_url: `${origin}/`,
			line_items: line_items,
			mode: "payment",
			metadata: {
				purchaseId: newPurchase._id.toString(),
			},
		});

		res.json({ success: true, session_url: session.url });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Update course progress
export const updateUserCourseProgress = async (req, res) => {
	try {
		const userId = req.user.id;
		const { courseId, lectureId } = req.body;
		const progressData = await CourseProgress.findOne({ userId, courseId });

		if (progressData) {
			if (progressData.lectureCompleted.includes(lectureId)) {
				return res.json({ success: true, message: "Lecture Already Completed" });
			}

			progressData.lectureCompleted.push(lectureId);
			await progressData.save();
		} else {
			await CourseProgress.create({
				userId,
				courseId,
				lectureCompleted: [lectureId],
			});
		}

		res.json({ success: true, message: "Progress Updated" });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get course progress
export const getUserCourseProgress = async (req, res) => {
	try {
		const userId = req.user.id;
		const { courseId } = req.body;
		const progressData = await CourseProgress.findOne({ userId, courseId });
		res.json({ success: true, progressData });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Add rating to course
export const addUserRating = async (req, res) => {
	const userId = req.user.id;
	const { courseId, rating } = req.body;

	if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
		return res.json({ success: false, message: "Invalid Details" });
	}
	try {
		const course = await Course.findById(courseId);
		if (!course) {
			return res.json({ success: false, message: "Course not found" });
		}

		const user = await User.findById(userId);
		if (!user || !user.enrolledCourses.includes(courseId)) {
			return res.json({ success: false, message: "User not purchased course" });
		}

		const existingRatingIndex = course.courseRatings.findIndex((r) => r.userId == userId);
		if (existingRatingIndex > -1) {
			course.courseRatings[existingRatingIndex].rating = rating;
		} else {
			course.courseRatings.push({ userId, rating });
		}

		await course.save();
		res.json({ success: true, message: "Rating Added" });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
