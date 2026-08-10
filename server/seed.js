import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import Course from "./models/Course.js";

const MONGODB_URI = process.env.MONGODB_URI;

// Your current educator account
const EDUCATOR_ID = "6a79fbf7f67752ddc38845e25";

const YOUTUBE_URL = "https://youtu.be/tWJEuzE9vts";

// Static thumbnails served by Vite from client/public
const thumbnails = Array.from(
	{ length: 25 },
	(_, index) => `/thumbnails/thumbnail_${index + 1}.png`,
);

const courses = [
	{
		courseTitle: "Complete MERN Stack Development",
		courseDescription:
			"Build modern full-stack web applications using MongoDB, Express.js, React, and Node.js. Learn how to design APIs, connect databases, implement authentication, and deploy production-ready applications.",
		coursePrice: 4999,
		discount: 20,
		chapters: [
			"Introduction to Full Stack Development",
			"React Frontend Development",
			"Node.js and Express Backend",
			"MongoDB and Mongoose",
			"Authentication and Deployment",
		],
	},
	{
		courseTitle: "JavaScript Mastery for Modern Web Development",
		courseDescription:
			"Master JavaScript from fundamentals to advanced concepts including ES6+, asynchronous programming, APIs, modules, DOM manipulation, and modern development patterns.",
		coursePrice: 2999,
		discount: 25,
		chapters: [
			"JavaScript Fundamentals",
			"Functions and Advanced Concepts",
			"Objects and Arrays",
			"Asynchronous JavaScript",
			"Modern JavaScript Development",
		],
	},
	{
		courseTitle: "React.js Frontend Development",
		courseDescription:
			"Learn React.js by building practical user interfaces. Understand components, hooks, state management, routing, API integration, and modern React development practices.",
		coursePrice: 3499,
		discount: 20,
		chapters: [
			"React Fundamentals",
			"Components and Props",
			"State and Hooks",
			"React Router",
			"API Integration and Projects",
		],
	},
	{
		courseTitle: "Node.js and Express.js Backend Development",
		courseDescription:
			"Learn backend development with Node.js and Express.js. Build REST APIs, work with middleware, handle authentication, manage errors, and structure scalable backend applications.",
		coursePrice: 3299,
		discount: 20,
		chapters: [
			"Node.js Fundamentals",
			"Express.js",
			"REST API Development",
			"Authentication and Authorization",
			"Production Backend Development",
		],
	},
	{
		courseTitle: "MongoDB and Mongoose Complete Course",
		courseDescription:
			"Learn MongoDB and Mongoose from the ground up. Work with collections, documents, queries, schemas, relationships, validation, aggregation, and database design.",
		coursePrice: 2499,
		discount: 15,
		chapters: [
			"MongoDB Fundamentals",
			"CRUD Operations",
			"Mongoose and Schemas",
			"Aggregation and Relationships",
			"MongoDB in Full Stack Applications",
		],
	},
	{
		courseTitle: "Data Structures and Algorithms in JavaScript",
		courseDescription:
			"Strengthen your problem-solving skills with data structures and algorithms using JavaScript. Prepare for technical interviews and coding assessments with practical problems.",
		coursePrice: 3999,
		discount: 30,
		chapters: [
			"Algorithmic Thinking",
			"Arrays and Strings",
			"Linked Lists and Stacks",
			"Trees and Graphs",
			"Searching, Sorting and Interview Problems",
		],
	},
	{
		courseTitle: "Python Programming from Beginner to Advanced",
		courseDescription:
			"Learn Python programming through practical examples covering syntax, functions, object-oriented programming, modules, file handling, APIs, and real-world development.",
		coursePrice: 2999,
		discount: 25,
		chapters: [
			"Python Fundamentals",
			"Functions and Data Structures",
			"Object-Oriented Programming",
			"Files, Modules and APIs",
			"Python Projects",
		],
	},
	{
		courseTitle: "Python for Data Science",
		courseDescription:
			"Learn how Python is used in data science with practical programming concepts, data processing, visualization, and introductory data analysis workflows.",
		coursePrice: 3499,
		discount: 20,
		chapters: [
			"Python for Data Analysis",
			"NumPy Fundamentals",
			"Pandas",
			"Data Visualization",
			"Practical Data Analysis",
		],
	},
	{
		courseTitle: "Machine Learning with Python",
		courseDescription:
			"Understand the fundamentals of machine learning and build practical models using Python. Learn data preparation, supervised learning, evaluation, and model improvement.",
		coursePrice: 4999,
		discount: 25,
		chapters: [
			"Introduction to Machine Learning",
			"Data Preparation",
			"Regression Algorithms",
			"Classification Algorithms",
			"Model Evaluation and Projects",
		],
	},
	{
		courseTitle: "Artificial Intelligence Fundamentals",
		courseDescription:
			"Explore the fundamentals of artificial intelligence, machine learning, neural networks, generative AI, and the technologies shaping modern software development.",
		coursePrice: 3999,
		discount: 20,
		chapters: [
			"Introduction to AI",
			"Machine Learning Basics",
			"Neural Networks",
			"Generative AI",
			"Building AI Applications",
		],
	},
	{
		courseTitle: "Next.js Full Stack Development",
		courseDescription:
			"Build modern full-stack applications with Next.js. Learn routing, server-side rendering, API routes, authentication, database integration, and deployment.",
		coursePrice: 4499,
		discount: 20,
		chapters: [
			"Next.js Fundamentals",
			"Routing and Layouts",
			"Server and Client Components",
			"Database and Authentication",
			"Deployment and Production",
		],
	},
	{
		courseTitle: "TypeScript for JavaScript Developers",
		courseDescription:
			"Upgrade your JavaScript development skills with TypeScript. Learn types, interfaces, generics, utility types, classes, and TypeScript integration with modern applications.",
		coursePrice: 2499,
		discount: 20,
		chapters: [
			"TypeScript Fundamentals",
			"Types and Interfaces",
			"Functions and Generics",
			"Advanced TypeScript",
			"TypeScript with React and Node.js",
		],
	},
	{
		courseTitle: "Git and GitHub for Developers",
		courseDescription:
			"Master Git and GitHub workflows used by professional developers. Learn branching, merging, pull requests, collaboration, conflict resolution, and professional workflows.",
		coursePrice: 1499,
		discount: 15,
		chapters: [
			"Git Fundamentals",
			"Branches and Merging",
			"GitHub",
			"Pull Requests and Collaboration",
			"Professional Git Workflows",
		],
	},
	{
		courseTitle: "Docker and Containerization",
		courseDescription:
			"Learn Docker and containerization to package, run, and deploy applications consistently across development and production environments.",
		coursePrice: 2999,
		discount: 20,
		chapters: [
			"Introduction to Docker",
			"Images and Containers",
			"Dockerfiles",
			"Docker Compose",
			"Production Containers",
		],
	},
	{
		courseTitle: "AWS Cloud Computing Fundamentals",
		courseDescription:
			"Learn the fundamentals of Amazon Web Services and cloud computing. Understand core AWS services, deployment concepts, storage, networking, security, and scalability.",
		coursePrice: 3999,
		discount: 25,
		chapters: [
			"Cloud Computing Fundamentals",
			"AWS Core Services",
			"Storage and Databases",
			"Networking and Security",
			"Deployment and Scalability",
		],
	},
	{
		courseTitle: "DevOps and CI/CD Essentials",
		courseDescription:
			"Learn modern DevOps practices including continuous integration, continuous deployment, automation, version control, containers, and deployment pipelines.",
		coursePrice: 3499,
		discount: 20,
		chapters: [
			"Introduction to DevOps",
			"CI/CD Fundamentals",
			"Automation",
			"Containers and Deployment",
			"Building CI/CD Pipelines",
		],
	},
	{
		courseTitle: "HTML and CSS Modern Web Design",
		courseDescription:
			"Build responsive and accessible websites using modern HTML and CSS. Learn layouts, Flexbox, Grid, responsive design, animations, and practical UI development.",
		coursePrice: 1999,
		discount: 25,
		chapters: [
			"HTML Fundamentals",
			"CSS Fundamentals",
			"Flexbox and Grid",
			"Responsive Web Design",
			"Modern UI Projects",
		],
	},
	{
		courseTitle: "Tailwind CSS Modern UI Development",
		courseDescription:
			"Build beautiful responsive interfaces quickly using Tailwind CSS. Learn utility classes, responsive design, components, custom themes, and modern UI development.",
		coursePrice: 1999,
		discount: 20,
		chapters: [
			"Tailwind Fundamentals",
			"Responsive Design",
			"Layouts and Components",
			"Custom Themes",
			"Building Modern Interfaces",
		],
	},
	{
		courseTitle: "SQL and Database Management",
		courseDescription:
			"Learn SQL and relational database fundamentals including queries, joins, relationships, constraints, aggregation, indexing, and practical database design.",
		coursePrice: 2499,
		discount: 20,
		chapters: [
			"SQL Fundamentals",
			"Queries and Filtering",
			"Joins and Relationships",
			"Aggregation and Subqueries",
			"Database Design",
		],
	},
	{
		courseTitle: "Cybersecurity Fundamentals",
		courseDescription:
			"Understand essential cybersecurity concepts including common threats, authentication, encryption, network security, application security, and secure development practices.",
		coursePrice: 3499,
		discount: 25,
		chapters: [
			"Cybersecurity Fundamentals",
			"Common Security Threats",
			"Authentication and Encryption",
			"Network Security",
			"Secure Application Development",
		],
	},
	{
		courseTitle: "REST API Development",
		courseDescription:
			"Learn how to design and build reliable REST APIs for modern applications. Understand HTTP, API architecture, authentication, validation, error handling, and documentation.",
		coursePrice: 2499,
		discount: 20,
		chapters: [
			"HTTP and REST Fundamentals",
			"Designing REST APIs",
			"Authentication",
			"Validation and Error Handling",
			"API Documentation and Deployment",
		],
	},
	{
		courseTitle: "Full Stack Authentication with JWT",
		courseDescription:
			"Build secure authentication systems for full-stack applications using JWT. Learn registration, login, password hashing, protected routes, authorization, and token management.",
		coursePrice: 1999,
		discount: 15,
		chapters: [
			"Authentication Fundamentals",
			"Password Hashing",
			"JWT Authentication",
			"Protected Routes",
			"Authorization and Security",
		],
	},
	{
		courseTitle: "Web Development Interview Preparation",
		courseDescription:
			"Prepare for frontend and full-stack developer interviews with JavaScript, React, backend, databases, APIs, system design fundamentals, and practical interview questions.",
		coursePrice: 2999,
		discount: 30,
		chapters: [
			"JavaScript Interview Questions",
			"React Interview Questions",
			"Backend and API Questions",
			"Database Questions",
			"Practical Coding and System Design",
		],
	},
	{
		courseTitle: "Frontend System Design",
		courseDescription:
			"Learn how to approach frontend system design interviews and build scalable web interfaces. Understand architecture, performance, state management, caching, and component design.",
		coursePrice: 2999,
		discount: 20,
		chapters: [
			"Frontend Architecture",
			"Component Design",
			"State Management",
			"Performance and Caching",
			"Frontend System Design Problems",
		],
	},
	{
		courseTitle: "Generative AI for Developers",
		courseDescription:
			"Learn how developers can use generative AI to build modern applications. Explore LLM fundamentals, prompt engineering, APIs, AI-powered features, and practical development workflows.",
		coursePrice: 3999,
		discount: 25,
		chapters: [
			"Generative AI Fundamentals",
			"Large Language Models",
			"Prompt Engineering",
			"AI APIs",
			"Building AI-Powered Applications",
		],
	},
];

const createChapter = (chapterTitle, chapterOrder) => ({
	chapterId: crypto.randomUUID(),
	chapterOrder,
	chapterTitle,

	chapterContent: [
		{
			lectureId: crypto.randomUUID(),
			lectureOrder: 1,
			lectureTitle: `${chapterTitle} - Complete Lesson`,
			lectureDuration: 45,
			lectureUrl: YOUTUBE_URL,
			isPreviewFree: chapterOrder === 1,
		},
	],
});

const courseDocuments = courses.map((course, index) => ({
	courseTitle: course.courseTitle,
	courseDescription: course.courseDescription,

	// /client/public/thumbnails/thumbnail_1.jpg
	// becomes /thumbnails/thumbnail_1.jpg
	courseThumbnail: thumbnails[index],

	coursePrice: course.coursePrice,
	isPublished: true,
	discount: course.discount,

	courseContent: course.chapters.map((chapterTitle, chapterIndex) =>
		createChapter(chapterTitle, chapterIndex + 1),
	),

	// Empty initially, just like courses created from your frontend
	courseRatings: [],
	enrolledStudents: [],

	educator: EDUCATOR_ID,
}));

const seedCourses = async () => {
	try {
		if (!MONGODB_URI) {
			throw new Error(
				"MONGODB_URI is missing. Add your MongoDB Atlas connection string to server/.env",
			);
		}

		await mongoose.connect(MONGODB_URI);

		console.log("Connected to MongoDB Atlas.");

		const insertedCourses = await Course.insertMany(courseDocuments);

		console.log(`Successfully inserted ${insertedCourses.length} courses.`);

		insertedCourses.forEach((course, index) => {
			console.log(
				`${index + 1}. ${course.courseTitle} | ₹${course.coursePrice} | ${course.courseThumbnail}`,
			);
		});
	} catch (error) {
		console.error("Failed to seed courses:");
		console.error(error);
	} finally {
		await mongoose.disconnect();
		console.log("MongoDB connection closed.");
	}
};

seedCourses();
