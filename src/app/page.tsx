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
  Headphones,
  Lock,
  Phone,
  Play,
  Send,
  Compass,
  ChevronRight,
  ChevronLeft,
  User,
  Heart,
  Tag,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import VisualRouteMap from "@/components/member/VisualRouteMap";
import { daysUntil, cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

const DEPARTURE_DATE = new Timestamp(1766617200, 0); // 24 Dec 2026

function WavySquiggle() {
  return (
    <svg
      width="32"
      height="12"
      style={{ width: "32px", height: "12px", minWidth: "32px" }}
      className="w-8 h-3 text-[#007d8a] inline-block ml-2 align-middle shrink-0"
      viewBox="0 0 36 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5C3.5 2 6 2 8.5 5C11 8 13.5 8 16 5C18.5 2 21 2 23.5 5C26 8 28.5 8 31 5C33.5 2 35 3 35 5"
        stroke="#007d8a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CIRCUIT_DESTINATIONS = [
  {
    id: "rajasthan",
    title: "Jaipur, Rajasthan",
    subtitle: "Amber Palace & The Pink City",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    daysTag: "4 Days Planned",
    routeLink: "/destinations/rajasthan",
  },
  {
    id: "delhi",
    title: "New & Old Delhi",
    subtitle: "Red Fort, Qutub & Spice Bazaars",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    daysTag: "3 Days Planned",
    routeLink: "/destinations/delhi",
  },
  {
    id: "agra",
    title: "Agra, Uttar Pradesh",
    subtitle: "Sunrise Taj Mahal & Agra Citadel",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    daysTag: "2 Days Planned",
    routeLink: "/destinations/agra",
  },
  {
    id: "jodhpur",
    title: "Jodhpur Desert Circuit",
    subtitle: "Mehrangarh Fort & Blue City Bazaars",
    image:
      "https://images.unsplash.com/photo-1603288967399-28153c3065b2?auto=format&fit=crop&w=800&q=80",
    daysTag: "Optional Excursion",
    routeLink: "/destinations/rajasthan",
  },
  {
    id: "kollam",
    title: "Kollam Junction (QLN)",
    subtitle: "Coastal Kerala Departure Hub",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    daysTag: "Day 0 · Assembly",
    routeLink: "/travel-info",
  },
];

const TRIP_STAGES = [
  {
    id: "stage-kollam-transit",
    stageNumber: "STAGE 01",
    title: "Kollam Departure & Rajdhani Transit",
    subtitle: "Overland Rail Journey across Western Ghats & Konkan Corridor",
    duration: "~42 hrs AC Sleeper",
    statusBadge: "CONFIRMED DEPARTURE",
    statusVariant: "confirmed",
    scheduleNote: "24 Dec 2026 Night · QLN Station",
    image:
      "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80",
    highlights: ["Night Assembly at Kollam Platform", "Reserved AC Sleeper Berths", "Scenic Konkan Coastal Route"],
  },
  {
    id: "stage-rajasthan-forts",
    stageNumber: "STAGE 02",
    title: "Rajasthan Forts & Palatial Heritage",
    subtitle: "Amber Palace, Hawa Mahal, City Palace & Johari Bazaars",
    duration: "4 Days / 3 Nights",
    statusBadge: "IN PREPARATION (TBC)",
    statusVariant: "tbc",
    scheduleNote: "Jaipur Hub · Hotels Pending",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    highlights: ["Elephant Ramparts at Amber Fort", "Chokhi Dhani Rajasthani Banquet", "Pink City Architectural Walk"],
  },
  {
    id: "stage-delhi-capital",
    stageNumber: "STAGE 03",
    title: "Delhi Imperial Capitals & Spice Safaris",
    subtitle: "Red Fort, Qutub Minar Complex, India Gate & Chandni Chowk",
    duration: "3 Days / 2 Nights",
    statusBadge: "IN PREPARATION (TBC)",
    statusVariant: "tbc",
    scheduleNote: "Delhi NCR · Hotels Pending",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    highlights: ["Old Delhi Rickshaw Street Food Safari", "UNESCO Qutub Minar Heritage Tour", "Evening Walk at Kartavya Path"],
  },
  {
    id: "stage-agra-taj",
    stageNumber: "STAGE 04",
    title: "Agra Sunrise Taj Mahal & Sandstone Citadel",
    subtitle: "Mughal Architecture Wonder at Sunrise & Agra Red Fort",
    duration: "2 Days / 1 Night",
    statusBadge: "IN PREPARATION (TBC)",
    statusVariant: "tbc",
    scheduleNote: "Agra Cantt · Hotels Pending",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    highlights: ["Sunrise Taj Mahal Entry (No Crowds)", "Agra Fort Mughal Citadel Walk", "Mehtab Bagh Yamuna Sunset View"],
  },
  {
    id: "stage-fatehpur-excursion",
    stageNumber: "STAGE 05",
    title: "Fatehpur Sikri Imperial Excursion",
    subtitle: "Buland Darwaza, Panch Mahal & Emperor Akbar's Sandstone City",
    duration: "Day Excursion",
    statusBadge: "OPTIONAL TRIP (TBC)",
    statusVariant: "tbc",
    scheduleNote: "Agra Suburbs · Transit Coach",
    image:
      "https://images.unsplash.com/photo-1603288967399-28153c3065b2?auto=format&fit=crop&w=800&q=80",
    highlights: ["Buland Darwaza Giant Gateway", "Salim Chishti Sacred White Shrine", "Architectural Guided Excursion"],
  },
  {
    id: "stage-return-kollam",
    stageNumber: "STAGE 06",
    title: "Return Journey to Kollam Junction",
    subtitle: "Homeward Overland Rail Journey Concluding Winter Expedition",
    duration: "Return Transit",
    statusBadge: "RETURN DATE TBC",
    statusVariant: "tbc",
    scheduleNote: "Early Jan 2027 · Return Date TBC",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    highlights: ["Group Souvenir Gathering", "Photo Album Archiving", "Safe Return to Kollam, Kerala"],
  },
];

const GROUP_TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Trip Participant · Kollam",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "So excited for our 24 Dec night departure from Kollam Junction! Having the live timeline and hotel updates makes coordinating our group effortless.",
  },
  {
    name: "Rohit Verma",
    role: "Rajasthan Destination Admin",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "The day-by-day plan for Jaipur includes Amber Fort early morning and Chokhi Dhani banquet in the evening. Looking forward to our group visit!",
  },
  {
    name: "Anjali Mehta",
    role: "Delhi Destination Admin",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    text: "The Delhi leg combines Old Delhi rickshaw food safari at Chandni Chowk with Qutub Minar and India Gate evening stroll. Ready for approval review.",
  },
  {
    name: "Karan Singh",
    role: "Agra Destination Admin",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    text: "Sunrise Taj Mahal tickets and battery transfers are being organized for our morning visit. Unforgettable memories ahead for all members!",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"destinations" | "routemap" | "stages" | "rail">("destinations");
  const [daysLeft, setDaysLeft] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    setDaysLeft(daysUntil(DEPARTURE_DATE));
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#007d8a] selection:text-white">
      {/* ── Fixed Transparent Header (Ref: Shanti Travels Mockup Style) ── */}
      <header className="absolute top-0 left-0 right-0 z-50 py-5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo with Pin Marker */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#007d8a] shadow-sm">
              <MapPin className="w-5 h-5 fill-[#007d8a] text-white" />
            </div>
            <div className="text-white leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-teal-200 transition-colors">
                  Royal Routes
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-teal-200 uppercase">
                  INDIA
                </span>
              </div>
              <span className="text-[9px] block font-semibold text-white/80 tracking-wider">
                Rajasthan · Delhi · Agra Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/90">
            <Link
              href="/"
              className="text-white font-semibold relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full"
            >
              Home
            </Link>
            <Link href="#destinations" className="hover:text-white transition-colors">
              Destinations
            </Link>
            <Link href="#routemap" className="hover:text-white transition-colors">
              Route Map
            </Link>
            <Link href="#stages" className="hover:text-white transition-colors">
              Trip Stages
            </Link>
            <Link href="/itinerary" className="hover:text-white transition-colors">
              Master Itinerary
            </Link>
            <Link href="/travel-info" className="hover:text-white transition-colors">
              Travel Logistics
            </Link>
            <Link href="#assistance" className="hover:text-white transition-colors">
              Organizer Support
            </Link>
          </nav>

          {/* Right Controls: Phone Hotline + User Profile */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+919876543210"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 fill-white text-white" />
              <span>+91 98765 43210</span>
            </a>

            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full border border-white/50 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all shadow-sm"
              title="Member Portal Dashboard"
            >
              <User className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Majestic Golden Heritage + Exact Shanti Typography) ── */}
      <section className="relative min-h-[90vh] sm:min-h-[94vh] flex items-center pt-24 pb-28 sm:pb-36 overflow-hidden">
        {/* Full Bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2400&q=85"
            alt="Royal Heritage Taj Mahal Palace"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Subtle natural gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Carousel Pagination Dots on Right Edge (Ref: Shanti Travels Mockup) */}
        <div className="hidden lg:flex flex-col items-center gap-2.5 absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <span className="w-2.5 h-6 rounded-full bg-[#007d8a] shadow-sm transition-all" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm" />
        </div>

        {/* Hero Left Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-2xl text-white space-y-4">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#007d8a] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WINTER 2026–27 GRAND GROUP EXPEDITION</span>
            </div>

            {/* Main Headline with Brush Script Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Find our dream <br />
              <span className="font-caveat text-[#f5a623] italic font-normal text-6xl sm:text-7xl lg:text-8xl inline-block -rotate-2 mr-2">
                Route
              </span>
              on Royal Routes
            </h1>

            {/* Subheading */}
            <p className="text-white/90 text-base sm:text-xl font-normal leading-relaxed pt-1">
              Group expedition covering Rajasthan, Delhi &amp; Agra. <br className="hidden sm:inline" />
              Departing from{" "}
              <strong className="text-teal-200 font-bold">Kollam Junction, Kerala</strong> on{" "}
              <strong className="text-teal-200 font-bold">24 December 2026 (Night)</strong> via{" "}
              <strong className="text-teal-200 font-bold">Rajdhani Express</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/itinerary"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#007d8a] hover:bg-[#006a75] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
              >
                <span>Explore Master Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#routemap"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/50 hover:border-white backdrop-blur-sm transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
                <span>View Route Circuit</span>
              </a>
            </div>

            {/* Countdown Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-teal-100 font-medium">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  <strong className="text-amber-300 font-bold">{daysLeft} Days</strong> Until 24 Dec 2026 Night Departure
                </span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                🚆 Planned Train: Rajdhani Express (Superfast)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Search Bar Widget (Ref: Shanti Travels Style for our Trip) ── */}
      <section className="relative z-30 max-w-5xl mx-auto px-4 -mt-16 sm:-mt-20">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100">
          {/* Top Tabs with Small Icons */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-100 pb-3 mb-4 text-xs sm:text-sm font-semibold text-gray-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab("destinations")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "destinations"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <MapPin className="w-4 h-4 text-[#007d8a]" />
              <span>Destinations</span>
            </button>

            <button
              onClick={() => setActiveTab("routemap")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "routemap"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Compass className="w-4 h-4 text-[#007d8a]" />
              <span>Route Map</span>
            </button>

            <button
              onClick={() => setActiveTab("stages")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "stages"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Tag className="w-4 h-4 text-[#007d8a]" />
              <span>Daily Schedules</span>
            </button>

            <button
              onClick={() => setActiveTab("rail")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "rail"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Train className="w-4 h-4 text-[#007d8a]" />
              <span>Trains &amp; Hotels</span>
            </button>
          </div>

          {/* Form Input Row with 4 Segments & Search Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Segment 1: Circuit */}
            <div className="lg:col-span-3 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <MapPin className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Trip Circuit</p>
                <p className="text-[11px] text-gray-500">Rajasthan · Delhi · Agra</p>
              </div>
            </div>

            {/* Segment 2: Departure Date */}
            <div className="lg:col-span-2 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Calendar className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Planned Departure</p>
                <p className="text-[11px] text-[#007d8a] font-semibold">24 Dec 2026 (Night)</p>
              </div>
            </div>

            {/* Segment 3: Departure Station */}
            <div className="lg:col-span-2 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Train className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Departure Hub</p>
                <p className="text-[11px] text-gray-500">Kollam Junction (QLN)</p>
              </div>
            </div>

            {/* Segment 4: Group Members */}
            <div className="lg:col-span-3 flex items-start gap-2.5 px-3 py-1.5">
              <Users className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Group Party</p>
                <p className="text-[11px] text-gray-500">Group Expedition (12+ Pax) ⌵</p>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2 flex justify-end">
              <Link
                href="/itinerary"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#007d8a] hover:bg-[#006670] text-white font-bold text-sm shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                <span>View Plan</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Circuit Destinations (5 Tall Photo Cards) ── */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Trip Circuit Destinations
            </h2>
            <WavySquiggle />
          </div>
          <Link
            href="/itinerary"
            className="text-xs sm:text-sm font-bold text-[#007d8a] hover:underline inline-flex items-center gap-1"
          >
            <span>View all destinations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
          {CIRCUIT_DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              href={dest.routeLink}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
            >
              <Image
                src={dest.image}
                alt={dest.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Top Tag */}
              <div className="absolute top-3 left-3">
                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                  {dest.daysTag}
                </span>
              </div>

              {/* Card Label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight text-white drop-shadow-sm">
                    {dest.title}
                  </h3>
                  <p className="text-[11px] text-white/80 font-normal drop-shadow-sm mt-0.5">
                    {dest.subtitle}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section: Interactive Timeline Route Map ── */}
      <section id="routemap" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <VisualRouteMap />
      </section>

      {/* ── Section: Trip Route Stages (6 Cards in 3x2 Grid) ── */}
      <section id="stages" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Trip Itinerary Stages
            </h2>
            <WavySquiggle />
          </div>
          <Link
            href="/itinerary"
            className="text-xs sm:text-sm font-bold text-[#007d8a] hover:underline inline-flex items-center gap-1"
          >
            <span>View master timeline</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRIP_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              {/* Card Image with Stage Number & Status Badge */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={stage.image}
                  alt={stage.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                <div className="absolute top-3 left-3 bg-[#007d8a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {stage.stageNumber}
                </div>

                <div
                  className={cn(
                    "absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm",
                    stage.statusVariant === "confirmed"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {stage.statusBadge}
                </div>

                <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-medium drop-shadow-sm flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-amber-300" />
                  <span>{stage.scheduleNote}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-[#007d8a] transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{stage.subtitle}</p>
                </div>

                {/* Highlights list */}
                <div className="space-y-1 pt-1 border-t border-gray-50">
                  {stage.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle2 className="w-3 h-3 text-[#007d8a] shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {/* Duration with Clock */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{stage.duration}</span>
                  </div>

                  {/* Stage Action Link */}
                  <Link
                    href="/itinerary"
                    className="text-xs font-bold text-[#007d8a] hover:underline flex items-center gap-1"
                  >
                    <span>View Day Plan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: "Organizer Support" Banner (Ref: Shanti Travels Style) ── */}
      <section id="assistance" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative rounded-3xl bg-[#064e5b] text-white overflow-hidden shadow-xl p-8 sm:p-12">
          {/* Subtle background image blending on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-25 sm:opacity-35 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
              alt="Assistance Rajasthan Architecture vista"
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#064e5b] via-[#064e5b]/70 to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading and Hotline */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest">
                TRIP ORGANIZER SUPPORT
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Need Assistance or Schedule Info?
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
                Our Master Admin and Destination Admins are actively coordinating day-by-day schedules,
                hotel options, and Rajdhani Express reservations for our group.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/travel-info"
                  className="px-6 py-2.5 rounded-full bg-white text-[#064e5b] font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-md"
                >
                  Travel Logistics Guide
                </Link>

                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/50 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 98765 43210</span>
                </a>
              </div>
            </div>

            {/* Right Column: 3 Guarantee Features */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-teal-200 mx-auto sm:mx-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Verified Stays</h4>
                <p className="text-[10px] text-white/70 leading-snug">Hotels reviewed by admins</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-teal-200 mx-auto sm:mx-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Admin Team</h4>
                <p className="text-[10px] text-white/70 leading-snug">Dedicated city coordinators</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-teal-200 mx-auto sm:mx-0">
                  <Train className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Rajdhani Transit</h4>
                <p className="text-[10px] text-white/70 leading-snug">Kollam reserved AC berths</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: "Group Notes & Coordinator Updates" (4 Cards + Arrow Buttons) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Group Notes &amp; Coordinator Updates
            </h2>
            <WavySquiggle />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setActiveReviewIndex((prev) => (prev > 0 ? prev - 1 : GROUP_TESTIMONIALS.length - 1))
              }
              className="w-8 h-8 rounded-full bg-[#064e5b] text-white flex items-center justify-center hover:opacity-90 shadow-sm"
              aria-label="Previous update"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setActiveReviewIndex((prev) => (prev < GROUP_TESTIMONIALS.length - 1 ? prev + 1 : 0))
              }
              className="w-8 h-8 rounded-full bg-[#064e5b] text-white flex items-center justify-center hover:opacity-90 shadow-sm"
              aria-label="Next update"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Review Cards in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GROUP_TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4",
                activeReviewIndex === idx ? "ring-2 ring-[#007d8a]" : ""
              )}
            >
              {/* Top: Avatar + Name + Stars */}
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
                  <p className="text-[11px] text-[#007d8a] font-medium">{t.role}</p>
                </div>
              </div>

              {/* Bottom Quote */}
              <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: 4 Project Feature Badges (White Box) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-6 px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          {/* Badge 1 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <MapPin className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">3 Royal Regions</h4>
              <p className="text-[11px] text-gray-500">Rajasthan · Delhi · Agra</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <Train className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Rajdhani Express</h4>
              <p className="text-[11px] text-gray-500">Kollam Jcn Departure</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <Users className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Admin Workflow</h4>
              <p className="text-[11px] text-gray-500">Master &amp; City Admins</p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">TBC Verification</h4>
              <p className="text-[11px] text-gray-500">Transparent Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Subscribe to Trip Bulletins ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#004d57] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          {/* Left Text with Airplane Icon */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-teal-600/50 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Subscribe to Trip Bulletins &amp; Notices
              </h3>
              <p className="text-xs sm:text-sm text-teal-100">
                Receive published itineraries, hotel check-in notifications, and train updates.
              </p>
            </div>
          </div>

          {/* Right Input Bar */}
          <div className="w-full md:w-auto flex-1 max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed successfully to Royal Routes trip bulletins!");
              }}
              className="bg-white rounded-full p-1.5 pl-5 flex items-center shadow-sm"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#007d8a] hover:bg-[#006670] text-white font-bold text-xs shrink-0 transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer (Dark Navy, 4 Columns, Royal Routes Edition) ── */}
      <footer id="contact" className="bg-[#06121e] text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Top 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs text-gray-400">
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#007d8a]">
                  <MapPin className="w-4 h-4 fill-[#007d8a] text-white" />
                </div>
                <div className="text-white font-extrabold text-lg tracking-tight">
                  Royal Routes <span className="text-[10px] tracking-widest text-teal-300">INDIA</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Royal Routes is the official collaborative trip planner for our Winter 2026–2027 group
                expedition across Rajasthan, Delhi, and Agra. Departing from Kollam Junction, Kerala
                via Rajdhani Express.
              </p>

              {/* Emergency railway pill */}
              <div className="flex items-center gap-2 text-[11px] text-teal-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl max-w-xs">
                <Train className="w-3.5 h-3.5 text-amber-300" />
                <span>Railway Helpline: 139 · National Emergency: 112</span>
              </div>
            </div>

            {/* Col 2: Trip Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trip Portal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Trip Overview
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Member Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/itinerary" className="hover:text-white transition-colors">
                    Master Itinerary
                  </Link>
                </li>
                <li>
                  <Link href="/travel-info" className="hover:text-white transition-colors">
                    Travel Logistics &amp; Packing
                  </Link>
                </li>
                <li>
                  <Link href="#routemap" className="hover:text-white transition-colors">
                    Visual Route Circuit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Destinations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Destinations</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/destinations/rajasthan" className="hover:text-white transition-colors">
                    Rajasthan (Jaipur Hub)
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/delhi" className="hover:text-white transition-colors">
                    Delhi (Imperial Capital)
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/agra" className="hover:text-white transition-colors">
                    Agra (Taj Mahal &amp; Fort)
                  </Link>
                </li>
                <li>
                  <Link href="/travel-info" className="hover:text-white transition-colors">
                    Kollam Junction (Departure)
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                    Admin Workspaces
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Administration */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administration</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                    Master Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/assignments" className="hover:text-white transition-colors">
                    Destination Assignments
                  </Link>
                </li>
                <li>
                  <Link href="/admin/approval-center" className="hover:text-white transition-colors">
                    Approval Center
                  </Link>
                </li>
                <li>
                  <Link href="/admin/hotels" className="hover:text-white transition-colors">
                    Hotel Manager
                  </Link>
                </li>
                <li>
                  <Link href="/admin/transport" className="hover:text-white transition-colors">
                    Transport Manager
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
            <p>© 2026–2027 Royal Routes – India Trip Planner. All group rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Departure: 24 December 2026 (Night)</span>
              <span>·</span>
              <span>Origin: Kollam Junction, Kerala</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
