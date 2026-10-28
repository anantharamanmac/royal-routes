// src/components/member/ItineraryDayCard.tsx
"use client";

import { useState } from "react";
import {
  Eye,
  Camera,
  Hotel,
  Train,
  Utensils,
  ShoppingBag,
  Bed,
  Zap,
  ArrowRight,
  Clock,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import type { ItineraryDay, ItineraryItem, ItineraryItemType, BookingStatus } from "@/lib/types";

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ITEM_ICONS: Record<ItineraryItemType, React.ElementType> = {
  sightseeing: Camera,
  hotel: Hotel,
  transport: Train,
  food: Utensils,
  shopping: ShoppingBag,
  rest: Bed,
  activity: Zap,
  departure: ArrowRight,
  arrival: ArrowRight,
};

const ITEM_COLORS: Record<ItineraryItemType, string> = {
  sightseeing: "bg-royal-50 text-royal-600 border-royal-200",
  hotel: "bg-purple-50 text-purple-600 border-purple-200",
  transport: "bg-blue-50 text-blue-600 border-blue-200",
  food: "bg-orange-50 text-orange-600 border-orange-200",
  shopping: "bg-pink-50 text-pink-600 border-pink-200",
  rest: "bg-slate-50 text-slate-500 border-slate-200",
  activity: "bg-emerald-50 text-emerald-600 border-emerald-200",
  departure: "bg-terracotta-50 text-terracotta-600 border-terracotta-200",
  arrival: "bg-gold-50 text-gold-700 border-gold-200",
};

const BOOKING_BADGE: Record<BookingStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
  tbc: { label: "TBC", cls: "bg-stone-50 text-stone-500 border-stone-200" },
  not_required: { label: "No Booking Needed", cls: "bg-slate-50 text-slate-500 border-slate-200" },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ItineraryDayCardProps {
  day: ItineraryDay;
  items: ItineraryItem[];
  destinationName?: string;
  destinationColor?: string;
}

// ─── Single Item Row ──────────────────────────────────────────────────────────
function ItemRow({ item }: { item: ItineraryItem }) {
  const Icon = ITEM_ICONS[item.type] ?? Eye;
  const colorCls = ITEM_COLORS[item.type] ?? "bg-stone-50 text-stone-600 border-stone-200";
  const booking = BOOKING_BADGE[item.bookingStatus];

  return (
    <div
      className={cn(
        "relative flex gap-3 p-3 sm:p-4 rounded-xl border transition-all",
        item.isOptional && "border-dashed border-stone-300 bg-stone-50/50",
        item.isTentative && !item.isOptional && "border-gold-300 bg-gold-50/40",
        !item.isOptional && !item.isTentative && "border-ivory-200 bg-white"
      )}
    >
      {/* Type icon */}
      <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center", colorCls)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <p className="font-body font-semibold text-stone-800 text-sm leading-tight">
            {item.title}
          </p>
          {item.isTentative && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded">
              Tentative
            </span>
          )}
          {item.isOptional && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
              Optional
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{item.description}</p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {item.startTime && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Clock className="w-3 h-3" />
              {item.startTime}
              {item.endTime && ` – ${item.endTime}`}
            </span>
          )}
          {item.durationMinutes !== undefined && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Clock className="w-3 h-3 text-transparent" />
              {formatDuration(item.durationMinutes)}
            </span>
          )}
          {item.location?.name && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <MapPin className="w-3 h-3" />
              {item.location.mapUrl ? (
                <a
                  href={item.location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-royal-600 flex items-center gap-0.5"
                >
                  {item.location.name}
                  <ExternalLink className="w-2.5 h-2.5 inline" />
                </a>
              ) : (
                item.location.name
              )}
            </span>
          )}
          {item.estimatedCost !== undefined && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(item.estimatedCost, item.currency ?? "INR")}
            </span>
          )}
        </div>

        {/* Booking badge */}
        <div className="mt-2">
          <span className={cn("inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border", booking.cls)}>
            {booking.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Travel Connector ─────────────────────────────────────────────────────────
function TravelConnector({ minutes }: { minutes: number }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 my-1">
      <div className="flex-1 border-t border-dashed border-royal-200" />
      <span className="flex items-center gap-1 text-[11px] text-royal-500 font-medium bg-royal-50 px-2 py-0.5 rounded-full border border-royal-100 whitespace-nowrap">
        <Train className="w-3 h-3" />
        {formatDuration(minutes)} travel
      </span>
      <div className="flex-1 border-t border-dashed border-royal-200" />
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────
const PREVIEW_COUNT = 3;

export default function ItineraryDayCard({
  day,
  items,
  destinationName,
  destinationColor = "bg-royal-100 text-royal-700 border-royal-200",
}: ItineraryDayCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Warnings
  const hasAccommodation = items.some((i) => i.type === "hotel");
  const missingTime = items.some((i) => !i.startTime && i.type !== "rest");

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const visible = expanded ? sorted : sorted.slice(0, PREVIEW_COUNT);
  const hasMore = sorted.length > PREVIEW_COUNT;

  const dateLabel = day.date
    ? new Date(day.date.toDate()).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "Date TBC";

  return (
    <div className="card-premium overflow-hidden">
      {/* Day Header */}
      <div className="bg-royal-gradient px-5 py-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-white text-lg">Day {day.dayNumber}</span>
            {destinationName && (
              <span className={cn("text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border", destinationColor)}>
                {destinationName}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-white/70 font-body">{dateLabel}</p>
          {day.title && (
            <p className="mt-1 text-sm font-semibold text-gold-200 font-body">{day.title}</p>
          )}
        </div>
        <span className="flex-shrink-0 text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full border border-white/20">
          {sorted.length} {sorted.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Warnings */}
      {(!hasAccommodation || missingTime) && (
        <div className="px-5 pt-3 flex flex-col gap-1.5">
          {!hasAccommodation && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Accommodation not added for this day yet.
            </div>
          )}
          {missingTime && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Some items are missing scheduled times.
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {day.summary && (
        <p className="px-5 pt-3 text-xs text-stone-500 italic">{day.summary}</p>
      )}

      {/* Items */}
      <div className="px-5 py-4 flex flex-col gap-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-6">No items planned for this day yet.</p>
        ) : (
          <>
            {visible.map((item, idx) => (
              <div key={item.id}>
                <ItemRow item={item} />
                {item.travelTimeToNextMinutes !== undefined &&
                  idx < visible.length - 1 && (
                    <TravelConnector minutes={item.travelTimeToNextMinutes} />
                  )}
              </div>
            ))}
            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-royal-600 hover:text-royal-700 py-2 rounded-xl border border-royal-100 bg-royal-50/60 hover:bg-royal-100 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Show {sorted.length - PREVIEW_COUNT} more items
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
