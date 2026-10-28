"use client";

import { useState } from "react";
import {
  MapPin,
  Train,
  Bus,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RouteStop {
  id: string;
  name: string;
  tagline: string;
  dateText: string;
  station: string;
  type: "origin" | "destination" | "transit" | "return";
  transitToNext?: {
    mode: "train" | "bus" | "taxi";
    title: string;
    distance: string;
    duration: string;
    status: "tbc" | "confirmed";
  };
  highlights: string[];
  status: "confirmed" | "tentative" | "in_review";
  details: string;
  latLng: { x: number; y: number }; // Relative percentage coordinates for visual SVG map
}

export const ROUTE_STOPS: RouteStop[] = [
  {
    id: "kollam",
    name: "Kollam Junction (QLN)",
    tagline: "Coastal Kerala Departure Hub",
    dateText: "24 Dec 2026 (Night)",
    station: "Kollam Junction, Southern Railway",
    type: "origin",
    transitToNext: {
      mode: "train",
      title: "Rajdhani Express (Superfast)",
      distance: "2,840 km",
      duration: "~42 hrs (Scenic Konkan Corridor)",
      status: "tbc",
    },
    highlights: ["Group Assembly at QLN Station", "Overnight Sleeper AC Coach", "Luggage & PNR Verification"],
    status: "confirmed",
    details:
      "All group members assemble at Kollam Junction railway platform on the night of 24 December 2026. Boarding the Rajdhani Express with reserved AC berths.",
    latLng: { x: 38, y: 88 },
  },
  {
    id: "rajasthan",
    name: "Rajasthan (Jaipur Hub)",
    tagline: "Land of Kings & Amber Fort",
    dateText: "26 – 29 Dec 2026 (Tentative)",
    station: "Jaipur Junction / Durgapura",
    type: "destination",
    transitToNext: {
      mode: "bus",
      title: "Dedicated AC Luxury Coach",
      distance: "280 km",
      duration: "~4.5 hrs via NE-4 Expressway",
      status: "tbc",
    },
    highlights: ["Amber Palace & Fort Elephant Ramparts", "City Palace & Hawa Mahal", "Chokhi Dhani Heritage Village", "Johari Bazaar Textile Shopping"],
    status: "tentative",
    details:
      "First royal destination stop. Experiencing the Pink City's palatial architecture, hilltop forts, and rich Rajasthani dinner banquets.",
    latLng: { x: 32, y: 36 },
  },
  {
    id: "delhi",
    name: "Delhi (Imperial Capital)",
    tagline: "Mughal Grandeur & Lutyens' Avenues",
    dateText: "29 Dec 2026 – 01 Jan 2027",
    station: "New Delhi / Hazrat Nizamuddin",
    type: "destination",
    transitToNext: {
      mode: "bus",
      title: "Yamuna Expressway Transit",
      distance: "210 km",
      duration: "~3 hrs via Yamuna Expressway",
      status: "tbc",
    },
    highlights: ["Red Fort (Lal Qila) & Jama Masjid", "Qutub Minar & Iron Pillar", "India Gate & Kartavya Path Walk", "Chandni Chowk Rickshaw Food Safari"],
    status: "tentative",
    details:
      "Discover the layered imperial capital. Balancing Old Delhi Mughal relics and bustling street bazaars with modern New Delhi landmarks.",
    latLng: { x: 42, y: 28 },
  },
  {
    id: "agra",
    name: "Agra (City of the Taj)",
    tagline: "The Eternal Monument to Love",
    dateText: "01 – 03 Jan 2027 (Tentative)",
    station: "Agra Cantt (AGC)",
    type: "destination",
    transitToNext: {
      mode: "train",
      title: "Return Rajdhani / Express Transit",
      distance: "2,750 km",
      duration: "Return Journey to Kerala",
      status: "tbc",
    },
    highlights: ["Taj Mahal Sunrise Vista (Closed Fridays)", "Agra Fort Red Sandstone Citadel", "Mehtab Bagh Sunset Across Yamuna", "Fatehpur Sikri Imperial Ruins"],
    status: "tentative",
    details:
      "The pinnacle of Mughal architectural splendour. Witnessing the Taj Mahal in sunrise fog, exploring Akbar's Agra Fort, and sampling local marble artisan crafts.",
    latLng: { x: 48, y: 34 },
  },
  {
    id: "return",
    name: "Kollam Junction (Return)",
    tagline: "Welcome Home Group Arrival",
    dateText: "Early Jan 2027 (Date TBC)",
    station: "Kollam Junction, Kerala",
    type: "return",
    highlights: ["Group Souvenir Distribution", "Photo Sharing Album Archive", "End of Winter Expedition 2026-27"],
    status: "tentative",
    details:
      "Safe return of all trip participants to Kollam Junction, concluding the Royal Routes Winter 2026-27 group journey.",
    latLng: { x: 38, y: 92 },
  },
];

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

export default function VisualRouteMap() {
  const [selectedStopId, setSelectedStopId] = useState<string>("kollam");
  const selectedStop = ROUTE_STOPS.find((s) => s.id === selectedStopId) || ROUTE_STOPS[0];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 inline-block">
              Route Map &amp; Timeline Circuit
            </h2>
            <WavySquiggle />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            2,840+ km Winter Group Expedition from Kollam Junction to Rajasthan, Delhi &amp; Agra.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Departure Confirmed</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Schedule Tentative (TBC)</span>
          </span>
        </div>
      </div>

      {/* ── Route Steps Rail / Pill Navigator ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {ROUTE_STOPS.map((stop, idx) => {
          const isActive = stop.id === selectedStopId;
          return (
            <button
              key={stop.id}
              onClick={() => setSelectedStopId(stop.id)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 border",
                isActive
                  ? "bg-[#007d8a] text-white shadow-md border-transparent"
                  : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-white hover:border-teal-200"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0",
                  isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                )}
              >
                {idx + 1}
              </span>
              <div className="text-left">
                <p className="font-bold leading-tight">{stop.name.split(" ")[0]}</p>
                <p className={cn("text-[10px]", isActive ? "text-teal-100" : "text-gray-400")}>
                  {stop.dateText.split("(")[0]}
                </p>
              </div>
              {idx < ROUTE_STOPS.length - 1 && (
                <ChevronRight className={cn("w-3.5 h-3.5 ml-1", isActive ? "text-white/60" : "text-gray-300")} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Dual Panel: Visual Map & Stop Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#064e5b] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg min-h-[440px] flex flex-col justify-between">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Map Top Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs uppercase tracking-widest text-teal-200 font-bold">
                Express Rail &amp; Highway Corridor
              </span>
            </div>
            <span className="text-xs text-white/70 font-mono">Distance: ~5,800 km Roundtrip</span>
          </div>

          {/* SVG Map Schematic */}
          <div className="relative z-10 my-6 py-2">
            <svg viewBox="0 0 100 100" className="w-full h-64 sm:h-72 overflow-visible">
              {/* Route connecting line */}
              <path
                d="M 38 88 L 34 60 L 32 36 L 42 28 L 48 34 L 40 70 L 38 92"
                fill="none"
                stroke="url(#routeTealGradient)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />

              <defs>
                <linearGradient id="routeTealGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f5a623" />
                  <stop offset="40%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              {/* Station Dots & Labels */}
              {ROUTE_STOPS.map((stop) => {
                const isSelected = stop.id === selectedStopId;
                return (
                  <g
                    key={stop.id}
                    className="cursor-pointer transition-transform duration-300 group"
                    onClick={() => setSelectedStopId(stop.id)}
                  >
                    {/* Pulsing ring on selected */}
                    {isSelected && (
                      <circle
                        cx={stop.latLng.x}
                        cy={stop.latLng.y}
                        r="7"
                        fill="none"
                        stroke="#f5a623"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={stop.latLng.x}
                      cy={stop.latLng.y}
                      r={isSelected ? "5" : "3.5"}
                      fill={isSelected ? "#f5a623" : "#ffffff"}
                      stroke={isSelected ? "#ffffff" : "#007d8a"}
                      strokeWidth="2"
                      className="transition-all"
                    />

                    {/* Node Label Text */}
                    <text
                      x={stop.latLng.x + (stop.latLng.x > 40 ? 6 : -6)}
                      y={stop.latLng.y + 1.5}
                      textAnchor={stop.latLng.x > 40 ? "start" : "end"}
                      fill={isSelected ? "#fed7aa" : "#ffffff"}
                      fontSize="4.2"
                      fontWeight={isSelected ? "bold" : "600"}
                      className="select-none font-sans drop-shadow-sm"
                    >
                      {stop.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer status */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-amber-400" />
              <span>Rajdhani Express: Kollam Jcn (24 Dec Night) ➔ Jaipur ➔ Delhi ➔ Agra</span>
            </div>
            <span className="text-[11px] text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              Winter 2026-27 Group Tour
            </span>
          </div>
        </div>

        {/* Selected Stop Details Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="space-y-1.5 border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#007d8a] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                Stop Focus
              </span>
              <span
                className={cn(
                  "text-[11px] px-2.5 py-0.5 rounded-full font-semibold border",
                  selectedStop.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                {selectedStop.status === "confirmed" ? "Departure Confirmed" : "Tentative (TBC)"}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">{selectedStop.name}</h3>
            <p className="text-xs text-gray-500 font-medium italic">{selectedStop.tagline}</p>
          </div>

          {/* Overview text */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{selectedStop.details}</p>

          {/* Transit Leg to Next Stop */}
          {selectedStop.transitToNext && (
            <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#007d8a] flex items-center gap-1.5">
                  {selectedStop.transitToNext.mode === "train" ? (
                    <Train className="w-3.5 h-3.5 text-[#007d8a]" />
                  ) : (
                    <Bus className="w-3.5 h-3.5 text-[#007d8a]" />
                  )}
                  <span>Next Transit</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {selectedStop.transitToNext.status.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">{selectedStop.transitToNext.title}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1 border-t border-gray-100">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase">Distance</span>
                  <span className="font-medium text-gray-700">{selectedStop.transitToNext.distance}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase">Est. Duration</span>
                  <span className="font-medium text-gray-700">{selectedStop.transitToNext.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Highlights */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Planned Highlights &amp; Activities
            </p>
            <div className="space-y-1.5">
              {selectedStop.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice pill */}
          <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 flex items-start gap-2 shadow-xs">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Official train numbers, berth allotments, and hotel check-in times will be finalized by
              the Master Admin upon booking confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
