"use client"
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <div className="h-1 w-16 bg-cyan-400 mb-6"></div>
          
          <div className="prose prose-invert prose-cyan max-w-none">
            <p className="text-gray-300">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to NexaSec ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website and services operated by NexaSec.
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the Service.
            </p>
            
            <h2>2. Communications</h2>
            <p>
              By creating an Account on our service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.
            </p>
            
            <h2>3. Subscriptions</h2>
            <p>
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis, depending on the type of subscription plan you select. Billing cycles are set on a monthly or annual basis.
            </p>
            <p>
              At the end of each billing period, your subscription will automatically renew under the same conditions unless you cancel it or NexaSec cancels it. You may cancel your subscription renewal either through your online account management page or by contacting our customer support team.
            </p>
            
            <h2>4. Security Services</h2>
            <p>
              Our cybersecurity services are designed to protect your digital assets and infrastructure from threats. However, we cannot guarantee complete protection against all possible security threats. Our services operate on a best-effort basis, utilizing industry-standard practices and technologies.
            </p>
            
            <h2>5. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            
            <h2>6. Prohibited Uses</h2>
            <p>
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
            </p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
            </ul>
            
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall NexaSec, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h2>8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Rwanda, without regard to its conflict of law provisions.
            </p>
            
            <h2>9. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@nexasec.rw" className="text-cyan-400 hover:text-cyan-300 transition-colors">legal@nexasec.rw</a>.
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