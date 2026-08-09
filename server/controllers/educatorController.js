import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import CourseProgress from "../models/CourseProgress.js";

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
	try {
		const userId = req.user.id;
		await User.findByIdAndUpdate(userId, { role: "educator" });

		res.json({ success: true, message: "You can publish course now" });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Add new course
export const addCourse = async (req, res) => {
	try {
		const { courseData } = req.body;
		const imageFile = req.file;
		const educatorId = req.user.id;

		if (!imageFile) {
			return res.status(400).json({
				success: false,
				message: "Thumbnail not attached",
			});
		}

		const parsedCourseData = JSON.parse(courseData);
		parsedCourseData.educator = educatorId;

		const imageUpload = await cloudinary.uploader.upload(imageFile.path);
		parsedCourseData.courseThumbnail = imageUpload.secure_url;
		await Course.create(parsedCourseData);

		return res.status(201).json({
			success: true,
			message: "Course added successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get educator courses
export const getEducatorCourses = async (req, res) => {
	try {
		const educator = req.user.id;

		const courses = await Course.find({ educator });
		res.json({ success: true, courses });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get educator dashboard data
export const educatorDashboardData = async (req, res) => {
	try {
		const educator = req.user.id;
		const courses = await Course.find({ educator });
		const totalCourses = courses.length;

		const courseIds = courses.map((course) => course._id);

		// calc total earnings
		const purchases = await Purchase.find({
			courseId: { $in: courseIds },
			status: "completed",
		});

		const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

		// Per-course earnings breakdown for the instructor earnings chart —
		// reuses the same `purchases` query above rather than hitting the DB again.
		const earningsByCourseId = {};
		for (const purchase of purchases) {
			const id = purchase.courseId.toString();
			earningsByCourseId[id] = (earningsByCourseId[id] || 0) + purchase.amount;
		}
		const courseEarnings = courses.map((course) => ({
			courseId: course._id,
			courseTitle: course.courseTitle,
			earnings: earningsByCourseId[course._id.toString()] || 0,
			students: course.enrolledStudents.length,
		}));

		// collect unique students
		const enrolledStudentsData = [];
		for (const course of courses) {
			const students = await User.find(
				{
					_id: { $in: course.enrolledStudents },
				},
				"name imageUrl",
			);

			students.forEach((student) => {
				enrolledStudentsData.push({
					courseTitle: course.courseTitle,
					student,
				});
			});
		}

		// Enrollments over the last 30 days, one point per day — built from
		// the same completed-purchases query above, no extra DB round-trip.
		const days = 30;
		const dayBuckets = new Map();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		for (let i = days - 1; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			dayBuckets.set(d.toISOString().slice(0, 10), 0);
		}
		for (const purchase of purchases) {
			const key = new Date(purchase.createdAt).toISOString().slice(0, 10);
			if (dayBuckets.has(key)) {
				dayBuckets.set(key, dayBuckets.get(key) + 1);
			}
		}
		const enrollmentTrend = Array.from(dayBuckets, ([date, count]) => ({ date, count }));

		// Overall completion rate: of every (student, course) enrollment pair,
		// what fraction has finished every lecture in that course.
		let completedPairs = 0;
		let totalPairs = 0;
		for (const course of courses) {
			const totalLectures = course.courseContent.reduce(
				(sum, chapter) => sum + chapter.chapterContent.length,
				0,
			);
			if (course.enrolledStudents.length === 0 || totalLectures === 0) continue;

			const progresses = await CourseProgress.find({
				courseId: course._id.toString(),
				userId: { $in: course.enrolledStudents },
			});

			totalPairs += course.enrolledStudents.length;
			completedPairs += progresses.filter(
				(p) => (p.lectureCompleted?.length || 0) >= totalLectures,
			).length;
		}
		const completionRate = totalPairs > 0 ? Math.round((completedPairs / totalPairs) * 100) : 0;

		res.json({
			success: true,
			dashboardData: {
				totalEarnings,
				enrolledStudentsData,
				totalCourses,
				courseEarnings,
				enrollmentTrend,
				completionRate,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get enrolled data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
	try {
		const educator = req.user.id;
		const courses = await Course.find({ educator });
		const courseIds = courses.map((course) => course._id);

		const purchases = await Purchase.find({
			courseId: { $in: courseIds },
			status: "completed",
		})
			.populate("userId", "name imageUrl")
			.populate("courseId", "courseTitle");

		const enrolledStudents = purchases.map((purchase) => ({
			student: purchase.userId,
			courseTitle: purchase.courseId.courseTitle,
			purchaseDate: purchase.createdAt,
		}));

		res.json({ success: true, enrolledStudents });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
