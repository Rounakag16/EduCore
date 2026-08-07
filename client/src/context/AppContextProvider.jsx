import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = (props) => {
	const backendUrl = import.meta.env.VITE_BACKEND_URL;
	const currency = import.meta.env.VITE_CURRENCY;
	const navigate = useNavigate();

	const { getToken } = useAuth();
	const { user } = useUser();

	const [allCourses, setAllCourses] = useState([]);
	const [coursesLoading, setCoursesLoading] = useState(true);
	const [isEducator, setIsEducator] = useState(false);
	const [courseData, setCourseData] = useState(null);
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(false);
	const [userData, setUserData] = useState(null);

	// Dark mode: persisted in localStorage, applied as a class on <html> so
	// Tailwind's `dark:` variant (see the @custom-variant in index.css) works.
	const [isDarkMode, setIsDarkMode] = useState(() => {
		const stored = localStorage.getItem("theme");
		if (stored) return stored === "dark";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	const toggleTheme = () => setIsDarkMode((prev) => !prev);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDarkMode);
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");
	}, [isDarkMode]);

	//Fetch all courses
	const fetchAllCourses = async () => {
		setCoursesLoading(true);
		try {
			const { data } = await axios.get(backendUrl + "/api/course/all");

			if (data.success) {
				setAllCourses(data.courses);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setCoursesLoading(false);
		}
	};

	//Fetch user data
	const fetchUserData = async () => {
		setIsEducator(user?.publicMetadata?.role === "educator");

		try {
			const token = await getToken();

			const { data } = await axios.get(backendUrl + "/api/user/data", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (data.success) {
				setUserData(data.user);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	//Fetch user enrolled courses
	const fetchUserEnrolledCourses = async () => {
		setEnrolledCoursesLoading(true);
		try {
			const token = await getToken();
			const { data } = await axios.get(backendUrl + "/api/user/enrolled-courses", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (data.success) {
				setEnrolledCourses([...data.enrolledCourses].reverse());
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setEnrolledCoursesLoading(false);
		}
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
	}, []);

	useEffect(() => {
		if (user) {
			fetchUserData();
			fetchUserEnrolledCourses();
		}
	}, [user]);

	const value = {
		currency,
		allCourses,
		coursesLoading,
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
		enrolledCoursesLoading,
		fetchUserEnrolledCourses,
		backendUrl,
		userData,
		setUserData,
		getToken,
		fetchAllCourses,
		isDarkMode,
		toggleTheme,
	};

	return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
