import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContextProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<AppContextProvider>
					<App />
				</AppContextProvider>
			</ErrorBoundary>
		</BrowserRouter>
	</StrictMode>,
);
