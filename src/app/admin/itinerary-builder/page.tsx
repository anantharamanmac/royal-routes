"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Compass,
  Calendar,
  Sparkles,
  Database,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { seedDemoData } from "@/lib/firebase/seedData";
import { Destination } from "@/lib/types";
import { toast } from "sonner";

const TRIP_ID = "demo-trip-2026";

const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: "dest-rajasthan",
    name: "Rajasthan (Jaipur Hub & Desert Circuit)",
    state: "Rajasthan",
    country: "India",
    sequenceOrder: 1,
    status: "in_progress",
    arrivalDate: null,
    departureDate: null,
    tripId: TRIP_ID,
    description: "Amber Fort, City Palace, Hawa Mahal, royal bazaars, and traditional dinner.",
    createdBy: "system",
    createdAt: null as never,
    updatedAt: null as never,
  },
  {
    id: "dest-delhi",
    name: "Delhi (Imperial & Historic Capital)",
    state: "Delhi",
    country: "India",
    sequenceOrder: 2,
    status: "in_progress",
    arrivalDate: null,
    departureDate: null,
    tripId: TRIP_ID,
    description: "Qutub Minar, Red Fort, Chandni Chowk street food, and India Gate boulevards.",
    createdBy: "system",
    createdAt: null as never,
    updatedAt: null as never,
  },
  {
    id: "dest-agra",
    name: "Agra (Taj Mahal & Mughal Splendour)",
    state: "Uttar Pradesh",
    country: "India",
    sequenceOrder: 3,
    status: "in_progress",
    arrivalDate: null,
    departureDate: null,
    tripId: TRIP_ID,
    description: "Sunrise Taj Mahal visit, Agra Fort, Mehtab Bagh, and Fatehpur Sikri excursion.",
    createdBy: "system",
    createdAt: null as never,
    updatedAt: null as never,
  },
];

export default function ItineraryBuilderHubPage() {
  const { appUser } = useAuth();
  const { destinations, loading } = useDestinations(TRIP_ID);
  const [isSeeding, setIsSeeding] = useState(false);

  const displayDestinations = destinations.length > 0 ? destinations : DEFAULT_DESTINATIONS;

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await seedDemoData(appUser?.uid || "admin-system");
      toast.success("Authentic Rajasthan · Delhi · Agra itinerary seeded into Firestore successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to seed itinerary data.");
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="border-b border-ivory-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Itinerary Preparation Hub</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">
            Itinerary Builder
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage day-by-day schedules, drag-and-drop activities, transit intervals, and booking statuses for each destination.
          </p>
        </div>

        {/* Action Button: Populate / Sync Database */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-premium flex items-center gap-2 transition-all disabled:opacity-50"
            title="Populates full days, sights, timings, and activities into Firestore"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
            <span>{isSeeding ? "Syncing Itinerary…" : "Populate Default Days & Sights"}</span>
          </button>
        </div>
      </div>

      {/* ── Destination Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayDestinations.map((dest, idx) => {
          const isAssigned =
            appUser?.role === "master_admin" ||
            appUser?.assignedDestinationIds?.includes(dest.id);

          return (
            <div
              key={dest.id}
              className="card-premium p-6 flex flex-col justify-between space-y-6 hover:shadow-premium-lg transition-all group border border-ivory-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Stop {idx + 1}
                  </span>
                  <StatusBadge status={dest.status} type="destination" />
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#007d8a] shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-royal-950 group-hover:text-[#007d8a] transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {dest.description ||
                        "Organize morning to evening visits, fort excursions, dinner stops, and transfer intervals."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-stone-600 flex items-center gap-1.5 border-t border-ivory-100">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Schedule:{" "}
                    {dest.arrivalDate ? formatDate(dest.arrivalDate) : "Dates To Be Confirmed (TBC)"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">
                  {isAssigned ? "👑 Full Access" : "Read-only Preview"}
                </span>
                <Link
                  href={`/admin/itinerary-builder/${dest.id}`}
                  className="px-4 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 hover:opacity-95 shadow-premium transition-all"
                >
                  <span>Open Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Guidance Banner ── */}
      <div className="card-premium p-6 bg-gradient-to-r from-royal-900 to-royal-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Need pre-filled day schedules?</h3>
            <p className="text-xs text-royal-200 mt-0.5">
              Click &quot;Populate Default Days &amp; Sights&quot; above to initialize Day 1 &ndash; Day 7 with authentic Rajasthan forts, Delhi heritage sites, and Agra sunrise visits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
