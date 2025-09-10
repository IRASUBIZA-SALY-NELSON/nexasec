"use client"
import React, { useEffect, useState } from "react";

interface CyberLoaderProps {
  fullScreen?: boolean;
  text?: string;
  duration?: number; // in milliseconds
  onComplete?: () => void;
}

export default function CyberLoader({ 
  fullScreen = true, 
  text = "Securing connection...", 
  duration = 2000,
  onComplete
}: CyberLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [securityMessages, setSecurityMessages] = useState<string[]>([]);
  
  const messages = [
    "Initializing secure connection...",
    "Verifying digital signature...",
    "Encrypting data channels...",
    "Scanning for vulnerabilities...",
    "Establishing secure tunnel...",
    "Authenticating credentials...",
    "Applying security protocols..."
  ];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    
    if (duration > 0) {
      // Progress bar animation
      const step = 100 / (duration / 10);
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + step;
          if (newProgress >= 100) {
            clearInterval(interval);
            clearInterval(messageInterval);
            if (onComplete) {
              setTimeout(onComplete, 300);
            }
            return 100;
          }
          return newProgress;
        });
      }, 10);
      
      // Security messages animation
      let messageIndex = 0;
      messageInterval = setInterval(() => {
        if (messageIndex < messages.length) {
          setSecurityMessages(prev => [...prev, messages[messageIndex]]);
          messageIndex++;
        }
      }, duration / (messages.length + 1));
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [duration, onComplete]);
  
  const loader = (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-16 h-16 relative mb-6">
        <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 bg-black/80 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-cyan-400 mb-2">{text}</h3>
      
      <div className="w-full bg-gray-800/50 rounded-full h-2 mb-6 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="w-full max-h-32 overflow-y-auto font-mono text-xs text-gray-400 bg-black/30 p-3 rounded-md">
        {securityMessages.map((msg, index) => (
          <div key={index} className="mb-1 flex items-start">
            <span className="text-cyan-400 mr-2">&gt;</span>
            <span>{msg}</span>
          </div>
        ))}
        {progress < 100 && (
          <div className="flex items-center">
            <span className="text-cyan-400 mr-2">&gt;</span>
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Binary code background effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -right-20 top-1/4 text-cyan-400 text-opacity-30 text-xs font-mono">
            01001010 10101010 01010101<br />
            10101010 01010101 10101010<br />
            01010101 10101010 01010101
          </div>
          <div className="absolute left-20 bottom-1/4 text-cyan-400 text-opacity-30 text-xs font-mono">
            01001010 10101010 01010101<br />
            10101010 01010101 10101010<br />
            01010101 10101010 01010101
          </div>
        </div>
        {loader}
      </div>
    );
  }
  
  return loader;
} 