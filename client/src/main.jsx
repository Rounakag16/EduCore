import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContextProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
				<AppContextProvider>
					<App />
				</AppContextProvider>
			</ClerkProvider>
		</BrowserRouter>
	</StrictMode>,
);
