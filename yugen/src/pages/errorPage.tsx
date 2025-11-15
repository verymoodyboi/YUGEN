// src/components/ErrorBoundary.tsx
import React from "react";
import FuzzyText from "../L3/FuzzyText";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-emerald-50 dark:bg-emerald-950 p-4">
          <div className="w-full max-w-3xl rounded-3xl border-2 border-emerald-950 bg-emerald-50 dark:bg-emerald-950/90 backdrop-blur-md shadow-xl p-6 overflow-y-auto max-h-[80vh] flex flex-col items-center space-y-6">
            {/* Centered FuzzyText */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <FuzzyText baseIntensity={0.2}>404</FuzzyText>
              <FuzzyText baseIntensity={0.2}>Unexpected Error</FuzzyText>
              <p className="text-emerald-950 dark:text-emerald-50/70 text-sm mt-2 max-w-md">
                We’re sorry this happened. Try refreshing the page. If the issue
                continues, please follow the steps below:
              </p>
            </div>

            {/* Steps */}
            <div className="w-full flex flex-col md:flex-row gap-6 justify-center">
              <ul className="list-decimal list-inside space-y-2 text-emerald-950 dark:text-emerald-50/70 text-sm flex-1">
                <li>Open the dev tools (F12)</li>
                <li>Navigate to the console tab</li>
                <li>Copy or screenshot the red error message</li>
                <li>Send it to us via contact info below</li>
              </ul>

              {/* Contact info */}
              <div className="flex-1 space-y-1 text-emerald-950 dark:text-emerald-50/70 text-sm">
                <p className="font-bold text-emerald-950 dark:text-emerald-50">
                  Contact info:
                </p>
                <p>Email: support@yourapp.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Streaming St, Film City, USA</p>
              </div>
            </div>

            <p className="text-emerald-950 dark:text-emerald-50/70 text-sm">
              Thanks for your patience :)
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
