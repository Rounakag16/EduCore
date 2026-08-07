import { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
	const { isEducator } = useContext(AppContext);

	const menuItems = [
		{ name: "Dashboard", path: "/educator", icon: assets.home_icon },
		{ name: "Add Course", path: "/educator/add-course", icon: assets.add_icon },
		{ name: "My Courses", path: "/educator/my-courses", icon: assets.my_course_icon },
		{ name: "Student Enrolled", path: "/educator/student-enrolled", icon: assets.person_tick_icon },
	];

	return (
		<div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-500 dark:border-gray-700 py-2 flex flex-col bg-white dark:bg-gray-900">
			{menuItems.map((item) => (
				<NavLink
					key={item.path}
					to={item.path}
					end={item.path == "/educator"}
					className={({ isActive }) =>
						`flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 text-gray-700 dark:text-gray-300 ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10 border-r-[6px] border-indigo-500/90" : "hover:bg-gray-100/90 dark:hover:bg-gray-800 border-r-[6px] border-white dark:border-gray-900 hover:border-gray-100/90 dark:hover:border-gray-800"}`
					}
				>
					<img src={item.icon} alt={item.name} className="w-6 h-6 dark:invert" />
					<p className="md:block hidden text-center">{item.name}</p>
				</NavLink>
			))}
		</div>
	);
};

export default Sidebar;
