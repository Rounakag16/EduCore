import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { useClerk, useUser } from "@clerk/react";
import { AppContext } from "../../context/AppContext";

const CallToAction = () => {
	const { navigate } = useContext(AppContext);
	const { user } = useUser();
	const { openSignIn } = useClerk();

	const handleGetStarted = () => {
		if (user) {
			navigate("/course-list");
		} else {
			openSignIn();
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0">
			<h1 className="text-xl md:text-4xl text-gray-800 font-semibold">
				Start Learning. Start Growing.
			</h1>
			<p className="text-gray-500 sm:text-sm">
				Join EduCore to access expert-led courses, gain real-world skills, and take the next step
				toward your personal and professional success.
			</p>
			<div className="flex items-center font-medium gap-6 mt-4">
				<button onClick={handleGetStarted} className="px-10 py-3 rounded-md text-white bg-blue-600">
					Get Started
				</button>
				<button onClick={() => navigate("/course-list")} className="flex items-center gap-2">
					Explore Courses
					<img src={assets.arrow_icon} alt="arrow_icon" />
				</button>
			</div>
		</div>
	);
};

export default CallToAction;
