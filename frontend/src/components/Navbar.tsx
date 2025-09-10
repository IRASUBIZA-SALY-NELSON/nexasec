"use client"
import Link from "next/link";
import Image from "next/image";
import Button from "./ui/Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthContext();

  return (
    <nav className="bg-black/80 backdrop-blur-sm py-1 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                height={120}
                width={120}
                src="/logo.png"
                alt="NexaSec Logo"
                className="object-contain h-16 w-auto"
              />
            </Link>
          </div>
          
          <div className="hidden md:flex flex-grow justify-center items-center space-x-8">
            <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Pricing
            </a>
            <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Testimonials
            </a>
            <Link href="/learn-more" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Learn More
            </Link>
            
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
            )}
          </div>
          <div className="hidden md:flex flex-shrink-0 justify-end space-x-4">
            {isAuthenticated ? (
              <Button 
                onClick={logout}
                className="border border-cyan-400 text-cyan-400 font-medium py-1 px-6 rounded-full text-center hover:bg-cyan-900/80 transition-colors"
              >
                Logout
              </Button>
            ) : (
              <Button 
                pathname="/auth/login" 
                className="border border-cyan-400 text-cyan-400 font-medium py-1 px-6 rounded-full text-center hover:bg-cyan-900/80 transition-colors"
              >
                Login
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyan-400 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4 px-4">
              <a 
                href="#pricing" 
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#features" 
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <Link 
                href="/learn-more" 
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Learn More
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-gray-800">
                {isAuthenticated ? (
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full border border-cyan-400 text-cyan-400 font-medium py-2 px-4 rounded-full text-center hover:bg-cyan-900/80 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/auth/login"
                    className="block w-full border border-cyan-400 text-cyan-400 font-medium py-2 px-4 rounded-full text-center hover:bg-cyan-900/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 