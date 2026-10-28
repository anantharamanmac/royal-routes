"use client";

import { useEffect, useState } from "react";
import {
  Train,
  Bus,
  Car,
  Plane,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { TransportBooking, TransportType, BookingStatus } from "@/lib/types";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

const TRIP_ID = "demo-trip-2026";

const TYPE_ICONS: Record<TransportType, React.ElementType> = {
  train: Train,
  bus: Bus,
  taxi: Car,
  auto: Car,
  flight: Plane,
  metro: Train,
  other: Car,
};

export default function TransportManagerPage() {
  const { appUser } = useAuth();
  const [transports, setTransports] = useState<TransportBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filterType, setFilterType] = useState<string>("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TransportBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog
  const [itemToDelete, setItemToDelete] = useState<TransportBooking | null>(null);

  // Form
  const [formData, setFormData] = useState({
    type: "train" as TransportType,
    title: "",
    departureLocation: "",
    arrivalLocation: "",
    scheduledDeparture: "",
    scheduledArrival: "",
    provider: "Indian Railways",
    trainNumber: "",
    pnrNumber: "",
    estimatedCost: 15000,
    actualCost: 0,
    bookingStatus: "tbc" as BookingStatus,
    seatDetails: "",
    notes: "",
  });

  useEffect(() => {
    const q = query(collection(db, "transportBookings"), where("tripId", "==", TRIP_ID));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTransports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransportBooking)));
        setLoading(false);
      },
      () => {
        // Fallback demo transport
        setTransports([
          {
            id: "trans-demo-1",
            tripId: TRIP_ID,
            type: "train",
            title: "Outbound Rajdhani Express Service",
            provider: "Indian Railways",
            trainNumber: "To be confirmed",
            pnrNumber: "To be confirmed",
            departureLocation: "Kollam Junction (QLN), Kerala",
            arrivalLocation: "North India (Delhi / Rajasthan Station TBC)",
            scheduledDeparture: null,
            scheduledArrival: null,
            estimatedCost: 24000,
            bookingStatus: "tbc",
            seatDetails: "3-Tier AC / 2-Tier AC (Group Reservation)",
            notes: "Official booking opens 120 days prior to 24 Dec 2026 departure date.",
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "trans-demo-2",
            tripId: TRIP_ID,
            type: "bus",
            title: "Dedicated Air-Conditioned Coach for Golden Triangle",
            provider: "Private Heritage Coach Line",
            departureLocation: "Jaipur / Rajasthan Hub",
            arrivalLocation: "Delhi & Agra Sightseeing Circuit",
            scheduledDeparture: null,
            scheduledArrival: null,
            estimatedCost: 35000,
            bookingStatus: "tbc",
            seatDetails: "27-Seater Luxury AC Coach with Luggage Carrier",
            notes: "Tentative quotation gathered; pending Master Admin final vehicle inspection.",
            createdBy: "admin",
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

  const openAddModal = () => {
    setEditingTransport(null);
    setFormData({
      type: "train",
      title: "",
      departureLocation: "",
      arrivalLocation: "",
      scheduledDeparture: "",
      scheduledArrival: "",
      provider: "Indian Railways",
      trainNumber: "",
      pnrNumber: "",
      estimatedCost: 5000,
      actualCost: 0,
      bookingStatus: "tbc",
      seatDetails: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: TransportBooking) => {
    setEditingTransport(t);
    setFormData({
      type: t.type,
      title: t.title,
      departureLocation: t.departureLocation,
      arrivalLocation: t.arrivalLocation,
      scheduledDeparture: t.scheduledDeparture
        ? new Date(t.scheduledDeparture.toDate()).toISOString().slice(0, 16)
        : "",
      scheduledArrival: t.scheduledArrival
        ? new Date(t.scheduledArrival.toDate()).toISOString().slice(0, 16)
        : "",
      provider: t.provider || "",
      trainNumber: t.trainNumber || "",
      pnrNumber: t.pnrNumber || "",
      estimatedCost: t.estimatedCost || 0,
      actualCost: t.actualCost || 0,
      bookingStatus: t.bookingStatus,
      seatDetails: t.seatDetails || "",
      notes: t.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.departureLocation.trim() || !formData.arrivalLocation.trim()) {
      toast.error("Please fill in the title and route locations.");
      return;
    }

    try {
      setIsSubmitting(true);
      const depTimestamp = formData.scheduledDeparture
        ? Timestamp.fromDate(new Date(formData.scheduledDeparture))
        : null;
      const arrTimestamp = formData.scheduledArrival
        ? Timestamp.fromDate(new Date(formData.scheduledArrival))
        : null;

      const payload = {
        tripId: TRIP_ID,
        type: formData.type,
        title: formData.title.trim(),
        departureLocation: formData.departureLocation.trim(),
        arrivalLocation: formData.arrivalLocation.trim(),
        scheduledDeparture: depTimestamp,
        scheduledArrival: arrTimestamp,
        provider: formData.provider.trim(),
        trainNumber: formData.trainNumber.trim() || "To be confirmed",
        pnrNumber: formData.pnrNumber.trim() || "To be confirmed",
        estimatedCost: Number(formData.estimatedCost) || 0,
        actualCost: Number(formData.actualCost) || 0,
        bookingStatus: formData.bookingStatus,
        seatDetails: formData.seatDetails.trim(),
        notes: formData.notes.trim(),
        updatedAt: serverTimestamp(),
      };

      if (editingTransport) {
        await setDoc(
          doc(db, "transportBookings", editingTransport.id),
          {
            ...payload,
            createdBy: editingTransport.createdBy || appUser?.uid || "admin",
            createdAt: editingTransport.createdAt || serverTimestamp(),
          },
          { merge: true }
        );
        toast.success("Transport record updated successfully.");
      } else {
        await addDoc(collection(db, "transportBookings"), {
          ...payload,
          createdBy: appUser?.uid || "admin",
          createdAt: serverTimestamp(),
        });
        toast.success("Transport booking added to schedule.");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save transport details:", err);
      const msg = err instanceof Error ? err.message : "Failed to save transport details.";
      toast.error(`Save failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "transportBookings", itemToDelete.id));
      toast.success("Transport record deleted.");
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete transport record.");
    }
  };

  const filteredTransports = transports.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <Train className="w-3.5 h-3.5" />
            <span>Transit &amp; Conveyance</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">Transport Manager</h1>
          <p className="text-stone-500 text-sm mt-1">
            Log train connections, dedicated luxury coaches, station transfers, and verified ticket
            statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transit Service</span>
        </button>
      </div>

      {/* ── Type Filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "train", "bus", "taxi", "flight"].map((tp) => (
          <button
            key={tp}
            onClick={() => setFilterType(tp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterType === tp
                ? "bg-royal-gradient text-white shadow-premium"
                : "bg-white border border-ivory-200 text-stone-600 hover:bg-ivory-50"
            }`}
          >
            {tp === "all" ? "All Services" : tp}
          </button>
        ))}
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTransports.map((t) => {
          const Icon = TYPE_ICONS[t.type] || Train;

          return (
            <div
              key={t.id}
              className="card-premium p-6 flex flex-col justify-between space-y-4 hover:shadow-premium-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-royal-50 text-royal-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-royal-700 block">
                        {t.type} Service
                      </span>
                      <h3 className="font-display text-lg font-bold text-royal-950">{t.title}</h3>
                    </div>
                  </div>
                  <StatusBadge status={t.bookingStatus} type="booking" />
                </div>

                {/* Route */}
                <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-stone-800 font-semibold">
                    <span>{t.departureLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t.arrivalLocation}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px] pt-1">
                    <span>
                      Departure:{" "}
                      {t.scheduledDeparture ? formatDateTime(t.scheduledDeparture) : "To be confirmed"}
                    </span>
                  </div>
                </div>

                {/* Operational Details */}
                <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Service / Train No.</span>
                    <span className="font-medium text-stone-800">
                      {t.trainNumber || "To be confirmed"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">PNR / Ref Code</span>
                    <span className="font-medium text-stone-800">
                      {t.pnrNumber || "To be confirmed"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Estimated Tariff</span>
                    <span className="font-semibold text-royal-800">
                      {t.estimatedCost ? formatCurrency(t.estimatedCost) : "TBC"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Seat / Coach Allocation</span>
                    <span className="font-medium text-stone-800">{t.seatDetails || "TBC"}</span>
                  </div>
                </div>

                {t.notes && <p className="text-xs text-stone-500 italic">Note: {t.notes}</p>}
              </div>

              <div className="pt-3 border-t border-ivory-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2 text-stone-600 hover:text-royal-700 hover:bg-ivory-100 rounded-lg transition-colors"
                  title="Edit Transit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setItemToDelete(t)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Transit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-premium-lg max-w-lg w-full p-6 space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900">
                {editingTransport ? "Update Transit Service" : "Add Transit Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Transit Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TransportType })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    <option value="train">Train</option>
                    <option value="bus">Bus / Coach</option>
                    <option value="taxi">Taxi / Van</option>
                    <option value="metro">Metro</option>
                    <option value="flight">Flight</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Booking Status</label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingStatus: e.target.value as BookingStatus })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    <option value="tbc">To be confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajdhani Express Outbound"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Departure Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kollam Junction (QLN)"
                    value={formData.departureLocation}
                    onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Arrival Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hazrat Nizamuddin, Delhi"
                    value={formData.arrivalLocation}
                    onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Scheduled Departure Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDeparture}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDeparture: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Scheduled Arrival Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledArrival}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledArrival: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Train / Service Number (When Verified)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty or TBC"
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    PNR / Ticket Ref (When Verified)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty or TBC"
                    value={formData.pnrNumber}
                    onChange={(e) => setFormData({ ...formData, pnrNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Estimated Total Cost (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Additional logistics notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ivory-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>Save Transit Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Transit Record?"
        description={`Are you sure you want to remove ${itemToDelete?.title}?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
