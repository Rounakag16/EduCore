import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const ThemeToggle = ({ className = "" }) => {
	const { isDarkMode, toggleTheme } = useContext(AppContext);

	return (
		<button
			onClick={toggleTheme}
			aria-label="Toggle dark mode"
			className={`p-2 rounded-full hover:bg-gray-500/10 dark:hover:bg-gray-100/10 transition-colors ${className}`}
		>
			{isDarkMode ? (
				// Sun icon (click to switch to light)
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-5 h-5 text-yellow-400"
				>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
				</svg>
			) : (
				// Moon icon (click to switch to dark)
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-5 h-5 text-gray-600"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
				</svg>
			)}
		</button>
	);
};

export default ThemeToggle;
