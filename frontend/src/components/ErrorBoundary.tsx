"use client"
import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture the error with Sentry
    Sentry.captureException(error, { 
      extra: { 
        componentStack: errorInfo.componentStack,
      }
    });
    
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-4">
          <div className="backdrop-blur-sm bg-gray-900/40 rounded-lg border border-gray-800/60 p-8 shadow-xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-6">
                We've been notified about this issue and are working to fix it.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/"
                  className="block w-full bg-cyan-400 text-black font-medium py-2 px-4 rounded-md hover:bg-cyan-300 transition-colors"
                >
                  Return to Home
                </Link>
                <button 
                  onClick={() => window.location.reload()}
                  className="block w-full border border-cyan-400 text-cyan-400 font-medium py-2 px-4 rounded-md hover:bg-cyan-900/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 