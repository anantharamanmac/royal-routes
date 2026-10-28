/**
 * seedData.ts
 * -----------
 * Demo data seeder for Royal Routes India Trip Planner.
 * Creates a complete Rajasthan–Delhi–Agra Winter Trip 2026 demo dataset.
 *
 * Usage:
 *   import { seedDemoData } from "@/lib/firebase/seedData";
 *   await seedDemoData(currentUser.uid);
 *
 * All documents with fixed IDs are written with { merge: true } so the
 * seeder is fully idempotent and safe to run multiple times.
 */

import { db } from "@/lib/firebase/config";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Collection References ────────────────────────────────────────────────────

const tripsCol         = () => collection(db, "trips");
const destinationsCol  = () => collection(db, "destinations");
const assignmentsCol   = () => collection(db, "assignments");
const itineraryDaysCol = () => collection(db, "itineraryDays");
const itineraryItemsCol= () => collection(db, "itineraryItems");
const hotelsCol        = () => collection(db, "hotels");
const transportCol     = () => collection(db, "transportBookings");
const announcementsCol = () => collection(db, "announcements");

// ─── Main Seeder ──────────────────────────────────────────────────────────────

export async function seedDemoData(userId: string): Promise<void> {
  try {
    // ── 1. Trip ──────────────────────────────────────────────────────────────
    await setDoc(
      doc(tripsCol(), "demo-trip-2026"),
      {
        id: "demo-trip-2026",
        name: "Rajasthan – Delhi – Agra Winter Trip 2026",
        description:
          "A royal journey through India's heritage cities — Rajasthan, Delhi, and Agra — exploring forts, palaces, and the iconic Taj Mahal.",
        startDate: null,
        endDate: null,
        departureStation: "Kollam Junction",
        departureDateTime: null,
        returnDateTime: null,
        plannedTrainName: "Rajdhani Express (To be confirmed)",
        destinationIds: ["dest-rajasthan", "dest-delhi", "dest-agra"],
        status: "planning",
        createdBy: userId,
        isPublished: false,
        isDemoData: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // ── 2. Destinations ───────────────────────────────────────────────────────
    const destinations = [
      {
        id: "dest-rajasthan",
        name: "Rajasthan",
        state: "Rajasthan",
        country: "India",
        sequenceOrder: 1,
        status: "pending",
        arrivalDate: null,
        departureDate: null,
        tripId: "demo-trip-2026",
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "dest-delhi",
        name: "Delhi",
        state: "Delhi",
        country: "India",
        sequenceOrder: 2,
        status: "pending",
        arrivalDate: null,
        departureDate: null,
        tripId: "demo-trip-2026",
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "dest-agra",
        name: "Agra",
        state: "Uttar Pradesh",
        country: "India",
        sequenceOrder: 3,
        status: "pending",
        arrivalDate: null,
        departureDate: null,
        tripId: "demo-trip-2026",
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const dest of destinations) {
      const { id, ...data } = dest;
      await setDoc(doc(destinationsCol(), id), { id, ...data }, { merge: true });
    }

    // ── 3. Assignments ────────────────────────────────────────────────────────
    const assignments = [
      {
        id: "assign-raj",
        tripId: "demo-trip-2026",
        destinationId: "dest-rajasthan",
        assignedAdminId: userId,
        title: "Plan Rajasthan Itinerary",
        description:
          "Create detailed day-by-day plan for Rajasthan leg...",
        status: "not_started",
        priority: "medium",
        deadline: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "assign-del",
        tripId: "demo-trip-2026",
        destinationId: "dest-delhi",
        assignedAdminId: userId,
        title: "Plan Delhi Itinerary",
        description:
          "Create detailed day-by-day plan for Delhi leg...",
        status: "not_started",
        priority: "medium",
        deadline: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "assign-agra",
        tripId: "demo-trip-2026",
        destinationId: "dest-agra",
        assignedAdminId: userId,
        title: "Plan Agra Itinerary",
        description:
          "Create detailed day-by-day plan for Agra leg...",
        status: "not_started",
        priority: "medium",
        deadline: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const assignment of assignments) {
      const { id, ...data } = assignment;
      await setDoc(doc(assignmentsCol(), id), { id, ...data }, { merge: true });
    }

    // ── 4. Itinerary Days ─────────────────────────────────────────────────────
    const itineraryDays = [
      {
        id: "day-raj-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-rajasthan",
        dayNumber: 1,
        title: "Arrival & Jaipur City Tour",
        status: "draft",
        date: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "day-raj-2",
        tripId: "demo-trip-2026",
        destinationId: "dest-rajasthan",
        dayNumber: 2,
        title: "Amber Fort & Local Bazaars",
        status: "draft",
        date: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "day-del-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-delhi",
        dayNumber: 1,
        title: "Old Delhi & Red Fort",
        status: "draft",
        date: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "day-del-2",
        tripId: "demo-trip-2026",
        destinationId: "dest-delhi",
        dayNumber: 2,
        title: "New Delhi Monuments Trail",
        status: "draft",
        date: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "day-agra-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-agra",
        dayNumber: 1,
        title: "Taj Mahal Sunrise & Agra Fort",
        status: "draft",
        date: null,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const day of itineraryDays) {
      const { id, ...data } = day;
      await setDoc(doc(itineraryDaysCol(), id), { id, ...data }, { merge: true });
    }

    // ── 5. Itinerary Items (addDoc — auto-generated IDs) ───────────────────────

    // Shared base fields builder
    const baseItem = (
      dayId: string,
      destinationId: string,
      overrides: Record<string, unknown>
    ) => ({
      dayId,
      tripId: "demo-trip-2026",
      destinationId,
      isTentative: true,
      isDemoData: true,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...overrides,
    });

    // day-raj-1 items
    await addDoc(
      itineraryItemsCol(),
      baseItem("day-raj-1", "dest-rajasthan", {
        type: "sightseeing",
        title: "Hawa Mahal Visit",
        startTime: "10:00",
        endTime: "12:00",
        durationMinutes: 120,
        location: { name: "Hawa Mahal", address: "Hawa Mahal Rd, Jaipur, Rajasthan" },
        estimatedCost: 200,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 1,
        isOptional: false,
      })
    );

    await addDoc(
      itineraryItemsCol(),
      baseItem("day-raj-1", "dest-rajasthan", {
        type: "food",
        title: "Lunch at Laxmi Mishthan Bhandar",
        startTime: "13:00",
        endTime: "14:00",
        durationMinutes: 60,
        location: { name: "LMB Restaurant", address: "Johari Bazaar, Jaipur" },
        estimatedCost: 500,
        currency: "INR",
        bookingStatus: "not_required",
        sortOrder: 2,
        isOptional: false,
      })
    );

    await addDoc(
      itineraryItemsCol(),
      baseItem("day-raj-1", "dest-rajasthan", {
        type: "sightseeing",
        title: "City Palace Tour",
        startTime: "15:00",
        endTime: "17:30",
        durationMinutes: 150,
        location: { name: "City Palace", address: "Tulsi Marg, Gangori Bazaar, Jaipur" },
        estimatedCost: 500,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 3,
        isOptional: false,
      })
    );

    // day-raj-2 items
    await addDoc(
      itineraryItemsCol(),
      baseItem("day-raj-2", "dest-rajasthan", {
        type: "transport",
        title: "Taxi to Amber Fort",
        startTime: "08:00",
        durationMinutes: 30,
        estimatedCost: 400,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 1,
        isOptional: false,
      })
    );

    await addDoc(
      itineraryItemsCol(),
      baseItem("day-raj-2", "dest-rajasthan", {
        type: "sightseeing",
        title: "Amber Fort Guided Tour",
        startTime: "09:00",
        endTime: "12:00",
        durationMinutes: 180,
        location: { name: "Amer Fort", address: "Devisinghpura, Amer, Jaipur" },
        estimatedCost: 1500,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 2,
        isOptional: false,
      })
    );

    // day-del-1 items
    await addDoc(
      itineraryItemsCol(),
      baseItem("day-del-1", "dest-delhi", {
        type: "sightseeing",
        title: "Red Fort Visit",
        startTime: "09:00",
        endTime: "11:30",
        durationMinutes: 150,
        location: { name: "Red Fort", address: "Netaji Subhash Marg, Lal Qila, Delhi" },
        estimatedCost: 600,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 1,
        isOptional: false,
      })
    );

    await addDoc(
      itineraryItemsCol(),
      baseItem("day-del-1", "dest-delhi", {
        type: "food",
        title: "Paranthe Wali Gali Breakfast",
        startTime: "08:00",
        endTime: "09:00",
        durationMinutes: 60,
        location: { name: "Paranthe Wali Gali", address: "Chandni Chowk, Old Delhi" },
        estimatedCost: 300,
        currency: "INR",
        bookingStatus: "not_required",
        sortOrder: 2,
        isOptional: true,
      })
    );

    // day-del-2 items
    await addDoc(
      itineraryItemsCol(),
      baseItem("day-del-2", "dest-delhi", {
        type: "sightseeing",
        title: "Qutub Minar",
        startTime: "09:00",
        endTime: "11:00",
        durationMinutes: 120,
        location: { name: "Qutub Minar", address: "Mehrauli, New Delhi" },
        estimatedCost: 600,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 1,
        isOptional: false,
      })
    );

    await addDoc(
      itineraryItemsCol(),
      baseItem("day-del-2", "dest-delhi", {
        type: "sightseeing",
        title: "India Gate & Rajpath",
        startTime: "16:00",
        endTime: "18:00",
        durationMinutes: 120,
        location: { name: "India Gate", address: "Rajpath, India Gate, New Delhi" },
        estimatedCost: 0,
        currency: "INR",
        bookingStatus: "not_required",
        sortOrder: 2,
        isOptional: false,
      })
    );

    // day-agra-1 items
    await addDoc(
      itineraryItemsCol(),
      baseItem("day-agra-1", "dest-agra", {
        type: "sightseeing",
        title: "Taj Mahal Sunrise Visit",
        startTime: "06:00",
        endTime: "09:00",
        durationMinutes: 180,
        location: {
          name: "Taj Mahal",
          address: "Dharmapuri, Forest Colony, Tajganj, Agra",
        },
        estimatedCost: 1300,
        currency: "INR",
        bookingStatus: "tbc",
        sortOrder: 1,
        isOptional: false,
      })
    );

    // ── 6. Hotels ─────────────────────────────────────────────────────────────
    const hotels = [
      {
        id: "hotel-raj-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-rajasthan",
        name: "Rambagh Palace (To be confirmed)",
        address: "Bhawani Singh Rd, Rambagh, Jaipur",
        starRating: 5,
        checkIn: null,
        checkOut: null,
        checkInTime: "14:00",
        checkOutTime: "11:00",
        bookingStatus: "tbc",
        estimatedPrice: 15000,
        currency: "INR",
        isRecommended: true,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "hotel-del-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-delhi",
        name: "The Imperial New Delhi (To be confirmed)",
        address: "Janpath, New Delhi",
        starRating: 5,
        checkIn: null,
        checkOut: null,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        bookingStatus: "tbc",
        estimatedPrice: 12000,
        currency: "INR",
        isRecommended: true,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "hotel-agra-1",
        tripId: "demo-trip-2026",
        destinationId: "dest-agra",
        name: "Oberoi Amarvilas (To be confirmed)",
        address: "Taj East Gate Road, Agra",
        starRating: 5,
        checkIn: null,
        checkOut: null,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        bookingStatus: "tbc",
        estimatedPrice: 20000,
        currency: "INR",
        isRecommended: true,
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const hotel of hotels) {
      const { id, ...data } = hotel;
      await setDoc(doc(hotelsCol(), id), { id, ...data }, { merge: true });
    }

    // ── 7. Transport Bookings ─────────────────────────────────────────────────
    const transports = [
      {
        id: "transport-1",
        tripId: "demo-trip-2026",
        type: "train",
        title: "Kollam to Jaipur via Rajdhani Express",
        provider: "Indian Railways",
        trainNumber: "To be confirmed",
        departureLocation: "Kollam Junction",
        arrivalLocation: "Jaipur Junction",
        scheduledDeparture: null,
        scheduledArrival: null,
        bookingStatus: "tbc",
        estimatedCost: 2000,
        currency: "INR",
        notes:
          "Rajdhani Express route to be confirmed. Book tickets 120 days in advance.",
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "transport-2",
        tripId: "demo-trip-2026",
        type: "train",
        title: "Return Journey: Agra to Kollam",
        provider: "Indian Railways",
        trainNumber: "To be confirmed",
        departureLocation: "Agra Cantonment",
        arrivalLocation: "Kollam Junction",
        scheduledDeparture: null,
        scheduledArrival: null,
        bookingStatus: "tbc",
        estimatedCost: 2000,
        currency: "INR",
        notes: "Return journey. Exact train to be confirmed.",
        isDemoData: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const transport of transports) {
      const { id, ...data } = transport;
      await setDoc(doc(transportCol(), id), { id, ...data }, { merge: true });
    }

    // ── 8. Announcements ──────────────────────────────────────────────────────
    const announcements = [
      {
        id: "ann-1",
        tripId: "demo-trip-2026",
        title: "Welcome to Royal Routes!",
        body: "This is our trip planning workspace for the Rajasthan–Delhi–Agra Winter Trip 2026. All admins have been assigned their destination planning tasks.",
        isImportant: true,
        authorId: userId,
        isDemoData: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "ann-2",
        tripId: "demo-trip-2026",
        title: "Dates TBC – Please Stand By",
        body: "Travel dates are yet to be finalized. Once the train bookings are confirmed, all itinerary dates will be updated. All timings currently shown are approximate.",
        isImportant: true,
        authorId: userId,
        isDemoData: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        id: "ann-3",
        tripId: "demo-trip-2026",
        title: "Budget Guidelines",
        body: "Please keep estimated costs in INR. Hotel estimates are per room per night. All costs marked as 'To be confirmed' are approximate and subject to change.",
        isImportant: false,
        authorId: userId,
        isDemoData: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const ann of announcements) {
      const { id, ...data } = ann;
      await setDoc(doc(announcementsCol(), id), { id, ...data }, { merge: true });
    }

    console.log("[seedDemoData] ✅ Demo data seeded successfully.");
  } catch (error) {
    console.error("[seedDemoData] ❌ Failed to seed demo data:", error);
    throw error;
  }
}
