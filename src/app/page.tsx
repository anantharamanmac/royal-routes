"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Star,
  Search,
  Train,
  Clock,
  ShieldCheck,
  CheckCircle,
  Phone,
  Play,
  Mail,
  Compass,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Camera,
  Heart,
} from "lucide-react";
import VisualRouteMap from "@/components/member/VisualRouteMap";
import CountdownTimer from "@/components/member/CountdownTimer";
import { daysUntil, cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

const DEPARTURE_DATE = new Timestamp(1766617200, 0); // 24 Dec 2026

const POPULAR_DESTINATIONS = [
  {
    name: "Jaipur, Rajasthan",
    tagline: "Amber Fort & City Palace",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    days: "4 Days",
    rating: "4.9",
  },
  {
    name: "New & Old Delhi",
    tagline: "Red Fort & Qutub Minar",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    days: "3 Days",
    rating: "4.8",
  },
  {
    name: "Agra, Uttar Pradesh",
    tagline: "Taj Mahal & Agra Fort",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    days: "2 Days",
    rating: "5.0",
  },
  {
    name: "Jodhpur Desert Circuit",
    tagline: "Mehrangarh Citadel & Bazaars",
    image:
      "https://images.unsplash.com/photo-1603288967399-28153c3065b2?auto=format&fit=crop&w=800&q=80",
    days: "Optional",
    rating: "4.8",
  },
  {
    name: "Kollam Junction",
    tagline: "Coastal Kerala Departure Hub",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    days: "Day 0",
    rating: "4.9",
  },
];

const TOUR_PACKAGES = [
  {
    id: "rajasthan-royal",
    title: "Rajasthan Forts & Heritage Palace Trail",
    destination: "Rajasthan (Jaipur)",
    duration: "4 Days / 3 Nights",
    originalPrice: "₹24,000",
    price: "₹18,999",
    discountBadge: "20% OFF",
    rating: 5,
    reviews: 142,
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    highlights: ["Amber Fort Elephant Ramparts", "Hawa Mahal", "City Palace Museum", "Authentic Rajasthani Banquet"],
  },
  {
    id: "delhi-capital",
    title: "Delhi Imperial Capitals & Spice Markets",
    destination: "Delhi NCR",
    duration: "3 Days / 2 Nights",
    originalPrice: "₹16,500",
    price: "₹12,999",
    discountBadge: "15% OFF",
    rating: 5,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    highlights: ["Red Fort (Lal Qila)", "Qutub Minar Complex", "Chandni Chowk Food Walk", "India Gate Walk"],
  },
  {
    id: "agra-taj",
    title: "Agra Sunrise Taj Mahal & Mughal Citadel",
    destination: "Agra",
    duration: "2 Days / 1 Night",
    originalPrice: "₹21,000",
    price: "₹16,999",
    discountBadge: "18% OFF",
    rating: 5,
    reviews: 180,
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    highlights: ["Taj Mahal Sunrise Entry", "Agra Fort Sandstone Palace", "Mehtab Bagh Sunset", "Marble Inlay Workshop"],
  },
  {
    id: "rajdhani-transit",
    title: "Kollam to North India Rajdhani Rail Express",
    destination: "Indian Railways",
    duration: "2 Days / 2 Nights",
    originalPrice: "₹18,000",
    price: "₹14,999",
    discountBadge: "16% OFF",
    rating: 5,
    reviews: 76,
    image:
      "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80",
    highlights: ["Overnight 3-Tier/2-Tier AC Sleeper", "Meals Onboard", "Western Ghats Views", "Group Reserved Berths"],
  },
  {
    id: "fatehpur-sikri",
    title: "Fatehpur Sikri Imperial Ghost Citadel",
    destination: "Agra Suburbs",
    duration: "Day Excursion",
    originalPrice: "₹32,000",
    price: "₹24,999",
    discountBadge: "22% OFF",
    rating: 5,
    reviews: 110,
    image:
      "https://images.unsplash.com/photo-1603288967399-28153c3065b2?auto=format&fit=crop&w=800&q=80",
    highlights: ["Buland Darwaza Giant Gate", "Panch Mahal", "Salim Chishti Tomb", "Guided Architectural Walk"],
  },
  {
    id: "complete-circuit",
    title: "All-Inclusive Royal Route Winter Circuit",
    destination: "Rajasthan · Delhi · Agra",
    duration: "10 Days / 9 Nights",
    originalPrice: "₹36,000",
    price: "₹28,999",
    discountBadge: "20% OFF",
    rating: 5,
    reviews: 215,
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    highlights: ["Full Golden Triangle Circuit", "All Heritage Stays", "Express Coach & Transfers", "All Entry Permits Included"],
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Trip Participant · Kollam",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "Amazing experience with Royal Routes! The coordination between Kollam departure and the Rajasthan hotels was completely seamless. Everything was perfectly organized!",
  },
  {
    name: "Rohit Verma",
    role: "Group Member · Ernakulam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "The best winter vacation we ever had. Having the itinerary, hotel check-ins, and train PNRs all updated live by the destination admins made travel stress-free.",
  },
  {
    name: "Anjali Mehta",
    role: "Destination Coordinator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    text: "Highly recommended! As a coordinator, the approval workflow and drag-and-drop itinerary builder allowed our team to draft our Delhi day schedules in minutes.",
  },
  {
    name: "Karan Singh",
    role: "Trip Member · Trivandrum",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    text: "Excellent support throughout the entire planning phase. Having the interactive route map and transparent per-person budget estimates kept our group aligned.",
  },
];

export default function LandingPage() {
  const [daysLeft, setDaysLeft] = useState(0);
  const [activeTab, setActiveTab] = useState<"places" | "routemap" | "packages" | "transfers">("places");
  const [searchLocation, setSearchLocation] = useState("Rajasthan, Delhi, Agra");
  const [travelers, setTravelers] = useState("Group Trip (12+ Pax)");

  useEffect(() => {
    setDaysLeft(daysUntil(DEPARTURE_DATE));
  }, []);

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col font-body text-stone-900 selection:bg-gold-500 selection:text-white">
      {/* ── Top Floating Header (Ref: Shanti Travels Style) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-royal-950/85 backdrop-blur-md border-b border-white/10 text-white transition-all">
        <div className="section-container flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient flex items-center justify-center text-white shadow-gold font-display font-black text-xl">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-gold-300 transition-colors">
                  Royal Routes
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gold-300 font-semibold leading-none">
                India Trip Planner
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-white/80">
            <Link href="/" className="text-gold-400 hover:text-gold-300 transition-colors">
              Home
            </Link>
            <Link href="#destinations" className="hover:text-white transition-colors">
              Destinations
            </Link>
            <Link href="#routemap" className="hover:text-white transition-colors">
              Route Map
            </Link>
            <Link href="#packages" className="hover:text-white transition-colors">
              Packages &amp; Stages
            </Link>
            <Link href="/itinerary" className="hover:text-white transition-colors">
              Master Itinerary
            </Link>
            <Link href="/travel-info" className="hover:text-white transition-colors">
              Travel Logistics
            </Link>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Phone Hotline Pill */}
            <a
              href="tel:+919876543210"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 backdrop-blur-sm transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>+91 98765 43210</span>
            </a>

            {/* Portal Action */}
            <Link
              href="/dashboard"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold text-xs sm:text-sm transition-all shadow-gold hover:scale-105 flex items-center gap-1.5"
            >
              <span>Member Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className="p-2 sm:px-3 sm:py-2 rounded-full border border-white/20 hover:border-white text-xs font-medium text-white/90 hover:text-white transition-colors"
              title="Admin Login"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Ref: Shanti Travels Style) ── */}
      <section className="relative min-h-[92vh] sm:min-h-[90vh] flex flex-col justify-center pt-28 pb-32 sm:pb-36 bg-royal-950 text-white overflow-hidden">
        {/* Background Landscape Photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2200&q=85"
            alt="Royal India Taj Mahal Heritage"
            fill
            priority
            className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
          {/* Gradients to blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/60 to-royal-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-950/90 via-transparent to-royal-950/80" />
        </div>

        {/* Hero Content */}
        <div className="section-container relative z-10 space-y-6 max-w-4xl pt-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Winter 2026-27 Grand Group Tour · 24 Dec Departure</span>
          </div>

          {/* Big Hero Title with Script Accent */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            Find our dream <br />
            <span className="font-serif italic text-gold-400 font-normal">Royal Route</span> on
            Royal Routes
          </h1>

          <p className="text-white/80 text-base sm:text-xl font-normal max-w-2xl leading-relaxed">
            Let&apos;s make your winter journey through Rajasthan, Delhi, and Agra an extraordinary,
            seamlessly coordinated adventure. Departing from{" "}
            <span className="text-gold-300 font-semibold">Kollam Junction, Kerala</span> on{" "}
            <span className="text-gold-300 font-semibold">24 December 2026</span> via Rajdhani Express.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold-gradient text-royal-950 font-bold text-sm sm:text-base shadow-gold hover:opacity-95 hover:scale-105 transition-all"
            >
              <span>Explore Itinerary Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#routemap"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/25 backdrop-blur-md transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3 h-3 text-gold-400 fill-gold-400" />
              </div>
              <span>View Route Circuit</span>
            </a>
          </div>

          {/* Countdown Chips */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>
                <strong className="text-gold-300 font-bold">{daysLeft} Days</strong> Until Departure
              </span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-gold-400" />
              <span>Kollam Jcn ➔ Rajasthan ➔ Delhi ➔ Agra</span>
            </div>
          </div>
        </div>

        {/* ── Floating Search & Filter Bar (Ref: Shanti Travels Floating Widget) ── */}
        <div className="section-container relative z-20 -mb-48 sm:-mb-52 mt-12 sm:mt-16">
          <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-premium-lg border border-ivory-200">
            {/* Top Switcher Tabs */}
            <div className="flex items-center gap-2 sm:gap-4 border-b border-ivory-100 pb-3 mb-4 overflow-x-auto text-xs sm:text-sm font-semibold text-stone-500">
              <button
                onClick={() => setActiveTab("places")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  activeTab === "places"
                    ? "bg-royal-50 text-royal-700 font-bold border border-royal-200"
                    : "hover:text-stone-900"
                )}
              >
                <MapPin className="w-4 h-4 text-royal-600" />
                <span>Destinations</span>
              </button>

              <button
                onClick={() => setActiveTab("routemap")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  activeTab === "routemap"
                    ? "bg-royal-50 text-royal-700 font-bold border border-royal-200"
                    : "hover:text-stone-900"
                )}
              >
                <Compass className="w-4 h-4 text-royal-600" />
                <span>Interactive Route Map</span>
              </button>

              <button
                onClick={() => setActiveTab("packages")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  activeTab === "packages"
                    ? "bg-royal-50 text-royal-700 font-bold border border-royal-200"
                    : "hover:text-stone-900"
                )}
              >
                <Sparkles className="w-4 h-4 text-royal-600" />
                <span>Tour Stages</span>
              </button>

              <button
                onClick={() => setActiveTab("transfers")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  activeTab === "transfers"
                    ? "bg-royal-50 text-royal-700 font-bold border border-royal-200"
                    : "hover:text-stone-900"
                )}
              >
                <Train className="w-4 h-4 text-royal-600" />
                <span>Train &amp; Transfers</span>
              </button>
            </div>

            {/* Segmented Inputs Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Where are you going? */}
              <div className="lg:col-span-4 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gold-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-1">
                    Circuit Focus
                  </label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm font-bold text-stone-900 bg-transparent focus:outline-none truncate"
                  />
                </div>
              </div>

              {/* Check In / Departure Date */}
              <div className="lg:col-span-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-royal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-1">
                    Planned Departure
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    24 Dec 2026 (Night)
                  </p>
                </div>
              </div>

              {/* Train / Transport Service */}
              <div className="lg:col-span-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <Train className="w-5 h-5 text-royal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-1">
                    Transit Mode
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    Rajdhani Express (TBC)
                  </p>
                </div>
              </div>

              {/* Search Action Button */}
              <div className="lg:col-span-2">
                <Link
                  href="/itinerary"
                  className="w-full py-4 rounded-2xl bg-royal-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-premium hover:opacity-95 transition-all text-center"
                >
                  <Search className="w-4 h-4 text-gold-300" />
                  <span>Explore</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for floating search widget overlap */}
      <div className="h-28 sm:h-32" />

      {/* ── Popular Destinations Section (Ref: Shanti Travels 5-Card Layout) ── */}
      <section id="destinations" className="py-16 sm:py-20 bg-ivory-50">
        <div className="section-container space-y-8">
          {/* Section Header with Wave */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ivory-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-royal-950">
                  Popular Destinations
                </h2>
                <span className="text-gold-500 text-lg font-mono">~~~~</span>
              </div>
              <p className="text-stone-500 text-xs sm:text-sm">
                Explore the key royal capitals, forts, and departure hubs on our 2026-27 circuit.
              </p>
            </div>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-royal-700 hover:text-royal-950 group"
            >
              <span>View all destinations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 5 Destination Cards Carousel/Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <Link
                key={dest.name}
                href={
                  dest.name.toLowerCase().includes("rajasthan")
                    ? "/destinations/rajasthan"
                    : dest.name.toLowerCase().includes("delhi")
                    ? "/destinations/delhi"
                    : dest.name.toLowerCase().includes("agra")
                    ? "/destinations/agra"
                    : "/travel-info"
                }
                className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden shadow-card hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end p-4 text-white"
              >
                {/* Background Image */}
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gold-300 font-semibold">
                    <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {dest.days}
                    </span>
                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                      {dest.rating}
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold leading-tight group-hover:text-gold-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1 italic">{dest.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Route Map Section (Visual Schematic Circuit) ── */}
      <section id="routemap" className="py-12 sm:py-16 bg-white border-y border-ivory-200">
        <div className="section-container space-y-6">
          <VisualRouteMap />
        </div>
      </section>

      {/* ── Popular Tour Packages / Circuit Stages (Ref: Shanti Travels 6-Card Grid) ── */}
      <section id="packages" className="py-16 sm:py-20 bg-ivory-50">
        <div className="section-container space-y-8">
          {/* Header with decorative wave */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ivory-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-royal-950">
                  Popular Tour Packages &amp; Stages
                </h2>
                <span className="text-gold-500 text-lg font-mono">~~~~</span>
              </div>
              <p className="text-stone-500 text-xs sm:text-sm">
                Curated group itineraries designed by our destination administrators.
              </p>
            </div>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-royal-700 hover:text-royal-950 group"
            >
              <span>View all packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 6 Tour Packages 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TOUR_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="card-premium overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Discount Pill */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                    {/* Red Discount Tag */}
                    <span className="absolute top-4 right-4 bg-terracotta-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {pkg.discountBadge}
                    </span>

                    {/* Location Badge */}
                    <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {pkg.destination}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-royal-600" />
                        {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-stone-700">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        5.0 ({pkg.reviews})
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-royal-950 group-hover:text-royal-700 transition-colors leading-snug">
                      {pkg.title}
                    </h3>

                    {/* Highlights bullet chips */}
                    <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                      {pkg.highlights.slice(0, 2).map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Price & CTA */}
                <div className="p-6 pt-0 border-t border-ivory-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Estimated Cost
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-black text-royal-950">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        {pkg.originalPrice}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/itinerary"
                    className="px-4 py-2 rounded-xl bg-royal-gradient text-white text-xs font-bold hover:opacity-95 shadow-premium flex items-center gap-1 transition-all"
                  >
                    <span>View Day Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── "Need Assistance? Trip Organizers" Banner (Ref: Shanti Travels Assistance Strip) ── */}
      <section className="section-container my-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-royal-950 via-royal-900 to-[#0e3b43] text-white p-8 sm:p-12 shadow-premium-lg">
          {/* Subtle background decoration */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 10px 10px, #ffffff 1.5px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs uppercase tracking-widest text-gold-300 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                We&apos;re Here to Help
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                Need Assistance With Your Trip?
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Our trip organizers and destination admins are available to verify train tickets,
                arrange group room allocations, and resolve custom travel requirements.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/travel-info"
                  className="px-6 py-3 rounded-xl bg-white text-royal-950 text-xs sm:text-sm font-bold hover:bg-gold-300 transition-colors shadow-sm"
                >
                  Contact Organizers
                </Link>
                <a
                  href="tel:+919876543210"
                  className="px-6 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-sm transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-gold-400" />
                  <span>+91 98765 43210</span>
                </a>
              </div>
            </div>

            {/* 3 Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-white/15 pt-6 lg:pt-0 lg:pl-8">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">Best Group Rates</h4>
                <p className="text-xs text-white/60">We negotiate bulk tariffs for stays &amp; coaches.</p>
              </div>

              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">24/7 Group Support</h4>
                <p className="text-xs text-white/60">Active admin coordination on all travel days.</p>
              </div>

              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">Verified Bookings</h4>
                <p className="text-xs text-white/60">Strict anti-fake reservation protocols.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section (Ref: Shanti Travels Traveler Reviews) ── */}
      <section className="py-16 bg-white border-b border-ivory-200">
        <div className="section-container space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ivory-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-royal-950">
                  What Our Travelers Say
                </h2>
                <span className="text-gold-500 text-lg font-mono">~~~~</span>
              </div>
              <p className="text-stone-500 text-xs sm:text-sm">
                Feedback from members and coordinators who have experienced our organized group tours.
              </p>
            </div>
            <span className="text-xs text-stone-400 font-semibold hidden sm:block">
              Verified Member Reviews
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-ivory-50 border border-ivory-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-card hover:border-royal-200 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-ivory-200">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold-300 shrink-0">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-royal-950">{t.name}</h4>
                    <p className="text-[10px] text-stone-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 Feature / Guarantee Badges (Ref: Shanti Travels 4-Icon Strip) ── */}
      <section className="py-12 bg-ivory-100/60 border-b border-ivory-200">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-royal-100 flex items-center justify-center text-royal-700 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">100+ Heritage Stops</h4>
                <p className="text-xs text-stone-500">Across Rajasthan, Delhi &amp; Agra</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Transparent Budget</h4>
                <p className="text-xs text-stone-500">Per-person share with no hidden costs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Multi-Admin Team</h4>
                <p className="text-xs text-stone-500">Live verified updates by local admins</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Official Railway Transit</h4>
                <p className="text-xs text-stone-500">Rajdhani Express reservation tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter / Updates Strip (Ref: Shanti Travels Green Strip) ── */}
      <section className="section-container my-12">
        <div className="rounded-3xl bg-[#0c4038] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">Subscribe to Trip Bulletins</h3>
              <p className="text-xs text-white/80 mt-0.5">
                Receive instant notices when hotel bookings and Rajdhani ticket berths are confirmed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-4 py-3 rounded-2xl bg-white text-stone-900 text-xs sm:text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button className="px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold text-xs sm:text-sm transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── Modern Luxury Dark Navy Footer (Ref: Shanti Travels Bottom) ── */}
      <footer className="bg-royal-950 text-white pt-16 pb-12 mt-auto border-t border-white/10">
        <div className="section-container space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold-gradient flex items-center justify-center text-white font-display font-black text-base shadow-gold">
                  R
                </div>
                <span className="font-display font-bold text-xl text-white">Royal Routes</span>
              </div>
              <p className="text-white/70 leading-relaxed max-w-sm">
                Royal Routes is your premium collaborative group trip planner for the Rajasthan, Delhi,
                and Agra winter tour departing 24 December 2026 from Kollam Junction, Kerala.
              </p>
              <div className="flex items-center gap-3 text-gold-400 font-semibold pt-1">
                <span>Winter 2026-27 Edition</span>
                <span>•</span>
                <span>Rajdhani Express Rail</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gold-400 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-white/75">
                <li><Link href="/" className="hover:text-white">Home Portal</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Member Dashboard</Link></li>
                <li><Link href="/itinerary" className="hover:text-white">Master Itinerary</Link></li>
                <li><Link href="/travel-info" className="hover:text-white">Travel Information</Link></li>
                <li><Link href="/login" className="hover:text-white">Administrator Login</Link></li>
              </ul>
            </div>

            {/* Col 3: Destinations */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gold-400 uppercase tracking-wider">Destinations</h4>
              <ul className="space-y-2 text-white/75">
                <li><Link href="/destinations/rajasthan" className="hover:text-white">Jaipur &amp; Rajasthan Forts</Link></li>
                <li><Link href="/destinations/delhi" className="hover:text-white">Delhi Red Fort &amp; Qutub</Link></li>
                <li><Link href="/destinations/agra" className="hover:text-white">Agra &amp; Taj Mahal Sunrise</Link></li>
                <li><Link href="/travel-info" className="hover:text-white">Kollam Junction Hub</Link></li>
              </ul>
            </div>

            {/* Col 4: Emergency Contacts */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gold-400 uppercase tracking-wider">Contact &amp; Helplines</h4>
              <ul className="space-y-2 text-white/75">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>+91 98765 43210 (Organizer)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Train className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>139 (Railway Enquiry)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>112 (National Emergency)</span>
                </li>
                <li className="text-[11px] text-white/50 pt-2">
                  Departing: Kollam Junction Railway Station, Kerala 691001
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
            <p>&copy; 2026-2027 Royal Routes · India Trip Planner. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white">Terms of Travel</span>
              <span>•</span>
              <span className="hover:text-white">Railway Booking Notice</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
