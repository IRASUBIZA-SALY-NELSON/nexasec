"use client"
import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

interface PlanSelectorProps {
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

export default function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const plans: Plan[] = [
    {
      id: "basic",
      name: "Basic",
      price: "$49/month",
      features: [
        "Network scanning",
        "Basic vulnerability detection",
        "Weak password testing",
        "5 scans per month"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      price: "$99/month",
      recommended: true,
      features: [
        "Everything in Basic",
        "Full vulnerability analysis",
        "Custom password lists",
        "Unlimited scans",
        "Priority support"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Contact us",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated support",
        "Compliance reporting",
        "On-premise deployment option"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Select a Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border rounded-lg p-6 transition-all ${
              selectedPlan === plan.id
                ? "border-cyan-500 bg-cyan-900/20"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                Recommended
              </div>
            )}
            
            <div className="flex justify-center mb-4">
              {plan.id === "basic" ? (
                <Shield className="h-12 w-12 text-cyan-400" />
              ) : plan.id === "professional" ? (
                <ShieldCheck className="h-12 w-12 text-cyan-400" />
              ) : (
                <ShieldAlert className="h-12 w-12 text-cyan-400" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-center mb-2">{plan.name}</h3>
            <p className="text-xl font-bold text-center mb-4">{plan.price}</p>
            
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <button
                type="button"
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                }`}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 