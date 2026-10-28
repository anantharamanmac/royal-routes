"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Printer,
  Compass,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
} from "lucide-react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { ItineraryDay, ItineraryItem } from "@/lib/types";
import ItineraryDayCard from "@/components/member/ItineraryDayCard";
import EmptyState from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

export default function MasterItineraryPage() {
  const { destinations, loading: destLoading } = useDestinations(TRIP_ID);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("all");
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load itinerary days (published or approved)
  useEffect(() => {
    const qDays = query(
      collection(db, "itineraryDays"),
      where("tripId", "==", TRIP_ID),
      orderBy("dayNumber", "asc")
    );
    const unsubDays = onSnapshot(
      qDays,
      (snap) => {
        const d = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ItineraryDay));
        // Members see published days, and also draft/approved in demo mode
        setDays(d);
      },
      () => {
        // Fallback for empty state or index building
        setDays([]);
      }
    );

    const qItems = query(collection(db, "itineraryItems"), where("tripId", "==", TRIP_ID));
    const unsubItems = onSnapshot(
      qItems,
      (snap) => {
        const it = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ItineraryItem));
        it.sort((a, b) => a.sortOrder - b.sortOrder);
        setItems(it);
        setLoading(false);
      },
      () => {
        setItems([]);
        setLoading(false);
      }
    );

    return () => {
      unsubDays();
      unsubItems();
    };
  }, []);

  // Filter days based on tab
  const filteredDays = useMemo(() => {
    if (selectedDestinationId === "all") return days;
    return days.filter((d) => d.destinationId === selectedDestinationId);
  }, [days, selectedDestinationId]);

  // Group items by dayId
  const itemsByDay = useMemo(() => {
    const map = new Map<string, ItineraryItem[]>();
    for (const item of items) {
      const list = map.get(item.dayId) || [];
      list.push(item);
      map.set(item.dayId, list);
    }
    return map;
  }, [items]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || destLoading) return <PageLoader />;

  return (
    <div className="section-container py-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Master Travel Timeline</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-royal-950">
            Trip Master Itinerary
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Day-by-day sightseeing, hotel stays, travel intervals, and verified schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ivory-300 text-stone-700 text-sm font-semibold hover:bg-ivory-100 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Itinerary</span>
          </button>
        </div>
      </div>

      {/* ── Verification Warning Notice ── */}
      <div className="bg-sandstone-50 border border-sandstone-200 rounded-2xl p-4 flex items-start gap-3 print:hidden">
        <AlertCircle className="w-5 h-5 text-sandstone-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <span className="font-semibold text-stone-900">Tentative Schedule Notice:</span> Times,
          visiting orders, and hotel allotments marked with a yellow tentative badge are preliminary
          estimates compiled by destination admins. Confirmed reservations will be pinned once
          finalized.
        </div>
      </div>

      {/* ── Destination Tabs Filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 print:hidden">
        <button
          onClick={() => setSelectedDestinationId("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedDestinationId === "all"
              ? "bg-royal-gradient text-white shadow-premium"
              : "bg-white border border-ivory-200 text-stone-600 hover:bg-ivory-50"
          }`}
        >
          All Destinations ({days.length} Days)
        </button>
        {destinations.map((dest) => {
          const count = days.filter((d) => d.destinationId === dest.id).length;
          return (
            <button
              key={dest.id}
              onClick={() => setSelectedDestinationId(dest.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedDestinationId === dest.id
                  ? "bg-royal-gradient text-white shadow-premium"
                  : "bg-white border border-ivory-200 text-stone-600 hover:bg-ivory-50"
              }`}
            >
              {dest.name} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Printable Header for Print Mode ── */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold font-display">Royal Routes – India Trip Planner</h1>
        <p className="text-xs text-stone-600">
          Rajasthan · Delhi · Agra Winter Trip (24 Dec 2026 onwards)
        </p>
      </div>

      {/* ── Days List ── */}
      {filteredDays.length > 0 ? (
        <div className="space-y-8">
          {filteredDays.map((day) => {
            const dayItems = itemsByDay.get(day.id) || [];
            return (
              <ItineraryDayCard
                key={day.id}
                day={day}
                items={dayItems}
                destinationName={
                  destinations.find((d) => d.id === day.destinationId)?.name ?? "General"
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-stone-400" />}
          title="No Published Days Yet"
          description="The itinerary for this destination is currently being finalized by our destination administrators. Please check back soon!"
        />
      )}
    </div>
  );
}
