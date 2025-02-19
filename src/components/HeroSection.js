"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { useState } from "react";
import RegistrationModal from "./RegistrationModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Event Logo - Top */}
      <div className="fixed top-0 sm:top-2 left-1/2 -translate-x-1/2 z-50">
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
      <div className="fixed top-32 sm:top-40 left-0 right-0 z-40">
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-16 sm:mt-20 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold
                     bg-primary hover:bg-primary-dark text-white rounded-lg
                     transform hover:scale-105 active:scale-95
                     transition-all duration-300 ease-in-out
                     shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                     group"
          >
            Start Submission
            <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
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
