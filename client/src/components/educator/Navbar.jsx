import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import UserMenu from "../UserMenu";

const Navbar = () => {
	const { userData } = useContext(AppContext);
	return (
		<div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 bg-white">
			<Link to="/">
				<img src={assets.logo} alt="logo" className="w-28 lg:w-32" />
			</Link>
			<div className="flex items-center gap-5 text-gray-500 relative">
				<p>Hi! {userData ? userData.name : "Educator"}</p>
				{userData ? <UserMenu /> : <Avatar size="w-8 h-8" />}
			</div>
		</div>
	);
};

export default Navbar;
