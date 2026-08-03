import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import LeftSection from "../../components/student/CourseDetails/LeftSection";
import RightSection from "../../components/student/CourseDetails/RightSection";

const CourseDetails = () => {
	const { id } = useParams();

	const [playerData, setPlayerData] = useState(null);

	const { allCourses, courseData, setCourseData } = useContext(AppContext);

	//Fetch course data
	const fetchCourseData = async () => {
		const findCourse = allCourses.find((course) => course._id === id);
		setCourseData(findCourse);
	};

	useEffect(() => {
		fetchCourseData();
	}, [allCourses]);

	return courseData ? (
		<div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
			<div className="absolute top-0 left-0 w-full h-section-height z-1 bg-gradient-to-b from-cyan-100/70"></div>
			<LeftSection playerData={playerData} setPlayerData={setPlayerData} />
			<RightSection playerData={playerData} setPlayerData={setPlayerData} />
		</div>
	) : (
		<Loading />
	);
};

export default CourseDetails;
