import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import LeftSection from "../../components/student/CourseDetails/LeftSection";
import RightSection from "../../components/student/CourseDetails/RightSection";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
	const { id } = useParams();

	const [playerData, setPlayerData] = useState(null);
	const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

	const { courseData, setCourseData, backendUrl, userData, getToken } = useContext(AppContext);

	//Fetch course data
	const fetchCourseData = async () => {
		try {
			const { data } = await axios.get(backendUrl + "/api/course/" + id);
			if (data.success) {
				setCourseData(data.courseData);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Buy course
	const enrollCourse = async () => {
		try {
			if (!userData) {
				return toast.warn("Login to Enroll");
			}
			if (isAlreadyEnrolled) {
				return toast.warn("Already Enrolled");
			}

			const token = await getToken();
			const { data } = await axios.post(
				backendUrl + "/api/user/purchase",
				{
					courseId: courseData._id,
				},
				{},
			);

			if (data.success) {
				const { session_url } = data;
				window.location.replace(session_url);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	useEffect(() => {
		fetchCourseData();
	}, []);

	useEffect(() => {
		if (userData && courseData) {
			setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
		}
	}, [userData, courseData]);

	return courseData ? (
		<div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
			<div className="absolute top-0 left-0 w-full h-section-height z-1 bg-gradient-to-b from-cyan-100/70"></div>
			<LeftSection playerData={playerData} setPlayerData={setPlayerData} />
			<RightSection
				playerData={playerData}
				setPlayerData={setPlayerData}
				isAlreadyEnrolled={isAlreadyEnrolled}
				setIsAlreadyEnrolled={setIsAlreadyEnrolled}
				enrollCourse={enrollCourse}
			/>
		</div>
	) : (
		<Loading />
	);
};

export default CourseDetails;
