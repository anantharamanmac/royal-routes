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
} from "lucide-react";
import VisualRouteMap from "@/components/member/VisualRouteMap";
import { daysUntil, cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

const DEPARTURE_DATE = new Timestamp(1766617200, 0); // 24 Dec 2026

function WavySquiggle() {
  return (
    <svg
      className="w-8 h-3 text-[#007d8a] inline-block ml-2 align-middle"
      viewBox="0 0 36 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5C3.5 2 6 2 8.5 5C11 8 13.5 8 16 5C18.5 2 21 2 23.5 5C26 8 28.5 8 31 5C33.5 2 35 3 35 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const POPULAR_DESTINATIONS = [
  {
    id: "maldives",
    title: "Maldives",
    subtitle: "Paradise on Earth",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    routeContext: "Kollam Departure ➔ Coastal Hub",
  },
  {
    id: "thailand",
    title: "Thailand",
    subtitle: "Land of Smiles",
    image:
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80",
    routeContext: "Rajasthan (Jaipur Hub)",
  },
  {
    id: "greece",
    title: "Greece",
    subtitle: "Aegean Dream",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    routeContext: "Delhi Imperial Capital",
  },
  {
    id: "switzerland",
    title: "Switzerland",
    subtitle: "Scenic Beauty",
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    routeContext: "Agra Taj Mahal Circuit",
  },
  {
    id: "bali",
    title: "Bali",
    subtitle: "Island of Gods",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    routeContext: "Western Ghats Corridor",
  },
];

const TOUR_PACKAGES = [
  {
    id: "andaman",
    title: "Andaman Escape",
    subtitle: "Rajasthan Heritage Forts & Palaces",
    duration: "5 Days / 4 Nights",
    price: "₹18,999",
    originalPrice: "₹24,000",
    discountBadge: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "goa",
    title: "Goa Beach Holiday",
    subtitle: "Delhi Old & New Capital Safari",
    duration: "4 Days / 3 Nights",
    price: "₹12,999",
    originalPrice: "₹16,000",
    discountBadge: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "himachal",
    title: "Himachal Adventure",
    subtitle: "Agra Sunrise Taj & Red Citadel",
    duration: "6 Days / 5 Nights",
    price: "₹16,999",
    originalPrice: "₹21,000",
    discountBadge: "18% OFF",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kerala",
    title: "Kerala Backwaters",
    subtitle: "Kollam Junction Rajdhani Express (TBC)",
    duration: "4 Days / 3 Nights",
    price: "₹14,999",
    originalPrice: "₹18,000",
    discountBadge: "16% OFF",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dubai",
    title: "Dubai City Tour",
    subtitle: "Fatehpur Sikri Imperial Ruins Excursion",
    duration: "4 Days / 3 Nights",
    price: "₹24,999",
    originalPrice: "₹32,000",
    discountBadge: "22% OFF",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "singapore",
    title: "Singapore Getaway",
    subtitle: "Royal Routes 10-Day Complete Circuit",
    duration: "5 Days / 4 Nights",
    price: "₹28,999",
    originalPrice: "₹36,000",
    discountBadge: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "Amazing experience with Shanti Travels. Everything was perfectly organized!",
  },
  {
    name: "Rohit Verma",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "The best vacation we ever had. Great service and memorable moments.",
  },
  {
    name: "Anjali Mehta",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    text: "Highly recommended! Will definitely book my next trip with them.",
  },
  {
    name: "Karan Singh",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    text: "Excellent support throughout the trip. Hassle-free and enjoyable.",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"places" | "activities" | "packages" | "deals">("places");
  const [daysLeft, setDaysLeft] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    setDaysLeft(daysUntil(DEPARTURE_DATE));
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#007d8a] selection:text-white">
      {/* ── Fixed Transparent Header (Ref: Shanti Travels Mockup) ── */}
      <header className="absolute top-0 left-0 right-0 z-50 py-5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo with Pin Marker */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#007d8a] shadow-sm">
              <MapPin className="w-5 h-5 fill-[#007d8a] text-white" />
            </div>
            <div className="text-white leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-teal-200 transition-colors">
                  Shanti
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase">
                  Travels
                </span>
              </div>
              <span className="text-[9px] block font-semibold text-teal-200 tracking-wider">
                Royal Routes Edition
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
            <Link href="#packages" className="hover:text-white transition-colors">
              Packages
            </Link>
            <Link href="#routemap" className="hover:text-white transition-colors">
              Activities &amp; Route
            </Link>
            <Link href="/itinerary" className="hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="#assistance" className="hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="#contact" className="hover:text-white transition-colors">
              Contact
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
              title="Trip Member Portal"
            >
              <User className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Lush Tropical Ocean + Bold Headline) ── */}
      <section className="relative min-h-[90vh] sm:min-h-[94vh] flex items-center pt-24 pb-28 sm:pb-36 overflow-hidden">
        {/* Full Bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2400&q=85"
            alt="Tropical Island Lagoon Resort"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Subtle natural gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
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
              EXPLORE THE WORLD
            </div>

            {/* Main Headline with Brush Script Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Find our dream <br />
              <span className="font-caveat text-[#f5a623] italic font-normal text-6xl sm:text-7xl lg:text-8xl inline-block -rotate-2 mr-2">
                Trip
              </span>
              on Shanti Travels
            </h1>

            {/* Subheading */}
            <p className="text-white/90 text-base sm:text-xl font-normal leading-relaxed pt-1">
              Let&apos;s make your next journey <br />
              your best journey
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#007d8a] hover:bg-[#006a75] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#routemap"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/50 hover:border-white backdrop-blur-sm transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
                <span>Watch Video</span>
              </a>
            </div>

            {/* Winter 2026-27 Trip Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-teal-100 font-medium">
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                🚆 24 Dec 2026 Night Departure from Kollam Junction via Rajdhani Express
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Search Bar Widget (Ref: Shanti Travels Mockup) ── */}
      <section className="relative z-30 max-w-5xl mx-auto px-4 -mt-16 sm:-mt-20">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100">
          {/* Top Tabs with Small Icons */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-100 pb-3 mb-4 text-xs sm:text-sm font-semibold text-gray-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab("places")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "places"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <MapPin className="w-4 h-4 text-[#007d8a]" />
              <span>Places</span>
            </button>

            <button
              onClick={() => setActiveTab("activities")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "activities"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Compass className="w-4 h-4 text-[#007d8a]" />
              <span>Activities</span>
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "packages"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Tag className="w-4 h-4 text-[#007d8a]" />
              <span>Packages</span>
            </button>

            <button
              onClick={() => setActiveTab("deals")}
              className={cn(
                "flex items-center gap-2 pb-1 transition-all whitespace-nowrap",
                activeTab === "deals"
                  ? "text-[#007d8a] font-bold border-b-2 border-[#007d8a]"
                  : "hover:text-gray-900"
              )}
            >
              <Star className="w-4 h-4 text-[#007d8a]" />
              <span>Deals</span>
            </button>
          </div>

          {/* Form Input Row with 4 Segments & Search Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Segment 1: Where */}
            <div className="lg:col-span-3 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <MapPin className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Where are you going?</p>
                <p className="text-[11px] text-gray-400">Rajasthan, Delhi, Agra</p>
              </div>
            </div>

            {/* Segment 2: Check in */}
            <div className="lg:col-span-2 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Calendar className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Check in</p>
                <p className="text-[11px] text-[#007d8a] font-medium">24 Dec 2026 (Night)</p>
              </div>
            </div>

            {/* Segment 3: Check Out */}
            <div className="lg:col-span-2 flex items-start gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Calendar className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Check Out</p>
                <p className="text-[11px] text-gray-400">Return Date (TBC)</p>
              </div>
            </div>

            {/* Segment 4: Travelers */}
            <div className="lg:col-span-3 flex items-start gap-2.5 px-3 py-1.5">
              <Users className="w-4 h-4 text-[#007d8a] mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Travelers</p>
                <p className="text-[11px] text-gray-500">Group Trip (12+ Pax) ⌵</p>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2 flex justify-end">
              <Link
                href="/itinerary"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#007d8a] hover:bg-[#006670] text-white font-bold text-sm shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Popular Destinations (5 Tall Photo Cards) ── */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Popular Destinations
            </h2>
            <WavySquiggle />
          </div>
          <Link
            href="/destinations/rajasthan"
            className="text-xs sm:text-sm font-bold text-[#007d8a] hover:underline inline-flex items-center gap-1"
          >
            <span>View all destinations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
          {POPULAR_DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              href="/itinerary"
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
            >
              <Image
                src={dest.image}
                alt={dest.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Card Label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight text-white drop-shadow-sm">
                    {dest.title}
                  </h3>
                  <p className="text-[11px] text-white/80 font-normal drop-shadow-sm">
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

      {/* ── Section: Interactive Timeline Route Map (Requested by User) ── */}
      <section id="routemap" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <VisualRouteMap />
      </section>

      {/* ── Section: Popular Tour Packages (6 Card Grid: 3x2) ── */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Popular Tour Packages
            </h2>
            <WavySquiggle />
          </div>
          <Link
            href="/itinerary"
            className="text-xs sm:text-sm font-bold text-[#007d8a] hover:underline inline-flex items-center gap-1"
          >
            <span>View all packages</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOUR_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              {/* Card Image with Red Discount Badge */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#ff4d4f] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {pkg.discountBadge}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-[#007d8a] transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pkg.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {/* Duration with Clock */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-gray-900">{pkg.price}</span>
                    <span className="text-xs text-gray-400 line-through">
                      {pkg.originalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: "Need Assistance?" Banner (Curved Dark Teal Container) ── */}
      <section id="assistance" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative rounded-3xl bg-[#064e5b] text-white overflow-hidden shadow-xl p-8 sm:p-12">
          {/* Swimmer / Traveler Background image blending on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-35 sm:opacity-55 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
              alt="Assistance underwater ocean vista"
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#064e5b] via-[#064e5b]/70 to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading and Hotline */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest">
                WE&apos;RE HERE TO HELP
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Need Assistance?
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
                Our travel coordinators are ready to help you coordinate your winter trip across
                Rajasthan, Delhi, and Agra.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#contact"
                  className="px-6 py-2.5 rounded-full bg-white text-[#064e5b] font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-md"
                >
                  Contact Us
                </a>

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
                <h4 className="text-xs font-bold text-white">Best Price</h4>
                <p className="text-[10px] text-white/70 leading-snug">We guarantee best price</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-teal-200 mx-auto sm:mx-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">24/7 Support</h4>
                <p className="text-[10px] text-white/70 leading-snug">We&apos;re here to help anytime</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-teal-200 mx-auto sm:mx-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Secure Booking</h4>
                <p className="text-[10px] text-white/70 leading-snug">Book with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: "What Our Travelers Say" (4 Testimonials + Arrow Buttons) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              What Our Travelers Say
            </h2>
            <WavySquiggle />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setActiveReviewIndex((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1))
              }
              className="w-8 h-8 rounded-full bg-[#064e5b] text-white flex items-center justify-center hover:opacity-90 shadow-sm"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setActiveReviewIndex((prev) => (prev < TESTIMONIALS.length - 1 ? prev + 1 : 0))
              }
              className="w-8 h-8 rounded-full bg-[#064e5b] text-white flex items-center justify-center hover:opacity-90 shadow-sm"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Review Cards in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, idx) => (
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
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quote */}
              <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: 4 Trust Badges Strip (White Box) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-6 px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          {/* Badge 1 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <MapPin className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">100+ Destinations</h4>
              <p className="text-[11px] text-gray-500">Across the globe</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <Tag className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Best Price Guarantee</h4>
              <p className="text-[11px] text-gray-500">Get best deals</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <Users className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Trusted by 10K+</h4>
              <p className="text-[11px] text-gray-500">Happy travelers</p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#007d8a] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#007d8a]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Secure Payments</h4>
              <p className="text-[11px] text-gray-500">100% safe &amp; secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Subscribe to Our Newsletter ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#004d57] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          {/* Left Text with Airplane Icon */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-teal-600/50 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-xs sm:text-sm text-teal-100">
                Get the best travel deals and offers straight to your inbox.
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

      {/* ── Footer (Dark Navy, 4 Columns, Ref: Shanti Travels Mockup) ── */}
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
                  Shanti <span className="text-[10px] tracking-widest text-teal-300">TRAVELS</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Shanti Travels is your trusted travel partner. Discover amazing destinations with the
                best deals and experiences. Group expedition planner for Rajasthan, Delhi &amp; Agra.
              </p>

              {/* Social Circle Icons */}
              <div className="flex items-center gap-2.5 pt-1">
                {["f", "ig", "yt", "tw"].map((s) => (
                  <span
                    key={s}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#assistance" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#destinations" className="hover:text-white transition-colors">
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link href="#packages" className="hover:text-white transition-colors">
                    Packages
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Services */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/admin/hotels" className="hover:text-white transition-colors">
                    Hotel Booking
                  </Link>
                </li>
                <li>
                  <Link href="/admin/transport" className="hover:text-white transition-colors">
                    Train Booking
                  </Link>
                </li>
                <li>
                  <Link href="/itinerary" className="hover:text-white transition-colors">
                    Holiday Packages
                  </Link>
                </li>
                <li>
                  <Link href="/travel-info" className="hover:text-white transition-colors">
                    Travel Insurance
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <a href="tel:+919876543210" className="hover:text-white">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold text-xs">@</span>
                  <a href="mailto:info@shantitravels.com" className="hover:text-white">
                    info@shantitravels.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                  <span>123, Travel Street, New Delhi, India - 110001</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
            <p>© 2026 Shanti Travels / Royal Routes. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-gray-300">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
