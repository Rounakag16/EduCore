import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import discussionRouter from "./routes/discussionRoutes.js";
import passport from "./configs/passport.js";

// Initalize
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database — logged loudly instead of letting a missing/bad env
// var crash the whole serverless function with no explanation in the logs.
try {
	await connectDB();
} catch (error) {
	console.error("❌ MongoDB connection failed:", error.message);
	console.error("Check MONGODB_URI and MONGODB_DB_NAME are set correctly in your environment.");
}

try {
	await connectCloudinary();
} catch (error) {
	console.error("❌ Cloudinary connection failed:", error.message);
	console.error("Check CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY are set.");
}

// Middlewares
app.use(cors());
app.use(passport.initialize());

app.get("/", (req, res) => {
	res.send("API Working");
});

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);
app.use("/api/discussion", discussionRouter);

// Locally (and on non-Vercel hosts) we need a real listening server.
// On Vercel, the platform itself invokes the exported app per-request —
// calling app.listen() there is unnecessary and can itself throw inside
// the serverless sandbox, which is enough to crash the whole function.
if (!process.env.VERCEL) {
	app.listen(PORT, () => {
		console.log(`Server is running on ${PORT}`);
	});
}

export default app;
