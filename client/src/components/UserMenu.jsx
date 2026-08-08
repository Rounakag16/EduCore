import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const UserMenu = () => {
	const { userData, logout } = useContext(AppContext);
	const [open, setOpen] = useState(false);
	const closeTimeout = useRef(null);

	if (!userData) return null;

	const handleMouseLeave = () => {
		closeTimeout.current = setTimeout(() => setOpen(false), 150);
	};
	const handleMouseEnter = () => {
		if (closeTimeout.current) clearTimeout(closeTimeout.current);
	};

	return (
		<div
			className="relative"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<button
				onClick={() => setOpen((prev) => !prev)}
				className="flex items-center gap-2"
			>
				<img
					src={userData.imageUrl || assets.profile_img}
					alt={userData.name}
					className="w-8 h-8 rounded-full object-cover"
				/>
			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-500/20 dark:border-gray-700 rounded-md shadow-lg py-2 z-50 text-sm">
					<div className="px-4 py-2 border-b border-gray-500/10 dark:border-gray-700">
						<p className="font-medium text-gray-800 dark:text-gray-100 truncate">
							{userData.name}
						</p>
						<p className="text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
					</div>
					<button
						onClick={logout}
						className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						Log out
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
