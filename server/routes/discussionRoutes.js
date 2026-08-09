import express from "express";
import {
	getDiscussionMessages,
	postDiscussionMessage,
} from "../controllers/discussionController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const discussionRouter = express.Router();

discussionRouter.get("/:courseId", requireAuth, getDiscussionMessages);
discussionRouter.post("/:courseId", requireAuth, postDiscussionMessage);

export default discussionRouter;
