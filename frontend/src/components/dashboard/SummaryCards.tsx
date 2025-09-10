"use client"
import { SummaryCardProps } from "@/types";

interface SummaryCardsProps {
  items: SummaryCardProps[];
}

export default function SummaryCards({ items }: SummaryCardsProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "red": return "text-red-400";
      case "orange": return "text-orange-400";
      case "yellow": return "text-yellow-400";
      case "green": return "text-green-400";
      case "blue": return "text-blue-400";
      case "purple": return "text-purple-400";
      case "cyan": return "text-cyan-400";
      default: return "text-white";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {items.map((item, index) => (
        <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">{item.title}</h3>
          <p className={`text-3xl font-bold ${getColorClass(item.color)}`}>{item.count}</p>
          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
        </div>
      ))}
    </div>
  );
} 