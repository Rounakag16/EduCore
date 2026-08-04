import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
	try {
		const { userId } = await req.auth();
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}
		await clerkClient.users.updateUserMetadata(userId, {
			publicMetadata: {
				role: "educator",
			},
		});

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
		const { userId } = await req.auth();
		const educatorId = userId;

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
		const { userId } = await req.auth();
		const educator = userId;

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
		const { userId } = await req.auth();
		const educator = userId;
		const courses = await Course.find({ educator });
		const totalCourses = courses.length;

		const courseIds = courses.map((course) => course._id);

		// calc total earnings
		const purchases = await Purchase.find({
			courseId: { $in: courseIds },
			status: "completed",
		});

		const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

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

		res.json({
			success: true,
			dashboardData: {
				totalEarnings,
				enrolledStudentsData,
				totalCourses,
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
		const { userId } = await req.auth();
		const educator = userId;
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
