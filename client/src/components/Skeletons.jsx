import React from "react";

// Matches the layout of CourseCard so the grid doesn't jump when real data arrives
export const SkeletonCourseCard = () => (
	<div className="border border-gray-500/30 dark:border-gray-700 pb-6 overflow-hidden rounded-lg">
		<div className="skeleton w-full aspect-video" />
		<div className="p-3 text-left space-y-2">
			<div className="skeleton h-4 w-3/4 rounded" />
			<div className="skeleton h-3 w-1/2 rounded" />
			<div className="skeleton h-3 w-2/3 rounded" />
			<div className="skeleton h-4 w-1/3 rounded mt-2" />
		</div>
	</div>
);

export const SkeletonCourseGrid = ({ count = 8 }) => (
	<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
		{Array.from({ length: count }).map((_, i) => (
			<SkeletonCourseCard key={i} />
		))}
	</div>
);

// Generic skeleton row for tables (dashboard, enrollments, students, etc.)
export const SkeletonTableRow = ({ columns = 4 }) => (
	<tr className="border-b border-gray-500/20">
		{Array.from({ length: columns }).map((_, i) => (
			<td key={i} className="px-4 py-3">
				<div className="skeleton h-4 w-full max-w-32 rounded" />
			</td>
		))}
	</tr>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
	<>
		{Array.from({ length: rows }).map((_, i) => (
			<SkeletonTableRow key={i} columns={columns} />
		))}
	</>
);

// Stat-card skeleton for the educator dashboard
export const SkeletonStatCard = () => (
	<div className="flex items-center gap-3 shadow-card border border-blue-500/40 dark:border-blue-500/20 p-3 w-56 rounded-md">
		<div className="skeleton w-8 h-8 rounded-full shrink-0" />
		<div className="space-y-2 w-full">
			<div className="skeleton h-5 w-16 rounded" />
			<div className="skeleton h-3 w-24 rounded" />
		</div>
	</div>
);
