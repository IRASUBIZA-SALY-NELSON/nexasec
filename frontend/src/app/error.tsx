"use client"
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
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
            <button 
              onClick={reset}
              className="block w-full bg-cyan-400 text-black font-medium py-2 px-4 rounded-md hover:bg-cyan-300 transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="block w-full border border-cyan-400 text-cyan-400 font-medium py-2 px-4 rounded-md hover:bg-cyan-900/30 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 