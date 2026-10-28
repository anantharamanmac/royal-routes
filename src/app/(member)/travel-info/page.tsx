"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Train,
  Hotel,
  ShieldAlert,
  PhoneCall,
  Luggage,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TransportBooking, Hotel as HotelType } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

export default function TravelInfoPage() {
  const [transports, setTransports] = useState<TransportBooking[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qT = query(collection(db, "transportBookings"), where("tripId", "==", TRIP_ID));
    const unsubT = onSnapshot(qT, (snap) => {
      setTransports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransportBooking)));
    });

    const qH = query(collection(db, "hotels"), where("tripId", "==", TRIP_ID));
    const unsubH = onSnapshot(qH, (snap) => {
      setHotels(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HotelType)));
      setLoading(false);
    });

    return () => {
      unsubT();
      unsubH();
    };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="section-container py-8 space-y-8">
      {/* ── Header ── */}
      <div className="border-b border-ivory-200 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200 mb-2">
          <Luggage className="w-3.5 h-3.5" />
          <span>Travel Logistics &amp; Guidelines</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-royal-950">
          Travel Information &amp; Bookings
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Official train connections, accommodation allocations, emergency contacts, and packing guidelines.
        </p>
      </div>

      {/* ── Strict Integrity Notice ── */}
      <div className="bg-sandstone-100 border border-sandstone-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900 font-semibold">Verification Protocol:</strong> In
          accordance with official trip guidelines, all reservation references, PNR codes, departure
          schedules, and hotel check-in slots remain marked as{" "}
          <span className="font-semibold text-royal-800">To be confirmed (TBC)</span> until an
          authorized admin inputs and validates the genuine booking receipts.
        </div>
      </div>

      {/* ── Train & Departure Details ── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
          <Train className="w-5 h-5 text-royal-700" />
          Train Journey &amp; Transfers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Outbound Train Card */}
          <div className="card-premium p-6 space-y-4 border-t-4 border-t-royal-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200">
                Primary Departure
              </span>
              <StatusBadge status="tbc" type="booking" />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-stone-900">
                Rajdhani Express
              </h3>
              <p className="text-xs text-stone-500">Kollam Junction (QLN) → North India</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-ivory-100">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Departure Station</span>
                <span className="font-semibold text-stone-800">Kollam Junction, Kerala</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Planned Date</span>
                <span className="font-semibold text-stone-800">24 Dec 2026 (Night)</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Train Service No.</span>
                <span className="font-semibold text-stone-600">To be confirmed</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">PNR Reference</span>
                <span className="font-semibold text-stone-600">To be confirmed</span>
              </div>
            </div>
          </div>

          {/* Return & Additional Transfers */}
          <div className="card-premium p-6 space-y-4 border-t-4 border-t-sandstone-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sandstone-700 bg-sandstone-50 px-2.5 py-0.5 rounded-full border border-sandstone-200">
                Return Journey
              </span>
              <StatusBadge status="tbc" type="booking" />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-stone-900">Return Train Service</h3>
              <p className="text-xs text-stone-500">North India → Kollam Junction, Kerala</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-ivory-100">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Departure Station</span>
                <span className="font-semibold text-stone-600">To be confirmed</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Return Date</span>
                <span className="font-semibold text-stone-600">To be confirmed (2027)</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Booking Status</span>
                <span className="font-semibold text-stone-600">Awaiting Schedule Freeze</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Ticket Allocation</span>
                <span className="font-semibold text-stone-600">Group Reservation Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Transport items from Firestore */}
        {transports.length > 0 && (
          <div className="card-premium divide-y divide-ivory-100 overflow-hidden mt-4">
            <div className="p-4 bg-ivory-50 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Local Inter-City &amp; Station Transfers
            </div>
            {transports.map((t) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{t.title}</p>
                  <p className="text-stone-500">
                    {t.departureLocation} → {t.arrivalLocation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-600">
                    {t.scheduledDeparture ? formatDateTime(t.scheduledDeparture) : "Time TBC"}
                  </span>
                  <StatusBadge status={t.bookingStatus} type="booking" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Hotel Check-in / Check-out Schedule ── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-royal-700" />
          Hotel Accommodations Summary
        </h2>

        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-ivory-100 text-stone-500 uppercase tracking-wider border-b border-ivory-200">
                <tr>
                  <th className="p-4 font-semibold">Destination / Hotel</th>
                  <th className="p-4 font-semibold">Check In</th>
                  <th className="p-4 font-semibold">Check Out</th>
                  <th className="p-4 font-semibold">Rooms</th>
                  <th className="p-4 font-semibold">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {hotels.length > 0 ? (
                  hotels.map((h) => (
                    <tr key={h.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="p-4 font-medium text-stone-900">
                        <div>{h.name}</div>
                        <div className="text-[11px] text-stone-400">{h.address || "TBC"}</div>
                      </td>
                      <td className="p-4">
                        {h.checkIn ? formatDate(h.checkIn) : "To be confirmed"}
                      </td>
                      <td className="p-4">
                        {h.checkOut ? formatDate(h.checkOut) : "To be confirmed"}
                      </td>
                      <td className="p-4">{h.numberOfRooms ? `${h.numberOfRooms} Rooms` : "TBC"}</td>
                      <td className="p-4">
                        <StatusBadge status={h.bookingStatus} type="booking" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400 italic">
                      Hotels will be populated here as each Destination Admin submits confirmed properties.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Packing Checklist & Emergency Contacts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Packing Checklist */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-royal-950 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-gold-600" />
            Winter Travel Packing Checklist
          </h3>
          <ul className="space-y-2.5 text-xs text-stone-600">
            {[
              "Heavy jacket / windcheater and thermal innerwear for mornings & evenings",
              "Comfortable walking shoes suitable for fort ramps and heritage courtyards",
              "Original Government Photo ID (Aadhaar / Voter ID / Passport) required at all monuments",
              "Personal medical kit (motion sickness tablets, antacids, band-aids, prescribed medicines)",
              "Power bank (20000mAh) and universal adapters for overnight train travel",
              "Moisturizer, lip balm, and sunglasses for dry winter sunshine",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency Contacts */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-royal-950 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-royal-700" />
            Emergency &amp; Helpline Directory
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-ivory-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900">National Emergency Number</p>
                <p className="text-[11px] text-stone-500">Police, Ambulance, Fire</p>
              </div>
              <span className="font-mono font-bold text-sm text-royal-800">112</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900">Railway Security Helpline</p>
                <p className="text-[11px] text-stone-500">RPF Assistance 24/7</p>
              </div>
              <span className="font-mono font-bold text-sm text-royal-800">139</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900">Tourist Infoline (Govt. of India)</p>
                <p className="text-[11px] text-stone-500">Toll Free Multi-language</p>
              </div>
              <span className="font-mono font-bold text-sm text-royal-800">1363</span>
            </div>
            <p className="text-[11px] text-stone-400 italic pt-1">
              Admin contact details and local tour coordinator phone numbers will be distributed
              privately before departure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

