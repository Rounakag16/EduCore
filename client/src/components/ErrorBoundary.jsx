import React from "react";

// Catches render-time errors anywhere below it in the tree so one broken
// component doesn't blank the entire app. Logs the error and shows a
// simple recovery screen instead of a white page.
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		// Swap this for a real error-reporting service (Sentry, LogRocket, etc.)
		console.error("Uncaught error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-white px-6">
					<div className="text-center max-w-md">
						<h1 className="text-3xl font-semibold text-gray-800 mb-3">
							Something went wrong
						</h1>
						<p className="text-gray-500 mb-6">
							An unexpected error occurred. You can try going back to the
							homepage — if this keeps happening, please let us know.
						</p>
						<button
							onClick={this.handleReset}
							className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
						>
							Back to Home
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
