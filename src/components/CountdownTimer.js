"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

function TimeUnit({ value }) {
  return (
    <span className="text-6xl sm:text-8xl lg:text-9xl font-black text-white">
      {value.toString().padStart(2, "0")}
    </span>
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
    const supabase = createClient();

    const fetchDeadline = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "submission_deadline")
          .single();

        if (error) throw error;
        if (data?.value) {
          const newDeadline = new Date(data.value);
          setDeadline(newDeadline);
          setIsExpired(new Date() >= newDeadline);
        }
      } catch (error) {
        console.error("Error fetching deadline:", error);
      }
    };

    // Initial fetch
    fetchDeadline();

    // Subscribe to changes
    const channel = supabase
      .channel("settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: "key=eq.submission_deadline",
        },
        (payload) => {
          if (payload.new?.value) {
            const newDeadline = new Date(payload.new.value);
            setDeadline(newDeadline);
            setIsExpired(new Date() >= newDeadline);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        <div className="text-6xl sm:text-8xl lg:text-9xl font-black text-red-500 animate-pulse">
          00:00:00
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center">
        <TimeUnit value={timeUnits.hours} />
        <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-orange-500/80 mx-2 sm:mx-4 animate-pulse">
          :
        </span>
        <TimeUnit value={timeUnits.minutes} />
        <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-orange-500/80 mx-2 sm:mx-4 animate-pulse">
          :
        </span>
        <TimeUnit value={timeUnits.seconds} />
      </div>
    </div>
  );
}
