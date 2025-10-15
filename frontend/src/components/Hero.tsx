import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  id?: string;
}

export default function Hero({ id }: HeroProps) {
  return (
    <div className="relative overflow-hidden -mt-10" id={id}>

      <div className="px-4 sm:px-6 md:px-8 relative z-10  md:mx-10">
        <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto">
          <div className="w-full md:w-3/5 mb-10 md:mb-0 md:pr-4  md:z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 space-y-2">
              <span className="block">Secure your network with</span>
              <span className="block text-cyan-400">Cybersecurity Strategies</span>
              <span className="block md:relative md:z-20">for Growth and Resilience</span>
            </h1>
            <p className="text-base sm:text-lg mb-8 max-w-2xl md:relative md:z-20">
              Unlock your business&apos;s full potential with our comprehensive
              cybersecurity strategies. Safeguard your growth and resilience in the
              digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:relative md:z-20">
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
                TALK WITH US
              </Link>
            </div>
          </div>

          {/* Image section with decorative corners */}
          <div className="w-full md:w-2/5 flex justify-center md:justify-end md:-ml-16 ">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-180 md:h-180">
              <Image
                src="/cybersecurityLand.png"
                alt="Cybersecurity Shield"
                fill
                sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 720px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block absolute top-16 right-16 w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="hidden sm:block absolute bottom-16 left-16 w-8 h-8 md:w-12 md:h-12 border-b-2 border-l-2 border-cyan-400"></div>

      <div className="absolute inset-0 opacity-10 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -right-20 top-1/4 text-cyan-400 text-opacity-30 text-xs font-mono">
          01001010 10101010 01010101<br />
          10101010 01010101 10101010<br />
          01010101 10101010 01010101<br />
          10101010 01010101 10101010<br />
          01010101 10101010 01010101
        </div>
        <div className="absolute left-20 bottom-1/4 text-cyan-400 text-opacity-30 text-xs font-mono">
          01001010 10101010 01010101<br />
          10101010 01010101 10101010<br />
          01010101 10101010 01010101<br />
          10101010 01010101 10101010<br />
          01010101 10101010 01010101
        </div>
      </div>
    </div>
  );
} 