"use client";

import { useEffect, useState } from "react";
import {
  Hotel as HotelIcon,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Edit,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { Hotel, BookingStatus } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

const TRIP_ID = "demo-trip-2026";

export default function HotelManagerPage() {
  const { appUser } = useAuth();
  const { destinations } = useDestinations(TRIP_ID);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDest, setFilterDest] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog
  const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    destinationId: "dest-rajasthan",
    name: "",
    address: "",
    phone: "",
    email: "",
    checkInDate: "",
    checkOutDate: "",
    roomDetails: "Deluxe Twin / Double Rooms",
    numberOfRooms: 5,
    estimatedPrice: 6500,
    actualPrice: 0,
    bookingStatus: "tbc" as BookingStatus,
    confirmationReference: "",
    cancellationPolicy: "Free cancellation up to 48 hours prior to check-in.",
    notes: "",
  });

  useEffect(() => {
    const q = query(collection(db, "hotels"), where("tripId", "==", TRIP_ID));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHotels(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hotel)));
        setLoading(false);
      },
      () => {
        // Demo fallback properties
        setHotels([
          {
            id: "hotel-demo-1",
            tripId: TRIP_ID,
            destinationId: "dest-rajasthan",
            name: "ITC Rajputana – Heritage Luxury",
            address: "Palace Road, Gopalbari, Jaipur, Rajasthan",
            checkIn: null,
            checkOut: null,
            roomDetails: "Superior Heritage Rooms",
            numberOfRooms: 6,
            estimatedPrice: 8500,
            bookingStatus: "tbc",
            confirmationReference: "",
            cancellationPolicy: "Refundable up to 72 hours prior.",
            isRecommended: true,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "hotel-demo-2",
            tripId: TRIP_ID,
            destinationId: "dest-delhi",
            name: "The Claridges New Delhi",
            address: "12 Dr APJ Abdul Kalam Road, New Delhi",
            checkIn: null,
            checkOut: null,
            roomDetails: "Classic King / Twin Rooms",
            numberOfRooms: 6,
            estimatedPrice: 9200,
            bookingStatus: "tbc",
            confirmationReference: "",
            cancellationPolicy: "Non-refundable corporate group tariff.",
            isRecommended: true,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "hotel-demo-3",
            tripId: TRIP_ID,
            destinationId: "dest-agra",
            name: "ITC Mughal, A Luxury Collection Resort",
            address: "Fatehabad Road, Tajganj, Agra, Uttar Pradesh",
            checkIn: null,
            checkOut: null,
            roomDetails: "Mughal Chambers",
            numberOfRooms: 6,
            estimatedPrice: 7800,
            bookingStatus: "tbc",
            confirmationReference: "",
            cancellationPolicy: "Free cancellation 7 days before check-in.",
            isRecommended: true,
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
    setEditingHotel(null);
    setFormData({
      destinationId: destinations[0]?.id || "dest-rajasthan",
      name: "",
      address: "",
      phone: "",
      email: "",
      checkInDate: "",
      checkOutDate: "",
      roomDetails: "Deluxe Twin / Double Rooms",
      numberOfRooms: 5,
      estimatedPrice: 7000,
      actualPrice: 0,
      bookingStatus: "tbc",
      confirmationReference: "",
      cancellationPolicy: "Free cancellation up to 48 hours prior to arrival.",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      destinationId: hotel.destinationId,
      name: hotel.name,
      address: hotel.address || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
      checkInDate: hotel.checkIn ? new Date(hotel.checkIn.toDate()).toISOString().slice(0, 10) : "",
      checkOutDate: hotel.checkOut
        ? new Date(hotel.checkOut.toDate()).toISOString().slice(0, 10)
        : "",
      roomDetails: hotel.roomDetails || "Deluxe Rooms",
      numberOfRooms: hotel.numberOfRooms || 5,
      estimatedPrice: hotel.estimatedPrice || 0,
      actualPrice: hotel.actualPrice || 0,
      bookingStatus: hotel.bookingStatus || "tbc",
      confirmationReference: hotel.confirmationReference || "",
      cancellationPolicy: hotel.cancellationPolicy || "",
      notes: hotel.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Hotel name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const checkInTimestamp = formData.checkInDate ? new Date(formData.checkInDate) : null;
      const checkOutTimestamp = formData.checkOutDate ? new Date(formData.checkOutDate) : null;

      const payload = {
        tripId: TRIP_ID,
        destinationId: formData.destinationId,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        checkIn: checkInTimestamp,
        checkOut: checkOutTimestamp,
        roomDetails: formData.roomDetails,
        numberOfRooms: Number(formData.numberOfRooms) || 1,
        estimatedPrice: Number(formData.estimatedPrice) || 0,
        actualPrice: Number(formData.actualPrice) || 0,
        bookingStatus: formData.bookingStatus,
        confirmationReference: formData.confirmationReference.trim(),
        cancellationPolicy: formData.cancellationPolicy.trim(),
        notes: formData.notes.trim(),
        isRecommended: true,
        updatedAt: serverTimestamp(),
      };

      if (editingHotel) {
        await updateDoc(doc(db, "hotels", editingHotel.id), payload);
        toast.success("Hotel booking updated successfully.");
      } else {
        await addDoc(collection(db, "hotels"), {
          ...payload,
          createdBy: appUser?.uid || "admin",
          createdAt: serverTimestamp(),
        });
        toast.success("Hotel accommodation record added.");
      }

      setIsModalOpen(false);
    } catch {
      toast.error("Failed to save hotel details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    try {
      await deleteDoc(doc(db, "hotels", hotelToDelete.id));
      toast.success("Hotel record removed.");
      setHotelToDelete(null);
    } catch {
      toast.error("Failed to delete hotel.");
    }
  };

  // Filter list
  const filteredHotels = hotels.filter((h) => {
    if (filterDest !== "all" && h.destinationId !== filterDest) return false;
    if (filterStatus !== "all" && h.bookingStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <HotelIcon className="w-3.5 h-3.5" />
            <span>Accommodation &amp; Stays</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">Hotel &amp; Booking Manager</h1>
          <p className="text-stone-500 text-sm mt-1">
            Maintain property reservations, tariffs, room allocations, and check-in schedules.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hotel Property</span>
        </button>
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterDest}
          onChange={(e) => setFilterDest(e.target.value)}
          className="px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:ring-2 focus:ring-royal-500 focus:outline-none"
        >
          <option value="all">All Destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:ring-2 focus:ring-royal-500 focus:outline-none"
        >
          <option value="all">All Booking Statuses</option>
          <option value="tbc">To be confirmed</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="not_required">Not Required</option>
        </select>
      </div>

      {/* ── Hotel Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((h) => {
          const destName = destinations.find((d) => d.id === h.destinationId)?.name || "Rajasthan";

          return (
            <div
              key={h.id}
              className="card-premium p-6 flex flex-col justify-between space-y-4 hover:shadow-premium-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-royal-700 bg-royal-50 px-2 py-0.5 rounded-full border border-royal-200">
                    {destName}
                  </span>
                  <StatusBadge status={h.bookingStatus} type="booking" />
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-royal-950">{h.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="line-clamp-1">{h.address || "Address to be confirmed"}</span>
                  </p>
                </div>

                <div className="bg-ivory-50 p-3 rounded-xl border border-ivory-200 text-xs space-y-1.5 text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Check In:</span>
                    <span className="font-medium text-stone-800">
                      {h.checkIn ? formatDate(h.checkIn) : "To be confirmed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Check Out:</span>
                    <span className="font-medium text-stone-800">
                      {h.checkOut ? formatDate(h.checkOut) : "To be confirmed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Rooms:</span>
                    <span className="font-medium text-stone-800">
                      {h.numberOfRooms} Rooms ({h.roomDetails || "Twin/Double"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Estimated Price:</span>
                    <span className="font-semibold text-royal-800">
                      {h.estimatedPrice ? formatCurrency(h.estimatedPrice) : "TBC"}
                    </span>
                  </div>
                </div>

                {h.confirmationReference ? (
                  <div className="p-2 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-mono">
                    Ref: {h.confirmationReference}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">
                    Booking reference to be entered upon final voucher receipt.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-ivory-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(h)}
                  className="p-2 text-stone-600 hover:text-royal-700 hover:bg-ivory-100 rounded-lg transition-colors"
                  title="Edit Hotel"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHotelToDelete(h)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Hotel"
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
                {editingHotel ? "Update Accommodation" : "Add Hotel Property"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Destination *</label>
                  <select
                    value={formData.destinationId}
                    onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
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
                <label className="block font-semibold text-stone-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITC Rajputana, Jaipur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Palace Road, Jaipur"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Check In Date</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Check Out Date</label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.numberOfRooms}
                    onChange={(e) => setFormData({ ...formData, numberOfRooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimated Cost (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Room Categories / Details</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Deluxe Double Bed Rooms with Breakfast"
                  value={formData.roomDetails}
                  onChange={(e) => setFormData({ ...formData, roomDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Confirmed Voucher / PNR Reference (Only when verified)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty or TBC until actual booking receipt is uploaded"
                  value={formData.confirmationReference}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmationReference: e.target.value })
                  }
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
                  <span>Save Property</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!hotelToDelete}
        onClose={() => setHotelToDelete(null)}
        onConfirm={handleDeleteHotel}
        title="Remove Hotel Property?"
        description={`Are you sure you want to remove ${hotelToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
