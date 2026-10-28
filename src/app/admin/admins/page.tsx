"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";
import { collection, query, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { AppUser, UserRole } from "@/lib/types";
import { logActivity } from "@/lib/firebase/activityLogs";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const TRIP_ID = "demo-trip-2026";

export default function AdminsManagementPage() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "destination_admin" as UserRole,
    assignedDestinationIds: [] as string[],
  });

  // Toggle status dialog state
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<AppUser | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const u = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
        setUsers(u);
        setLoading(false);
      },
      () => {
        // Fallback demo users if collection has no docs
        setUsers([
          {
            uid: "master-admin-1",
            displayName: "Rajesh Sharma (Master Admin)",
            email: "organizer@royalroutes.com",
            role: "master_admin",
            assignedDestinationIds: ["dest-rajasthan", "dest-delhi", "dest-agra"],
            tripIds: [TRIP_ID],
            status: "active",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            uid: "dest-admin-raj",
            displayName: "Pooja Rathore (Rajasthan Admin)",
            email: "rajasthan@royalroutes.com",
            role: "destination_admin",
            assignedDestinationIds: ["dest-rajasthan"],
            tripIds: [TRIP_ID],
            status: "active",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            uid: "dest-admin-delhi",
            displayName: "Amit Verma (Delhi Admin)",
            email: "delhi@royalroutes.com",
            role: "destination_admin",
            assignedDestinationIds: ["dest-delhi"],
            tripIds: [TRIP_ID],
            status: "active",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            uid: "dest-admin-agra",
            displayName: "Sunita Khan (Agra Admin)",
            email: "agra@royalroutes.com",
            role: "destination_admin",
            assignedDestinationIds: ["dest-agra"],
            tripIds: [TRIP_ID],
            status: "active",
            createdAt: null as never,
            updatedAt: null as never,
          },
        ]);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  if (loading) return <PageLoader />;

  // Only Master Admin can manage administrators
  if (appUser && appUser.role !== "master_admin") {
    return (
      <div className="card-premium p-12 text-center space-y-4 max-w-md mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-display text-xl font-bold text-stone-900">Restricted Access</h2>
        <p className="text-stone-500 text-xs leading-relaxed">
          Only the authorized Master Admin can appoint other administrators or modify role assignments.
        </p>
      </div>
    );
  }

  const handleDestinationCheckbox = (destId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedDestinationIds.includes(destId);
      return {
        ...prev,
        assignedDestinationIds: exists
          ? prev.assignedDestinationIds.filter((id) => id !== destId)
          : [...prev.assignedDestinationIds, destId],
      };
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Create user with Firebase Auth secondary instance or directly
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUid = cred.user.uid;

      // Create doc in Firestore
      await setDoc(doc(db, "users", newUid), {
        uid: newUid,
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        assignedDestinationIds: formData.assignedDestinationIds,
        tripIds: [TRIP_ID],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Audit log
      await logActivity({
        tripId: TRIP_ID,
        action: "admin_invited",
        performedBy: appUser?.uid || "admin",
        performedByName: appUser?.displayName || "Master Admin",
        details: `Created admin account for ${formData.displayName} (${formData.role}).`,
      });

      toast.success(`Administrator ${formData.displayName} created successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        displayName: "",
        email: "",
        password: "",
        role: "destination_admin",
        assignedDestinationIds: [],
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create administrator account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!selectedUserForStatus) return;
    try {
      const newStatus = selectedUserForStatus.status === "active" ? "disabled" : "active";
      await updateDoc(doc(db, "users", selectedUserForStatus.uid), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(
        `User account ${newStatus === "active" ? "re-activated" : "disabled"} successfully.`
      );
      setSelectedUserForStatus(null);
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Access Control &amp; Privileges</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">Administrator Directory</h1>
          <p className="text-stone-500 text-sm mt-1">
            Delegate destination responsibilities, control access, and review admin permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* ── Users Table ── */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-ivory-100 text-stone-500 uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Assigned Destinations</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-stone-900 text-sm">{u.displayName}</div>
                    <div className="text-stone-400 text-xs flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`badge ${
                        u.role === "master_admin"
                          ? "bg-gold-50 text-gold-800 border-gold-300"
                          : u.role === "destination_admin"
                          ? "bg-royal-50 text-royal-700 border-royal-200"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {u.role === "master_admin"
                        ? "Master Admin"
                        : u.role === "destination_admin"
                        ? "Destination Admin"
                        : "Viewer"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {u.role === "master_admin" ? (
                        <span className="text-[11px] text-stone-600 font-medium italic">
                          All Destinations (Full Scope)
                        </span>
                      ) : u.assignedDestinationIds?.length > 0 ? (
                        u.assignedDestinationIds.map((id) => (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded bg-ivory-100 border border-ivory-200 text-[11px] text-stone-700 capitalize"
                          >
                            {id.replace("dest-", "")}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">None assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        u.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {u.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Disabled
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== "master_admin" && (
                      <button
                        onClick={() => setSelectedUserForStatus(u)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          u.status === "active"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.status === "active" ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Administrator Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-premium-lg max-w-md w-full p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900">
                Provision Administrator
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Rathore"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@royalroutes.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Role Assignment *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                >
                  <option value="destination_admin">Destination Admin</option>
                  <option value="master_admin">Master Admin</option>
                  <option value="viewer">Trip Member / Viewer</option>
                </select>
              </div>

              {formData.role === "destination_admin" && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-2">
                    Authorized Destinations *
                  </label>
                  <div className="space-y-2 bg-ivory-50 p-3 rounded-xl border border-ivory-200">
                    {[
                      { id: "dest-rajasthan", label: "Rajasthan (Jaipur & Forts)" },
                      { id: "dest-delhi", label: "Delhi (Mughal & Capital Heritage)" },
                      { id: "dest-agra", label: "Agra (Taj Mahal & Citadel)" },
                    ].map((dest) => (
                      <label key={dest.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedDestinationIds.includes(dest.id)}
                          onChange={() => handleDestinationCheckbox(dest.id)}
                          className="rounded text-royal-600 focus:ring-royal-500"
                        />
                        <span className="text-stone-800">{dest.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-ivory-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  <span>Save Administrator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status Toggle Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={!!selectedUserForStatus}
        onClose={() => setSelectedUserForStatus(null)}
        onConfirm={toggleUserStatus}
        title={
          selectedUserForStatus?.status === "active"
            ? "Disable Administrator Account?"
            : "Re-activate Account?"
        }
        description={`Are you sure you want to ${
          selectedUserForStatus?.status === "active" ? "disable" : "activate"
        } access for ${selectedUserForStatus?.displayName}?`}
        confirmLabel={selectedUserForStatus?.status === "active" ? "Disable" : "Activate"}
        variant={selectedUserForStatus?.status === "active" ? "danger" : "default"}
      />
    </div>
  );
}
