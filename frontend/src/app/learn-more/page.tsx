import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Shield, Lock, Server, Users, Database, Code } from "lucide-react";

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 text-white">
      <div className="relative overflow-hidden">
        {/* Common background elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0 overflow-hidden">
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
        
        {/* Glowing orbs */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        <Navbar />
        
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Learn More About Our Cybersecurity Solutions</h1>
            <div className="h-1 w-24 bg-cyan-400 mb-10"></div>
            
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-xl text-gray-300 mb-10">
                At NexaSec, we provide comprehensive cybersecurity solutions designed to protect your business
                from evolving digital threats. Our approach combines advanced technology with expert knowledge
                to deliver robust security that grows with your business.
              </p>
              
              <h2 className="text-2xl font-bold mt-12 mb-6 text-cyan-400">Our Comprehensive Approach</h2>
              <p className="text-gray-300 mb-8">
                We believe in a multi-layered security strategy that addresses vulnerabilities at every level
                of your digital infrastructure. From network security to endpoint protection, our solutions
                provide complete coverage against modern cyber threats.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-8 w-8 text-cyan-400 mr-3" />
                    <h3 className="text-xl font-bold">Threat Prevention</h3>
                  </div>
                  <p className="text-gray-300">
                    Proactively identify and neutralize threats before they can impact your business operations.
                  </p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Lock className="h-8 w-8 text-cyan-400 mr-3" />
                    <h3 className="text-xl font-bold">Data Protection</h3>
                  </div>
                  <p className="text-gray-300">
                    Secure your sensitive data with advanced encryption and access control mechanisms.
                  </p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Server className="h-8 w-8 text-cyan-400 mr-3" />
                    <h3 className="text-xl font-bold">Infrastructure Security</h3>
                  </div>
                  <p className="text-gray-300">
                    Protect your servers, networks, and cloud environments from unauthorized access and attacks.
                  </p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-cyan-400 mr-3" />
                    <h3 className="text-xl font-bold">Security Training</h3>
                  </div>
                  <p className="text-gray-300">
                    Empower your team with the knowledge to recognize and respond to security threats.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mt-12 mb-6 text-cyan-400">Why Choose NexaSec?</h2>
              <ul className="space-y-4 text-gray-300 mb-10">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Local Expertise:</strong> We understand the unique security challenges faced by businesses in East Africa.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>AI-Powered Solutions:</strong> Our advanced AI systems detect and respond to threats in real-time.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>24/7 Monitoring:</strong> Our security operations center provides round-the-clock protection.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Scalable Solutions:</strong> Our services grow with your business, providing the right level of protection at every stage.</span>
                </li>
              </ul>
              
              <div className="mt-12 bg-gradient-to-br from-black to-gray-900 border-2 border-cyan-400 rounded-lg p-8 shadow-lg shadow-cyan-400/20">
                <h3 className="text-2xl font-bold mb-4">Ready to secure your business?</h3>
                <p className="mb-6">
                  Contact our team today to schedule a free security assessment and discover how NexaSec can protect your digital assets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/auth/signup" 
                    className="bg-cyan-400 text-black font-medium py-3 px-8 rounded-full text-center hover:bg-cyan-200 transition-colors w-full sm:w-auto"
                  >
                    Get Started
                  </Link>
                  <Link 
                    href="/contact" 
                    className="border border-cyan-400 text-cyan-400 font-medium py-3 px-8 rounded-full text-center hover:bg-cyan-900/30 transition-colors w-full sm:w-auto"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
} 