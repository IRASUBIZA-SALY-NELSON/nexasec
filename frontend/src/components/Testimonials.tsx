"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ClientOnly from "./ClientOnly";
import Image from "next/image";

export default function Testimonials({ id }: { id?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "NexaSec has transformed our security posture. Their AI-powered threat detection caught vulnerabilities that our previous provider missed for years.",
      author: "Sarah Mutoni",
      title: "CTO, RwandaFinTech",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "The team at NexaSec understands the unique security challenges we face in East Africa. Their solutions are tailored to our specific needs.",
      author: "Irasubiza Saly Nelson",
      title: "IT Director, Kigali Innovations",
      image: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      quote: "After experiencing a security breach with our previous provider, we switched to NexaSec. Their incident response team was exceptional in helping us recover.",
      author: "Diane Uwimana",
      title: "CEO, EastAfrica Commerce",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 relative z-10" id={id}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hear from organizations across East Africa who have strengthened their security with NexaSec.
          </p>
        </div>

        <ClientOnly>
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentIndex === index ? 1 : 0,
                  x: currentIndex === index ? 0 : currentIndex > index ? -100 : 100
                }}
                transition={{ duration: 0.5 }}
                className={`${currentIndex === index ? "block" : "hidden"
                  } bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center`}
              >
                <div className="mb-6">
                  <svg className="w-10 h-10 text-cyan-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-300 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image || "/logo.png"}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                      sizes="48px"
                      unoptimized
                      onError={(e) => {
                        // Fallback to local logo if remote avatar fails
                        (e.currentTarget as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Dots navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-cyan-400" : "bg-gray-600"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
  );
}