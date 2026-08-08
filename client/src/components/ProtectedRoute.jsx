import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Wrap any route that requires a logged-in user. Also supports a
// `requireEducator` flag for the /educator/* section.
const ProtectedRoute = ({ children, requireEducator = false }) => {
	const { token, userData, isEducator } = useContext(AppContext);

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	// userData is still loading (token exists but /api/auth/me hasn't
	// resolved yet) — render nothing briefly rather than bouncing to login.
	if (!userData) {
		return null;
	}

	if (requireEducator && !isEducator) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default ProtectedRoute;
