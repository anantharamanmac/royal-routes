"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileEdit,
  Loader2,
  X,
  Send,
} from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { Assignment, AssignmentPriority, AssignmentStatus, AppUser } from "@/lib/types";
import { formatDate, fromNow } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { logActivity } from "@/lib/firebase/activityLogs";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const TRIP_ID = "demo-trip-2026";

export default function AssignmentsBoardPage() {
  const { appUser } = useAuth();
  const { destinations, loading: destLoading } = useDestinations(TRIP_ID);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Assign Modal State
  const [activeModalDest, setActiveModalDest] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assignedAdminId: "",
    title: "",
    instructions: "",
    deadlineDate: "",
    priority: "medium" as AssignmentPriority,
    status: "not_started" as AssignmentStatus,
  });

  const isMasterAdmin = appUser?.role === "master_admin";

  useEffect(() => {
    // 1. Fetch assignments
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

    // 2. Fetch admin users for dropdown
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const u = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      setAdminUsers(u.filter((x) => x.role === "destination_admin" || x.role === "master_admin"));
      setLoading(false);
    });

    return () => {
      unsubAssign();
      unsubUsers();
    };
  }, []);

  if (destLoading || loading) return <PageLoader />;

  const openAssignModal = (destId: string, current?: Assignment) => {
    const defaultTitle = `Prepare ${
      destinations.find((d) => d.id === destId)?.name || "Destination"
    } Itinerary`;
    setAssignForm({
      assignedAdminId: current?.assignedAdminId || "",
      title: current?.title || defaultTitle,
      instructions:
        current?.instructions ||
        "Research key monuments, day schedules, budget estimates, and draft 2-3 accommodation options with tentative timings.",
      deadlineDate: current?.deadline
        ? new Date(current.deadline.toDate()).toISOString().slice(0, 10)
        : "2026-11-30",
      priority: current?.priority || "medium",
      status: current?.status || "not_started",
    });
    setActiveModalDest(destId);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalDest) return;

    try {
      setIsSubmitting(true);
      const existing = assignments.find((a) => a.destinationId === activeModalDest);
      const assignmentId = existing?.id || `assign-${activeModalDest}`;
      const destName = destinations.find((d) => d.id === activeModalDest)?.name || "Destination";

      const deadlineTimestamp = assignForm.deadlineDate
        ? new Date(assignForm.deadlineDate)
        : null;

      await setDoc(
        doc(db, "assignments", assignmentId),
        {
          id: assignmentId,
          tripId: TRIP_ID,
          destinationId: activeModalDest,
          assignedAdminId: assignForm.assignedAdminId,
          title: assignForm.title,
          instructions: assignForm.instructions,
          deadline: deadlineTimestamp,
          priority: assignForm.priority,
          status: assignForm.status,
          updatedAt: serverTimestamp(),
          createdBy: appUser?.uid || "admin",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Also update destination status to match
      await updateDoc(doc(db, "destinations", activeModalDest), {
        assignedAdminId: assignForm.assignedAdminId,
        status: assignForm.status === "approved" ? "approved" : "in_progress",
        updatedAt: serverTimestamp(),
      });

      await logActivity({
        tripId: TRIP_ID,
        action: "assignment_created",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: `Updated assignment for ${destName} (Assigned to ${
          adminUsers.find((u) => u.uid === assignForm.assignedAdminId)?.displayName || "Unassigned"
        }).`,
      });

      toast.success(`Assignment for ${destName} saved successfully.`);
      setActiveModalDest(null);
    } catch {
      toast.error("Failed to update assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSubmitForReview = async (assignment: Assignment) => {
    try {
      await updateDoc(doc(db, "assignments", assignment.id), {
        status: "submitted",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await logActivity({
        tripId: TRIP_ID,
        action: "assignment_submitted",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Destination Admin",
        details: `Submitted ${assignment.title} for Master Admin review.`,
      });

      toast.success("Itinerary submitted for Master Admin review!");
    } catch {
      toast.error("Failed to submit assignment.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Workflow &amp; Delegation</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">
            Destination Assignment Board
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Assign target destinations, track preparation deadlines, and oversee itinerary readiness.
          </p>
        </div>
      </div>

      {/* ── Kanban Columns / Destination Boards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.map((dest) => {
          const assignment = assignments.find((a) => a.destinationId === dest.id);
          const assignedUser = adminUsers.find((u) => u.uid === assignment?.assignedAdminId);
          const canEditAssignment =
            isMasterAdmin || (appUser && appUser.uid === assignment?.assignedAdminId);

          return (
            <div
              key={dest.id}
              className="card-premium p-6 flex flex-col justify-between space-y-6 hover:shadow-premium-lg transition-all"
            >
              <div className="space-y-4">
                {/* Destination & Status header */}
                <div className="flex items-start justify-between gap-2 border-b border-ivory-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 block">
                      Target Area
                    </span>
                    <h2 className="font-display text-2xl font-bold text-royal-900">{dest.name}</h2>
                  </div>
                  <StatusBadge
                    status={assignment ? assignment.status : "not_started"}
                    type="assignment"
                  />
                </div>

                {/* Assignment Title & Instructions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-800 text-sm">
                    {assignment?.title || `Prepare ${dest.name} Itinerary`}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {assignment?.instructions ||
                      "Draft day-by-day sightseeing, hotel options, local transfers, and estimated ticket expenses."}
                  </p>
                </div>

                {/* Assignment Metadata */}
                <div className="bg-ivory-50 p-4 rounded-xl space-y-2.5 text-xs text-stone-600 border border-ivory-200">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Assigned Admin:</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-royal-600" />
                      {assignedUser ? assignedUser.displayName : "Unassigned"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Deadline:</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {assignment?.deadline ? formatDate(assignment.deadline) : "To be confirmed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Priority:</span>
                    <span
                      className={`font-semibold capitalize px-2 py-0.5 rounded text-[10px] ${
                        assignment?.priority === "urgent"
                          ? "bg-red-100 text-red-700"
                          : assignment?.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {assignment?.priority || "medium"}
                    </span>
                  </div>
                </div>

                {/* Revision comments if any */}
                {assignment?.reviewComment && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Revision Request
                    </span>
                    <p className="text-stone-700">{assignment.reviewComment}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-ivory-100 space-y-2">
                <Link
                  href={`/admin/itinerary-builder/${dest.id}`}
                  className="w-full py-2 px-3 bg-royal-gradient text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-premium hover:opacity-95"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Open Itinerary Builder</span>
                </Link>

                <div className="flex items-center gap-2">
                  {isMasterAdmin && (
                    <button
                      onClick={() => openAssignModal(dest.id, assignment)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-ivory-300 text-xs font-semibold text-stone-700 hover:bg-ivory-100 transition-colors text-center"
                    >
                      {assignment ? "Edit Assignment" : "Assign Admin"}
                    </button>
                  )}

                  {assignment &&
                    assignment.status !== "submitted" &&
                    assignment.status !== "approved" &&
                    assignment.status !== "published" && (
                      <button
                        onClick={() => handleDirectSubmitForReview(assignment)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit</span>
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Assign / Edit Modal ── */}
      {activeModalDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-premium-lg max-w-md w-full p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900">
                Configure Assignment:{" "}
                {destinations.find((d) => d.id === activeModalDest)?.name}
              </h2>
              <button
                onClick={() => setActiveModalDest(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Assign to Administrator *
                </label>
                <select
                  required
                  value={assignForm.assignedAdminId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, assignedAdminId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                >
                  <option value="">-- Select Administrator --</option>
                  {adminUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Scope &amp; Instructions</label>
                <textarea
                  rows={3}
                  value={assignForm.instructions}
                  onChange={(e) => setAssignForm({ ...assignForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={assignForm.deadlineDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, deadlineDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={assignForm.priority}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        priority: e.target.value as AssignmentPriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assignment Status</label>
                <select
                  value={assignForm.status}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      status: e.target.value as AssignmentStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted for Review</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="pt-3 border-t border-ivory-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalDest(null)}
                  className="px-4 py-2 border border-ivory-300 rounded-xl text-stone-600 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-royal-gradient text-white font-semibold rounded-xl hover:opacity-90 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
