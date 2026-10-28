import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export type FirestoreDateLike =
  | Timestamp
  | Date
  | string
  | number
  | { seconds: number; nanoseconds?: number; toDate?: () => Date }
  | null
  | undefined;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse any date representation into a native JS Date object.
 */
function parseDate(date: FirestoreDateLike): Date | null {
  if (!date) return null;
  try {
    let d: Date;
    if (typeof (date as Timestamp)?.toDate === "function") {
      d = (date as Timestamp).toDate();
    } else if (typeof (date as { seconds: number })?.seconds === "number") {
      d = new Date((date as { seconds: number }).seconds * 1000);
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date as string | number);
    }
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatDate(date: FirestoreDateLike, fmt = "dd MMM yyyy"): string {
  const d = parseDate(date);
  if (!d) return "To be confirmed";
  return format(d, fmt);
}

export function formatDateTime(date: FirestoreDateLike): string {
  const d = parseDate(date);
  if (!d) return "To be confirmed";
  return format(d, "dd MMM yyyy, hh:mm a");
}

export function fromNow(date: FirestoreDateLike): string {
  const d = parseDate(date);
  if (!d) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysUntil(date: FirestoreDateLike): number {
  const d = parseDate(date);
  if (!d) return 0;
  return differenceInDays(d, new Date());
}

export function formatDateInput(date: FirestoreDateLike): string {
  const d = parseDate(date);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
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
