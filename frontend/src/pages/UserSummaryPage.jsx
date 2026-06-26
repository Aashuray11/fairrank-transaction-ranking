import { useState } from "react";
import { FiClock, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";

import { fetchUserSummary } from "../api/fairrank";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Skeleton from "../components/Skeleton";
import { currency, formatDateTime, integer } from "../utils/format";

export default function UserSummaryPage() {
  const [userId, setUserId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (event) => {
    event.preventDefault();
    if (!userId.trim()) {
      setError("Enter a user ID first");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await fetchUserSummary(userId.trim());
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setError(err.response?.status === 404 ? "User does not exist" : err.response?.data?.message || "Unable to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">User Summary</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Search any user and inspect their fairness profile.</p>
      </div>

      <form onSubmit={search} className="glass flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center">
        <input
          className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-900/70"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID, e.g. USER001"
        />
        <button className="rounded-2xl bg-primary px-5 py-3 font-medium text-white" type="submit">
          Search
        </button>
      </form>

      {loading ? <Skeleton className="h-72" /> : null}
      {error ? <ErrorState message={error} onRetry={() => setError("")} /> : null}

      {!loading && !summary && !error ? (
        <EmptyState title="No summary loaded" description="Search a user ID to view activity, rank, and recent transactions." />
      ) : null}

      {summary ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass rounded-3xl p-5"><p className="text-sm text-slate-500">Total Amount</p><p className="mt-3 text-2xl font-bold">{currency(summary.totalAmount)}</p></div>
            <div className="glass rounded-3xl p-5"><p className="text-sm text-slate-500">Total Points</p><p className="mt-3 text-2xl font-bold">{integer(summary.totalPoints)}</p></div>
            <div className="glass rounded-3xl p-5"><p className="text-sm text-slate-500">Rank</p><p className="mt-3 text-2xl font-bold">#{summary.rank ?? "-"}</p></div>
            <div className="glass rounded-3xl p-5"><p className="text-sm text-slate-500">Fairness Score</p><p className="mt-3 text-2xl font-bold">{summary.fairnessScore ?? 0}</p></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="glass rounded-3xl p-5">
              <h2 className="section-title">Profile</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center gap-2"><FiUser /> User ID: {summary.userId}</p>
                <p className="flex items-center gap-2"><FiTarget /> Transactions: {integer(summary.transactionCount)}</p>
                <p className="flex items-center gap-2"><FiClock /> Last Activity: {formatDateTime(summary.lastActivity)}</p>
                <p className="flex items-center gap-2"><FiTrendingUp /> Fairness Score: {summary.fairnessScore}</p>
              </div>
            </section>

            <section className="glass rounded-3xl p-5">
              <h2 className="section-title">Last Five Transactions</h2>
              <div className="mt-4 space-y-3">
                {(summary.recentTransactions || []).map((item) => (
                  <div key={item.transactionId} className="rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.transactionId}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <p className="font-semibold text-primary">{currency(item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
