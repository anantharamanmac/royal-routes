"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Database,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
  Globe,
  Loader2,
} from "lucide-react";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/lib/hooks/useTrip";
import { seedDemoData } from "@/lib/firebase/seedData";
import { logActivity } from "@/lib/firebase/activityLogs";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const TRIP_ID = "demo-trip-2026";

export default function TripSettingsPage() {
  const { appUser } = useAuth();
  const { trip, loading: tripLoading } = useTrip(TRIP_ID);

  const [formData, setFormData] = useState({
    name: "Royal Routes – Rajasthan, Delhi & Agra Winter Trip",
    departureStation: "Kollam Junction, Kerala",
    plannedDeparture: "24 December 2026, night",
    plannedTrainName: "Rajdhani Express (Details to be confirmed)",
    status: "planning",
    isPublished: false,
    returnDateText: "To be confirmed (January 2027)",
    notes:
      "All train schedules and hotel reservations remain tentative until officially booked and ticketed by the Master Admin.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name || "Royal Routes – Rajasthan, Delhi & Agra Winter Trip",
        departureStation: trip.departureStation || "Kollam Junction, Kerala",
        plannedDeparture: "24 December 2026, night",
        plannedTrainName: trip.plannedTrainName || "Rajdhani Express (Details to be confirmed)",
        status: trip.status || "planning",
        isPublished: trip.isPublished || false,
        returnDateText: "To be confirmed (January 2027)",
        notes:
          trip.description ||
          "All train schedules and hotel reservations remain tentative until officially booked.",
      });
    }
  }, [trip]);

  if (tripLoading) return <PageLoader />;

  const isMasterAdmin = appUser?.role === "master_admin";

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMasterAdmin) {
      toast.error("Only Master Admins can modify trip configuration.");
      return;
    }

    try {
      setIsSaving(true);
      await updateDoc(doc(db, "trips", TRIP_ID), {
        name: formData.name,
        departureStation: formData.departureStation,
        plannedTrainName: formData.plannedTrainName,
        status: formData.status,
        isPublished: formData.isPublished,
        description: formData.notes,
        updatedAt: serverTimestamp(),
      });

      await logActivity({
        tripId: TRIP_ID,
        action: "trip_updated",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: "Updated primary trip configuration and publication status.",
      });

      toast.success("Trip configuration saved successfully.");
    } catch {
      toast.error("Failed to update trip settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSeeder = async () => {
    try {
      setIsSeeding(true);
      await seedDemoData(appUser?.uid || "admin-system");
      toast.success(
        "Realistic Rajasthan – Delhi – Agra dataset seeded successfully into Firestore!"
      );
      setIsSeedConfirmOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to seed demo dataset.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Header ── */}
      <div className="border-b border-ivory-200 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Trip Master Configuration</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-royal-950">Trip Settings &amp; Data</h1>
        <p className="text-stone-500 text-sm mt-1">
          Adjust high-level journey parameters, manage publishing status, or initialize the realistic
          development dataset.
        </p>
      </div>

      {/* ── Strict Integrity Directive Notice ── */}
      <div className="bg-sandstone-50 border border-sandstone-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900 font-semibold">Strict Data Policy:</strong> As
          stipulated in the project specifications, unverified details such as train numbers,
          departure or arrival times, ticket PNRs, or hotel room allocations must remain displayed as{" "}
          <span className="font-semibold text-royal-800">“To be confirmed”</span> until an
          authorized admin enters and verifies genuine booking vouchers.
        </div>
      </div>

      {/* ── Primary Settings Form ── */}
      <form onSubmit={handleSaveSettings} className="card-premium p-6 sm:p-8 space-y-6">
        <h2 className="font-display text-xl font-bold text-royal-950">Primary Trip Parameters</h2>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Official Project Name *</label>
            <input
              type="text"
              required
              disabled={!isMasterAdmin}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Departure Station *</label>
              <input
                type="text"
                required
                disabled={!isMasterAdmin}
                value={formData.departureStation}
                onChange={(e) => setFormData({ ...formData, departureStation: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Planned Departure *</label>
              <input
                type="text"
                required
                disabled={!isMasterAdmin}
                value={formData.plannedDeparture}
                onChange={(e) => setFormData({ ...formData, plannedDeparture: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Planned Train *</label>
              <input
                type="text"
                required
                disabled={!isMasterAdmin}
                value={formData.plannedTrainName}
                onChange={(e) => setFormData({ ...formData, plannedTrainName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Return Journey *</label>
              <input
                type="text"
                disabled={!isMasterAdmin}
                value={formData.returnDateText}
                onChange={(e) => setFormData({ ...formData, returnDateText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Trip Status</label>
              <select
                disabled={!isMasterAdmin}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 bg-white text-stone-900"
              >
                <option value="planning">Planning Phase</option>
                <option value="active">Active Trip</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Member Visibility</label>
              <label className="flex items-center gap-2.5 p-2.5 border border-ivory-300 rounded-xl bg-ivory-50 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isMasterAdmin}
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-royal-600 focus:ring-royal-500"
                />
                <span className="font-medium text-stone-800">
                  Publish Itinerary to Trip Members
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Trip Overview Notes</label>
            <textarea
              rows={3}
              disabled={!isMasterAdmin}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none disabled:bg-ivory-100 text-stone-900"
            />
          </div>
        </div>

        {isMasterAdmin && (
          <div className="pt-4 border-t border-ivory-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </form>

      {/* ── Demo Dataset Seeder Section ── */}
      <div className="card-premium p-6 sm:p-8 space-y-4 border-l-4 border-l-gold-500">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
              <Database className="w-5 h-5 text-gold-600" />
              Development Demo Data Seeder
            </h2>
            <p className="text-stone-500 text-xs mt-1 leading-relaxed max-w-xl">
              Populate or refresh the initial realistic demo data: Rajasthan, Delhi, and Agra
              destinations, sample day-wise itineraries, tentative hotel options, transport records,
              assignments, and announcements.
            </p>
          </div>

          <button
            onClick={() => setIsSeedConfirmOpen(true)}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-xl shadow-gold flex items-center gap-2 transition-colors shrink-0"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Seed / Reset Demo Data</span>
          </button>
        </div>

        <div className="p-3 bg-ivory-100 rounded-xl text-xs text-stone-600 space-y-1">
          <p className="font-semibold text-stone-800">Seeder Scope:</p>
          <ul className="list-disc list-inside space-y-0.5 text-stone-600">
            <li>Trip: Rajasthan – Delhi – Agra Winter Trip 2026 (Kollam Departure)</li>
            <li>3 Destinations: Rajasthan, Delhi, Agra</li>
            <li>3 Work Assignments with instructions &amp; deadlines</li>
            <li>Sample day itineraries across all three destinations</li>
            <li>Sample tentative hotel options and transport records</li>
          </ul>
        </div>
      </div>

      {/* Confirm Seeding Dialog */}
      <ConfirmDialog
        isOpen={isSeedConfirmOpen}
        onClose={() => setIsSeedConfirmOpen(false)}
        onConfirm={handleRunSeeder}
        title="Initialize Realistic Demo Dataset?"
        description="This will populate Firestore with a complete realistic Rajasthan – Delhi – Agra winter trip plan, complete with destinations, assignments, and sample days."
        confirmLabel="Seed Dataset Now"
        variant="default"
        loading={isSeeding}
      />
    </div>
  );
}
