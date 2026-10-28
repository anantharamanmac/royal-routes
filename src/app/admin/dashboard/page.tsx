"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Hotel,
  Train,
  Sparkles,
} from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/lib/hooks/useTrip";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { useAssignments } from "@/lib/hooks/useAssignments";
import { ActivityLog, Assignment, AppUser } from "@/lib/types";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, fromNow, daysUntil } from "@/lib/utils";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

export default function AdminDashboardPage() {
  const { appUser } = useAuth();
  const { trip, loading: tripLoading } = useTrip(TRIP_ID);
  const { destinations, loading: destLoading } = useDestinations(TRIP_ID);
  const { assignments, loading: assignLoading } = useAssignments(TRIP_ID);

  const [adminsCount, setAdminsCount] = useState<number>(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isMasterAdmin = appUser?.role === "master_admin";

  useEffect(() => {
    // 1. Fetch Admin Users Count
    const qUsers = query(collection(db, "users"), where("role", "in", ["master_admin", "destination_admin"]));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setAdminsCount(snap.size || 3); // Fallback to 3 if starting fresh
    });

    // 2. Fetch Activity Logs
    const qLogs = query(
      collection(db, "activityLogs"),
      where("tripId", "==", TRIP_ID),
      orderBy("createdAt", "desc"),
      limit(8)
    );
    const unsubLogs = onSnapshot(
      qLogs,
      (snap) => {
        setActivityLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog)));
        setLoading(false);
      },
      () => {
        // Sample fallback activity if collection empty
        setActivityLogs([
          {
            id: "log-1",
            tripId: TRIP_ID,
            action: "trip_created",
            performedBy: "admin",
            performedByName: "Master Admin",
            details: "Created Royal Routes Winter 2026 initial trip setup.",
            createdAt: null as never,
          },
          {
            id: "log-2",
            tripId: TRIP_ID,
            action: "destination_added",
            performedBy: "admin",
            performedByName: "Master Admin",
            details: "Added Rajasthan, Delhi, and Agra destination boards.",
            createdAt: null as never,
          },
        ]);
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  if (tripLoading || destLoading || assignLoading || loading) return <PageLoader />;

  // Computed metrics
  const submittedCount = assignments.filter((a) => a.status === "submitted").length;
  const approvedCount = assignments.filter((a) => a.status === "approved" || a.status === "published").length;
  const inProgressCount = assignments.filter((a) => a.status === "in_progress" || a.status === "not_started").length;

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isMasterAdmin ? "Master Control Panel" : "Destination Admin Workspace"}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">
            Welcome back, {appUser?.displayName || "Admin"}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Tracking trip operations, destination itineraries, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/assignments"
            className="px-4 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Assignments Board</span>
          </Link>
          {isMasterAdmin && (
            <Link
              href="/admin/approval-center"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-xl shadow-gold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Submissions ({submittedCount})</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Destinations
          </span>
          <p className="font-display text-2xl font-bold text-royal-900">{destinations.length || 3}</p>
          <span className="text-[11px] text-stone-500">Rajasthan, Delhi, Agra</span>
        </div>

        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Admin Team
          </span>
          <p className="font-display text-2xl font-bold text-royal-900">{adminsCount || 4}</p>
          <span className="text-[11px] text-stone-500">Active accounts</span>
        </div>

        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            In Progress
          </span>
          <p className="font-display text-2xl font-bold text-blue-600">{inProgressCount}</p>
          <span className="text-[11px] text-stone-500">Drafting schedules</span>
        </div>

        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Needs Review
          </span>
          <p className="font-display text-2xl font-bold text-amber-600">{submittedCount}</p>
          <span className="text-[11px] text-stone-500">Awaiting sign-off</span>
        </div>

        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Approved
          </span>
          <p className="font-display text-2xl font-bold text-emerald-600">{approvedCount}</p>
          <span className="text-[11px] text-stone-500">Ready or Published</span>
        </div>

        <div className="card-premium p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Departure In
          </span>
          <p className="font-display text-2xl font-bold text-royal-800">
            {trip?.startDate ? daysUntil(trip.startDate) : "Dec 2026"}
          </p>
          <span className="text-[11px] text-stone-500">Kollam Junction</span>
        </div>
      </div>

      {/* ── Destination Assignment Cards ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-royal-950">Destination Status Overview</h2>
          <Link
            href="/admin/assignments"
            className="text-xs font-semibold text-royal-700 hover:text-royal-900 inline-flex items-center gap-1"
          >
            <span>Manage All Assignments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const assignment = assignments.find((a) => a.destinationId === dest.id);
            return (
              <div
                key={dest.id}
                className="card-premium p-6 space-y-4 flex flex-col justify-between hover:border-royal-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-bold text-royal-900">{dest.name}</span>
                    <StatusBadge
                      status={assignment ? assignment.status : dest.status}
                      type="assignment"
                    />
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {assignment?.instructions ||
                      "Research attractions, coordinate hotel bookings, train transfers, and day schedules."}
                  </p>
                  <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-ivory-100">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Deadline:</span>
                      <span className="font-medium">
                        {assignment?.deadline ? formatDate(assignment.deadline) : "To be confirmed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Priority:</span>
                      <span className="font-medium capitalize">{assignment?.priority || "medium"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-ivory-100 flex items-center justify-between">
                  <Link
                    href={`/admin/itinerary-builder/${dest.id}`}
                    className="text-xs font-bold text-royal-700 hover:text-royal-900 inline-flex items-center gap-1"
                  >
                    <span>Open Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/destinations/${dest.name.toLowerCase()}`}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Operational Grid: Recent Activity & Quick Tools ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Audit & Activity Feed */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
            <Clock className="w-5 h-5 text-royal-700" />
            Recent Activity &amp; Audit Log
          </h2>

          <div className="card-premium divide-y divide-ivory-100 overflow-hidden">
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-3.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-royal-50 text-royal-700 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold text-stone-800">
                      {log.performedByName || "Admin"} ·{" "}
                      <span className="font-normal text-stone-500">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </p>
                    <p className="text-stone-600">{log.details || "Updated itinerary record."}</p>
                  </div>
                  <span className="text-[11px] text-stone-400 shrink-0">
                    {fromNow(log.createdAt) || "Just now"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-stone-400 text-xs">
                No recent activity records found.
              </div>
            )}
          </div>
        </section>

        {/* Quick Manager Shortcuts */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-royal-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-600" />
            Admin Operations
          </h2>

          <div className="card-premium p-5 space-y-3">
            <Link
              href="/admin/hotels"
              className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 hover:bg-ivory-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Hotel className="w-4 h-4 text-royal-700" />
                <span className="text-xs font-semibold text-stone-800">Manage Hotels &amp; Stays</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <Link
              href="/admin/transport"
              className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 hover:bg-ivory-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-royal-700" />
                <span className="text-xs font-semibold text-stone-800">Transport &amp; Trains</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <Link
              href="/admin/budget"
              className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 hover:bg-ivory-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-royal-700" />
                <span className="text-xs font-semibold text-stone-800">Trip Budget Manager</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            {isMasterAdmin && (
              <Link
                href="/admin/admins"
                className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 hover:bg-ivory-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-royal-700" />
                  <span className="text-xs font-semibold text-stone-800">Admin Permissions &amp; Roles</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
