import Pusher from "pusher-js";

// Required env vars: VITE_PUSHER_KEY, VITE_PUSHER_CLUSTER
// (the app key is safe to expose client-side — that's how Pusher's model works;
// the app secret used to broadcast lives only on the server, see server/configs/pusher.js)
let pusherClient = null;

export const getPusherClient = () => {
	if (pusherClient) return pusherClient;

	const key = import.meta.env.VITE_PUSHER_KEY;
	const cluster = import.meta.env.VITE_PUSHER_CLUSTER;

	if (!key || !cluster) {
		console.warn(
			"[pusher] VITE_PUSHER_KEY / VITE_PUSHER_CLUSTER not set — live discussion updates disabled. " +
				"Messages still send and save, they just won't appear live for other viewers without a refresh.",
		);
		return null;
	}

	pusherClient = new Pusher(key, { cluster });
	return pusherClient;
};
