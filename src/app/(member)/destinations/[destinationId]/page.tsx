"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ArrowLeft,
  Calendar,
  Hotel as HotelIcon,
  Train,
  Camera,
  Compass,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Destination, Hotel, TransportBooking, ItineraryItem } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

const DEST_STATIC_INFO: Record<
  string,
  {
    heroTitle: string;
    tagline: string;
    description: string;
    tips: string[];
    mustVisit: string[];
  }
> = {
  rajasthan: {
    heroTitle: "Rajasthan – Land of Kings",
    tagline: "Amber Forts, Palaces, Vibrant Bazaars & Royal Hospitality",
    description:
      "Rajasthan offers a spectacle of royal India. From the blushing pink terracotta walls of Jaipur to the majestic hilltop ramparts of Amber Fort and the vibrant textile markets of Johari Bazaar, this leg of the tour encapsulates magnificent Rajput artistry, rich musical traditions, and authentic Rajasthani cuisine.",
    tips: [
      "Carry woolens or shawls for chilly December evenings.",
      "Wear comfortable slip-on footwear as shoes must be removed when entering temple sanctums within forts.",
      "Bargaining is expected in traditional craft bazaars; check certified handicraft emporiums for fixed-rate textiles.",
      "Stay hydrated and sample authentic Dal Baati Churma and Ghewar sweets.",
    ],
    mustVisit: ["Amber Palace & Fort", "City Palace Jaipur", "Hawa Mahal", "Jantar Mantar", "Local Bazaars"],
  },
  delhi: {
    heroTitle: "Delhi – The Imperial Capital",
    tagline: "Centuries of Mughal Grandeur, Lutyens' Architecture & Dynamic Soul",
    description:
      "Delhi is a living chronicle of empires. Old Delhi invites you into crowded lanes scented with cardamom, the towering Red Fort, and Jama Masjid. New Delhi unfolds broad tree-lined boulevards, India Gate, and Qutub Minar, showcasing a striking harmony between ancient heritage and modern nationhood.",
    tips: [
      "Delhi winter mornings can have heavy fog; allow extra travel buffer for morning transfers.",
      "The Delhi Metro is the quickest way to bypass city traffic between Central and South Delhi.",
      "Keep digital or physical copies of government photo IDs at all times for entry to high-security monuments.",
      "Chandni Chowk is best explored by pedal rickshaw or leisurely walking.",
    ],
    mustVisit: ["Red Fort (Lal Qila)", "Qutub Minar Complex", "India Gate & Kartavya Path", "Humayun's Tomb", "Chandni Chowk"],
  },
  agra: {
    heroTitle: "Agra – City of Eternal Love",
    tagline: "Home of the Taj Mahal and Zenith of Mughal Architecture",
    description:
      "Nestled along the banks of the Yamuna River, Agra is synonymous with the Taj Mahal — an unmissable UNESCO World Heritage Site crafted in white Makrana marble. Beyond the Taj, Agra Fort and the nearby deserted imperial city of Fatehpur Sikri offer profound glimpses into the height of the Mughal court.",
    tips: [
      "Taj Mahal is CLOSED on Fridays. Itinerary scheduling accounts for this requirement.",
      "Sunrise is the most serene time to visit the Taj Mahal with minimal crowds and soft golden light.",
      "Only small pouches/bags, cameras, and water bottles are permitted inside the monument security gates.",
      "Try local Agra Petha and visit artisan workshops demonstrating marble inlay (Pietra Dura) craftsmanship.",
    ],
    mustVisit: ["Taj Mahal at Sunrise", "Agra Fort (Red Sandstone Citadel)", "Mehtab Bagh Sunset View", "Fatehpur Sikri"],
  },
};

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.destinationId as string) || "rajasthan";
  const normalizedKey = rawId.toLowerCase().includes("delhi")
    ? "delhi"
    : rawId.toLowerCase().includes("agra")
    ? "agra"
    : "rajasthan";

  const staticMeta = DEST_STATIC_INFO[normalizedKey] || DEST_STATIC_INFO.rajasthan;

  const [destination, setDestination] = useState<Destination | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transports, setTransports] = useState<TransportBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch matching destination doc from Firestore
    const qDest = query(collection(db, "destinations"), where("tripId", "==", TRIP_ID));
    const unsubDest = onSnapshot(qDest, (snap) => {
      const allDests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
      const match =
        allDests.find(
          (d) =>
            d.id === rawId ||
            d.name.toLowerCase().includes(normalizedKey)
        ) || null;
      setDestination(match);
    });

    // 2. Fetch hotels for this destination
    const qHotels = query(collection(db, "hotels"), where("tripId", "==", TRIP_ID));
    const unsubHotels = onSnapshot(qHotels, (snap) => {
      const allHotels = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hotel));
      const destHotels = allHotels.filter(
        (h) =>
          h.destinationId === destination?.id ||
          h.destinationId.toLowerCase().includes(normalizedKey) ||
          h.address?.toLowerCase().includes(normalizedKey)
      );
      setHotels(destHotels);
    });

    // 3. Fetch transport bookings
    const qTrans = query(collection(db, "transportBookings"), where("tripId", "==", TRIP_ID));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      const allTrans = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransportBooking));
      const filtered = allTrans.filter(
        (t) =>
          t.destinationId === destination?.id ||
          t.arrivalLocation.toLowerCase().includes(normalizedKey) ||
          t.departureLocation.toLowerCase().includes(normalizedKey)
      );
      setTransports(filtered);
      setLoading(false);
    });

    return () => {
      unsubDest();
      unsubHotels();
      unsubTrans();
    };
  }, [rawId, normalizedKey, destination?.id]);

  if (loading) return <PageLoader />;

  return (
    <div className="section-container py-8 space-y-8">
      {/* ── Breadcrumb / Back button ── */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* ── Hero Banner ── */}
      <section className="bg-royal-gradient text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-premium-lg">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Compass className="w-3.5 h-3.5 text-gold-400" />
            Destination Guide
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {staticMeta.heroTitle}
          </h1>
          <p className="text-white/80 text-sm sm:text-base italic leading-relaxed">
            {staticMeta.tagline}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>
                Schedule:{" "}
                {destination?.arrivalDate ? formatDate(destination.arrivalDate) : "Dates To Be Confirmed"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Status: {destination?.status.replace("_", " ") || "In Planning"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Overview & Must-Visit Highlights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-royal-950">About This Destination</h2>
            <p className="text-stone-600 text-sm leading-relaxed">{staticMeta.description}</p>
          </div>

          {/* Must-Visit Attractions */}
          <div className="card-premium p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-royal-950 flex items-center gap-2">
              <Camera className="w-5 h-5 text-royal-700" />
              Key Sightseeing Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {staticMeta.mustVisit.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-ivory-100 border border-ivory-200"
                >
                  <span className="w-6 h-6 rounded-full bg-royal-100 text-royal-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-stone-800">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation / Hotels */}
          <div className="card-premium p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-royal-950 flex items-center gap-2">
              <HotelIcon className="w-5 h-5 text-royal-700" />
              Accommodations &amp; Stays
            </h2>
            {hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-4 rounded-xl border border-ivory-200 bg-white space-y-2 hover:border-royal-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-stone-900 text-base">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-stone-500">{hotel.address || "Address pending verification"}</p>
                      </div>
                      <StatusBadge status={hotel.bookingStatus} type="booking" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-stone-600 pt-2 border-t border-ivory-100">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Check In</span>
                        <span className="font-medium">
                          {hotel.checkIn ? formatDate(hotel.checkIn) : "To be confirmed"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Check Out</span>
                        <span className="font-medium">
                          {hotel.checkOut ? formatDate(hotel.checkOut) : "To be confirmed"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Price Est.</span>
                        <span className="font-medium">
                          {hotel.estimatedPrice ? formatCurrency(hotel.estimatedPrice) : "TBC"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Hotel options are currently being evaluated and curated by the destination admin.
              </p>
            )}
          </div>
        </div>

        {/* ── Practical Travel Tips Sidebar ── */}
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-4 bg-white border-l-4 border-l-gold-500">
            <h3 className="font-display text-lg font-bold text-royal-950 flex items-center gap-2">
              <Info className="w-5 h-5 text-gold-600" />
              Essential Travel Tips
            </h3>
            <ul className="space-y-3">
              {staticMeta.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
                  <span className="text-gold-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="card-premium p-6 space-y-3">
            <h3 className="font-display text-sm font-bold text-stone-900">Explore Further</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/itinerary"
                className="px-4 py-2.5 rounded-xl bg-royal-gradient text-white text-xs font-semibold text-center hover:opacity-90 transition-opacity"
              >
                View Full Timeline
              </Link>
              <Link
                href="/travel-info"
                className="px-4 py-2.5 rounded-xl border border-ivory-300 text-stone-700 text-xs font-semibold text-center hover:bg-ivory-50 transition-colors"
              >
                Check Train &amp; Transfer Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
