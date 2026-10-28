"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Eye,
  FileCheck,
  Send,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { Assignment, ItineraryDay, AppUser } from "@/lib/types";
import { formatDate, fromNow } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { logActivity } from "@/lib/firebase/activityLogs";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

const TRIP_ID = "demo-trip-2026";

export default function ApprovalCenterPage() {
  const { appUser } = useAuth();
  const { destinations } = useDestinations(TRIP_ID);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [filterTab, setFilterTab] = useState<"pending" | "approved" | "changes_requested" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);

  // Request Changes Modal
  const [activeRequestAssignment, setActiveRequestAssignment] = useState<Assignment | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Listen to assignments
    const qAssign = query(collection(db, "assignments"), where("tripId", "==", TRIP_ID));
    const unsubAssign = onSnapshot(
      qAssign,
      (snap) => {
        setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment)));
      },
      () => {
        setAssignments([]);
      }
    );

    // 2. Fetch admin users for names
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setAdminUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser)));
    });

    // 3. Fetch days to show day count
    const qDays = query(collection(db, "itineraryDays"), where("tripId", "==", TRIP_ID));
    const unsubDays = onSnapshot(qDays, (snap) => {
      setDays(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryDay)));
      setLoading(false);
    });

    return () => {
      unsubAssign();
      unsubUsers();
      unsubDays();
    };
  }, []);

  if (loading) return <PageLoader />;

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    if (filterTab === "pending") return a.status === "submitted";
    if (filterTab === "approved") return a.status === "approved" || a.status === "published";
    if (filterTab === "changes_requested") return a.status === "changes_requested";
    return true;
  });

  const handleApprove = async (assignment: Assignment) => {
    try {
      // 1. Update assignment status
      await updateDoc(doc(db, "assignments", assignment.id), {
        status: "approved",
        reviewedBy: appUser?.uid || "admin",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Update destination status
      await updateDoc(doc(db, "destinations", assignment.destinationId), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      // 3. Update all days for this destination to approved
      const destDays = days.filter((d) => d.destinationId === assignment.destinationId);
      for (const day of destDays) {
        await updateDoc(doc(db, "itineraryDays", day.id), {
          status: "approved",
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Log activity
      await logActivity({
        tripId: TRIP_ID,
        action: "assignment_approved",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: `Approved itinerary for ${
          destinations.find((d) => d.id === assignment.destinationId)?.name || "Destination"
        }.`,
      });

      // 5. Notify assigned admin
      if (assignment.assignedAdminId) {
        await addDoc(collection(db, "notifications"), {
          userId: assignment.assignedAdminId,
          tripId: TRIP_ID,
          type: "itinerary_approved",
          title: "Itinerary Approved!",
          message: `Your submitted itinerary for ${assignment.title} has been officially approved by the Master Admin.`,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Itinerary approved successfully!");
    } catch {
      toast.error("Failed to approve itinerary.");
    }
  };

  const handlePublish = async (assignment: Assignment) => {
    try {
      // 1. Update assignment
      await updateDoc(doc(db, "assignments", assignment.id), {
        status: "published",
        updatedAt: serverTimestamp(),
      });

      // 2. Update destination
      await updateDoc(doc(db, "destinations", assignment.destinationId), {
        status: "published",
        updatedAt: serverTimestamp(),
      });

      // 3. Update days to published
      const destDays = days.filter((d) => d.destinationId === assignment.destinationId);
      for (const day of destDays) {
        await updateDoc(doc(db, "itineraryDays", day.id), {
          status: "published",
          updatedAt: serverTimestamp(),
        });
      }

      const destName =
        destinations.find((d) => d.id === assignment.destinationId)?.name || "Destination";

      // 4. Post announcement for members
      await addDoc(collection(db, "announcements"), {
        tripId: TRIP_ID,
        title: `${destName} Itinerary Is Now Published!`,
        body: `The verified itinerary for ${destName} has been approved and published. Check the Master Itinerary view for day-by-day schedules.`,
        isImportant: true,
        authorId: appUser?.uid || "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Log activity
      await logActivity({
        tripId: TRIP_ID,
        action: "trip_published",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: `Published final member itinerary for ${destName}.`,
      });

      toast.success(`${destName} itinerary published for all members!`);
    } catch {
      toast.error("Failed to publish itinerary.");
    }
  };

  const handleRequestChangesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestAssignment || !commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, "assignments", activeRequestAssignment.id), {
        status: "changes_requested",
        reviewComment: commentText.trim(),
        reviewedBy: appUser?.uid || "admin",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify admin
      if (activeRequestAssignment.assignedAdminId) {
        await addDoc(collection(db, "notifications"), {
          userId: activeRequestAssignment.assignedAdminId,
          tripId: TRIP_ID,
          type: "changes_requested",
          title: "Revision Requested on Itinerary",
          message: `The Master Admin has requested adjustments on ${activeRequestAssignment.title}: "${commentText.trim()}"`,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      await logActivity({
        tripId: TRIP_ID,
        action: "assignment_rejected",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: `Requested revisions on ${activeRequestAssignment.title}.`,
      });

      toast.success("Revision comments transmitted to destination admin.");
      setActiveRequestAssignment(null);
      setCommentText("");
    } catch {
      toast.error("Failed to submit revision request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Editorial Review &amp; Quality Control</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">Approval Center</h1>
          <p className="text-stone-500 text-sm mt-1">
            Review submitted destination schedules, verify transfer buffers, request revisions, and
            publish final itineraries.
          </p>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 border-b border-ivory-200 pb-2">
        {[
          { key: "pending", label: "Pending Review", count: assignments.filter((a) => a.status === "submitted").length },
          { key: "approved", label: "Approved & Live", count: assignments.filter((a) => a.status === "approved" || a.status === "published").length },
          { key: "changes_requested", label: "Changes Requested", count: assignments.filter((a) => a.status === "changes_requested").length },
          { key: "all", label: "All Submissions", count: assignments.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as typeof filterTab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              filterTab === tab.key
                ? "bg-royal-gradient text-white shadow-premium"
                : "bg-white border border-ivory-200 text-stone-600 hover:bg-ivory-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filterTab === tab.key ? "bg-white/20 text-white" : "bg-ivory-200 text-stone-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Submissions List ── */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-6">
          {filteredAssignments.map((assignment) => {
            const dest = destinations.find((d) => d.id === assignment.destinationId);
            const adminUser = adminUsers.find((u) => u.uid === assignment.assignedAdminId);
            const destDays = days.filter((d) => d.destinationId === assignment.destinationId);

            return (
              <div
                key={assignment.id}
                className="card-premium p-6 space-y-6 hover:shadow-premium-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                        {dest?.name || "Destination"}
                      </span>
                      <StatusBadge status={assignment.status} type="assignment" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-royal-950">
                      {assignment.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/itinerary-builder/${assignment.destinationId}`}
                      className="px-3.5 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-stone-700 hover:bg-ivory-100 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Itinerary</span>
                    </Link>

                    {assignment.status === "submitted" && (
                      <>
                        <button
                          onClick={() => {
                            setActiveRequestAssignment(assignment);
                            setCommentText(assignment.reviewComment || "");
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Request Changes</span>
                        </button>

                        <button
                          onClick={() => handleApprove(assignment)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Itinerary</span>
                        </button>
                      </>
                    )}

                    {assignment.status === "approved" && (
                      <button
                        onClick={() => handlePublish(assignment)}
                        className="px-4 py-2 bg-royal-gradient text-white text-xs font-semibold rounded-xl shadow-premium flex items-center gap-1.5 hover:opacity-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                        <span>Publish to Members</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-600 bg-ivory-50 p-4 rounded-xl border border-ivory-200">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Submitted By</span>
                    <span className="font-semibold text-stone-800">
                      {adminUser?.displayName || "Destination Admin"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Submission Date</span>
                    <span className="font-medium text-stone-800">
                      {assignment.submittedAt ? formatDate(assignment.submittedAt) : "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Planned Days</span>
                    <span className="font-semibold text-royal-700">
                      {destDays.length} Days Drafted
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Priority</span>
                    <span className="font-medium capitalize">{assignment.priority}</span>
                  </div>
                </div>

                {/* Scope & Revision Comments */}
                <div className="space-y-2 text-xs">
                  <p className="text-stone-500">
                    <strong className="text-stone-700">Scope Instructions: </strong>
                    {assignment.instructions}
                  </p>

                  {assignment.reviewComment && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <span className="font-bold text-amber-800 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Feedback / Change Notes:
                      </span>
                      <p className="text-stone-700">{assignment.reviewComment}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-stone-400" />}
          title="No Submissions in this Tab"
          description="Destination admins will submit their day-by-day itineraries here for quality assurance."
        />
      )}

      {/* ── Request Changes Modal ── */}
      {activeRequestAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-premium-lg max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900">
                Request Changes: {activeRequestAssignment.title}
              </h2>
              <button
                onClick={() => setActiveRequestAssignment(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestChangesSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Specific Revision Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Please increase the transfer buffer between Amber Fort and City Palace to 45 mins. Also verify ticket pricing."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ivory-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRequestAssignment(null)}
                  className="px-4 py-2 border border-ivory-300 rounded-xl text-stone-600 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Transmit Revision Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
