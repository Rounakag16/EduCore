// Extract a YouTube video ID from any common URL format the "Share" button
// can produce (youtu.be, watch?v=, embed/, shorts/, live/), with or without
// an appended ?si= tracking param. Used anywhere a lecture URL needs to be
// turned into a playable video ID — keep it here as the single source of
// truth rather than re-implementing it per component.
export const getYoutubeId = (url) => {
	if (!url) return "";
	const trimmed = url.trim();

	try {
		const parsed = new URL(trimmed);
		const host = parsed.hostname.replace(/^www\.|^m\./, "");

		if (host === "youtu.be") {
			return parsed.pathname.slice(1).split("/")[0];
		}

		if (host === "youtube.com" || host === "youtube-nocookie.com") {
			if (parsed.searchParams.has("v")) {
				return parsed.searchParams.get("v");
			}
			const pathParts = parsed.pathname.split("/").filter(Boolean);
			if (["embed", "shorts", "live"].includes(pathParts[0])) {
				return pathParts[1];
			}
		}
	} catch {
		// Not a valid URL — they may have pasted the raw video ID directly
	}

	// Fallback: strip any query string and take the last path segment
	return trimmed.split(/[?&]/)[0].split("/").filter(Boolean).pop() || "";
};
