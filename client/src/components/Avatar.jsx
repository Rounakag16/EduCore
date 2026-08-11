import React from "react";
import { assets } from "../assets/assets";

// Single source of truth for rendering a user's profile photo anywhere in
// the app. Handles two things that kept getting duplicated (and drifting
// out of sync) across components:
//   1. Falling back to the default avatar when imageUrl is empty
//   2. object-cover — the default avatar asset isn't square (1536x1024), so
//      without object-cover a fixed-size square box stretches/distorts it
const Avatar = ({ src, alt = "", size = "w-9 h-9", className = "" }) => (
	<img
		src={src || assets.profile}
		alt={alt}
		className={`${size} rounded-full object-cover shrink-0 ${className}`}
	/>
);

export default Avatar;
