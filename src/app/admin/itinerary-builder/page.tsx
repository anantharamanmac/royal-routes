"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Compass, Calendar, Sparkles } from "lucide-react";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

export default function ItineraryBuilderHubPage() {
  const { appUser } = useAuth();
  const { destinations, loading } = useDestinations(TRIP_ID);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="border-b border-ivory-200 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Itinerary Preparation Hub</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-royal-950">
          Select Itinerary Destination
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Choose a destination workspace to manage day timelines, drag-and-drop activities, and
          review timings.
        </p>
      </div>

      {/* ── Destination Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.map((dest, idx) => {
          const isAssigned =
            appUser?.role === "master_admin" ||
            appUser?.assignedDestinationIds?.includes(dest.id);

          return (
            <div
              key={dest.id}
              className="card-premium p-6 flex flex-col justify-between space-y-6 hover:shadow-premium-lg transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200">
                    Stop {idx + 1}
                  </span>
                  <StatusBadge status={dest.status} type="destination" />
                </div>

                <h2 className="font-display text-2xl font-bold text-royal-900 group-hover:text-royal-700 transition-colors">
                  {dest.name}
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {dest.description ||
                    "Organize morning to evening visits, fort excursions, dinner stops, and transfer intervals."}
                </p>

                <div className="pt-2 text-xs text-stone-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Schedule:{" "}
                    {dest.arrivalDate ? formatDate(dest.arrivalDate) : "Dates To Be Confirmed"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  {isAssigned ? "Authorized Access" : "Read-only preview"}
                </span>
                <Link
                  href={`/admin/itinerary-builder/${dest.id}`}
                  className="px-4 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 hover:opacity-95 shadow-premium"
                >
                  <span>Open Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
