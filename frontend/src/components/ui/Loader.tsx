"use client"
import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: "cyan" | "white" | "black";
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ 
  size = "md", 
  color = "cyan", 
  text, 
  fullScreen = false 
}: LoaderProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  // Color mappings
  const colorMap = {
    cyan: "text-cyan-400",
    white: "text-white",
    black: "text-black"
  };
  
  const loader = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'h-screen' : ''}`}>
      <div className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      {text && <p className={`mt-3 ${colorMap[color]} text-sm font-medium`}>{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }
  
  return loader;
}

