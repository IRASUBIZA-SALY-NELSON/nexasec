"use client"
import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function NotFound() {
  useEffect(() => {
    // Report 404 errors to Sentry
    Sentry.captureMessage("404 Page Not Found", {
      level: "warning",
      extra: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : ''
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-4">
      <div className="backdrop-blur-sm bg-gray-900/40 rounded-lg border border-gray-800/60 p-8 shadow-xl max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-900/20 mb-4">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/"
          className="inline-block bg-cyan-400 text-black font-medium py-2 px-6 rounded-md hover:bg-cyan-300 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 