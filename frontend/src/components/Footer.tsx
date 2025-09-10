"use client"

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6 px-4 sm:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-400 text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} NexaSec. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-cyan-400">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-cyan-400">Terms of Service</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-cyan-400">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 