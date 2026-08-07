import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import { useParams } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import { SkeletonCourseGrid } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";

const CoursesList = () => {
	const { navigate, allCourses, coursesLoading } = useContext(AppContext);
	const { input } = useParams();
	const [filteredCourse, setFilteredCourse] = useState([]);

	useEffect(() => {
		if (allCourses && allCourses.length > 0) {
			const tempCourses = allCourses.slice();

			input
				? setFilteredCourse(
						tempCourses.filter((item) =>
							item.courseTitle
								.toLowerCase()
								.includes(input.toLowerCase()),
						),
					)
				: setFilteredCourse(tempCourses);
		} else {
			setFilteredCourse([]);
		}
	}, [allCourses, input]);

	return (
		<>
			<div className="relative md:px-36 px-8 pt-20 text-left">
				<div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
					<div>
						<h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-100">
							Course List
						</h1>
						<p className="text-gray-500 dark:text-gray-400">
							<span
								className="text-blue-600 dark:text-blue-400 cursor-pointer"
								onClick={() => navigate("/")}
							>
								Home
							</span>{" "}
							/ <span>Course List</span>
						</p>
					</div>
					<SearchBar data={input} />
				</div>
				{input && (
					<div className="inline-flex items-center gap-4 px-4 py-2 border dark:border-gray-700 mt-8 -mb-8 text-gray-600/80 dark:text-gray-300 rounded">
						<p>{input}</p>
						<img
							src={assets.cross_icon}
							alt="cross"
							className="cursor-pointer dark:invert"
							onClick={() => navigate("/course-list")}
						/>
					</div>
				)}
				{coursesLoading ? (
					<SkeletonCourseGrid />
				) : filteredCourse.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
						{filteredCourse.map((course, index) => (
							<CourseCard key={index} course={course} />
						))}
					</div>
				) : input ? (
					<EmptyState
						title="No courses found"
						subtitle="Try searching with a different keyword."
					/>
				) : (
					<EmptyState
						title="No courses available yet"
						subtitle="Check back soon — new courses are added regularly."
					/>
				)}
			</div>
		</>
	);
};

export default CoursesList;
