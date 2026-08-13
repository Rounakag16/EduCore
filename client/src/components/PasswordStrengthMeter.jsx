import React from "react";
import { passwordRules, getPasswordStrength, strengthLabel, strengthColor } from "../utils/passwordStrength";

// Live strength bar + checklist shown under the password field on Register.
// Renders nothing until the user starts typing, so it doesn't clutter an
// empty form.
const PasswordStrengthMeter = ({ password }) => {
	if (!password) return null;

	const { score, total } = getPasswordStrength(password);
	const label = strengthLabel(score, total);
	const color = strengthColor(score, total);

	return (
		<div className="mt-2">
			<div className="flex gap-1">
				{Array.from({ length: total }).map((_, i) => (
					<div
						key={i}
						className={`h-1.5 flex-1 rounded-full transition-colors ${
							i < score ? color : "bg-gray-200"
						}`}
					/>
				))}
			</div>
			{label && (
				<p
					className={`text-xs mt-1 ${
						score === total ? "text-green-600" : score <= 2 ? "text-red-500" : "text-yellow-600"
					}`}
				>
					{label}
				</p>
			)}
			<ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
				{passwordRules.map((rule) => {
					const met = rule.test(password);
					return (
						<li
							key={rule.id}
							className={`text-xs flex items-center gap-1.5 ${
								met ? "text-green-600" : "text-gray-400"
							}`}
						>
							<span>{met ? "✓" : "○"}</span>
							{rule.label}
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default PasswordStrengthMeter;
