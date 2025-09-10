"use client"
import FeatureCard from "./FeatureCard";
import { BrainCircuit, BugPlay } from "lucide-react";

interface FeaturesProps {
  id: string;
}

export default function Features({ id }: FeaturesProps) {
  return (
    <div id={id} className="container mx-auto px-6 py-16 relative z-10">
      <h2 className="text-3xl font-bold text-center mb-12">Our Security Solutions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Vulnerability Assessment"
          description="Identify and prioritize security weaknesses before they can be exploited."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <FeatureCard
          title="Intrusion Detection"
          description="Real-time monitoring and alerts for suspicious activities in your network."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <FeatureCard
          title="Security Reporting"
          description="Comprehensive analytics and actionable insights to improve your security posture."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <FeatureCard
          title="AI integration"
          description="Implement AI to detect and respond to threats in real-time."
          icon={
            <BrainCircuit className="h-8 w-8 text-cyan-400" />
          }
        />
        <FeatureCard
          title="Penetration Testing"
          description="Perform your penetration testing with AI."
          icon={
            <BugPlay className="h-8 w-8 text-cyan-400" />
          }
        />
      </div>
    </div>
  );
} 