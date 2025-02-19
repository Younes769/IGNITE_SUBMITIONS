"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
      <div className="glass text-4xl sm:text-6xl lg:text-7xl font-black font-mono w-24 sm:w-32 lg:w-36 h-24 sm:h-32 lg:h-36 flex items-center justify-center rounded-xl mb-2 group hover:bg-white/10 hover:scale-105 transition-all duration-300 border border-white/10 bg-black/30">
        <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-dark transition-all duration-300">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="text-gray-400 text-sm sm:text-base font-bold uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

export default function CountdownTimer() {
  // Set a default deadline 24 hours from now
  const defaultDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [timeUnits, setTimeUnits] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "submission_deadline")
          .single();

        if (error) throw error;
        if (data?.value) {
          setDeadline(new Date(data.value));
        }
      } catch (error) {
        console.error("Error fetching deadline:", error);
        // Keep using the default deadline if there's an error
      }
    };

    fetchDeadline();
  }, []);

  useEffect(() => {
    if (!deadline) return;

    const updateTimer = () => {
      const now = new Date();
      if (now >= deadline) {
        setIsExpired(true);
        return;
      }

      const distance = deadline.getTime() - now.getTime();
      const totalHours = Math.floor(distance / (1000 * 60 * 60));

      setTimeUnits({
        hours: totalHours,
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="glass-darker text-4xl sm:text-5xl font-black text-red-500 px-8 py-6 rounded-xl animate-pulse border border-red-500/30 bg-black/30">
          Submission Closed
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center items-center gap-2 sm:gap-3">
        <TimeUnit value={timeUnits.hours} label="Hours" />
        <div className="text-4xl sm:text-6xl font-mono text-primary/80 font-black animate-pulse mt-[-1rem]">
          :
        </div>
        <TimeUnit value={timeUnits.minutes} label="Minutes" />
        <div className="text-4xl sm:text-6xl font-mono text-primary/80 font-black animate-pulse mt-[-1rem]">
          :
        </div>
        <TimeUnit value={timeUnits.seconds} label="Seconds" />
      </div>
    </div>
  );
}
