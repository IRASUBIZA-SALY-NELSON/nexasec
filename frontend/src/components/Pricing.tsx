"use client"
import React, { useState } from "react";
import Link from "next/link";
import { PricingProps, PricingTierProps } from "@/types";

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  description,
  features,
  highlighted = false,
  buttonText,
  buttonLink,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`rounded-lg p-4 sm:p-6 flex flex-col h-full transition-all duration-300 ${
        highlighted 
          ? " border-2 border-cyan-400 shadow-lg shadow-cyan-400/20 -translate-y-2" 
          : " border border-gray-800 hover:bg-gradient-to-br hover:from-black hover:to-gray-900 hover:border-2 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-2"
      }`}
    >
      <div className="mb-4">
        <h3 className={`text-lg sm:text-xl font-bold ${highlighted ? "text-cyan-400" : "text-white"}`}>{name}</h3>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-gray-400 ml-1">/month</span>}
        </div>
        <p className="mt-2 text-sm sm:text-base text-gray-400">{description}</p>
      </div>
      
      <div className="flex-grow">
        <ul className="space-y-2 sm:space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg 
                className={`h-5 w-5 flex-shrink-0 ${highlighted ? "text-cyan-400" : "text-gray-400"} mr-2 mt-0.5`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm sm:text-base text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <Link 
        href={buttonLink}
        className={`text-center py-2 sm:py-3 px-4 rounded-full font-medium transition-colors ${
          highlighted
            ? "bg-cyan-400 text-black hover:bg-cyan-300" 
            : "border border-cyan-400 text-cyan-400 hover:bg-cyan-900/80"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default function Pricing({ id }: PricingProps) {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10" id={id}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your security needs. All plans include 24/7 monitoring and support.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <PricingTier
            name="Basic Security"
            price="$299"
            description="Essential protection for small businesses"
            features={[
              "Vulnerability Assessment",
              "Firewall Configuration",
              "Security Monitoring",
              "Email Protection",
              "Basic Threat Detection",
              "Quarterly Security Report"
            ]}
            buttonText="Get Started"
            buttonLink="/auth/signup?plan=basic"
          />
          
          <PricingTier
            name="Advanced Security"
            price="$699"
            description="Comprehensive protection for growing companies"
            features={[
              "Everything in Basic",
              "Advanced Threat Detection",
              "Cloud Security",
              "Employee Security Training",
              "Incident Response Team",
              "Monthly Security Assessment"
            ]}
           
            buttonText="Get Started"
            buttonLink="/auth/signup?plan=advanced"
          />
          
          <PricingTier
            name="Enterprise"
            price="Custom"
            description="Tailored security solutions for large organizations"
            features={[
              "Everything in Advanced",
              "Custom Security Architecture",
              "Dedicated Security Team",
              "AI-Powered Threat Intelligence",
              "Regulatory Compliance",
              "Weekly Security Assessments",
              "Executive Security Briefings"
            ]}
            buttonText="Contact Us"
            buttonLink="/contact"
          />
        </div>
        
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-400">
            Need a custom solution? <Link href="/contact" className="text-cyan-400 hover:underline">Contact our team</Link> for a personalized quote.
          </p>
        </div>
      </div>
    </section>
  );
} 