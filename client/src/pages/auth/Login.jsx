import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const Login = () => {
	const { login, navigate } = useContext(AppContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		const success = await login(email, password);
		setSubmitting(false);
		if (success) navigate("/");
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center px-4">
			<div className="w-full max-w-sm border border-gray-500/30 rounded-lg p-8 bg-white">
				<h1 className="text-2xl font-semibold text-gray-800 mb-1">
					Welcome back
				</h1>
				<p className="text-sm text-gray-500 mb-6">
					Log in to continue learning.
				</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="text-sm text-gray-600">Email</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full border border-gray-500/30 bg-transparent rounded px-3 py-2 text-gray-800 outline-none focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600">Password</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 w-full border border-gray-500/30 bg-transparent rounded px-3 py-2 text-gray-800 outline-none focus:border-blue-500"
						/>
					</div>
					<button
						type="submit"
						disabled={submitting}
						className="w-full bg-blue-600 text-white rounded py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
					>
						{submitting ? "Logging in..." : "Log In"}
					</button>
				</form>
				<p className="text-sm text-gray-500 mt-6 text-center">
					Don't have an account?{" "}
					<Link to="/register" className="text-blue-600">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
