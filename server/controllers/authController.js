import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "../configs/passport.js";
import User from "../models/User.js";

const signToken = (user) =>
	jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

// Never send the password hash back to the client
const sanitizeUser = (user) => ({
	_id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	imageUrl: user.imageUrl,
	enrolledCourses: user.enrolledCourses,
	createdAt: user.createdAt,
});

// Register a new account (always starts as "student" — becomeEducator
// upgrades the role later via a separate authenticated call)
export const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}
		if (password.length < 8) {
			return res
				.status(400)
				.json({ success: false, message: "Password must be at least 8 characters" });
		}

		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			return res.status(409).json({ success: false, message: "Email already registered" });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await User.create({
			name,
			email: email.toLowerCase(),
			password: hashedPassword,
		});

		const token = signToken(user);
		res.status(201).json({ success: true, token, user: sanitizeUser(user) });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Login with email + password, handled by the passport-local strategy
export const login = (req, res, next) => {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		if (!user) {
			return res
				.status(401)
				.json({ success: false, message: info?.message || "Invalid credentials" });
		}

		const token = signToken(user);
		res.json({ success: true, token, user: sanitizeUser(user) });
	})(req, res, next);
};

// Returns the currently authenticated user — req.user is populated by the
// requireAuth middleware (passport-jwt) before this ever runs.
export const getMe = async (req, res) => {
	res.json({ success: true, user: sanitizeUser(req.user) });
};

// Stateless JWTs can't be revoked server-side without a blacklist/allowlist,
// so logging out is really a client-side action (discard the token). This
// endpoint exists for API symmetry and as a hook for adding a blacklist later.
export const logout = (req, res) => {
	res.json({ success: true, message: "Logged out" });
};
