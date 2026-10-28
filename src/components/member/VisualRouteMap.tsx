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

export default function VisualRouteMap() {
  const [selectedStopId, setSelectedStopId] = useState<string>("kollam");
  const selectedStop = ROUTE_STOPS.find((s) => s.id === selectedStopId) || ROUTE_STOPS[0];

  return (
    <div className="bg-white border border-ivory-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-gold-600" />
            <span>Interactive Geographic Circuit</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-royal-950">
            The Royal Route Map &amp; Timeline
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Tracking our 2,800+ km winter overland journey from South India to the Northern Golden Triangle.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Confirmed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>To Be Confirmed</span>
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
                "px-4 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 border",
                isActive
                  ? "bg-royal-gradient text-white shadow-premium border-transparent"
                  : "bg-ivory-50 text-stone-700 border-ivory-200 hover:bg-white hover:border-royal-200"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0",
                  isActive ? "bg-white/20 text-white" : "bg-ivory-200 text-stone-700"
                )}
              >
                {idx + 1}
              </span>
              <div className="text-left">
                <p className="font-bold leading-tight">{stop.name.split(" ")[0]}</p>
                <p className={cn("text-[10px] opacity-80", isActive ? "text-gold-300" : "text-stone-400")}>
                  {stop.dateText.split("(")[0]}
                </p>
              </div>
              {idx < ROUTE_STOPS.length - 1 && (
                <ChevronRight className={cn("w-3.5 h-3.5 ml-1", isActive ? "text-white/60" : "text-stone-300")} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Dual Panel: Interactive Visual Map & Stop Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-royal-950 via-royal-900 to-[#101438] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-premium-lg min-h-[460px] flex flex-col justify-between">
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase tracking-widest text-gold-300 font-semibold">
                Overland Rail &amp; Road Transit
              </span>
            </div>
            <span className="text-xs text-white/60 font-mono">Distance: ~5,800 km Roundtrip</span>
          </div>

          {/* SVG Map Schematic */}
          <div className="relative z-10 my-8 py-4">
            <svg viewBox="0 0 100 100" className="w-full h-72 sm:h-80 overflow-visible">
              {/* Route connecting line */}
              <path
                d="M 38 88 L 34 60 L 32 36 L 42 28 L 48 34 L 40 70 L 38 92"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />

              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#4d64f8" />
                </linearGradient>
              </defs>

              {/* Station Dots & Labels */}
              {ROUTE_STOPS.map((stop, idx) => {
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
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={stop.latLng.x}
                      cy={stop.latLng.y}
                      r={isSelected ? "5" : "3.5"}
                      fill={isSelected ? "#f59e0b" : "#ffffff"}
                      stroke={isSelected ? "#ffffff" : "#1e2fd6"}
                      strokeWidth="2"
                      className="transition-all"
                    />

                    {/* Node Label Text */}
                    <text
                      x={stop.latLng.x + (stop.latLng.x > 40 ? 6 : -6)}
                      y={stop.latLng.y + 1.5}
                      textAnchor={stop.latLng.x > 40 ? "start" : "end"}
                      fill={isSelected ? "#fde68a" : "#ffffff"}
                      fontSize="4.2"
                      fontWeight={isSelected ? "bold" : "600"}
                      className="select-none font-sans"
                    >
                      {stop.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer status */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-gold-400" />
              <span>Express Rail Corridor: Kollam ➔ Western Ghats ➔ Delhi ➔ Taj Circuit</span>
            </div>
            <span className="text-[11px] text-gold-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              Winter 2026-27 Group Tour
            </span>
          </div>
        </div>

        {/* Selected Stop Details Card (5 Cols) */}
        <div className="lg:col-span-5 bg-ivory-50 border border-ivory-200 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="space-y-2 border-b border-ivory-200 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-gold-100/70 px-2.5 py-0.5 rounded-full border border-gold-200">
                Stop Focus
              </span>
              <span
                className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-semibold border",
                  selectedStop.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                {selectedStop.status === "confirmed" ? "Schedule Confirmed" : "Tentative (TBC)"}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-royal-950">{selectedStop.name}</h3>
            <p className="text-xs text-stone-500 font-medium italic">{selectedStop.tagline}</p>
          </div>

          {/* Overview text */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{selectedStop.details}</p>

          {/* Transit Leg to Next Stop */}
          {selectedStop.transitToNext && (
            <div className="p-4 rounded-2xl bg-white border border-ivory-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-royal-700 flex items-center gap-1.5">
                  {selectedStop.transitToNext.mode === "train" ? (
                    <Train className="w-3.5 h-3.5 text-royal-600" />
                  ) : (
                    <Bus className="w-3.5 h-3.5 text-royal-600" />
                  )}
                  <span>Next Connection</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {selectedStop.transitToNext.status.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-stone-900 text-sm">{selectedStop.transitToNext.title}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 pt-1 border-t border-ivory-100">
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase">Distance</span>
                  <span className="font-medium text-stone-700">{selectedStop.transitToNext.distance}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase">Est. Duration</span>
                  <span className="font-medium text-stone-700">{selectedStop.transitToNext.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Highlights */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Planned Highlights &amp; Activities
            </p>
            <div className="space-y-2">
              {selectedStop.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice pill */}
          <div className="p-3 bg-sandstone-100 border border-sandstone-200 rounded-xl text-xs text-stone-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
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
