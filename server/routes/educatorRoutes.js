import express from "express";
import {
	addCourse,
	educatorDashboardData,
	getEducatorCourses,
	getEnrolledStudentsData,
	updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { requireAuth, requireEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Any logged-in user can request to become an educator
educatorRouter.get("/update-role", requireAuth, updateRoleToEducator);
educatorRouter.post(
	"/add-course",
	requireAuth,
	requireEducator,
	upload.single("image"),
	addCourse,
);
educatorRouter.get("/courses", requireAuth, requireEducator, getEducatorCourses);
educatorRouter.get("/dashboard", requireAuth, requireEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", requireAuth, requireEducator, getEnrolledStudentsData);

export default educatorRouter;
