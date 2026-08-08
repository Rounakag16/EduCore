import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

// Basic brute-force protection on credential endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many attempts, please try again later" },
});

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
