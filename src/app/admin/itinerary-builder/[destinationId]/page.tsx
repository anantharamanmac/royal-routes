"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Icons
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Pencil,
  Plus,
  GripVertical,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  Coffee,
  Zap,
  PlaneTakeoff,
  PlaneLanding,
  Send,
  Save,
  Info,
  ExternalLink,
} from "lucide-react";

// Auth
import { useAuth } from "@/contexts/AuthContext";

// Types
import type { ItineraryDay, ItineraryItem, Assignment, Destination } from "@/lib/types";

// Firebase services
import {
  listenToItineraryDays,
  addItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  listenToItineraryItems,
} from "@/lib/firebase/itinerary";
import { getAssignment, updateAssignment, submitAssignment } from "@/lib/firebase/assignments";
import { getDestinations } from "@/lib/firebase/destinations";
import { createNotification } from "@/lib/firebase/notifications";
import { logActivity } from "@/lib/firebase/activityLogs";
import { createApprovalRequest } from "@/lib/firebase/approvals";

// Utils
import {
  cn,
  formatDate,
  formatDuration,
  formatCurrency,
  BOOKING_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const TRIP_ID = "demo-trip-2026";

const ITEM_TYPE_ICONS: Record<ItineraryItem["type"], React.ComponentType<{ className?: string }>> = {
  sightseeing: Eye,
  hotel: Building2,
  transport: Car,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  rest: Coffee,
  activity: Zap,
  departure: PlaneTakeoff,
  arrival: PlaneLanding,
};

const ITEM_TYPE_LABELS: Record<ItineraryItem["type"], string> = {
  sightseeing: "Sightseeing",
  hotel: "Hotel",
  transport: "Transport",
  food: "Food & Dining",
  shopping: "Shopping",
  rest: "Rest",
  activity: "Activity",
  departure: "Departure",
  arrival: "Arrival",
};

const ITEM_TYPE_COLORS: Record<ItineraryItem["type"], string> = {
  sightseeing: "text-blue-600 bg-blue-50",
  hotel: "text-purple-600 bg-purple-50",
  transport: "text-slate-600 bg-slate-50",
  food: "text-orange-600 bg-orange-50",
  shopping: "text-pink-600 bg-pink-50",
  rest: "text-teal-600 bg-teal-50",
  activity: "text-yellow-600 bg-yellow-50",
  departure: "text-red-600 bg-red-50",
  arrival: "text-green-600 bg-green-50",
};

const BOOKING_STATUS_COLORS: Record<ItineraryItem["bookingStatus"], string> = {
  not_required: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  tbc: "bg-orange-100 text-orange-700",
};

const DAY_STATUS_COLORS: Record<ItineraryDay["status"], string> = {
  draft: "bg-gray-400",
  submitted: "bg-yellow-500",
  approved: "bg-blue-500",
  published: "bg-green-500",
};

const CURRENCIES = ["INR", "USD", "EUR"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema for Item Form
// ─────────────────────────────────────────────────────────────────────────────
const itemSchema = z.object({
  type: z.enum([
    "sightseeing","hotel","transport","food","shopping","rest","activity","departure","arrival",
  ]),
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationMinutes: z.any().optional(),
  travelTimeToNextMinutes: z.any().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationMapUrl: z.string().optional(),
  estimatedCost: z.any().optional(),
  currency: z.string().optional(),
  bookingStatus: z.enum(["not_required","pending","confirmed","cancelled","tbc"]),
  isOptional: z.boolean().optional(),
  isTentative: z.boolean().optional(),
  openingHours: z.string().optional(),
  entryFee: z.any().optional(),
  notes: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation Dialog Component
// ─────────────────────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-ivory-100 p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold font-display text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50",
              confirmVariant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-royal-600 text-white hover:bg-royal-700"
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────────────────────────────────────
function DaySkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function ItemSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Item Row
// ─────────────────────────────────────────────────────────────────────────────
interface SortableItemRowProps {
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (item: ItineraryItem) => void;
  previewMode: boolean;
}

function SortableItemRow({ item, onEdit, onDelete, previewMode }: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const TypeIcon = ITEM_TYPE_ICONS[item.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border border-ivory-200 rounded-2xl p-4 flex items-center gap-3.5 group hover:border-royal-300 hover:shadow-card transition-all",
        isDragging && "shadow-premium-lg border-royal-400 bg-royal-50/50"
      )}
    >
      {/* Drag handle */}
      {!previewMode && (
        <button
          {...attributes}
          {...listeners}
          className="text-stone-300 hover:text-stone-600 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Type icon */}
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm", ITEM_TYPE_COLORS[item.type])}>
        <TypeIcon className="w-4 h-4" />
      </div>

      {/* Time */}
      {(item.startTime || item.endTime) && (
        <div className="text-xs text-gray-500 flex-shrink-0 w-24 font-mono">
          {item.startTime}
          {item.endTime && ` – ${item.endTime}`}
        </div>
      )}

      {/* Title & description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-royal-950 truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-stone-500 truncate mt-0.5">{item.description}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
        {item.durationMinutes != null && item.durationMinutes > 0 && (
          <span className="text-[11px] bg-ivory-100 text-stone-600 px-2.5 py-0.5 rounded-full border border-ivory-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            {formatDuration(item.durationMinutes)}
          </span>
        )}
        {item.estimatedCost != null && item.estimatedCost > 0 && (
          <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            {formatCurrency(item.estimatedCost, item.currency ?? "INR")}
          </span>
        )}
        {item.bookingStatus !== "not_required" && (
          <span className={cn("text-[11px] px-2.5 py-0.5 rounded-full border", BOOKING_STATUS_COLORS[item.bookingStatus])}>
            {BOOKING_STATUS_LABELS[item.bookingStatus]}
          </span>
        )}
        {item.isTentative && (
          <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">TBC</span>
        )}
        {item.isOptional && (
          <span className="text-[11px] bg-stone-100 text-stone-600 border border-dashed border-stone-300 px-2.5 py-0.5 rounded-full">Optional</span>
        )}
      </div>

      {/* Actions */}
      {!previewMode && (
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-royal-600 hover:bg-royal-50 transition-colors"
            aria-label="Edit item"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Form Panel
// ─────────────────────────────────────────────────────────────────────────────
interface ItemFormPanelProps {
  open: boolean;
  editingItem: ItineraryItem | null;
  dayId: string;
  tripId: string;
  destinationId: string;
  createdBy: string;
  onClose: () => void;
  onSaved: () => void;
}

function ItemFormPanel({
  open,
  editingItem,
  dayId,
  tripId,
  destinationId,
  createdBy,
  onClose,
  onSaved,
}: ItemFormPanelProps) {
  const [saving, setSaving] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);

  const defaultValues: ItemFormValues = useMemo(
    () => ({
      type: editingItem?.type ?? "sightseeing",
      title: editingItem?.title ?? "",
      description: editingItem?.description ?? "",
      startTime: editingItem?.startTime ?? "",
      endTime: editingItem?.endTime ?? "",
      durationMinutes: editingItem?.durationMinutes ?? "",
      travelTimeToNextMinutes: editingItem?.travelTimeToNextMinutes ?? "",
      locationName: editingItem?.location?.name ?? "",
      locationAddress: editingItem?.location?.address ?? "",
      locationMapUrl: editingItem?.location?.mapUrl ?? "",
      estimatedCost: editingItem?.estimatedCost ?? "",
      currency: editingItem?.currency ?? "INR",
      bookingStatus: editingItem?.bookingStatus ?? "not_required",
      isOptional: editingItem?.isOptional ?? false,
      isTentative: editingItem?.isTentative ?? false,
      openingHours: editingItem?.openingHours ?? "",
      entryFee: editingItem?.entryFee ?? "",
      notes: editingItem?.notes ?? "",
    }),
    [editingItem]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setLocationExpanded(!!editingItem?.location?.name);
    }
  }, [open, editingItem, reset, defaultValues]);

  const onSubmit = useCallback(
    async (values: ItemFormValues) => {
      setSaving(true);
      try {
        const payload = {
          dayId,
          tripId,
          destinationId,
          type: values.type,
          title: values.title,
          description: values.description || undefined,
          startTime: values.startTime || undefined,
          endTime: values.endTime || undefined,
          durationMinutes:
            values.durationMinutes !== "" && values.durationMinutes != null
              ? Number(values.durationMinutes)
              : undefined,
          travelTimeToNextMinutes:
            values.travelTimeToNextMinutes !== "" && values.travelTimeToNextMinutes != null
              ? Number(values.travelTimeToNextMinutes)
              : undefined,
          location:
            values.locationName
              ? {
                  name: values.locationName,
                  address: values.locationAddress || undefined,
                  mapUrl: values.locationMapUrl || undefined,
                }
              : undefined,
          estimatedCost:
            values.estimatedCost !== "" && values.estimatedCost != null
              ? Number(values.estimatedCost)
              : undefined,
          currency: values.currency,
          bookingStatus: values.bookingStatus,
          isOptional: Boolean(values.isOptional),
          isTentative: Boolean(values.isTentative),
          openingHours: values.openingHours || undefined,
          entryFee:
            values.entryFee !== "" && values.entryFee != null
              ? Number(values.entryFee)
              : undefined,
          notes: values.notes || undefined,
          createdBy,
        };

        if (editingItem) {
          await updateItineraryItem(editingItem.id, payload);
          toast.success("Item updated successfully");
        } else {
          await addItineraryItem({ ...payload, sortOrder: Date.now() });
          toast.success("Item added successfully");
        }
        onSaved();
        onClose();
      } catch (err) {
        toast.error("Failed to save item. Please try again.");
        console.error(err);
      } finally {
        setSaving(false);
      }
    },
    [dayId, tripId, destinationId, createdBy, editingItem, onSaved, onClose]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] z-40 bg-white shadow-2xl border-l border-gray-100 flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold font-display text-gray-900">
            {editingItem ? "Edit Activity" : "Add Activity"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                  >
                    {(Object.keys(ITEM_TYPE_LABELS) as ItineraryItem["type"][]).map((t) => (
                      <option key={t} value={t}>
                        {ITEM_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Visit Amber Fort"
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent",
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
              <textarea
                {...register("description")}
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Time</label>
                <input
                  {...register("startTime")}
                  type="time"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time</label>
                <input
                  {...register("endTime")}
                  type="time"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration & Travel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Duration (min)</label>
                <input
                  {...register("durationMinutes")}
                  type="number"
                  min="0"
                  placeholder="e.g. 120"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Travel to Next (min)</label>
                <input
                  {...register("travelTimeToNextMinutes")}
                  type="number"
                  min="0"
                  placeholder="e.g. 30"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setLocationExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Location Details
                </span>
                {locationExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {locationExpanded && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Location Name</label>
                    <input
                      {...register("locationName")}
                      type="text"
                      placeholder="e.g. Amber Fort"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                    <input
                      {...register("locationAddress")}
                      type="text"
                      placeholder="Full address..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Map URL</label>
                    <input
                      {...register("locationMapUrl")}
                      type="url"
                      placeholder="https://maps.google.com/..."
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent",
                        errors.locationMapUrl ? "border-red-300 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.locationMapUrl && (
                      <p className="mt-1 text-xs text-red-600">{errors.locationMapUrl.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Estimated Cost</label>
                <input
                  {...register("estimatedCost")}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Currency</label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Booking Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Booking Status</label>
              <Controller
                name="bookingStatus"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                  >
                    {(Object.keys(BOOKING_STATUS_LABELS) as ItineraryItem["bookingStatus"][]).map((s) => (
                      <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register("isOptional")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-royal-600 focus:ring-royal-400"
                />
                <span className="text-sm text-gray-700">Optional</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register("isTentative")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-700">Tentative (TBC)</span>
              </label>
            </div>

            {/* Opening Hours & Entry Fee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Opening Hours</label>
                <input
                  {...register("openingHours")}
                  type="text"
                  placeholder="e.g. 9am – 5pm"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Entry Fee</label>
                <input
                  {...register("entryFee")}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Additional notes or instructions..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Panel Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Warnings Panel
// ─────────────────────────────────────────────────────────────────────────────
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function detectOverlaps(items: ItineraryItem[]): boolean {
  const timed = items.filter((i) => i.startTime && i.endTime);
  for (let a = 0; a < timed.length; a++) {
    for (let b = a + 1; b < timed.length; b++) {
      const aStart = timeToMinutes(timed[a]!.startTime!);
      const aEnd = timeToMinutes(timed[a]!.endTime!);
      const bStart = timeToMinutes(timed[b]!.startTime!);
      const bEnd = timeToMinutes(timed[b]!.endTime!);
      if (aStart < bEnd && bStart < aEnd) return true;
    }
  }
  return false;
}

interface WarningsPanelProps {
  items: ItineraryItem[];
}

function WarningsPanel({ items }: WarningsPanelProps) {
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (items.length === 0) w.push("No items planned for this day.");
    else {
      if (!items.some((i) => i.type === "hotel")) w.push("No hotel check-in item added.");
      if (detectOverlaps(items)) w.push("Overlapping times detected between items.");
    }
    return w;
  }, [items]);

  if (warnings.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-800">{w}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview Mode – Day Card
// ─────────────────────────────────────────────────────────────────────────────
interface PreviewDayCardProps {
  day: ItineraryDay;
  items: ItineraryItem[];
}

function PreviewDayCard({ day, items }: PreviewDayCardProps) {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  );

  return (
    <div className="card-premium mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-royal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          Day {day.dayNumber}
        </span>
        <div>
          <h3 className="font-display font-semibold text-lg text-gray-900">{day.title}</h3>
          {day.date && (
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate((day.date as unknown as { toDate: () => Date }).toDate())}
            </p>
          )}
        </div>
      </div>
      {day.summary && <p className="text-sm text-gray-600 mb-4">{day.summary}</p>}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const TypeIcon = ITEM_TYPE_ICONS[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", ITEM_TYPE_COLORS[item.type])}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-gray-900">{item.title}</p>
                  {item.isTentative && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">TBC</span>
                  )}
                  {item.isOptional && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
                  )}
                </div>
                {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                {(item.startTime || item.durationMinutes) && (
                  <div className="flex items-center gap-3 mt-1">
                    {item.startTime && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.startTime}{item.endTime && ` – ${item.endTime}`}
                      </span>
                    )}
                    {item.durationMinutes && item.durationMinutes > 0 && (
                      <span className="text-xs text-gray-500">{formatDuration(item.durationMinutes)}</span>
                    )}
                  </div>
                )}
                {item.location?.name && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.location.name}</span>
                    {item.location.mapUrl && (
                      <a href={item.location.mapUrl} target="_blank" rel="noopener noreferrer" className="text-royal-500 hover:text-royal-700">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              {item.estimatedCost != null && item.estimatedCost > 0 && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-medium flex-shrink-0">
                  {formatCurrency(item.estimatedCost, item.currency ?? "INR")}
                </span>
              )}
            </div>
          );
        })}
        {sortedItems.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No items for this day.</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ItineraryBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const destinationId = params.destinationId as string;
  const { appUser } = useAuth();

  // ── Data State ──────────────────────────────────────────────────────────────
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [itemsByDay, setItemsByDay] = useState<Record<string, ItineraryItem[]>>({});

  // ── Loading State ───────────────────────────────────────────────────────────
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [loadingDays, setLoadingDays] = useState(true);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // ── Day Editing State ───────────────────────────────────────────────────────
  const [dayTitle, setDayTitle] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [dayStatus, setDayStatus] = useState<ItineraryDay["status"]>("draft");
  const [daySummary, setDaySummary] = useState("");

  // ── Item Form State ─────────────────────────────────────────────────────────
  const [itemPanelOpen, setItemPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  // ── Dialog State ────────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant: "danger" | "primary";
    loading: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    confirmVariant: "danger",
    loading: false,
    onConfirm: () => {},
  });

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSavedAtRef = useRef<number | null>(null);

  // ── DnD Sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Derived: selected day ───────────────────────────────────────────────────
  const selectedDay = useMemo(
    () => days.find((d) => d.id === selectedDayId) ?? null,
    [days, selectedDayId]
  );

  const selectedDayItems = useMemo(
    () =>
      selectedDayId
        ? [...(itemsByDay[selectedDayId] ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [itemsByDay, selectedDayId]
  );

  // ── Access check ────────────────────────────────────────────────────────────
  const isAuthorized = useMemo(() => {
    if (!appUser || !assignment) return false;
    return (
      appUser.uid === assignment.assignedAdminId ||
      appUser.role === "master_admin"
    );
  }, [appUser, assignment]);

  // ── Deadline check ──────────────────────────────────────────────────────────
  const isOverdue = useMemo(() => {
    if (!assignment?.deadline) return false;
    const deadlineDate =
      typeof (assignment.deadline as unknown as { toDate?: () => Date }).toDate === "function"
        ? (assignment.deadline as unknown as { toDate: () => Date }).toDate()
        : new Date(assignment.deadline as unknown as string);
    return deadlineDate < new Date();
  }, [assignment]);

  // ── Load assignment & destination ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!appUser) return;
      setLoadingAssignment(true);
      try {
        // Load assignments for this destination
        const { getAssignments } = await import("@/lib/firebase/assignments");
        const allAssignments = await getAssignments(TRIP_ID);
        const myAssignment = allAssignments.find(
          (a: Assignment) =>
            a.destinationId === destinationId &&
            (a.assignedAdminId === appUser.uid || appUser.role === "master_admin")
        );
        if (!cancelled && myAssignment) {
          setAssignment(myAssignment);
          setAssignmentId(myAssignment.id);
        }

        // Load destination
        const destinations = await getDestinations(TRIP_ID);
        const dest = destinations.find((d: Destination) => d.id === destinationId);
        if (!cancelled && dest) setDestination(dest);
      } catch (err) {
        if (!cancelled) toast.error("Failed to load assignment data.");
        console.error(err);
      } finally {
        if (!cancelled) setLoadingAssignment(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [appUser, destinationId]);

  // ── Real-time days listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (!appUser) return;
    setLoadingDays(true);

    const unsubscribe = listenToItineraryDays(
      TRIP_ID,
      (updatedDays: ItineraryDay[]) => {
        const destDays = updatedDays.filter((d) => d.destinationId === destinationId);
        const sorted = [...destDays].sort((a, b) => a.dayNumber - b.dayNumber);
        setDays(sorted);
        setLoadingDays(false);
        if (sorted.length > 0 && !selectedDayId) {
          setSelectedDayId(sorted[0]!.id);
        }
      }
    );

    return () => unsubscribe();
  }, [appUser, destinationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time items listener per day ────────────────────────────────────────
  useEffect(() => {
    if (!selectedDayId) return;

    const unsubscribe = listenToItineraryItems(
      selectedDayId,
      (updatedItems: ItineraryItem[]) => {
        setItemsByDay((prev) => ({ ...prev, [selectedDayId]: updatedItems }));
      }
    );

    return () => unsubscribe();
  }, [selectedDayId, destinationId]);

  // ── Sync selected day fields when selection changes ─────────────────────────
  useEffect(() => {
    if (selectedDay) {
      setDayTitle(selectedDay.title);
      setDayStatus(selectedDay.status);
      setDaySummary(selectedDay.summary ?? "");
      if (selectedDay.date) {
        const d =
          typeof (selectedDay.date as unknown as { toDate?: () => Date }).toDate === "function"
            ? (selectedDay.date as unknown as { toDate: () => Date }).toDate()
            : new Date(selectedDay.date as unknown as string);
        setDayDate(d.toISOString().split("T")[0] ?? "");
      } else {
        setDayDate("");
      }
    }
  }, [selectedDay]);

  // ── Auto-save logic ─────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (!selectedDayId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus("saving");
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await updateItineraryDay(selectedDayId, {
          title: dayTitle,
          date: dayDate ? Timestamp.fromDate(new Date(dayDate)) : null,
          status: dayStatus,
          summary: daySummary || undefined,
        });
        autoSavedAtRef.current = Date.now();
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } catch (err) {
        setAutoSaveStatus("idle");
        toast.error("Auto-save failed.");
        console.error(err);
      }
    }, 2000);
  }, [selectedDayId, dayTitle, dayDate, dayStatus, daySummary]);

  useEffect(() => {
    if (selectedDay && dayTitle !== undefined) {
      triggerAutoSave();
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [dayTitle, dayDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddDay = useCallback(async () => {
    if (!appUser) return;
    try {
      const newDayNumber = days.length + 1;
      await addItineraryDay({
        tripId: TRIP_ID,
        destinationId,
        date: null,
        dayNumber: newDayNumber,
        title: `Day ${newDayNumber}`,
        status: "draft",
        createdBy: appUser.uid,
      });
      toast.success(`Day ${newDayNumber} added`);
    } catch (err) {
      toast.error("Failed to add day.");
      console.error(err);
    }
  }, [appUser, days.length, destinationId]);

  const handleDeleteDay = useCallback(
    (day: ItineraryDay) => {
      setConfirmDialog({
        open: true,
        title: "Delete Day",
        message: `Are you sure you want to delete "Day ${day.dayNumber}: ${day.title}"? All items in this day will also be deleted.`,
        confirmLabel: "Delete Day",
        confirmVariant: "danger",
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, loading: true }));
          try {
            await deleteItineraryDay(day.id);
            if (selectedDayId === day.id) {
              const remaining = days.filter((d) => d.id !== day.id);
              setSelectedDayId(remaining[0]?.id ?? null);
            }
            toast.success("Day deleted");
            setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
          } catch (err) {
            toast.error("Failed to delete day.");
            console.error(err);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
          }
        },
      });
    },
    [days, selectedDayId]
  );

  const handleDeleteItem = useCallback((item: ItineraryItem) => {
    setConfirmDialog({
      open: true,
      title: "Delete Item",
      message: `Are you sure you want to delete "${item.title}"?`,
      confirmLabel: "Delete Item",
      confirmVariant: "danger",
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await deleteItineraryItem(item.id);
          toast.success("Item deleted");
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
        } catch (err) {
          toast.error("Failed to delete item.");
          console.error(err);
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !selectedDayId) return;

      const currentItems = itemsByDay[selectedDayId] ?? [];
      const oldIndex = currentItems.findIndex((i) => i.id === active.id);
      const newIndex = currentItems.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(currentItems, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));
      setItemsByDay((prev) => ({ ...prev, [selectedDayId]: reordered }));

      try {
        await reorderItineraryItems(
          reordered.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
        );
      } catch (err) {
        toast.error("Failed to reorder items.");
        console.error(err);
      }
    },
    [itemsByDay, selectedDayId]
  );

  const handleSaveDraft = useCallback(async () => {
    if (!selectedDayId) return;
    setSavingDraft(true);
    try {
      await updateItineraryDay(selectedDayId, {
        title: dayTitle,
        date: dayDate ? Timestamp.fromDate(new Date(dayDate)) : null,
        status: dayStatus,
        summary: daySummary || undefined,
      });
      toast.success("Draft saved successfully");
    } catch (err) {
      toast.error("Failed to save draft.");
      console.error(err);
    } finally {
      setSavingDraft(false);
    }
  }, [selectedDayId, dayTitle, dayDate, dayStatus, daySummary]);

  const handleSubmitForReview = useCallback(() => {
    if (!assignment || !appUser) return;

    setConfirmDialog({
      open: true,
      title: "Submit for Review",
      message:
        "Are you sure you want to submit this itinerary for review? You will not be able to edit it after submission unless changes are requested.",
      confirmLabel: "Submit for Review",
      confirmVariant: "primary",
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        setSubmitting(true);
        try {
          // 1. Update assignment status
          await updateAssignment(assignmentId!, {
            status: "submitted",
          });

          // 2. Create approval request
          await createApprovalRequest({
            tripId: TRIP_ID,
            destinationId,
            assignmentId: assignmentId!,
            submittedBy: appUser.uid,
            status: "pending",
          });

          // 3. Log activity
          await logActivity({
            tripId: TRIP_ID,
            action: "assignment_submitted",
            performedBy: appUser.uid,
            performedByName: appUser.displayName ?? "Admin",
            targetType: "assignment",
            targetId: assignmentId!,
            details: "Itinerary submitted for review",
          });

          // 4. Notify master admin
          await createNotification({
            userId: "master-admin",
            tripId: TRIP_ID,
            type: "itinerary_submitted",
            title: "Itinerary Submitted for Review",
            message: `${appUser.displayName ?? "An admin"} has submitted the itinerary for ${destination?.name ?? "a destination"}.`,
            isRead: false,
          });

          // 5. Reload assignment
          const updated = await getAssignment(assignmentId!);
          setAssignment(updated);

          toast.success("Itinerary submitted for review successfully!");
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
        } catch (err) {
          toast.error("Failed to submit for review. Please try again.");
          console.error(err);
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        } finally {
          setSubmitting(false);
        }
      },
    });
  }, [assignment, appUser, assignmentId, destinationId, destination]);

  // ── Status badge ─────────────────────────────────────────────────────────────
  const assignmentStatusClass = useMemo(() => {
    if (!assignment) return "";
    return ASSIGNMENT_STATUS_COLORS[assignment.status] ?? "bg-gray-100 text-gray-700";
  }, [assignment]);

  // ── Render: Access Restricted ────────────────────────────────────────────────
  if (!loadingAssignment && !isAuthorized) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">
            You do not have permission to access this itinerary builder.
          </p>
          <button
            onClick={() => router.push("/admin/assignments")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 text-white rounded-xl text-sm font-medium hover:bg-royal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Loading ──────────────────────────────────────────────────────────
  if (loadingAssignment) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-royal-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading itinerary builder…</p>
        </div>
      </div>
    );
  }

  // ── Preview Mode ─────────────────────────────────────────────────────────────
  if (previewMode) {
    return (
      <div className="min-h-screen bg-ivory-50">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="section-container py-3 flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(false)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Preview
            </button>
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-royal-500" />
              <span className="font-display font-semibold text-gray-900">
                {destination?.name ?? "Destination"} — Preview Mode
              </span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
              Preview Mode
            </span>
          </div>
        </div>

        <div className="section-container py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              {destination?.name} Itinerary
            </h1>
            <p className="text-gray-500 mb-8">
              {days.length} day{days.length !== 1 ? "s" : ""} planned
            </p>
            {days.map((day) => (
              <PreviewDayCard
                key={day.id}
                day={day}
                items={itemsByDay[day.id] ?? []}
              />
            ))}
            {days.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No days added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      {/* ── Header Bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          {/* Back */}
          <button
            onClick={() => router.push("/admin/assignments")}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Back to assignments"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Destination + Status */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-5 h-5 text-royal-500 flex-shrink-0" />
            <span className="font-display font-semibold text-gray-900 truncate text-lg">
              {destination?.name ?? "Loading…"}
            </span>
            {assignment && (
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0",
                  assignmentStatusClass
                )}
              >
                {ASSIGNMENT_STATUS_LABELS[assignment.status]}
              </span>
            )}
            {assignment?.deadline && (
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1",
                  isOverdue
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                <Calendar className="w-3 h-3" />
                Due:{" "}
                {formatDate(
                  typeof (assignment.deadline as unknown as { toDate?: () => Date }).toDate === "function"
                    ? (assignment.deadline as unknown as { toDate: () => Date }).toDate()
                    : new Date(assignment.deadline as unknown as string)
                )}
              </span>
            )}
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
            {autoSaveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            )}
            {autoSaveStatus === "saved" && (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">Auto-saved</span>
              </>
            )}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setPreviewMode(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-ivory-300 hover:bg-ivory-100 transition-colors flex-shrink-0 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            Preview
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || !selectedDayId}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-ivory-300 hover:bg-ivory-100 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
          >
            {savingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-stone-500" />
            )}
            Save Draft
          </button>

          {/* Submit for Review */}
          <button
            onClick={handleSubmitForReview}
            disabled={
              submitting ||
              !assignment ||
              assignment.status !== "in_progress"
            }
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gold-500 hover:bg-gold-600 shadow-gold transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Submit for Review
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Days
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {days.length}
              </span>
            </h2>
          </div>

          {/* Days List */}
          <div className="flex-1 overflow-y-auto">
            {loadingDays ? (
              <DaySkeleton />
            ) : days.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-400">No days yet. Add a day to get started.</p>
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {days.map((day) => (
                  <li key={day.id}>
                    <button
                      onClick={() => setSelectedDayId(day.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-3 transition-all group",
                        selectedDayId === day.id
                          ? "bg-royal-50 border border-royal-200"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Day number pill */}
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                            selectedDayId === day.id
                              ? "bg-royal-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {day.dayNumber}
                        </span>
                        {/* Title */}
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium truncate",
                            selectedDayId === day.id ? "text-royal-700" : "text-gray-700"
                          )}
                        >
                          {day.title}
                        </span>
                        {/* Status dot */}
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            DAY_STATUS_COLORS[day.status]
                          )}
                          title={day.status}
                        />
                      </div>
                      <div className="mt-1.5 pl-8 flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">
                          {(itemsByDay[day.id]?.length ?? 0)} item
                          {(itemsByDay[day.id]?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Day Button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleAddDay}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-royal-600 border border-royal-200 hover:bg-royal-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Day
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-ivory-50 px-6 py-6">
          {!selectedDay ? (
            /* Empty state – no day selected */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-royal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-royal-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                No Day Selected
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Select a day from the sidebar to start editing, or add a new day.
              </p>
              <button
                onClick={handleAddDay}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-royal-gradient text-white rounded-xl text-sm font-semibold hover:opacity-95 shadow-premium transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add First Day
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Day Header Card */}
              <div className="card-premium mb-5">
                <div className="flex items-start gap-3">
                  {/* Day Number Badge */}
                  <span className="bg-royal-gradient text-white text-sm font-bold px-3.5 py-2 rounded-xl flex-shrink-0 mt-0.5 shadow-premium">
                    Day {selectedDay.dayNumber}
                  </span>

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Title */}
                    <input
                      type="text"
                      value={dayTitle}
                      onChange={(e) => setDayTitle(e.target.value)}
                      placeholder="Day title…"
                      className="w-full text-xl font-display font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-royal-400 focus:outline-none transition-colors pb-1"
                    />

                    {/* Date + Status Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dayDate}
                          onChange={(e) => setDayDate(e.target.value)}
                          placeholder="Date TBC"
                          className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                        />
                        {!dayDate && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            Date TBC
                          </span>
                        )}
                      </div>
                      <select
                        value={dayStatus}
                        onChange={(e) => setDayStatus(e.target.value as ItineraryDay["status"])}
                        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent text-gray-700"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {/* Delete day button */}
                  <button
                    onClick={() => handleDeleteDay(selectedDay)}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label="Delete day"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary (collapsible) */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSummaryExpanded((v) => !v)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors mb-2"
                  >
                    {summaryExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    Day Summary {daySummary && !summaryExpanded && (
                      <span className="text-gray-400 font-normal truncate max-w-xs">— {daySummary.slice(0, 60)}{daySummary.length > 60 ? "…" : ""}</span>
                    )}
                  </button>
                  {summaryExpanded && (
                    <textarea
                      value={daySummary}
                      onChange={(e) => setDaySummary(e.target.value)}
                      rows={3}
                      placeholder="Write a brief summary of this day's plan…"
                      className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              {/* Warnings */}
              <WarningsPanel items={selectedDayItems} />

              {/* Items Section */}
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-royal-950 flex items-center gap-2">
                    <span>Day Timeline &amp; Activities</span>
                    <span className="text-xs bg-ivory-100 text-stone-600 px-2.5 py-0.5 rounded-full border border-ivory-200 font-sans font-semibold">
                      {selectedDayItems.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setItemPanelOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Activity
                  </button>
                </div>

                {/* Items List */}
                {loadingDays ? (
                  <ItemSkeleton />
                ) : selectedDayItems.length === 0 ? (
                  /* Empty items state */
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Info className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No items yet</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Add sightseeing, hotels, transport, and more to plan this day.
                    </p>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setItemPanelOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedDayItems.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selectedDayItems.map((item) => (
                          <SortableItemRow
                            key={item.id}
                            item={item}
                            onEdit={(i) => {
                              setEditingItem(i);
                              setItemPanelOpen(true);
                            }}
                            onDelete={handleDeleteItem}
                            previewMode={false}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Item Form Panel ─────────────────────────────────────────────────────── */}
      {appUser && selectedDayId && (
        <ItemFormPanel
          open={itemPanelOpen}
          editingItem={editingItem}
          dayId={selectedDayId}
          tripId={TRIP_ID}
          destinationId={destinationId}
          createdBy={appUser.uid}
          onClose={() => {
            setItemPanelOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            // Real-time listener handles updates
          }}
        />
      )}

      {/* ── Confirmation Dialog ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        loading={confirmDialog.loading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }))
        }
      />
    </div>
  );
}
