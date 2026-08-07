import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Footer = () => {
	const { isDarkMode } = useContext(AppContext);
	return (
		<footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
			<div className="flex items-center gap-4">
				<img
					src={isDarkMode ? assets.logo_dark : assets.logo}
					alt="logo"
					className="hidden md:block w-20"
				/>
				<div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
				<p className="py-4 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
					© 2026 EduCore. Empowering learners worldwide. All rights reserved.
				</p>
			</div>
			<div className="flex items-center gap-3 max-md:mt-4">
				<a href="#">
					<img src={assets.facebook_icon} alt="facebook icon" className="dark:invert" />
				</a>
				<a href="#">
					<img src={assets.twitter_icon} alt="twitter icon" className="dark:invert" />
				</a>
				<a href="#">
					<img src={assets.instagram_icon} alt="instagram icon" className="dark:invert" />
				</a>
			</div>
		</footer>
	);
};

export default Footer;
