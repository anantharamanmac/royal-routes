"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Train,
  ArrowRight,
  Sparkles,
  Megaphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Compass,
} from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import CountdownTimer from "@/components/member/CountdownTimer";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { useItineraryDays } from "@/lib/hooks/useItineraryDays";
import { Announcement, ItineraryDay } from "@/lib/types";
import { formatDate, fromNow } from "@/lib/utils";

const TRIP_ID = "demo-trip-2026";

export default function MemberDashboardPage() {
  const { appUser } = useAuth();
  const { destinations, loading: destLoading } = useDestinations(TRIP_ID);
  const { days: publishedDays, loading: daysLoading } = useItineraryDays(TRIP_ID, undefined, true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      where("tripId", "==", TRIP_ID),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
      },
      () => {
        // Fallback or empty if index not yet provisioned
        setAnnouncements([
          {
            id: "sample-1",
            tripId: TRIP_ID,
            title: "Welcome to Royal Routes Winter 2026!",
            body: "Destination admins are preparing day-wise schedules for Rajasthan, Delhi, and Agra. Check back for approved itineraries.",
            isImportant: true,
            authorId: "system",
            createdAt: null as never,
            updatedAt: null as never,
          },
        ]);
      }
    );
    return unsub;
  }, []);

  return (
    <div className="section-container py-8 space-y-8">
      {/* ── Welcome & Countdown Banner ── */}
      <section className="bg-royal-gradient rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-premium-lg">
        {/* Subtle patterned background decoration */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Royal Routes · Official Trip Dashboard
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Namaste, {appUser?.displayName?.split(" ")[0] || "Explorer"}!
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Counting down to our winter group expedition through royal palaces, Mughal grandeur,
              and historical monuments.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Kollam Junction, Kerala</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>Departing 24 Dec 2026 (Night)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Train className="w-4 h-4 text-gold-400" />
                <span>Rajdhani Express (TBC)</span>
              </div>
            </div>
          </div>

          {/* Countdown widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-inner flex flex-col items-center">
            <p className="text-gold-300 text-xs uppercase tracking-widest font-semibold mb-3">
              Journey Commences In
            </p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* ── Key Highlights & Notice Banner ── */}
      <div className="bg-sandstone-100 border border-sandstone-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900 font-semibold">Important Trip Notice:</strong> All train
          departure timings, ticket numbers, and hotel room allotments are currently{" "}
          <span className="font-semibold text-royal-800">To Be Confirmed (TBC)</span> until officially
          verified and booked by the Master Admin. Please do not make independent reservations based
          on tentative plans.
        </div>
      </div>

      {/* ── Destinations Overview Grid ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-royal-950">Destinations on Track</h2>
            <p className="text-stone-500 text-sm">
              Discover each segment of the royal circuit and its planned highlights.
            </p>
          </div>
          <Link
            href="/itinerary"
            className="hidden sm:inline-flex items-center gap-1.5 text-royal-700 hover:text-royal-900 font-semibold text-sm transition-colors"
          >
            <span>View Full Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-premium p-6 space-y-3">
                <div className="skeleton h-6 w-1/2" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))
          ) : destinations.length > 0 ? (
            destinations.map((dest, idx) => {
              const slug = dest.name.toLowerCase().includes("rajasthan")
                ? "rajasthan"
                : dest.name.toLowerCase().includes("delhi")
                ? "delhi"
                : "agra";
              return (
                <div
                  key={dest.id}
                  className="card-premium p-6 flex flex-col justify-between hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200">
                        Stop {idx + 1}
                      </span>
                      <span className="text-xs text-stone-500 font-medium capitalize">
                        {dest.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-royal-900 group-hover:text-royal-700 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
                      {dest.description ||
                        "Explore the monumental heritage, vibrant bazaars, and scenic cultural marvels of this historic destination."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-ivory-200 mt-6 flex items-center justify-between">
                    <div className="text-xs text-stone-500">
                      <span>Schedule: </span>
                      <span className="font-medium text-stone-700">
                        {dest.arrivalDate ? formatDate(dest.arrivalDate) : "Dates TBC"}
                      </span>
                    </div>
                    <Link
                      href={`/destinations/${slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-royal-700 hover:text-royal-900 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 card-premium p-8 text-center text-stone-500">
              No destinations loaded yet. Please check back shortly.
            </div>
          )}
        </div>
      </section>

      {/* ── Itinerary Status & Announcements Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Published Itinerary Highlights */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-royal-700" />
              Published Itinerary Days
            </h2>
            <Link
              href="/itinerary"
              className="text-xs font-semibold text-royal-700 hover:underline"
            >
              See all days ({publishedDays.length})
            </Link>
          </div>

          <div className="card-premium divide-y divide-ivory-100 overflow-hidden">
            {daysLoading ? (
              <div className="p-6 space-y-3">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-full" />
              </div>
            ) : publishedDays.length > 0 ? (
              publishedDays.slice(0, 4).map((day) => (
                <div key={day.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-royal-50 text-royal-800 border-royal-200">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {day.date ? formatDate(day.date) : "Date TBC"}
                      </span>
                    </div>
                    <p className="font-display font-semibold text-stone-900 text-base">
                      {day.title}
                    </p>
                    {day.summary && (
                      <p className="text-xs text-stone-500 line-clamp-1">{day.summary}</p>
                    )}
                  </div>
                  <Link
                    href={`/itinerary?day=${day.id}`}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-ivory-300 text-xs font-medium text-stone-700 hover:bg-ivory-100 transition-colors"
                  >
                    View Day
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="font-display font-semibold text-stone-800">Itineraries in Progress</p>
                <p className="text-stone-500 text-xs max-w-sm mx-auto">
                  Our destination admins are crafting the detailed day-by-day schedules. As soon as the
                  Master Admin approves them, they will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Announcements & Reminders */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gold-600" />
            Trip Announcements
          </h2>

          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="card-premium p-4 space-y-2 border-l-4 border-l-gold-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-royal-900">{item.title}</span>
                  {item.isImportant && (
                    <span className="text-[10px] uppercase font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                      Notice
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.body}</p>
              </div>
            ))}

            {/* Quick Action Card */}
            <div className="bg-ivory-100 rounded-2xl p-5 border border-ivory-200 space-y-3">
              <h3 className="font-display font-bold text-sm text-stone-900">
                Preparing for December Travel
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                North India in late December brings cold mornings and evenings (8°C – 14°C). Pack
                thermal wear, light jackets, comfortable walking shoes, and valid photo ID cards.
              </p>
              <Link
                href="/travel-info"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 hover:text-royal-900"
              >
                <span>Read Full Travel Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
