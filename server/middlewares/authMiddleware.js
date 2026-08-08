import passport from "../configs/passport.js";

// Verifies the JWT (via the passport-jwt strategy) and attaches the full
// user document to req.user. Use on any route that requires a logged-in user.
export const requireAuth = (req, res, next) => {
	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
		req.user = user;
		next();
	})(req, res, next);
};

// Use *after* requireAuth to gate educator-only routes.
export const requireEducator = (req, res, next) => {
	if (!["educator", "admin"].includes(req.user.role)) {
		return res.status(403).json({ success: false, message: "Unauthorized Access" });
	}
	next();
};
