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
import passport from "./configs/passport.js";

// Initalize
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
await connectDB();
await connectCloudinary();

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

// Listen
app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`);
});
