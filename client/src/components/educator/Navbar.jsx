import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";
import { AppContext } from "../../context/AppContext";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
	const { user } = useUser();
	const { isDarkMode } = useContext(AppContext);
	return (
		<div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 dark:border-gray-700 py-3 bg-white dark:bg-gray-900">
			<Link to="/">
				<img
					src={isDarkMode ? assets.logo_dark : assets.logo}
					alt="logo"
					className="w-28 lg:w-32"
				/>
			</Link>
			<div className="flex items-center gap-5 text-gray-500 dark:text-gray-300 relative">
				<ThemeToggle />
				<p>Hi! {user ? user.fullName : "Developers"}</p>
				{user ? <UserButton /> : <img className="max-w-8" src={assets.profile_img} />}
			</div>
		</div>
	);
};

export default Navbar;
