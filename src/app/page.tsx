"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Calendar, Users, ArrowRight, Star, ChevronDown } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

const DEPARTURE_DATE = new Timestamp(1766617200, 0); // 24 Dec 2026 ~21:00 IST

const DESTINATIONS = [
  {
    name: "Rajasthan",
    tagline: "Land of Kings",
    desc: "Majestic forts, vibrant bazaars, and desert palaces await in the Pink City and beyond.",
    highlights: ["Amber Fort", "City Palace", "Hawa Mahal", "Thar Desert"],
    color: "from-terracotta-700 to-terracotta-500",
    emoji: "🏯",
  },
  {
    name: "Delhi",
    tagline: "The Soul of India",
    desc: "Seven cities layered with Mughal grandeur, colonial heritage, and dynamic modernity.",
    highlights: ["Red Fort", "Qutub Minar", "India Gate", "Chandni Chowk"],
    color: "from-royal-800 to-royal-600",
    emoji: "🕌",
  },
  {
    name: "Agra",
    tagline: "City of the Taj",
    desc: "Home to the world's greatest monument to love — a timeless symbol of Indian splendour.",
    highlights: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"],
    color: "from-sandstone-700 to-sandstone-500",
    emoji: "🕍",
  },
];

export default function LandingPage() {
  const [daysLeft, setDaysLeft] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setDaysLeft(daysUntil(DEPARTURE_DATE));
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-ivory-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span
              className={`font-display font-bold text-lg transition-colors ${
                isScrolled ? "text-royal-900" : "text-white"
              }`}
            >
              Royal Routes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isScrolled ? "text-stone-600 hover:text-royal-700" : "text-white/80 hover:text-white"
              }`}
            >
              Member View
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-gold"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-royal-gradient overflow-hidden">
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="section-container relative z-10 py-32 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-gold-300 text-sm font-medium mb-8">
            <Star className="w-3.5 h-3.5 fill-gold-300" />
            Winter 2026 Group Journey
            <Star className="w-3.5 h-3.5 fill-gold-300" />
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Royal Routes
            <br />
            <span className="text-gold-400">India Trip Planner</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mb-10 font-body leading-relaxed">
            An extraordinary journey through Rajasthan, Delhi &amp; Agra — departing from{" "}
            <span className="text-gold-300 font-semibold">Kollam Junction</span> on{" "}
            <span className="text-gold-300 font-semibold">24 December 2026</span>.
          </p>

          {/* Countdown */}
          <div className="flex items-center gap-6 mb-12">
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-white">{daysLeft}</p>
              <p className="text-white/60 text-xs uppercase tracking-widest mt-1">Days Away</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-5 h-5 text-gold-400" />
              <span className="text-sm">24 Dec 2026</span>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-5 h-5 text-gold-400" />
              <span className="text-sm">3 Destinations</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-2xl text-base transition-all shadow-gold hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore the Trip
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-2xl text-base transition-all backdrop-blur-sm"
            >
              Admin Login
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* ── Destinations ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Three Iconic Destinations
            </p>
            <h2 className="font-display text-display-md text-royal-950 mb-4">
              The Golden Triangle &amp; Beyond
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              From Rajasthan&apos;s royal heritage to the eternal Taj Mahal — every stop a masterpiece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DESTINATIONS.map((dest, i) => (
              <div
                key={dest.name}
                className="group card-premium overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card header */}
                <div className={`bg-gradient-to-br ${dest.color} p-8 text-white`}>
                  <div className="text-4xl mb-3">{dest.emoji}</div>
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                    Destination {i + 1}
                  </p>
                  <h3 className="font-display text-2xl font-bold">{dest.name}</h3>
                  <p className="text-white/80 text-sm mt-1 italic">{dest.tagline}</p>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{dest.desc}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Highlights
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dest.highlights.map((h) => (
                        <span
                          key={h}
                          className="px-2.5 py-1 bg-ivory-100 text-stone-600 text-xs rounded-full border border-ivory-200"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trip Overview ───────────────────────────────────────────────── */}
      <section className="py-24 bg-ivory-50">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-3">
                Trip Overview
              </p>
              <h2 className="font-display text-display-sm text-royal-950 mb-6">
                A Winter Journey Through North India
              </h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                Departing from Kollam Junction, Kerala on the night of 24 December 2026 via Rajdhani
                Express, our group will traverse three of India&apos;s most iconic destinations —
                Rajasthan, Delhi, and Agra — before returning home in early 2027.
              </p>

              <div className="space-y-4">
                {[
                  { icon: "🚂", label: "Departure", value: "Kollam Junction, 24 Dec 2026 (Night)" },
                  { icon: "🚄", label: "Train", value: "Rajdhani Express (details TBC)" },
                  { icon: "📍", label: "Destinations", value: "Rajasthan → Delhi → Agra" },
                  { icon: "📅", label: "Return", value: "To be confirmed" },
                  { icon: "👥", label: "Trip Type", value: "Group journey with multiple admins" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <span className="text-2xl w-8 shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-stone-700 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Destinations", value: "3", sub: "Rajasthan, Delhi, Agra" },
                { label: "Days Away", value: String(daysLeft), sub: "from today" },
                { label: "Departure", value: "24 Dec", sub: "2026, Night" },
                { label: "Itinerary", value: "Live", sub: "updates from admins" },
              ].map((stat) => (
                <div key={stat.label} className="card-premium p-6 text-center">
                  <p className="font-display text-3xl font-bold text-royal-800 mb-1">{stat.value}</p>
                  <p className="text-stone-500 text-xs uppercase tracking-wide">{stat.label}</p>
                  <p className="text-stone-400 text-xs mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Cards ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-royal-950 text-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-display-md text-white mb-4">
              Built for the Whole Team
            </h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Three distinct roles keep every member informed and every admin focused on their work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-7 h-7" />,
                role: "Master Admin",
                desc: "Full control — create trips, assign admins, approve itineraries, publish content.",
                color: "bg-gold-500/10 border-gold-400/30 text-gold-300",
              },
              {
                icon: <MapPin className="w-7 h-7" />,
                role: "Destination Admin",
                desc: "Build day-wise itineraries for assigned destinations and submit for review.",
                color: "bg-royal-500/10 border-royal-400/30 text-royal-300",
              },
              {
                icon: <Star className="w-7 h-7" />,
                role: "Trip Member",
                desc: "View the final itinerary, hotels, schedules, and all trip announcements.",
                color: "bg-terracotta-500/10 border-terracotta-400/30 text-terracotta-300",
              },
            ].map((r) => (
              <div
                key={r.role}
                className={`p-8 rounded-2xl border ${r.color} flex flex-col gap-4`}
              >
                <div className="opacity-80">{r.icon}</div>
                <h3 className="font-display text-xl font-bold text-white">{r.role}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-ivory-200 py-10">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <span className="font-display font-bold text-royal-900">Royal Routes</span>
          </div>
          <p className="text-stone-400 text-sm">
            Rajasthan · Delhi · Agra — Winter 2026–27 Group Trip
          </p>
          <Link href="/login" className="text-sm text-royal-600 hover:text-royal-800 font-medium">
            Admin Login →
          </Link>
        </div>
      </footer>
    </div>
  );
}
