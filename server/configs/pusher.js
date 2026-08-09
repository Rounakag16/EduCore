import Pusher from "pusher";

// Required env vars: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
// (free tier at pusher.com — 200k messages/day, plenty for a project like this)
let pusher = null;

export const getPusher = () => {
	if (pusher) return pusher;

	if (
		!process.env.PUSHER_APP_ID ||
		!process.env.PUSHER_KEY ||
		!process.env.PUSHER_SECRET ||
		!process.env.PUSHER_CLUSTER
	) {
		return null;
	}

	pusher = new Pusher({
		appId: process.env.PUSHER_APP_ID,
		key: process.env.PUSHER_KEY,
		secret: process.env.PUSHER_SECRET,
		cluster: process.env.PUSHER_CLUSTER,
		useTLS: true,
	});

	return pusher;
};
