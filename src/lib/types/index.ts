import { Timestamp } from "firebase/firestore";

// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = "master_admin" | "destination_admin" | "viewer";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  assignedDestinationIds: string[];
  tripIds: string[];
  status: "active" | "disabled" | "invited";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export type TripStatus = "draft" | "planning" | "active" | "completed" | "archived";

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  departureStation: string;
  departureDateTime: Timestamp | null;
  returnDateTime: Timestamp | null;
  plannedTrainName: string;
  destinationIds: string[];
  status: TripStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  coverImageUrl?: string;
  totalBudgetEstimate?: number;
  totalMembers?: number;
  isPublished: boolean;
}

// ─── Destination ──────────────────────────────────────────────────────────────
export type DestinationStatus = "pending" | "in_progress" | "submitted" | "approved" | "published";

export interface Destination {
  id: string;
  tripId: string;
  name: string;
  state: string;
  country: string;
  description?: string;
  coverImageUrl?: string;
  sequenceOrder: number;
  arrivalDate: Timestamp | null;
  departureDate: Timestamp | null;
  status: DestinationStatus;
  assignedAdminId?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Assignment ───────────────────────────────────────────────────────────────
export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "published"
  | "overdue";

export type AssignmentPriority = "low" | "medium" | "high" | "urgent";

export interface Assignment {
  id: string;
  tripId: string;
  destinationId: string;
  assignedAdminId: string;
  title: string;
  description?: string;
  instructions?: string;
  deadline: Timestamp | null;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  submittedAt?: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewComment?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Itinerary Day ────────────────────────────────────────────────────────────
export type ItineraryDayStatus = "draft" | "submitted" | "approved" | "published";

export interface ItineraryDay {
  id: string;
  tripId: string;
  destinationId: string;
  date: Timestamp | null;
  dayNumber: number;
  title: string;
  summary?: string;
  status: ItineraryDayStatus;
  createdBy: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// ─── Itinerary Item ───────────────────────────────────────────────────────────
export type ItineraryItemType =
  | "sightseeing"
  | "hotel"
  | "transport"
  | "food"
  | "shopping"
  | "rest"
  | "activity"
  | "departure"
  | "arrival";

export type BookingStatus = "not_required" | "pending" | "confirmed" | "cancelled" | "tbc";

export interface ItineraryItem {
  id: string;
  dayId: string;
  tripId: string;
  destinationId: string;
  type: ItineraryItemType;
  title: string;
  description?: string;
  startTime?: string; // "HH:MM"
  endTime?: string;   // "HH:MM"
  durationMinutes?: number;
  travelTimeToNextMinutes?: number;
  location?: {
    name: string;
    address?: string;
    mapUrl?: string;
    lat?: number;
    lng?: number;
  };
  estimatedCost?: number;
  actualCost?: number;
  currency?: string;
  bookingStatus: BookingStatus;
  bookingReference?: string;
  bookingUrl?: string;
  assignedAdminId?: string;
  sortOrder: number;
  isOptional: boolean;
  isTentative: boolean;
  openingHours?: string;
  entryFee?: number;
  notes?: string;
  imageUrls?: string[];
  documentUrls?: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Hotel ────────────────────────────────────────────────────────────────────
export interface Hotel {
  id: string;
  tripId: string;
  destinationId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  mapUrl?: string;
  starRating?: number;
  checkIn: Timestamp | null;
  checkOut: Timestamp | null;
  checkInTime?: string;
  checkOutTime?: string;
  roomDetails?: string;
  numberOfRooms?: number;
  guestsPerRoom?: number;
  estimatedPrice?: number;
  actualPrice?: number;
  currency?: string;
  bookingStatus: BookingStatus;
  confirmationReference?: string;
  cancellationPolicy?: string;
  contactInfo?: string;
  imageUrls?: string[];
  documentUrls?: string[];
  notes?: string;
  isRecommended: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Transport ────────────────────────────────────────────────────────────────
export type TransportType = "train" | "bus" | "taxi" | "auto" | "flight" | "metro" | "other";

export interface TransportBooking {
  id: string;
  tripId: string;
  destinationId?: string;
  type: TransportType;
  title: string;
  provider?: string;
  trainNumber?: string;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDeparture: Timestamp | null;
  scheduledArrival: Timestamp | null;
  estimatedDurationMinutes?: number;
  bookingReference?: string;
  pnrNumber?: string;
  estimatedCost?: number;
  actualCost?: number;
  currency?: string;
  bookingStatus: BookingStatus;
  seatDetails?: string;
  notes?: string;
  documentUrls?: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Expense ──────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | "hotel"
  | "transport"
  | "food"
  | "sightseeing"
  | "shopping"
  | "misc"
  | "emergency";

export interface Expense {
  id: string;
  tripId: string;
  destinationId?: string;
  category: ExpenseCategory;
  title: string;
  description?: string;
  estimatedAmount: number;
  actualAmount?: number;
  currency: string;
  isPaid: boolean;
  paidBy?: string;
  receiptUrls?: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Announcement ─────────────────────────────────────────────────────────────
export interface Announcement {
  id: string;
  tripId: string;
  title: string;
  body: string;
  isImportant: boolean;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType =
  | "assignment_created"
  | "itinerary_submitted"
  | "itinerary_approved"
  | "itinerary_rejected"
  | "changes_requested"
  | "deadline_approaching"
  | "announcement"
  | "trip_published"
  | "general";

export interface AppNotification {
  id: string;
  userId: string;
  tripId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Timestamp;
}

// ─── Approval Request ─────────────────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface ApprovalRequest {
  id: string;
  tripId: string;
  destinationId: string;
  assignmentId: string;
  submittedBy: string;
  reviewedBy?: string;
  status: ApprovalStatus;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  comments?: string;
  revisionRequests?: string[];
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export type ActivityAction =
  | "trip_created"
  | "trip_updated"
  | "trip_published"
  | "destination_added"
  | "assignment_created"
  | "assignment_submitted"
  | "assignment_approved"
  | "assignment_rejected"
  | "itinerary_day_added"
  | "itinerary_item_added"
  | "hotel_added"
  | "transport_added"
  | "admin_invited"
  | "admin_role_changed"
  | "announcement_posted";

export interface ActivityLog {
  id: string;
  tripId: string;
  action: ActivityAction;
  performedBy: string;
  performedByName: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  createdAt: Timestamp;
}

