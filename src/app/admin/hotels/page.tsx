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
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { Hotel, BookingStatus } from "@/lib/types";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

const TRIP_ID = "demo-trip-2026";

const DEFAULT_DESTINATIONS = [
  { id: "dest-rajasthan", name: "Rajasthan (Jaipur Hub)" },
  { id: "dest-delhi", name: "Delhi (Imperial Capital)" },
  { id: "dest-agra", name: "Agra (Taj Mahal Hub)" },
];

function parseDateInput(val: any): string {
  if (!val) return "";
  try {
    let d: Date;
    if (typeof val.toDate === "function") {
      d = val.toDate();
    } else if (typeof val.seconds === "number") {
      d = new Date(val.seconds * 1000);
    } else if (val instanceof Date) {
      d = val;
    } else {
      d = new Date(val);
    }
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function HotelManagerPage() {
  const { appUser } = useAuth();
  const { destinations: loadedDestinations } = useDestinations(TRIP_ID);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback to default trip destinations if not yet seeded
  const destinations =
    loadedDestinations && loadedDestinations.length > 0
      ? loadedDestinations
      : DEFAULT_DESTINATIONS;

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
        // Demo fallback properties if collection is empty
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
            actualPrice: 0,
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
            actualPrice: 0,
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
            actualPrice: 0,
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
      destinationId: hotel.destinationId || destinations[0]?.id || "dest-rajasthan",
      name: hotel.name || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
      checkInDate: parseDateInput(hotel.checkIn),
      checkOutDate: parseDateInput(hotel.checkOut),
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
      const checkInTimestamp = formData.checkInDate
        ? Timestamp.fromDate(new Date(formData.checkInDate))
        : null;
      const checkOutTimestamp = formData.checkOutDate
        ? Timestamp.fromDate(new Date(formData.checkOutDate))
        : null;

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
        await setDoc(
          doc(db, "hotels", editingHotel.id),
          {
            ...payload,
            createdBy: editingHotel.createdBy || appUser?.uid || "admin",
            createdAt: editingHotel.createdAt || serverTimestamp(),
          },
          { merge: true }
        );
        setHotels((prev) =>
          prev.map((h) => (h.id === editingHotel.id ? ({ ...h, ...payload } as Hotel) : h))
        );
        toast.success("Hotel booking updated successfully.");
      } else {
        const docRef = await addDoc(collection(db, "hotels"), {
          ...payload,
          createdBy: appUser?.uid || "admin",
          createdAt: serverTimestamp(),
        });
        setHotels((prev) => [{ id: docRef.id, ...payload } as Hotel, ...prev]);
        toast.success("Hotel accommodation record added.");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save hotel details:", err);
      const msg = err instanceof Error ? err.message : "Failed to save hotel details.";
      toast.error(`Save failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    try {
      await deleteDoc(doc(db, "hotels", hotelToDelete.id));
      setHotels((prev) => prev.filter((h) => h.id !== hotelToDelete.id));
      toast.success("Hotel record removed.");
      setHotelToDelete(null);
    } catch (err) {
      console.error("Failed to delete hotel:", err);
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
    <div className="space-y-8 font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007d8a] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mb-2">
            <HotelIcon className="w-3.5 h-3.5 text-[#007d8a]" />
            <span>Accommodation &amp; Stays</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hotel &amp; Booking Manager</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Maintain property reservations, tariffs, room allocations, and check-in schedules across Rajasthan, Delhi &amp; Agra.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#007d8a] hover:bg-[#006670] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
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
          className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
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
          className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
        >
          <option value="all">All Booking Statuses</option>
          <option value="tbc">To be confirmed (TBC)</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="not_required">Not Required</option>
        </select>
      </div>

      {/* ── Hotel Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((h) => {
          const destName = destinations.find((d) => d.id === h.destinationId)?.name || "Rajasthan (Jaipur Hub)";

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#007d8a] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {destName}
                  </span>
                  <StatusBadge status={h.bookingStatus} type="booking" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{h.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{h.address || "Address to be confirmed"}</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check In:</span>
                    <span className="font-medium text-gray-800">
                      {h.checkIn ? formatDate(h.checkIn) : "To be confirmed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check Out:</span>
                    <span className="font-medium text-gray-800">
                      {h.checkOut ? formatDate(h.checkOut) : "To be confirmed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rooms:</span>
                    <span className="font-medium text-gray-800">
                      {h.numberOfRooms} Rooms ({h.roomDetails || "Twin/Double"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Price:</span>
                    <span className="font-bold text-[#007d8a]">
                      {h.estimatedPrice ? formatCurrency(h.estimatedPrice) : "TBC"}
                    </span>
                  </div>
                </div>

                {h.confirmationReference ? (
                  <div className="p-2 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Voucher Ref: {h.confirmationReference}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">
                    Booking voucher reference to be entered upon final payment receipt.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(h)}
                  className="p-2 text-gray-600 hover:text-[#007d8a] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Hotel"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHotelToDelete(h)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingHotel ? "Update Accommodation" : "Add Hotel Property"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Destination *</label>
                  <select
                    value={formData.destinationId}
                    onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Booking Status</label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingStatus: e.target.value as BookingStatus })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none bg-white"
                  >
                    <option value="tbc">To be confirmed (TBC)</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITC Rajputana, Jaipur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Palace Road, Jaipur, Rajasthan"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Check In Date</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Check Out Date</label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.numberOfRooms}
                    onChange={(e) => setFormData({ ...formData, numberOfRooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Cost (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Room Categories / Details</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Deluxe Double Bed Rooms with Breakfast"
                  value={formData.roomDetails}
                  onChange={(e) => setFormData({ ...formData, roomDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Confirmed Voucher / PNR Reference (Only when verified)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty or TBC until actual booking receipt is uploaded"
                  value={formData.confirmationReference}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmationReference: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007d8a] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#007d8a] hover:bg-[#006670] text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
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
