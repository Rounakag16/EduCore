import React from "react";

// Reusable "nothing here yet" panel. Pass an actionLabel + onAction to show
// a CTA button (e.g. "Add your first course"), or omit for a plain message.
const EmptyState = ({ title, subtitle, actionLabel, onAction, className = "" }) => (
	<div className={`min-h-[30vh] flex items-center justify-center ${className}`}>
		<div className="text-center max-w-sm px-4">
			<h3 className="text-xl font-semibold text-gray-700">{title}</h3>
			{subtitle && (
				<p className="text-gray-500 mt-2 text-sm">{subtitle}</p>
			)}
			{actionLabel && onAction && (
				<button
					onClick={onAction}
					className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
				>
					{actionLabel}
				</button>
			)}
		</div>
	</div>
);

export default EmptyState;
