import { z } from "zod";

// ─── Reusable field helpers ────────────────────────────────────────────────────

const optionalString = z.string().optional();
const optionalUrl = z.string().url("Must be a valid URL").optional().or(z.literal(""));
const optionalEmail = z.string().email("Must be a valid email").optional().or(z.literal(""));
const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`);
const optionalPositiveNumber = z
  .preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive("Must be a positive number").optional()
  );

// ─── Status enums ─────────────────────────────────────────────────────────────

const TripStatus = z.enum([
  "draft",
  "planning",
  "active",
  "completed",
  "archived",
]);

const DestinationStatus = z.enum([
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "published",
]);

const AssignmentStatus = z.enum([
  "not_started",
  "in_progress",
  "submitted",
  "changes_requested",
  "approved",
  "published",
  "overdue",
]);

const AssignmentPriority = z.enum(["low", "medium", "high", "urgent"]);

const BookingStatus = z.enum([
  "not_required",
  "pending",
  "confirmed",
  "cancelled",
  "tbc",
]);

const ItineraryItemType = z.enum([
  "sightseeing",
  "hotel",
  "transport",
  "food",
  "shopping",
  "rest",
  "activity",
  "departure",
  "arrival",
]);

const TransportType = z.enum([
  "train",
  "bus",
  "taxi",
  "auto",
  "flight",
  "metro",
  "other",
]);

const ExpenseCategory = z.enum([
  "hotel",
  "transport",
  "food",
  "sightseeing",
  "shopping",
  "misc",
  "emergency",
]);

const UserRole = z.enum(["master_admin", "destination_admin", "viewer"]);

// ─── Trip Schema ───────────────────────────────────────────────────────────────

export const tripSchema = z
  .object({
    name: requiredString("Trip name").max(100, "Name must be under 100 characters"),
    description: optionalString,
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date"),
    departureStation: requiredString("Departure station"),
    departureDateTime: z
      .string()
      .min(1, "Departure date/time is required")
      .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date/time"),
    returnDateTime: z
      .string()
      .min(1, "Return date/time is required")
      .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date/time"),
    plannedTrainName: requiredString("Planned train name"),
    status: TripStatus.default("draft"),
    coverImageUrl: optionalUrl,
    totalBudgetEstimate: optionalPositiveNumber,
    totalMembers: z.coerce
      .number()
      .int("Must be a whole number")
      .positive("Must be at least 1")
      .optional(),
    isPublished: z.boolean().default(false),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type TripFormValues = z.infer<typeof tripSchema>;

// ─── Destination Schema ────────────────────────────────────────────────────────

export const destinationSchema = z
  .object({
    tripId: requiredString("Trip ID"),
    name: requiredString("Destination name").max(100),
    state: requiredString("State"),
    country: z.string().default("India"),
    description: optionalString,
    coverImageUrl: optionalUrl,
    sequenceOrder: z.coerce
      .number()
      .int("Must be a whole number")
      .min(1, "Sequence order must be at least 1"),
    arrivalDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), "Must be a valid date")
      .optional()
      .or(z.literal("")),
    departureDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), "Must be a valid date")
      .optional()
      .or(z.literal("")),
    status: DestinationStatus.default("pending"),
    assignedAdminId: optionalString,
  })
  .refine(
    (data) => {
      if (data.arrivalDate && data.departureDate) {
        return new Date(data.departureDate) >= new Date(data.arrivalDate);
      }
      return true;
    },
    {
      message: "Departure date must be on or after arrival date",
      path: ["departureDate"],
    }
  );

export type DestinationFormValues = z.infer<typeof destinationSchema>;

// ─── Assignment Schema ─────────────────────────────────────────────────────────

export const assignmentSchema = z.object({
  tripId: requiredString("Trip ID"),
  destinationId: requiredString("Destination"),
  assignedAdminId: requiredString("Assigned admin"),
  title: requiredString("Title").max(150, "Title must be under 150 characters"),
  description: optionalString,
  instructions: optionalString,
  deadline: z
    .string()
    .min(1, "Deadline is required")
    .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date"),
  priority: AssignmentPriority.default("medium"),
  status: AssignmentStatus.default("not_started"),
  reviewComment: optionalString,
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

// ─── Hotel Schema ──────────────────────────────────────────────────────────────

export const hotelSchema = z.object({
  tripId: requiredString("Trip ID"),
  destinationId: requiredString("Destination"),
  name: requiredString("Hotel name").max(150),
  address: optionalString,
  phone: z
    .string()
    .regex(/^[+\d\s\-().]*$/, "Must be a valid phone number")
    .optional()
    .or(z.literal("")),
  email: optionalEmail,
  website: optionalUrl,
  mapUrl: optionalUrl,
  starRating: z.coerce
    .number()
    .min(1, "Min 1 star")
    .max(5, "Max 5 stars")
    .optional(),
  checkIn: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Must be a valid date")
    .optional()
    .or(z.literal("")),
  checkOut: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Must be a valid date")
    .optional()
    .or(z.literal("")),
  checkInTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:MM format")
    .optional()
    .or(z.literal("")),
  checkOutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:MM format")
    .optional()
    .or(z.literal("")),
  roomDetails: optionalString,
  numberOfRooms: z.coerce.number().int().positive().optional(),
  guestsPerRoom: z.coerce.number().int().positive().optional(),
  estimatedPrice: optionalPositiveNumber,
  actualPrice: optionalPositiveNumber,
  currency: z.string().default("INR"),
  bookingStatus: BookingStatus.default("pending"),
  confirmationReference: optionalString,
  cancellationPolicy: optionalString,
  contactInfo: optionalString,
  notes: optionalString,
  isRecommended: z.boolean().default(false),
});

export type HotelFormValues = z.infer<typeof hotelSchema>;

// ─── Transport Schema ──────────────────────────────────────────────────────────

export const transportSchema = z
  .object({
    tripId: requiredString("Trip ID"),
    destinationId: optionalString,
    type: TransportType,
    title: requiredString("Title").max(150),
    provider: optionalString,
    trainNumber: optionalString,
    departureLocation: requiredString("Departure location"),
    arrivalLocation: requiredString("Arrival location"),
    scheduledDeparture: z
      .string()
      .min(1, "Departure date/time is required")
      .refine((v) => !isNaN(Date.parse(v)), "Must be a valid date/time"),
    scheduledArrival: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), "Must be a valid date/time")
      .optional()
      .or(z.literal("")),
    estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
    bookingReference: optionalString,
    pnrNumber: optionalString,
    estimatedCost: optionalPositiveNumber,
    actualCost: optionalPositiveNumber,
    currency: z.string().default("INR"),
    bookingStatus: BookingStatus.default("pending"),
    seatDetails: optionalString,
    notes: optionalString,
  })
  .refine(
    (data) => {
      if (data.scheduledArrival && data.scheduledArrival !== "") {
        return new Date(data.scheduledArrival) >= new Date(data.scheduledDeparture);
      }
      return true;
    },
    {
      message: "Arrival must be after departure",
      path: ["scheduledArrival"],
    }
  );

export type TransportFormValues = z.infer<typeof transportSchema>;

// ─── Itinerary Item Schema ─────────────────────────────────────────────────────

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const itineraryItemSchema = z.object({
  dayId: requiredString("Day ID"),
  tripId: requiredString("Trip ID"),
  destinationId: requiredString("Destination ID"),
  type: ItineraryItemType,
  title: requiredString("Title").max(150, "Title must be under 150 characters"),
  description: optionalString,
  startTime: z
    .string()
    .regex(timeRegex, "Must be HH:MM format (24h)")
    .optional()
    .or(z.literal("")),
  endTime: z
    .string()
    .regex(timeRegex, "Must be HH:MM format (24h)")
    .optional()
    .or(z.literal("")),
  durationMinutes: z.coerce.number().int().positive().optional(),
  travelTimeToNextMinutes: z.coerce.number().int().min(0).optional(),
  location: z
    .object({
      name: requiredString("Location name"),
      address: optionalString,
      mapUrl: optionalUrl,
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
    })
    .optional(),
  estimatedCost: optionalPositiveNumber,
  actualCost: optionalPositiveNumber,
  currency: z.string().default("INR"),
  bookingStatus: BookingStatus.default("not_required"),
  bookingReference: optionalString,
  bookingUrl: optionalUrl,
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater"),
  isOptional: z.boolean().default(false),
  isTentative: z.boolean().default(false),
  openingHours: optionalString,
  entryFee: optionalPositiveNumber,
  notes: optionalString,
});

export type ItineraryItemFormValues = z.infer<typeof itineraryItemSchema>;

// ─── Expense Schema ────────────────────────────────────────────────────────────

export const expenseSchema = z.object({
  tripId: requiredString("Trip ID"),
  destinationId: optionalString,
  category: ExpenseCategory,
  title: requiredString("Title").max(150),
  description: optionalString,
  estimatedAmount: z.coerce
    .number()
    .min(0, "Amount must be 0 or greater")
    .refine((v) => v !== undefined, "Estimated amount is required"),
  actualAmount: z.coerce.number().min(0, "Amount must be 0 or greater").optional(),
  currency: z.string().min(1, "Currency is required").default("INR"),
  isPaid: z.boolean().default(false),
  paidBy: optionalString,
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

// ─── Invite Admin Schema ───────────────────────────────────────────────────────

export const inviteAdminSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(60, "Display name must be under 60 characters"),
  role: UserRole,
  assignedDestinationIds: z
    .array(z.string())
    .default([])
    .refine(
      (ids) => ids.every((id) => typeof id === "string" && id.length > 0),
      "All destination IDs must be non-empty strings"
    ),
});

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;

// ─── Approval Request Schema ───────────────────────────────────────────────────

export const approvalRequestSchema = z.object({
  tripId: requiredString("Trip ID"),
  destinationId: requiredString("Destination ID"),
  assignmentId: requiredString("Assignment ID"),
  comments: optionalString,
});

export type ApprovalRequestFormValues = z.infer<typeof approvalRequestSchema>;

// ─── Announcement Schema ───────────────────────────────────────────────────────

export const announcementSchema = z.object({
  tripId: requiredString("Trip ID"),
  title: requiredString("Title").max(120, "Title must be under 120 characters"),
  body: requiredString("Message body").max(
    2000,
    "Message must be under 2000 characters"
  ),
  isImportant: z.boolean().default(false),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
