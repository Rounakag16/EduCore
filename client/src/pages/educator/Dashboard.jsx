import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { SkeletonStatCard, SkeletonTable } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";

const Dashboard = () => {
	const { currency, backendUrl, getToken, isEducator } = useContext(AppContext);
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);

	//Fetch dashboard data
	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const token = await getToken();
			const { data } = await axios.get(backendUrl + "/api/educator/dashboard", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (data.success) {
				setDashboardData(data.dashboardData);
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
		if (isEducator) fetchDashboardData();
	}, [isEducator]);

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
				<div className="space-y-5 w-full">
					<div className="flex flex-wrap gap-5 items-center">
						<SkeletonStatCard />
						<SkeletonStatCard />
						<SkeletonStatCard />
					</div>
					<div>
						<h2 className="pb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
							Latest Enrollments
						</h2>
						<div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-500/20 dark:border-gray-700">
							<table className="table-fixed md:table-auto w-full overflow-hidden">
								<tbody>
									<SkeletonTable rows={5} columns={3} />
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
			<div className="space-y-5 w-full">
				<div className="flex flex-wrap gap-5 items-center">
					<div className="flex items-center gap-3 shadow-card border border-blue-500 dark:border-blue-500/40 p-3 w-56 rounded-md bg-white dark:bg-gray-800">
						<img src={assets.patients_icon} alt="patients icons" />
						<div>
							<p className="text-2xl font-medium text-gray-600 dark:text-gray-200">
								{dashboardData.enrolledStudentsData.length}
							</p>
							<p className="text-base text-gray-500 dark:text-gray-400">Total Enrollments</p>
						</div>
					</div>
					<div className="flex items-center gap-3 shadow-card border border-blue-500 dark:border-blue-500/40 p-3 w-56 rounded-md bg-white dark:bg-gray-800">
						<img src={assets.appointments_icon} alt="appointments icon" />
						<div>
							<p className="text-2xl font-medium text-gray-600 dark:text-gray-200">
								{dashboardData.totalCourses}
							</p>
							<p className="text-base text-gray-500 dark:text-gray-400">Total Courses</p>
						</div>
					</div>
					<div className="flex items-center gap-3 shadow-card border border-blue-500 dark:border-blue-500/40 p-3 w-56 rounded-md bg-white dark:bg-gray-800">
						<img src={assets.earning_icon} alt="earning icon" />
						<div>
							<p className="text-2xl font-medium text-gray-600 dark:text-gray-200">
								{currency}
								{dashboardData.totalEarnings}
							</p>
							<p className="text-base text-gray-500 dark:text-gray-400">Total Earnings</p>
						</div>
					</div>
				</div>
				<div>
					<h2 className="pb-4 text-lg font-medium text-gray-800 dark:text-gray-100">
						Latest Enrollments
					</h2>
					{dashboardData.enrolledStudentsData.length === 0 ? (
						<div className="max-w-4xl w-full rounded-md bg-white dark:bg-gray-800 border border-gray-500/20 dark:border-gray-700">
							<EmptyState
								title="No enrollments yet"
								subtitle="Once students start enrolling in your courses, they'll show up here."
							/>
						</div>
					) : (
						<div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-500/20 dark:border-gray-700">
							<table className="table-fixed md:table-auto w-full overflow-hidden">
								<thead className="text-gray-900 dark:text-gray-100 border-b border-gray-500/20 dark:border-gray-700 text-sm text-left">
									<tr>
										<th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
											#
										</th>
										<th className="px-4 py-3 font-semibold">Student Name</th>
										<th className="px-4 py-3 font-semibold">Course Title</th>
									</tr>
								</thead>
								<tbody className="text-sm text-gray-500 dark:text-gray-400">
									{dashboardData.enrolledStudentsData.map((item, index) => (
										<tr
											key={index}
											className="border-b border-gray-500/20 dark:border-gray-700"
										>
											<td className="px-4 py-3 text-center hidden sm:table-cell">
												{index + 1}
											</td>
											<td className="md:px-4 px-2 py-3 flex items-center space-x-3">
												<img
													src={item.student.imageUrl}
													alt="profile"
													className="w-9 h-9 rounded-full"
												/>
												<span className="truncate">{item.student.name}</span>
											</td>
											<td className="px-4 py-3 truncate">{item.courseTitle}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
