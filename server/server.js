import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

// Initalize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
await connectDB();

// Middlewares
app.use(cors());

// Routes
app.get("/", (req, res) => {
	res.send("API Working");
});

app.post("/clerk", express.json(), clerkWebhooks);

// Listen
app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`);
});
