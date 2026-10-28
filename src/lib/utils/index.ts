import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Timestamp | Date | null | undefined, fmt = "dd MMM yyyy"): string {
  if (!date) return "To be confirmed";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, fmt);
}

export function formatDateTime(date: Timestamp | Date | null | undefined): string {
  if (!date) return "To be confirmed";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, "dd MMM yyyy, hh:mm a");
}

export function fromNow(date: Timestamp | Date | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysUntil(date: Timestamp | Date | null | undefined): number {
  if (!date) return 0;
  const d = date instanceof Timestamp ? date.toDate() : date;
  return differenceInDays(d, new Date());
}

export function formatCurrency(amount: number | undefined, currency = "INR"): string {
  if (amount === undefined || amount === null) return "TBC";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function toFirestoreTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  submitted: "Submitted for Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  published: "Published",
  overdue: "Overdue",
};

export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-stone-100 text-stone-700 border-stone-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  changes_requested: "bg-orange-50 text-orange-700 border-orange-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-royal-50 text-royal-700 border-royal-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  not_required: "Not Required",
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  tbc: "To be confirmed",
};

