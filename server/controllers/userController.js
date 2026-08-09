import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Stripe from "stripe";
import { v2 as cloudinary } from "cloudinary";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { sendEmail } from "../configs/email.js";

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

// Generate and stream a completion certificate as a PDF. Only issued once
// every lecture in the course has actually been marked complete — this is
// checked server-side (never trust a client-side "100%" claim for something
// that gets handed out as proof of completion).
export const getCourseCertificate = async (req, res) => {
	try {
		const userId = req.user.id;
		const { courseId } = req.params;

		const [user, course, progress] = await Promise.all([
			User.findById(userId),
			Course.findById(courseId).populate({ path: "educator", select: "name" }),
			CourseProgress.findOne({ userId, courseId }),
		]);

		if (!user || !course) {
			return res.status(404).json({ success: false, message: "Course not found" });
		}

		if (!user.enrolledCourses.includes(course._id)) {
			return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
		}

		const totalLectures = course.courseContent.reduce(
			(count, chapter) => count + chapter.chapterContent.length,
			0,
		);
		const completedCount = progress?.lectureCompleted?.length || 0;

		if (totalLectures === 0 || completedCount < totalLectures) {
			return res.status(400).json({
				success: false,
				message: "Course not yet fully completed",
			});
		}

		// Build the certificate PDF
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([842, 595]); // A4 landscape
		const { width, height } = page.getSize();

		const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
		const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

		const navy = rgb(0.11, 0.16, 0.32);
		const blue = rgb(0.15, 0.39, 0.92);
		const gray = rgb(0.4, 0.4, 0.42);

		// Border
		page.drawRectangle({
			x: 20,
			y: 20,
			width: width - 40,
			height: height - 40,
			borderColor: blue,
			borderWidth: 3,
		});
		page.drawRectangle({
			x: 30,
			y: 30,
			width: width - 60,
			height: height - 60,
			borderColor: navy,
			borderWidth: 1,
		});

		const centerText = (text, y, font, size, color = navy) => {
			const textWidth = font.widthOfTextAtSize(text, size);
			page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
		};

		centerText("EDUCORE", height - 90, fontBold, 22, blue);
		centerText("Certificate of Completion", height - 140, fontBold, 30, navy);
		centerText("This certifies that", height - 200, fontRegular, 14, gray);
		centerText(user.name, height - 240, fontBold, 26, navy);
		centerText("has successfully completed the course", height - 280, fontRegular, 14, gray);
		centerText(course.courseTitle, height - 320, fontBold, 20, blue);

		const educatorName = course.educator?.name || "EduCore Instructor";
		centerText(`Instructor: ${educatorName}`, height - 360, fontItalic, 12, gray);

		const completionDate = new Date().toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		centerText(`Completed on ${completionDate}`, height - 390, fontRegular, 12, gray);

		const pdfBytes = await pdfDoc.save();

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${course.courseTitle.replace(/[^a-z0-9]/gi, "_")}_certificate.pdf"`,
		);
		res.send(Buffer.from(pdfBytes));
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Update profile picture — falls back to the default avatar client-side if
// imageUrl is empty, so this is purely opt-in.
export const updateProfileImage = async (req, res) => {
	try {
		const userId = req.user.id;
		const imageFile = req.file;

		if (!imageFile) {
			return res.status(400).json({ success: false, message: "No image uploaded" });
		}

		const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
			folder: "profile-images",
		});

		const user = await User.findByIdAndUpdate(
			userId,
			{ imageUrl: imageUpload.secure_url },
			{ new: true },
		);

		res.json({ success: true, message: "Profile picture updated", user });
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

		let updatedLectureCompleted;

		if (progressData) {
			if (progressData.lectureCompleted.includes(lectureId)) {
				return res.json({ success: true, message: "Lecture Already Completed" });
			}

			progressData.lectureCompleted.push(lectureId);
			await progressData.save();
			updatedLectureCompleted = progressData.lectureCompleted;
		} else {
			const created = await CourseProgress.create({
				userId,
				courseId,
				lectureCompleted: [lectureId],
			});
			updatedLectureCompleted = created.lectureCompleted;
		}

		// If this was the last remaining lecture, send a completion email.
		// Fire-and-forget — never let an email failure affect the response.
		Course.findById(courseId)
			.then(async (course) => {
				if (!course) return;
				const totalLectures = course.courseContent.reduce(
					(count, chapter) => count + chapter.chapterContent.length,
					0,
				);
				if (totalLectures > 0 && updatedLectureCompleted.length === totalLectures) {
					const user = await User.findById(userId);
					if (user) {
						sendEmail({
							to: user.email,
							subject: `You completed ${course.courseTitle}! 🎉`,
							html: `
								<div style="font-family: sans-serif; max-width: 480px;">
									<h2>Nice work, ${user.name}!</h2>
									<p>You've finished every lecture in <strong>${course.courseTitle}</strong>.</p>
									<p>Head back to "My Enrollments" to download your certificate of completion.</p>
									<p style="color: #6b7280; font-size: 13px; margin-top: 24px;">— The EduCore Team</p>
								</div>
							`,
						});
					}
				}
			})
			.catch((err) => console.error("[email] Completion check failed:", err.message));

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
