import React, { useContext, useState } from "react";
import { assets } from "../../../assets/assets";
import { AppContext } from "../../../context/AppContext";
import YouTube from "react-youtube";

const RightSection = ({ playerData, setPlayerData, isAlreadyEnrolled, enrollCourse }) => {
	const {
		courseData,
		currency,
		calculateCourseDuration,
		calculateNumberOfLectures,
		calculateRating,
	} = useContext(AppContext);

	return (
		<div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
			{playerData ? (
				playerData.videoId ? (
					<YouTube
						key={playerData.videoId}
						videoId={playerData.videoId}
						opts={{ playerVars: { autoplay: 1 } }}
						iframeClassName="w-full aspect-video"
					/>
				) : (
					<div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
						Couldn't load this preview — the lecture URL looks invalid.
					</div>
				)
			) : (
				<img src={courseData.courseThumbnail} alt="" />
			)}

			<div className="p-5">
				<div className="flex items-center gap-2">
					<img className="w-3.5" src={assets.time_left_clock_icon} alt="time left clock icon" />

					<p className="text-red-500">
						<span className="font-medium">5 days</span> left at this price
					</p>
				</div>

				<div className="flex gap-3 items-center pt-2">
					<p className="text-gray-800 md:text-4xl text-2xl font-semibold">
						{currency}
						{(
							courseData.coursePrice -
							(courseData.discount * courseData.coursePrice) / 100
						).toFixed(2)}
					</p>
					<p className="md:text-lg text-gray-500 line-through">
						{currency}
						{courseData.coursePrice}
					</p>
					<p className="md:text-lg text-gray-500">{courseData.discount}% off</p>
				</div>

				<div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
					<div className="flex items-center gap-1">
						<img src={assets.star} alt="star icon" />
						<p>{calculateRating(courseData)}</p>
					</div>
					<div className="h-4 w-px bg-gray-500/40"></div>
					<div className="flex items-center gap-1">
						<img src={assets.time_clock_icon} alt="time clock icon" />
						<p> {calculateCourseDuration(courseData)}</p>
					</div>
					<div className="h-4 w-px bg-gray-500/40"></div>
					<div className="flex items-center gap-1">
						<img src={assets.lesson_icon} alt="time clock icon" />
						<p> {calculateNumberOfLectures(courseData)} lessons</p>
					</div>
				</div>
				<button
					onClick={enrollCourse}
					className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
				>
					{isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
				</button>
				<div className="pt-6">
					<p className="md:text-xl text-lg font-medium text-gray-800">What's in the course?</p>
					<ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
						<li>Lifetime access with future course updates.</li>
						<li>Learn from industry experts through practical lessons.</li>
						<li>Access downloadable resources and learning materials.</li>
						<li>Test your progress with quizzes and assessments.</li>
						<li>Receive a certificate to showcase your achievement.</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default RightSection;
