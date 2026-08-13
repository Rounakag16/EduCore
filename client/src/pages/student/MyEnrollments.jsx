import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import { toast } from "react-toastify";
import axios from "axios";
import { SkeletonTable } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";

const MyEnrollments = () => {
	const {
		enrolledCourses,
		enrolledCoursesLoading,
		calculateCourseDuration,
		navigate,
		userData,
		fetchUserEnrolledCourses,
		backendUrl,
		getToken,
		calculateNumberOfLectures,
	} = useContext(AppContext);
	const [progressArray, setProgressArray] = useState([]);
	const [downloadingCertFor, setDownloadingCertFor] = useState(null);

	const getCourseProgress = async () => {
		try {
			const token = await getToken();
			const tempProgressArray = await Promise.all(
				enrolledCourses.map(async (course) => {
					const { data } = await axios.post(
						backendUrl + "/api/user/get-course-progress",
						{ courseId: course._id },
						{ headers: { Authorization: `Bearer ${token}` } },
					);
					let totalLectures = calculateNumberOfLectures(course);
					const lectureCompleted = data.progressData
						? data.progressData.lectureCompleted.length
						: 0;
					return { totalLectures, lectureCompleted };
				}),
			);

			setProgressArray(tempProgressArray);
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Certificate download is JWT-protected, so a plain <a href> can't carry
	// the Authorization header — fetch as a blob and trigger the download manually.
	const downloadCertificate = async (course) => {
		setDownloadingCertFor(course._id);
		try {
			const token = await getToken();
			const response = await axios.get(backendUrl + `/api/user/certificate/${course._id}`, {
				headers: { Authorization: `Bearer ${token}` },
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.download = `${course.courseTitle.replace(/[^a-z0-9]/gi, "_")}_certificate.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Couldn't download certificate — please try again",
			);
		} finally {
			setDownloadingCertFor(null);
		}
	};

	useEffect(() => {
		if (userData) {
			fetchUserEnrolledCourses();
		}
	}, [userData]);

	useEffect(() => {
		if (enrolledCourses.length > 0) {
			getCourseProgress();
		}
	}, [enrolledCourses]);

	return (
		<>
			<div className="md:px-36 px-8 pt-10">
				<h1 className="text-2xl font-semibold text-gray-800">
					My Enrollments
				</h1>
				{!enrolledCoursesLoading && enrolledCourses.length === 0 ? (
					<EmptyState
						className="mt-10"
						title="You haven't enrolled in any course yet"
						subtitle="Browse the catalog and pick something to start learning."
						actionLabel="Explore Courses"
						onAction={() => navigate("/course-list")}
					/>
				) : (
					<table className="md:table-auto table-fixed w-full overflow-hidden border border-gray-500/20 mt-10">
						<thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
							<tr>
								<th className="px-4 py-3 font-semibold truncate">Course</th>
								<th className="px-4 py-3 font-semibold truncate">Duration</th>
								<th className="px-4 py-3 font-semibold truncate">Completed</th>
								<th className="px-4 py-3 font-semibold truncate">Status</th>
							</tr>
						</thead>
						<tbody className="text-gray-700">
							{enrolledCoursesLoading ? (
								<SkeletonTable rows={4} columns={4} />
							) : (
								enrolledCourses.map((course, index) => (
									<tr key={index} className="border-b border-gray-500/20">
										<td className="md:px-4 pl-2 md:pl-4 py-3">
											<div className="flex items-center gap-3">
												<img
													src={course.courseThumbnail}
													alt="course thumbnail"
													className="w-14 sm:w-24 md:w-28 shrink-0"
												/>
												<div className="flex-1 min-w-0">
													<p className="mb-1 max-sm:text-sm break-words">{course.courseTitle}</p>
													<Line
														strokeWidth={2}
														percent={
															progressArray[index]
																? (progressArray[index].lectureCompleted /
																		progressArray[index].totalLectures) *
																	100
																: 0
														}
														className="bg-gray-300 rounded-full"
													/>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 max-sm:hidden">{calculateCourseDuration(course)}</td>
										<td className="px-4 py-3 max-sm:hidden">
											{progressArray[index] &&
												`${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`}{" "}
											<span>Lectures</span>
										</td>
										<td className="px-2 sm:px-4 py-3 w-0 whitespace-nowrap max-sm:text-right align-top">
											<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 justify-end">
												<button
													className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white rounded"
													onClick={() => navigate("/player/" + course._id)}
												>
													{progressArray[index] &&
													progressArray[index].lectureCompleted ===
														progressArray[index].totalLectures
														? "Completed"
														: "On going"}
												</button>
												{progressArray[index] &&
													progressArray[index].totalLectures > 0 &&
													progressArray[index].lectureCompleted ===
														progressArray[index].totalLectures && (
														<button
															onClick={() => downloadCertificate(course)}
															disabled={downloadingCertFor === course._id}
															className="px-3 sm:px-5 py-1.5 sm:py-2 border border-blue-600 text-blue-600 max-sm:text-xs rounded disabled:opacity-60"
														>
															{downloadingCertFor === course._id
																? "..."
																: "Certificate"}
														</button>
													)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
};

export default MyEnrollments;
