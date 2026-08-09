import nodemailer from "nodemailer";

// Reads SMTP credentials from env vars. Works with any SMTP provider —
// Gmail (with an App Password), Brevo, SendGrid, Mailtrap for testing, etc.
// Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
let transporter = null;

const getTransporter = () => {
	if (transporter) return transporter;

	if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
		return null;
	}

	transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 587,
		secure: Number(process.env.SMTP_PORT) === 465,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	return transporter;
};

// Fire-and-forget by design: email is a nice-to-have notification, never a
// dependency of the actual business logic (a purchase or a completed lecture
// must still succeed even if the email fails or SMTP isn't configured at all).
export const sendEmail = async ({ to, subject, html }) => {
	const client = getTransporter();

	if (!client) {
		console.log(
			`[email] SMTP not configured — skipping email "${subject}" to ${to}. ` +
				"Set SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM to enable sending.",
		);
		return;
	}

	try {
		await client.sendMail({
			from: process.env.EMAIL_FROM || process.env.SMTP_USER,
			to,
			subject,
			html,
		});
		console.log(`[email] Sent "${subject}" to ${to}`);
	} catch (error) {
		console.error(`[email] Failed to send "${subject}" to ${to}:`, error.message);
	}
};
