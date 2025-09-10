"use client"
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

// Simulated API call function
const submitContactForm = async (formData: any) => {
  // In a real app, this would be an API call
  console.log("Form submitted:", formData);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: "Thank you for your message!" };
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    interest: ""
  });
  const router = useRouter();

  // React Query mutation
  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      // Redirect after success
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
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
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block mb-8">
            <img src="/logo.png" alt="NexaSec Logo" className="h-12" />
          </Link>
          <h1 className="text-4xl font-bold mb-4">Get in <span className="text-cyan-400">Touch</span></h1>
          <div className="h-1 w-20 bg-cyan-400 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about our security solutions? Our team of experts in Rwanda is ready to help protect your business.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Contact Info */}
          <div className="lg:w-1/3">
            <div className="backdrop-blur-sm bg-gray-900/40 rounded-lg border border-gray-800/60 p-8 shadow-xl h-full">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-cyan-400/20 p-3 rounded-lg mr-4">
                    <Mail className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Email</h3>
                    <p className="text-white">contact@nexasec.rw</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-cyan-400/20 p-3 rounded-lg mr-4">
                    <Phone className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Phone</h3>
                    <p className="text-white">+250 788 123 456</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-cyan-400/20 p-3 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Location</h3>
                    <p className="text-white">Kigali Heights, KG 7 Ave<br />Kigali, Rwanda</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-cyan-400/20 p-3 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Business Hours</h3>
                    <p className="text-white">Monday - Friday: 8am - 6pm<br />Saturday: 9am - 1pm</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800/60">
                <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-800/80 hover:bg-cyan-400/20 transition-colors p-3 rounded-full">
                    <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800/80 hover:bg-cyan-400/20 transition-colors p-3 rounded-full">
                    <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800/80 hover:bg-cyan-400/20 transition-colors p-3 rounded-full">
                    <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800/60">
                <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 rounded-md p-4 border-l-4 border-cyan-400">
                  <h3 className="text-sm font-medium text-cyan-400 mb-2">Rwanda's Leading Cybersecurity Provider</h3>
                  <p className="text-sm text-gray-300">
                    Proudly serving businesses across Rwanda with cutting-edge security solutions tailored to the East African market.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="backdrop-blur-sm bg-gray-900/40 rounded-lg border border-gray-800/60 p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              <div className="relative">
                {mutation.isSuccess ? (
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-300 mb-4">
                      Thank you for reaching out. Our team will get back to you shortly.
                    </p>
                    <p className="text-sm text-gray-400">Redirecting you to the homepage...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {mutation.isError && (
                      <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-md text-red-200">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>There was an error sending your message. Please try again.</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-300">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your Company, Ltd."
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-300">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+250 7XX XXX XXX"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="interest" className="block mb-2 text-sm font-medium text-gray-300">
                        What are you interested in?
                      </label>
                      <select
                        id="interest"
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" disabled>Select your interest</option>
                        <option value="basic">Basic Protection Plan</option>
                        <option value="advanced">Advanced Security Plan</option>
                        <option value="enterprise">Enterprise Security Solutions</option>
                        <option value="consultation">Security Consultation</option>
                        <option value="training">Staff Security Training</option>
                        <option value="compliance">Regulatory Compliance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-300">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us about your security needs..."
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-200"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-medium py-3 px-4 rounded-md hover:from-cyan-400 hover:to-cyan-300 transition-all duration-300 flex justify-center items-center shadow-lg shadow-cyan-500/20 mt-6"
                    >
                      {mutation.isPending ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 