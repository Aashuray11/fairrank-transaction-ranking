import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { submitTransaction } from "../api/fairrank";
import ErrorState from "../components/ErrorState";
import { currency, integer } from "../utils/format";

const initialState = { transactionId: "", userId: "", amount: "", type: "purchase" };

export default function AddTransactionPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const estimatedPoints = useMemo(() => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return 0;
    if (amount < 100) return 1;
    if (amount <= 1000) return Math.floor(amount / 10);
    return Math.floor(amount / 20);
  }, [form.amount]);

  const validate = () => {
    if (!form.transactionId.trim()) return "Transaction ID is required";
    if (!form.userId.trim()) return "User ID is required";
    if (!form.amount || Number(form.amount) <= 0) return "Amount must be greater than zero";
    if (!["purchase", "recharge", "payment"].includes(form.type)) return "Invalid transaction type";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await submitTransaction(form);
      if (response.success) {
        toast.success(response.message);
        setForm(initialState);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to submit transaction";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Add Transaction</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Securely validate and process a new transaction.</p>
      </div>

      {error ? <ErrorState message={error} onRetry={() => setError("")} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Transaction ID</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/70"
                value={form.transactionId}
                onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                placeholder="TXN1001"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">User ID</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/70"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="USER001"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Amount</span>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/70"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="1000"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Transaction Type</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/70"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="purchase">Purchase</option>
                <option value="recharge">Recharge</option>
                <option value="payment">Payment</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 font-medium text-white shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
            >
              {loading ? "Processing..." : "Submit Transaction"}
            </motion.button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={() => setForm(initialState)}
            >
              Reset
            </button>
          </div>
        </form>

        <aside className="glass rounded-3xl p-6">
          <h2 className="section-title">Estimated Reward</h2>
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-300">Preview for current amount</p>
            <p className="mt-3 font-display text-4xl font-bold text-primary">{integer(estimatedPoints)} pts</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Amount: {currency(form.amount || 0)}</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Duplicate `transactionId` values are rejected with a 409 response.</p>
            <p>Daily limit is capped at 50 transactions per user.</p>
            <p>Atomic updates protect consistency across totals and activity counts.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
