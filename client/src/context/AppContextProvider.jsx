import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContextProvider = (props) => {
	const backendUrl = import.meta.env.VITE_BACKEND_URL;
	const currency = import.meta.env.VITE_CURRENCY;
	const navigate = useNavigate();

	// JWT auth: token lives in localStorage so it survives a refresh. Kept as
	// an async getToken() (like Clerk's) so every existing `await getToken()`
	// call site across the app keeps working unchanged.
	const [token, setToken] = useState(() => localStorage.getItem("token"));
	const getToken = async () => token;

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

	//Fetch the logged-in user's data (also doubles as "is this token still valid")
	const fetchUserData = async () => {
		try {
			const { data } = await axios.get(backendUrl + "/api/auth/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (data.success) {
				setUserData(data.user);
				setIsEducator(data.user.role === "educator" || data.user.role === "admin");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			if (error.response?.status === 401) {
				// Token expired/invalid — clear the stale session quietly
				logout();
			} else {
				toast.error(error.message);
			}
		}
	};

	// Register a new account
	const register = async (name, email, password) => {
		try {
			const { data } = await axios.post(backendUrl + "/api/auth/register", {
				name,
				email,
				password,
			});
			if (data.success) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
				setUserData(data.user);
				setIsEducator(data.user.role === "educator" || data.user.role === "admin");
				toast.success("Account created!");
				return true;
			}
			toast.error(data.message);
			return false;
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
			return false;
		}
	};

	// Log in with email + password
	const login = async (email, password) => {
		try {
			const { data } = await axios.post(backendUrl + "/api/auth/login", { email, password });
			if (data.success) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
				setUserData(data.user);
				setIsEducator(data.user.role === "educator" || data.user.role === "admin");
				toast.success("Welcome back!");
				return true;
			}
			toast.error(data.message);
			return false;
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
			return false;
		}
	};

	// Stateless JWT — logging out just means discarding the token client-side
	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUserData(null);
		setIsEducator(false);
		setEnrolledCourses([]);
		navigate("/");
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
		if (token) {
			fetchUserData();
			fetchUserEnrolledCourses();
		}
	}, [token]);

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
		token,
		login,
		register,
		logout,
	};

	return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
