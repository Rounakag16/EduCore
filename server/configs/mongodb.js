import mongoose from "mongoose";

// Connecting to database
const connectDB = async () => {
	mongoose.connection.on("connected", () => {
		console.log("Database connected");
	});

	await mongoose.connect(process.env.MONGODB_URI, {
		dbName: process.env.MONGODB_DB_NAME,
	});
};

export default connectDB;
