import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import ThemeToggle from "../ThemeToggle";
import UserMenu from "../UserMenu";

const Navbar = () => {
	const { isDarkMode, userData } = useContext(AppContext);
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
				<p>Hi! {userData ? userData.name : "Educator"}</p>
				{userData ? <UserMenu /> : <img className="max-w-8" src={assets.profile_img} />}
			</div>
		</div>
	);
};

export default Navbar;
