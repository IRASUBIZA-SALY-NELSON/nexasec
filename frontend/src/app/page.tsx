"use client"
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 text-white">
      <div className="relative overflow-hidden">
        {/* Common background elements that appear across all sections */}
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
        
        {/* Glowing orbs that appear across the page */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <Navbar />
        <Hero id="hero" />
        <Features id="features" />
        <Testimonials id="testimonials" />
        <Pricing id="pricing" />
        <Footer />
      </div>
    </div>
  );
}
