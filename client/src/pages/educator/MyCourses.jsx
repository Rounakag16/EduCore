import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { SkeletonTable } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";

const MyCourses = () => {
	const { currency, backendUrl, getToken, isEducator, navigate } = useContext(AppContext);

	const [courses, setCourses] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchEducatorCourses = async () => {
		setLoading(true);
		try {
			const token = await getToken();
			const { data } = await axios.get(backendUrl + "/api/educator/courses", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (data.success) {
				setCourses(data.courses);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isEducator) fetchEducatorCourses();
	}, [isEducator]);

	return (
		<div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
			<div className="w-full">
				<h1 className="pb-4 text-lg font-medium text-gray-800">
					My Courses Page
				</h1>
				{!loading && courses && courses.length === 0 ? (
					<div className="max-w-4xl w-full rounded-md bg-white border border-gray-500/20">
						<EmptyState
							title="No courses yet"
							subtitle="Create your first course to start teaching and earning."
							actionLabel="Add your first course"
							onAction={() => navigate("/educator/add-course")}
						/>
					</div>
				) : (
					<div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
						<table className="table-fixed md:table-auto w-full overflow-hidden">
							<thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
								<tr>
									<th className="px-4 py-3 font-semibold truncate">All Courses</th>
									<th className="px-4 py-3 font-semibold truncate">Earnings</th>
									<th className="px-4 py-3 font-semibold truncate">Students</th>
									<th className="px-4 py-3 font-semibold truncate">Published On</th>
								</tr>
							</thead>
							<tbody className="text-sm text-gray-500">
								{loading ? (
									<SkeletonTable rows={5} columns={4} />
								) : (
									courses.map((course) => (
										<tr
											key={course._id}
											className="border-b border-gray-500/20"
										>
											<td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
												<img
													src={course.courseThumbnail}
													alt="course thumbnail"
													className="w-16"
												/>
												<span className="truncate hidden md:block">
													{course.courseTitle}
												</span>
											</td>
											<td className="px-4 py-3">
												{currency}
												{Math.floor(
													course.enrolledStudents.length *
														(course.coursePrice -
															(course.discount * course.coursePrice) / 100),
												)}
											</td>
											<td className="px-4 py-3">{course.enrolledStudents.length}</td>
											<td className="px-4 py-3">
												{new Date(course.createdAt).toLocaleDateString()}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default MyCourses;
