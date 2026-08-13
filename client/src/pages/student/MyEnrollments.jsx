import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import { toast } from "react-toastify";
import axios from "axios";
import { SkeletonEnrollmentList } from "../../components/Skeletons";
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
					<div className="border border-gray-500/20 rounded mt-10 divide-y divide-gray-500/20">
						{enrolledCoursesLoading ? (
							<SkeletonEnrollmentList rows={4} />
						) : (
							enrolledCourses.map((course, index) => {
								const progress = progressArray[index];
								const isComplete =
									progress && progress.totalLectures > 0 && progress.lectureCompleted === progress.totalLectures;

								return (
									<div
										key={course._id}
										className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
									>
										{/* Thumbnail + title + progress */}
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<img
												src={course.courseThumbnail}
												alt="course thumbnail"
												className="w-16 sm:w-24 md:w-28 rounded shrink-0 object-cover aspect-video"
											/>
											<div className="flex-1 min-w-0">
												<p className="text-sm sm:text-base text-gray-800 break-words">
													{course.courseTitle}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													{calculateCourseDuration(course)}
													{progress && (
														<>
															{" "}
															· {progress.lectureCompleted} / {progress.totalLectures} Lectures
														</>
													)}
												</p>
												<Line
													strokeWidth={2}
													percent={
														progress
															? (progress.lectureCompleted / progress.totalLectures) * 100
															: 0
													}
													className="bg-gray-300 rounded-full mt-1.5"
												/>
											</div>
										</div>

										{/* Actions — never squeezed against the text column */}
										<div className="flex sm:flex-col items-stretch sm:items-end gap-2 shrink-0 self-end sm:self-auto">
											<button
												className="px-4 py-2 bg-blue-600 text-white text-sm rounded whitespace-nowrap"
												onClick={() => navigate("/player/" + course._id)}
											>
												{isComplete ? "Completed" : "On going"}
											</button>
											{isComplete && (
												<button
													onClick={() => downloadCertificate(course)}
													disabled={downloadingCertFor === course._id}
													className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded whitespace-nowrap disabled:opacity-60"
												>
													{downloadingCertFor === course._id ? "…" : "Certificate"}
												</button>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default MyEnrollments;
