"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  Loader2,
  Download,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/lib/hooks/useDestinations";
import { Expense, ExpenseCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

const TRIP_ID = "demo-trip-2026";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  hotel: "bg-blue-100 text-blue-800",
  transport: "bg-amber-100 text-amber-800",
  sightseeing: "bg-purple-100 text-purple-800",
  food: "bg-emerald-100 text-emerald-800",
  shopping: "bg-rose-100 text-rose-800",
  misc: "bg-stone-100 text-stone-800",
  emergency: "bg-red-100 text-red-800",
};

export default function BudgetManagerPage() {
  const { appUser } = useAuth();
  const { destinations } = useDestinations(TRIP_ID);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groupSize, setGroupSize] = useState<number>(12);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    destinationId: "dest-rajasthan",
    category: "hotel" as ExpenseCategory,
    title: "",
    estimatedAmount: 10000,
    actualAmount: 0,
    isPaid: false,
    currency: "INR",
  });

  useEffect(() => {
    const q = query(collection(db, "expenses"), where("tripId", "==", TRIP_ID));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
        setLoading(false);
      },
      () => {
        // Fallback demo budget items
        setExpenses([
          {
            id: "exp-1",
            tripId: TRIP_ID,
            destinationId: "dest-rajasthan",
            category: "hotel",
            title: "Jaipur Heritage Hotel (6 Double Rooms, 3 Nights)",
            estimatedAmount: 51000,
            actualAmount: 0,
            currency: "INR",
            isPaid: false,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "exp-2",
            tripId: TRIP_ID,
            destinationId: "dest-rajasthan",
            category: "transport",
            title: "Jaipur Sightseeing AC Mini-Coach",
            estimatedAmount: 18000,
            actualAmount: 0,
            currency: "INR",
            isPaid: false,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "exp-3",
            tripId: TRIP_ID,
            destinationId: "dest-delhi",
            category: "sightseeing",
            title: "Red Fort, Qutub Minar & Monument Entry Fees",
            estimatedAmount: 12000,
            actualAmount: 0,
            currency: "INR",
            isPaid: false,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "exp-4",
            tripId: TRIP_ID,
            destinationId: "dest-agra",
            category: "sightseeing",
            title: "Taj Mahal Sunrise Composite Tickets (12 Pax)",
            estimatedAmount: 14400,
            actualAmount: 0,
            currency: "INR",
            isPaid: false,
            createdBy: "admin",
            createdAt: null as never,
            updatedAt: null as never,
          },
          {
            id: "exp-5",
            tripId: TRIP_ID,
            category: "transport",
            title: "Outbound Rajdhani Express Kollam → Delhi Tickets",
            estimatedAmount: 48000,
            actualAmount: 0,
            currency: "INR",
            isPaid: false,
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

  // Aggregated totals
  const totalEstimated = expenses.reduce((acc, curr) => acc + (curr.estimatedAmount || 0), 0);
  const totalActual = expenses.reduce((acc, curr) => acc + (curr.actualAmount || 0), 0);
  const perPersonEstimate = groupSize > 0 ? Math.round(totalEstimated / groupSize) : 0;

  // Breakdown by category
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.estimatedAmount;
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Expense title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "expenses"), {
        tripId: TRIP_ID,
        destinationId: formData.destinationId,
        category: formData.category,
        title: formData.title.trim(),
        estimatedAmount: Number(formData.estimatedAmount) || 0,
        actualAmount: Number(formData.actualAmount) || 0,
        currency: "INR",
        isPaid: formData.isPaid,
        createdBy: appUser?.uid || "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Expense item logged.");
      setIsAddModalOpen(false);
      setFormData({
        destinationId: "dest-rajasthan",
        category: "hotel",
        title: "",
        estimatedAmount: 5000,
        actualAmount: 0,
        isPaid: false,
        currency: "INR",
      });
    } catch {
      toast.error("Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteDoc(doc(db, "expenses", expenseToDelete.id));
      toast.success("Expense removed.");
      setExpenseToDelete(null);
    } catch {
      toast.error("Failed to delete expense.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-700 bg-royal-50 px-2.5 py-0.5 rounded-full border border-royal-200 mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Financials &amp; Cost Estimation</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-royal-950">Trip Budget Manager</h1>
          <p className="text-stone-500 text-sm mt-1">
            Track destination allocations, train tickets, hotel estimates, and calculate per-person
            contributions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-premium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* ── Top Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Estimated */}
        <div className="card-premium p-6 space-y-2 border-t-4 border-t-royal-600">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Total Group Estimate
          </span>
          <p className="font-display text-3xl font-bold text-royal-950">
            {formatCurrency(totalEstimated)}
          </p>
          <span className="text-xs text-stone-500">Across Rajasthan, Delhi, Agra &amp; Transit</span>
        </div>

        {/* Per-Person Calculation */}
        <div className="card-premium p-6 space-y-2 border-t-4 border-t-gold-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Per Person Share
            </span>
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Users className="w-3.5 h-3.5 text-royal-600" />
              <span>Pax:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={groupSize}
                onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
                className="w-14 px-1.5 py-0.5 border border-ivory-300 rounded font-semibold text-center focus:outline-none focus:ring-1 focus:ring-royal-500 text-xs"
              />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-gold-600">
            {formatCurrency(perPersonEstimate)}
          </p>
          <span className="text-xs text-stone-500">Based on {groupSize} traveling members</span>
        </div>

        {/* Actual Paid */}
        <div className="card-premium p-6 space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Confirmed / Paid
          </span>
          <p className="font-display text-3xl font-bold text-emerald-700">
            {formatCurrency(totalActual)}
          </p>
          <span className="text-xs text-stone-500">Pending final reservation invoices</span>
        </div>
      </div>

      {/* ── Category Breakdown ── */}
      <div className="card-premium p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-royal-950">
          Expenditure Breakdown by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = totalEstimated > 0 ? Math.round((amount / totalEstimated) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block capitalize">
                  {cat}
                </span>
                <p className="font-semibold text-stone-900 text-sm">{formatCurrency(amount)}</p>
                <div className="text-[11px] text-stone-500">{pct}% of budget</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expenses List Table ── */}
      <div className="card-premium overflow-hidden">
        <div className="p-4 border-b border-ivory-200 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-royal-950">All Budget Line Items</h2>
          <span className="text-xs text-stone-500">{expenses.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-ivory-100 text-stone-500 uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-4 font-semibold">Item &amp; Category</th>
                <th className="p-4 font-semibold">Destination</th>
                <th className="p-4 font-semibold text-right">Estimated</th>
                <th className="p-4 font-semibold text-right">Actual</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {expenses.map((exp) => {
                const destName =
                  destinations.find((d) => d.id === exp.destinationId)?.name || "Entire Circuit";
                const catClass = CATEGORY_COLORS[exp.category] || "bg-stone-100 text-stone-800";

                return (
                  <tr key={exp.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="p-4 font-medium text-stone-900">
                      <div>{exp.title}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 inline-block ${catClass}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">{destName}</td>
                    <td className="p-4 text-right font-semibold text-royal-900">
                      {formatCurrency(exp.estimatedAmount)}
                    </td>
                    <td className="p-4 text-right text-stone-600">
                      {exp.actualAmount ? formatCurrency(exp.actualAmount) : "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`badge ${
                          exp.isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {exp.isPaid ? "Settled" : "Estimate"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Expense Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-premium-lg max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900">Log Expense Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Fort Composite Ticket (12 Pax)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport / Train</option>
                    <option value="sightseeing">Sightseeing / Entry</option>
                    <option value="food">Meals &amp; Dining</option>
                    <option value="shopping">Shopping</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="misc">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Destination</label>
                  <select
                    value={formData.destinationId}
                    onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none bg-white"
                  >
                    <option value="">Trip Wide / All</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Estimated Cost (INR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.estimatedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Actual Settled Cost (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.actualAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, actualAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:ring-2 focus:ring-royal-500 focus:outline-none"
                  />
                </div>
              </div>

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
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Remove Expense Item?"
        description={`Are you sure you want to remove "${expenseToDelete?.title}" from the trip budget?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
