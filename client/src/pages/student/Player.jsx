import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import Rating from "../../components/student/Rating";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const Player = () => {
	const [openSections, setOpenSections] = useState({});
	const [courseData, setCourseData] = useState(null);
	const [playerData, setPlayerData] = useState(null);
	const [progressData, setProgressData] = useState(null);
	const [initialRating, setInitialRating] = useState(null);

	const { courseId } = useParams();

	const {
		enrolledCourses,
		calculateChapterTime,
		backendUrl,
		getToken,
		userData,
		fetchUserEnrolledCourses,
	} = useContext(AppContext);

	//Find the course
	const getCourseData = () => {
		const course = enrolledCourses.find((course) => course._id === courseId);

		if (course) {
			setCourseData(course);

			const userRating = course.courseRatings.find((item) => item.userId === userData?._id);

			if (userRating) {
				setInitialRating(userRating.rating);
			}
		}
	};

	//Toggle lectures under chapters
	const toggleSection = (index) => {
		setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	//Get Course Progress
	const getCourseProgress = async () => {
		try {
			const token = await getToken();
			const { data } = await axios.post(
				backendUrl + "/api/user/get-course-progress",
				{ courseId },
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (data.success) {
				setProgressData(data.progressData);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	//Extract YouTube video ID from any common URL format the "Share" button
	//can produce (youtu.be, watch?v=, embed/, shorts/, live/), with or without
	//an appended ?si= tracking param.
	const getYoutubeId = (url) => {
		if (!url) return "";
		const trimmed = url.trim();

		try {
			const parsed = new URL(trimmed);
			const host = parsed.hostname.replace(/^www\.|^m\./, "");

			if (host === "youtu.be") {
				return parsed.pathname.slice(1).split("/")[0];
			}

			if (host === "youtube.com" || host === "youtube-nocookie.com") {
				if (parsed.searchParams.has("v")) {
					return parsed.searchParams.get("v");
				}
				const pathParts = parsed.pathname.split("/").filter(Boolean);
				if (["embed", "shorts", "live"].includes(pathParts[0])) {
					return pathParts[1];
				}
			}
		} catch {
			// Not a valid URL — they may have pasted the raw video ID directly
		}

		// Fallback: strip any query string and take the last path segment
		return trimmed.split(/[?&]/)[0].split("/").filter(Boolean).pop() || "";
	};

	//Mark Completed
	const markCompleted = async (lectureId) => {
		try {
			const token = await getToken();
			const { data } = await axios.post(
				backendUrl + "/api/user/update-course-progress",
				{ courseId, lectureId },
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (data.success) {
				toast.success(data.message);
				getCourseProgress();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	//Rating handler
	const handleRate = async (rating) => {
		try {
			const token = await getToken();

			const { data } = await axios.post(
				backendUrl + "/api/user/add-rating",
				{ courseId, rating },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (data.success) {
				toast.success(data.message);
				fetchUserEnrolledCourses();
				getCourseData();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	useEffect(() => {
		if (enrolledCourses.length > 0 && userData) {
			getCourseData();
		}
	}, [enrolledCourses, userData, courseId]);

	useEffect(() => {
		getCourseProgress();
	}, [courseId]);

	return courseData ? (
		<>
			<div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
				{/* Left column */}
				<div className="text-gray-800">
					<h2 className="text-xl font-semibold">Course Structure</h2>
					<div className="pt-5">
						{courseData &&
							courseData.courseContent.map((chapter, index) => (
								<div key={index} className="border border-gray-300 bg-white mb-2 rounded">
									<div
										className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
										onClick={() => toggleSection(index)}
									>
										<div className="flex items-center gap-2">
											<img
												className={`transition transition-transform ${openSections[index] ? "rotate-180" : ""}`}
												src={assets.down_arrow_icon}
												alt="down arrow icon"
											/>
											<p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
										</div>
										<p className="text-sm md:text-default">
											{Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0}{" "}
											lectures - {calculateChapterTime(chapter)}
										</p>
									</div>
									<div
										className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`}
									>
										<ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
											{chapter.chapterContent.map((lecture, index) => (
												<li key={index} className="flex items-start gap-2 py-1">
													<img
														className="w-4 h-4 mt-1"
														src={
															progressData?.lectureCompleted?.includes(lecture.lectureId)
																? assets.blue_tick_icon
																: assets.play_icon
														}
														alt="play icon"
													/>
													<div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
														<p>{lecture.lectureTitle}</p>
														<div className="flex gap-2">
															{lecture.lectureUrl && (
																<p
																	onClick={() =>
																		setPlayerData({
																			...lecture,
																			chapter: index + 1,
																			lecture: index + 1,
																		})
																	}
																	className="text-blue-500 cursor-pointer"
																>
																	Watch
																</p>
															)}
															<p>
																{humanizeDuration(lecture.lectureDuration * 60 * 1000, {
																	units: ["h", "m"],
																})}
															</p>
														</div>
													</div>
												</li>
											))}
										</ul>
									</div>
								</div>
							))}
					</div>
					<div className="flex items-center gap-2 py-3 mt-10">
						<h1 className="text-xl font-bold">Rate this Course:</h1>
						<Rating initialRating={initialRating} onRate={handleRate} />
					</div>
				</div>
				{/* Right column */}
				<div className="md:mt-10">
					{playerData ? (
						<div>
							{getYoutubeId(playerData.lectureUrl) ? (
								<YouTube
									videoId={getYoutubeId(playerData.lectureUrl)}
									iframeClassName="w-full aspect-video"
								/>
							) : (
								<div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
									Couldn't load this video — the lecture URL looks invalid.
								</div>
							)}
							<div className="flex justify-between items-center mt-1">
								<p>
									{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
								</p>
								<button
									onClick={() => markCompleted(playerData.lectureId)}
									className="text-blue-600"
								>
									{progressData?.lectureCompleted?.includes(playerData.lectureId)
										? "Completed"
										: "Mark Complete"}
								</button>
							</div>
						</div>
					) : (
						<img src={courseData ? courseData.courseThumbnail : ""} alt="course thumbnail" />
					)}
				</div>
			</div>
		</>
	) : (
		<Loading />
	);
};

export default Player;
