import express from "express";
import {
	addUserRating,
	getCourseCertificate,
	getUserCourseProgress,
	getUserData,
	purchaseCourse,
	updateProfileImage,
	updateUserCourseProgress,
	userEnrolledCourses,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const userRouter = express.Router();

userRouter.get("/data", requireAuth, getUserData);
userRouter.get("/enrolled-courses", requireAuth, userEnrolledCourses);
userRouter.post("/purchase", requireAuth, purchaseCourse);
userRouter.post("/update-profile-image", requireAuth, upload.single("image"), updateProfileImage);
userRouter.get("/certificate/:courseId", requireAuth, getCourseCertificate);

userRouter.post("/update-course-progress", requireAuth, updateUserCourseProgress);
userRouter.post("/get-course-progress", requireAuth, getUserCourseProgress);
userRouter.post("/add-rating", requireAuth, addUserRating);

export default userRouter;
