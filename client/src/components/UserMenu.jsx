import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const UserMenu = () => {
	const { userData, setUserData, logout, backendUrl, getToken } = useContext(AppContext);
	const [open, setOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const closeTimeout = useRef(null);
	const fileInputRef = useRef(null);

	if (!userData) return null;

	const handleMouseLeave = () => {
		closeTimeout.current = setTimeout(() => setOpen(false), 150);
	};
	const handleMouseEnter = () => {
		if (closeTimeout.current) clearTimeout(closeTimeout.current);
	};

	const handlePhotoSelect = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = ""; // allow re-selecting the same file later
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			return toast.error("Please choose an image file");
		}

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("image", file);

			const token = await getToken();
			const { data } = await axios.post(backendUrl + "/api/user/update-profile-image", formData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (data.success) {
				// Update immediately — no reload needed to see the new avatar
				setUserData(data.user);
				toast.success("Profile picture updated");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<button onClick={() => setOpen((prev) => !prev)} className="flex items-center gap-2">
				<img
					src={userData.imageUrl || assets.profile}
					alt={userData.name}
					className="w-8 h-8 rounded-full object-cover"
				/>
			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-52 bg-white border border-gray-500/20 rounded-md shadow-lg py-2 z-50 text-sm">
					<div className="px-4 py-2 border-b border-gray-500/10 flex items-center gap-3">
						<img
							src={userData.imageUrl || assets.profile}
							alt={userData.name}
							className="w-10 h-10 rounded-full object-cover shrink-0"
						/>
						<div className="min-w-0">
							<p className="font-medium text-gray-800 truncate">{userData.name}</p>
							<p className="text-gray-500 truncate text-xs">{userData.email}</p>
						</div>
					</div>
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
					>
						{uploading ? "Uploading..." : "Change photo"}
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handlePhotoSelect}
						className="hidden"
					/>
					<button
						onClick={logout}
						className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
					>
						Log out
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
