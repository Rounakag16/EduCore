import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContextProvider = (props) => {
	const currency = import.meta.env.VITE_CURRENCY;
	const navigate = useNavigate();

	const [allCourses, setAllCourses] = useState([]);
	const [isEducator, setIsEducator] = useState(false);
	const [courseData, setCourseData] = useState(null);
	const [enrolledCourses, setEnrolledCourses] = useState([]);

	//Fetch all courses
	const fetchAllCourses = async () => {
		setAllCourses(dummyCourses);
	};

	//Fetch user enrolled courses
	const fetchUserEnrolledCourses = async () => {
		setEnrolledCourses(dummyCourses);
	};

	//Calcuate avg ratings
	const calculateRating = (course) => {
		if (course.courseRatings.length == 0) return 0;
		let totalRating = 0;
		course.courseRatings.forEach((rating) => {
			totalRating += rating.rating;
		});
		return totalRating / course.courseRatings.length;
	};

	//Calculate course chapter time
	const calculateChapterTime = (chapter) => {
		let time = 0;
		chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
		return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
	};

	//Calculate course duration
	const calculateCourseDuration = (course) => {
		let time = 0;
		course.courseContent.map((chapter) =>
			chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration)),
		);
		return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
	};

	//Calculate number of lectures in a course
	const calculateNumberOfLectures = (course) => {
		let totalLectures = 0;
		course.courseContent.forEach((chapter) => {
			if (Array.isArray(chapter.chapterContent)) {
				totalLectures += chapter.chapterContent.length;
			}
		});
		return totalLectures;
	};

	useEffect(() => {
		fetchAllCourses();
		fetchUserEnrolledCourses();
	}, []);

	const value = {
		currency,
		allCourses,
		courseData,
		setCourseData,
		navigate,
		calculateRating,
		isEducator,
		setIsEducator,
		calculateChapterTime,
		calculateCourseDuration,
		calculateNumberOfLectures,
		enrolledCourses,
		fetchUserEnrolledCourses,
	};

	return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
