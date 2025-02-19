"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { useState } from "react";
import RegistrationModal from "./RegistrationModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Event Logo - Top */}
      <div className="absolute top-0 sm:top-2 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-2xl -z-10" />
          <Image
            src="/IGNITE_LOGO.svg"
            alt="Event Logo"
            fill
            className="object-contain hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>
      </div>

      {/* University and Club logos */}
      <div className="absolute top-32 sm:top-40 left-0 right-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-8 sm:space-x-12">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src="/white_logo.png"
                alt="Club Logo"
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            <span className="text-4xl sm:text-5xl font-bold text-white/90 transform -skew-x-12 hover:scale-110 transition-transform duration-300">
              ×
            </span>

            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src="/logo_nit_.png"
                alt="University Logo"
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in relative z-10 mt-40 sm:mt-56">
          {/* Timer */}
          <div className="w-full overflow-x-auto">
            <CountdownTimer />
          </div>

          {/* Submit Button */}
          <div className="mt-16 sm:mt-20 relative z-20">
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />

            <button
              onClick={() => setIsModalOpen(true)}
              className="relative px-8 py-4 text-lg sm:text-xl font-bold
                       bg-gradient-to-r from-orange-500 to-red-500 
                       text-white rounded-lg
                       transform hover:scale-105 active:scale-95
                       transition-all duration-300 ease-out
                       shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/40
                       group overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="relative flex items-center justify-center space-x-2">
                <span className="tracking-wide">Start Submission</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              {/* Subtle shine effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
              />
            </button>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
