import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Discussion from "../../components/Discussion";
import { SkeletonBlock } from "../../components/Skeletons";

const EducatorDiscussion = () => {
	const { courseId } = useParams();
	const { backendUrl, getToken, isEducator, navigate } = useContext(AppContext);
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);

	// Fetch just enough course info (title) to head the page — access control
	// itself is enforced server-side on every discussion request regardless.
	useEffect(() => {
		if (!isEducator) return;

		const fetchCourse = async () => {
			setLoading(true);
			try {
				const token = await getToken();
				const { data } = await axios.get(backendUrl + "/api/educator/courses", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (data.success) {
					const match = data.courses.find((c) => c._id === courseId);
					if (!match) {
						toast.error("You don't have access to this course's discussion");
						navigate("/educator/my-courses");
						return;
					}
					setCourse(match);
				} else {
					toast.error(data.message);
				}
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchCourse();
	}, [isEducator, courseId]);

	return (
		<div className="min-h-screen flex flex-col items-start md:p-8 p-4 pt-8 w-full">
			<div className="w-full max-w-3xl">
				{loading ? (
					<div className="space-y-4 w-full">
						<div className="skeleton h-6 w-64 rounded" />
						<SkeletonBlock height={384} />
					</div>
				) : course ? (
					<>
						<button
							onClick={() => navigate("/educator/my-courses")}
							className="text-sm text-gray-500 mb-3"
						>
							← Back to My Courses
						</button>
						<h1 className="text-lg font-medium text-gray-800 mb-4">
							Discussion — {course.courseTitle}
						</h1>
						<Discussion courseId={courseId} />
					</>
				) : null}
			</div>
		</div>
	);
};

export default EducatorDiscussion;
