import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Local strategy: verifies email + password on login.
// Used once, at /api/auth/login — everything after that is JWT-based.
passport.use(
	new LocalStrategy(
		{ usernameField: "email", passwordField: "password" },
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
				if (!user) {
					return done(null, false, { message: "Invalid email or password" });
				}

				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					return done(null, false, { message: "Invalid email or password" });
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

// JWT strategy: verifies the Bearer token on every protected route.
// This is what replaces Clerk's req.auth() across the app.
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
};

passport.use(
	new JwtStrategy(jwtOptions, async (payload, done) => {
		try {
			const user = await User.findById(payload.id);
			if (!user) {
				return done(null, false);
			}
			return done(null, user);
		} catch (error) {
			return done(error, false);
		}
	}),
);

export default passport;
