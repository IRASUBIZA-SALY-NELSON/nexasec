"use client"
import { ActionButtonsProps } from "@/types";

export default function ActionButtons({ primaryAction, secondaryAction }: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <button 
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className={`${
          primaryAction.disabled 
            ? "bg-gray-600 cursor-not-allowed" 
            : "bg-cyan-500 hover:bg-cyan-600"
        } text-black px-4 py-2 rounded-md text-sm font-medium transition-colors`}
      >
        {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
        {primaryAction.label}
      </button>
      
      {secondaryAction && (
        <button 
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          className={`${
            secondaryAction.disabled 
              ? "bg-gray-700 cursor-not-allowed" 
              : "bg-gray-800 hover:bg-gray-700"
          } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
        >
          {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
} 