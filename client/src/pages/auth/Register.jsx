import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const Register = () => {
	const { register, navigate } = useContext(AppContext);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		const success = await register(name, email, password);
		setSubmitting(false);
		if (success) navigate("/");
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center px-4">
			<div className="w-full max-w-sm border border-gray-500/30 dark:border-gray-700 rounded-lg p-8 bg-white dark:bg-gray-800">
				<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
					Create your account
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
					Start learning — or become an educator later from your profile.
				</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300">Name</label>
						<input
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full border border-gray-500/30 dark:border-gray-600 bg-transparent rounded px-3 py-2 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full border border-gray-500/30 dark:border-gray-600 bg-transparent rounded px-3 py-2 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300">Password</label>
						<input
							type="password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 w-full border border-gray-500/30 dark:border-gray-600 bg-transparent rounded px-3 py-2 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
						/>
						<p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
					</div>
					<button
						type="submit"
						disabled={submitting}
						className="w-full bg-blue-600 text-white rounded py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
					>
						{submitting ? "Creating account..." : "Create Account"}
					</button>
				</form>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-600 dark:text-blue-400">
						Log in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
