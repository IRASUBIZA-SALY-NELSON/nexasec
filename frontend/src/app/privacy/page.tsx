"use client"
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 relative">
      {/* Binary code background effect */}
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
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="mb-8">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="NexaSec Logo" className="h-12" />
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-gray-900/40 rounded-lg border border-gray-800/60 p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <div className="h-1 w-16 bg-cyan-400 mb-6"></div>
          
          <div className="prose prose-invert prose-cyan max-w-none">
            <p className="text-gray-300">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <h2>1. Introduction</h2>
            <p>
              NexaSec ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              We take your privacy seriously and encourage you to read this policy carefully. By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We may collect several types of information from and about users of our services, including:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, telephone number, company name, job title, and any other information you provide when creating an account or using our services.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, operating system, device information, and usage details.</li>
              <li><strong>Security Assessment Data:</strong> Information about your digital infrastructure, network configuration, and potential vulnerabilities identified during security assessments.</li>
              <li><strong>Service Usage Data:</strong> Information about how you use our services, including features accessed, time spent, and actions taken.</li>
            </ul>
            
            <h2>3. How We Collect Information</h2>
            <p>
              We collect information through:
            </p>
            <ul>
              <li>Direct interactions when you create an account, subscribe to our services, or contact us.</li>
              <li>Automated technologies such as cookies, server logs, and similar technologies.</li>
              <li>Security scanning and monitoring tools when providing our cybersecurity services.</li>
              <li>Third-party sources, such as business partners or public databases, where permitted by law.</li>
            </ul>
            
            <h2>4. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Identify and analyze security threats and vulnerabilities.</li>
              <li>Send administrative information, such as updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
              <li>Personalize your experience and deliver content relevant to your interests.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
              <li>Comply with legal obligations and enforce our terms of service.</li>
            </ul>
            
            <h2>5. Disclosure of Your Information</h2>
            <p>
              We may disclose your personal information to:
            </p>
            <ul>
              <li>Our subsidiaries and affiliates.</li>
              <li>Contractors, service providers, and other third parties we use to support our business.</li>
              <li>A buyer or other successor in the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets.</li>
              <li>Fulfill the purpose for which you provide it.</li>
              <li>Comply with any court order, law, or legal process, including responding to any government or regulatory request.</li>
              <li>Enforce or apply our terms of service and other agreements.</li>
              <li>Protect the rights, property, or safety of our company, our customers, or others.</li>
            </ul>
            
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from accidental loss, unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is not completely secure, and we cannot guarantee the security of your personal information transmitted to our services.
            </p>
            
            <h2>7. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as reasonably necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
            </p>
            
            <h2>8. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access your personal information.</li>
              <li>The right to rectify inaccurate personal information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to restrict processing of your personal information.</li>
              <li>The right to data portability.</li>
              <li>The right to object to processing of your personal information.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
            
            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 18 years of age, and we do not knowingly collect personal information from children under 18. If we learn we have collected or received personal information from a child under 18, we will delete that information.
            </p>
            
            <h2>10. Changes to Our Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. If we make material changes, we will notify you by email or through a notice on our website prior to the change becoming effective.
            </p>
            
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@nexasec.rw" className="text-cyan-400 hover:text-cyan-300 transition-colors">privacy@nexasec.rw</a>.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 