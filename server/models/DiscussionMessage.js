import mongoose from "mongoose";

const discussionMessageSchema = new mongoose.Schema(
	{
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
		userId: { type: String, ref: "User", required: true },
		userName: { type: String, required: true },
		userImage: { type: String, default: "" },
		message: { type: String, required: true, maxlength: 2000 },
	},
	{ timestamps: true },
);

discussionMessageSchema.index({ courseId: 1, createdAt: 1 });

const DiscussionMessage = mongoose.model("DiscussionMessage", discussionMessageSchema);

export default DiscussionMessage;
