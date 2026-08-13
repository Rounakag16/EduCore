// Shared password strength logic — used by PasswordStrengthMeter and by
// Register.jsx's submit-time validation, so the rules can't drift between
// what the user sees in the meter and what actually blocks submission.
//
// Rules (all required for a password to be considered valid, matching the
// backend check in server/controllers/authController.js):
//   - at least 8 characters
//   - at least one uppercase letter
//   - at least one lowercase letter
//   - at least one number
//   - at least one symbol

export const passwordRules = [
	{ id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
	{ id: "uppercase", label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
	{ id: "lowercase", label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
	{ id: "number", label: "One number", test: (pw) => /[0-9]/.test(pw) },
	{ id: "symbol", label: "One symbol (!@#$...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

// Returns { score, passed, total, isValid } — score is 0..total (how many
// rules currently pass), isValid means every rule passes.
export const getPasswordStrength = (password = "") => {
	const passed = passwordRules.filter((rule) => rule.test(password));
	return {
		score: passed.length,
		total: passwordRules.length,
		passed: passed.map((r) => r.id),
		isValid: passed.length === passwordRules.length,
	};
};

export const strengthLabel = (score, total) => {
	if (score === 0) return "";
	if (score <= 2) return "Weak";
	if (score <= 4 && score < total) return "Fair";
	if (score === total) return "Strong";
	return "Good";
};

export const strengthColor = (score, total) => {
	if (score <= 2) return "bg-red-500";
	if (score < total) return "bg-yellow-500";
	return "bg-green-500";
};
