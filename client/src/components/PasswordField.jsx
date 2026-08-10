import React, { useState } from "react";

const EyeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="w-4.5 h-4.5"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeOffIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="w-4.5 h-4.5"
	>
		<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a17.4 17.4 0 0 1-3.35 4.6M6.6 6.6C3.2 8.6 1 12 1 12s4 8 11 8a9.3 9.3 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
		<line x1="1" y1="1" x2="23" y2="23" />
	</svg>
);

// Labeled password input with a show/hide toggle. Pass any other <input>
// props (required, minLength, etc.) through — they're spread onto the input.
const PasswordField = ({ label, value, onChange, helperText, ...inputProps }) => {
	const [visible, setVisible] = useState(false);

	return (
		<div>
			<label className="text-sm text-gray-600">{label}</label>
			<div className="relative mt-1">
				<input
					type={visible ? "text" : "password"}
					value={value}
					onChange={onChange}
					className="w-full border border-gray-500/30 bg-transparent rounded px-3 py-2 pr-10 text-gray-800 outline-none focus:border-blue-500"
					{...inputProps}
				/>
				<button
					type="button"
					onClick={() => setVisible((prev) => !prev)}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					aria-label={visible ? "Hide password" : "Show password"}
					tabIndex={-1}
				>
					{visible ? <EyeOffIcon /> : <EyeIcon />}
				</button>
			</div>
			{helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
		</div>
	);
};

export default PasswordField;
