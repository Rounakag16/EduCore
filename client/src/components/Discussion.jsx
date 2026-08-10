import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { getPusherClient } from "../configs/pusher";

const Discussion = ({ courseId }) => {
	const { backendUrl, getToken, userData } = useContext(AppContext);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const messagesContainerRef = useRef(null);

	const fetchMessages = async () => {
		setLoading(true);
		try {
			const token = await getToken();
			const { data } = await axios.get(backendUrl + `/api/discussion/${courseId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (data.success) {
				setMessages(data.messages);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (courseId) fetchMessages();
	}, [courseId]);

	// Subscribe to this course's live channel — new messages from any
	// enrolled student/educator appear instantly without a refresh.
	useEffect(() => {
		if (!courseId) return;

		const pusher = getPusherClient();
		if (!pusher) return; // falls back gracefully — messages just won't update live

		const channel = pusher.subscribe(`course-${courseId}`);
		channel.bind("new-message", (payload) => {
			setMessages((prev) => {
				if (prev.some((m) => m._id === payload._id)) return prev; // avoid dupes
				return [...prev, payload];
			});
		});

		return () => {
			channel.unbind("new-message");
			pusher.unsubscribe(`course-${courseId}`);
		};
	}, [courseId]);

	useEffect(() => {
		// Scroll only this component's own message list to its latest
		// message — never the page. The previous version used
		// bottomRef.scrollIntoView(), which by default can scroll ANY
		// scrollable ancestor (including the whole page) to bring its target
		// into view. Since this effect fires the moment the initial message
		// fetch resolves, that was dragging the entire page down to the
		// Discussion panel right after landing on it.
		const container = messagesContainerRef.current;
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}, [messages]);

	const handleSend = async (e) => {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;

		setSending(true);
		try {
			const token = await getToken();
			const { data } = await axios.post(
				backendUrl + `/api/discussion/${courseId}`,
				{ message: trimmed },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (data.success) {
				setText("");
				// Add locally right away — if Pusher is configured, the
				// dedupe check above prevents it from being added twice
				// when the broadcast echoes back.
				setMessages((prev) =>
					prev.some((m) => m._id === data.message._id) ? prev : [...prev, data.message],
				);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="border border-gray-500/30 rounded-md flex flex-col h-96">
			<div className="px-4 py-3 border-b border-gray-500/20 font-medium text-gray-800">
				Course Discussion
			</div>
			<div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
				{loading ? (
					<p className="text-sm text-gray-400">Loading discussion…</p>
				) : messages.length === 0 ? (
					<p className="text-sm text-gray-400">
						No messages yet — ask a question or start the conversation.
					</p>
				) : (
					messages.map((m) => (
						<div key={m._id} className="flex gap-2 items-start">
							<img
								src={m.userImage || assets.profile}
								alt={m.userName}
								className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
							/>
							<div className="min-w-0">
								<div className="flex items-baseline gap-2">
									<span className="text-sm font-medium text-gray-800">{m.userName}</span>
									<span className="text-xs text-gray-400">
										{new Date(m.createdAt).toLocaleString(undefined, {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<p className="text-sm text-gray-700 break-words">{m.message}</p>
							</div>
						</div>
					))
				)}
			</div>
			<form onSubmit={handleSend} className="flex gap-2 px-3 py-3 border-t border-gray-500/20">
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder={userData ? "Ask a question…" : "Log in to join the discussion"}
					disabled={!userData || sending}
					maxLength={2000}
					className="flex-1 border border-gray-500/30 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
				/>
				<button
					type="submit"
					disabled={!userData || sending || !text.trim()}
					className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
				>
					{sending ? "..." : "Send"}
				</button>
			</form>
		</div>
	);
};

export default Discussion;
