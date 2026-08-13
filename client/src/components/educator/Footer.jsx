import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
	return (
		<footer className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 md:gap-0 text-left w-full px-6 md:px-8 py-4 md:py-0 border-t border-gray-200 bg-white">
			<div className="flex items-center gap-4">
				<img src={assets.logo} alt="logo" className="w-16 md:w-20" />
				<div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
				<p className="text-center text-xs md:text-sm text-gray-500 md:py-4">
					© 2026 EduCore. Empowering learners worldwide. All rights reserved.
				</p>
			</div>
			<div className="flex items-center gap-4">
				<a href="#">
					<img src={assets.facebook_icon} alt="facebook icon" className="w-5 h-5" />
				</a>
				<a href="#">
					<img src={assets.twitter_icon} alt="twitter icon" className="w-5 h-5" />
				</a>
				<a href="#">
					<img src={assets.instagram_icon} alt="instagram icon" className="w-5 h-5" />
				</a>
			</div>
		</footer>
	);
};

export default Footer;
