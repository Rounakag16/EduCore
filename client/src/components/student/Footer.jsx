import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Footer = () => {
	const [email, setEmail] = useState("");

	// NOTE: there's no newsletter backend endpoint yet — this just validates
	// input and gives feedback. Wire it to a real API route when one exists.
	const handleSubscribe = () => {
		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			return toast.error("Enter a valid email");
		}
		toast.success("Thanks for subscribing!");
		setEmail("");
	};

	return (
		<footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
			<div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
				<div className="flex flex-col md:items-start items-center w-full">
					<img src={assets.logo_dark} alt="" />
					<p className="mt-6 text-center md:text-left text-sm text-white/80">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt distinctio rem voluptate
						rerum deserunt at possimus natus consequatur.
					</p>
				</div>
				<div className="flex flex-col md:items-start items-center w-full">
					<h2 className="font-semibold text-white mb-5">Company</h2>
					<ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<a href="#">About us</a>
						</li>
						<li>
							<a href="#">Contact us</a>
						</li>
						<li>
							<a href="#">Privacy policy</a>
						</li>
					</ul>
				</div>
				<div className="hidden md:flex flex-col items-start w-full">
					<h2 className="font-semibold text-white mb-5">Subscribe to our newsletter</h2>
					<p className="text-sm text-white/80">
						The latest news, articles, and resources, sent to your inbox weekly
					</p>
					<div className="flex items-center gap-2 pt-4">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm"
						/>
						<button onClick={handleSubscribe} className="bg-blue-600 w-24 h-9 text-white rounded">
							Subscribe
						</button>
					</div>
				</div>
			</div>
			<p className="py-4 text-center text-xs md:text-sm md:text-sm text-white/60">
				© 2026 EduCore. Empowering learners worldwide. All rights reserved.
			</p>
		</footer>
	);
};

export default Footer;
