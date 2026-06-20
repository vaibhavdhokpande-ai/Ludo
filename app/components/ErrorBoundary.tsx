"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("App error boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-[100dvh] w-screen flex-col items-center justify-center gap-4 p-6 text-center"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, #15436b 0%, #0a1f33 55%, #061320 100%)",
          }}
        >
          <p className="text-lg font-bold text-white">Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-amber-400 px-6 py-2 text-sm font-bold text-amber-950"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
