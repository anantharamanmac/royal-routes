// src/components/member/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEPARTURE = new Date("2026-12-24T20:00:00+05:30"); // 24 Dec 2026, 8 PM IST

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = DEPARTURE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

interface UnitBlockProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function UnitBlock({ value, label, highlight = false }: UnitBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32",
          "bg-white/10 backdrop-blur-sm border border-white/20 shadow-premium",
          highlight && "ring-2 ring-gold-400/60"
        )}
      >
        <span
          className={cn(
            "font-display font-bold tabular-nums leading-none",
            "text-3xl sm:text-4xl md:text-5xl text-white",
            highlight && "text-gold-300"
          )}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm font-body font-medium uppercase tracking-widest text-white/70">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const departed = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (!mounted) {
    // SSR placeholder – avoid hydration mismatch
    return (
      <div className="flex items-end gap-3 sm:gap-5 justify-center animate-pulse">
        {["Days", "Hours", "Mins", "Secs"].map((l) => (
          <div key={l} className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-white/10" />
            <div className="mt-2 h-3 w-10 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (departed) {
    return (
      <div className="text-center">
        <p className="font-display text-3xl font-bold text-gold-300">
          🚂 The journey has begun!
        </p>
        <p className="mt-1 text-white/70 font-body text-sm">
          Safe travels on Royal Routes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 sm:gap-5 justify-center">
      <UnitBlock value={timeLeft.days} label="Days" highlight />
      <div className="pb-8 text-white/50 font-display text-3xl font-bold select-none">:</div>
      <UnitBlock value={timeLeft.hours} label="Hours" />
      <div className="pb-8 text-white/50 font-display text-3xl font-bold select-none">:</div>
      <UnitBlock value={timeLeft.minutes} label="Mins" />
      <div className="pb-8 text-white/50 font-display text-3xl font-bold select-none">:</div>
      <UnitBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
