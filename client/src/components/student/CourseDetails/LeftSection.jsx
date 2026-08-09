import { useContext, useState } from "react";
import { assets } from "../../../assets/assets";
import humanizeDuration from "humanize-duration";
import { AppContext } from "../../../context/AppContext";
import { getYoutubeId } from "../../../utils/youtube";

const LeftSection = ({ playerData, setPlayerData }) => {
	const [openSections, setOpenSections] = useState({});

	const { courseData, calculateRating, calculateChapterTime } = useContext(AppContext);

	//Toggle lectures under chapters
	const toggleSection = (index) => {
		setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	return (
		<div className="max-w-xl z-10 text-gray-500">
			<h1 className="md:text-course-details-heading-large course-details-heading-small font-semibold text-gray-800">
				{courseData.courseTitle}
			</h1>
			<p
				className="pt-4 md:text-base text-sm"
				dangerouslySetInnerHTML={{
					__html: courseData.courseDescription.slice(0, 200),
				}}
			></p>
			{/* Review & Ratings */}
			<div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
				<p>{calculateRating(courseData)}</p>
				<div className="flex">
					{[...Array(5)].map((_, i) => (
						<img
							className="w-3.5 h-3.5"
							key={i}
							src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank}
							alt="rating_star"
						/>
					))}
				</div>
				<p className="text-blue-600">
					({courseData.courseRatings.length}{" "}
					{courseData.courseRatings.length > 1 ? "ratings" : "rating"})
				</p>
				<p>
					{courseData.enrolledStudents.length}{" "}
					{courseData.enrolledStudents.length > 1 ? "students" : "student"}
				</p>
			</div>
			<p className="text-sm">
				Course by <span className="text-blue-600 underline">{courseData.educator.name}</span>
			</p>
			<div className="pt-8 text-gray-800">
				<h2 className="text-xl font-semibold">Course Structure</h2>
				<div className="pt-5">
					{courseData.courseContent.map((chapter, index) => (
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
											<img className="w-4 h-4 mt-1" src={assets.play_icon} alt="play icon" />
											<div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
												<p>{lecture.lectureTitle}</p>
												<div className="flex gap-2">
													{lecture.isPreviewFree && (
														<p
															onClick={() =>
																setPlayerData({
																	videoId: getYoutubeId(lecture.lectureUrl),
																})
															}
															className="text-blue-500 cursor-pointer"
														>
															Preview
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
			</div>
			<div className="py-20 text-sm md:text-default">
				<h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
				<p
					className="pt-3 rich-text"
					dangerouslySetInnerHTML={{
						__html: courseData.courseDescription,
					}}
				></p>
			</div>
		</div>
	);
};

export default LeftSection;
