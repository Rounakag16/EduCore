import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import UserMenu from "../UserMenu";

const MenuIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="18" x2="21" y2="18" />
	</svg>
);

const CloseIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const Navbar = () => {
	const isCourseListPage = location.pathname.includes("/course-list");
	const { navigate, isEducator, setIsEducator, backendUrl, getToken, userData } =
		useContext(AppContext);
	const [menuOpen, setMenuOpen] = useState(false);

	const becomeEducator = async () => {
		setMenuOpen(false);
		try {
			if (isEducator) {
				navigate("/educator");
				return;
			}

			const token = await getToken();
			const { data } = await axios.get(backendUrl + "/api/educator/update-role", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (data.success) {
				setIsEducator(true);
				toast.success(data.message);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	return (
		<>
			<div
				className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? "bg-white" : "bg-cyan-100/70"}`}
			>
				<img
					src={assets.logo}
					alt="Logo"
					className="w-36 lg:w-40 cursor-pointer"
					onClick={() => navigate("/")}
				/>
				<div className="hidden md:flex items-center gap-5 text-gray-500">
					<div className="flex items-center gap-5">
						{userData && (
							<>
								<button onClick={becomeEducator}>
									{isEducator ? "Educator Dashboard" : "Become Educator"}
								</button>{" "}
								|<Link to="/my-enrollments">My Enrollments</Link>
							</>
						)}
					</div>
					{userData ? (
						<UserMenu />
					) : (
						<button
							onClick={() => navigate("/login")}
							className="bg-blue-600 text-white px-5 py-2 rounded-full"
						>
							Create Account
						</button>
					)}
				</div>
				{/* For Mobile */}
				<div className="md:hidden flex items-center gap-3 text-gray-500">
					{userData ? (
						<UserMenu />
					) : (
						<button
							onClick={() => navigate("/login")}
							className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm"
						>
							Log in
						</button>
					)}
					{userData && (
						<button
							onClick={() => setMenuOpen((prev) => !prev)}
							aria-label={menuOpen ? "Close menu" : "Open menu"}
							className="p-1"
						>
							{menuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>
					)}
				</div>
			</div>
			{/* Mobile dropdown — only relevant links live here, so it's only
			    rendered (and only needed) once the user is logged in. */}
			{userData && menuOpen && (
				<div className="md:hidden flex flex-col text-gray-700 bg-white border-b border-gray-500/20 shadow-sm">
					<button
						onClick={becomeEducator}
						className="text-left px-6 py-3 border-b border-gray-100 active:bg-gray-50"
					>
						{isEducator ? "Educator Dashboard" : "Become Educator"}
					</button>
					<Link
						to="/my-enrollments"
						onClick={() => setMenuOpen(false)}
						className="px-6 py-3 active:bg-gray-50"
					>
						My Enrollments
					</Link>
				</div>
			)}
		</>
	);
};

export default Navbar;
