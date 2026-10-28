"use client";

import { cn, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/lib/utils";

type StatusType = "assignment" | "booking" | "destination" | "trip";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  size?: "sm" | "md";
  className?: string;
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  not_required: "bg-stone-100 text-stone-600 border-stone-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  tbc: "bg-blue-50 text-blue-700 border-blue-200",
};

const DESTINATION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-stone-100 text-stone-600 border-stone-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-royal-50 text-royal-700 border-royal-200",
};

const DESTINATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  submitted: "Submitted",
  approved: "Approved",
  published: "Published",
};

const TRIP_STATUS_COLORS: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  planning: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-royal-50 text-royal-700 border-royal-200",
  archived: "bg-stone-100 text-stone-500 border-stone-200",
};

const TRIP_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export default function StatusBadge({ status, type = "assignment", size = "sm", className }: StatusBadgeProps) {
  let colorClass = "";
  let label = status;

  switch (type) {
    case "assignment":
      colorClass = ASSIGNMENT_STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600 border-stone-200";
      label = ASSIGNMENT_STATUS_LABELS[status] ?? status;
      break;
    case "booking":
      colorClass = BOOKING_STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600 border-stone-200";
      label = BOOKING_STATUS_LABELS[status] ?? status;
      break;
    case "destination":
      colorClass = DESTINATION_STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600 border-stone-200";
      label = DESTINATION_STATUS_LABELS[status] ?? status;
      break;
    case "trip":
      colorClass = TRIP_STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600 border-stone-200";
      label = TRIP_STATUS_LABELS[status] ?? status;
      break;
  }

  return (
    <span
      className={cn(
        "badge",
        colorClass,
        size === "sm" ? "text-xs" : "text-sm px-3 py-1",
        className
      )}
    >
      {label}
    </span>
  );
}

