import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

import { fetchRanking } from "../api/fairrank";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { downloadCsv } from "../utils/csv";
import { integer } from "../utils/format";

const pageSize = 10;

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const load = async (currentPage = page, currentSearch = search) => {
    try {
      setError("");
      if (!data.length) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await fetchRanking({ page: currentPage, limit: pageSize, search: currentSearch });
      setData(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load leaderboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(1, search);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const id = setInterval(() => load(page, search), 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const podium = useMemo(() => data.slice(0, 3), [data]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const exportCsv = () => downloadCsv("fairrank-leaderboard.csv", data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="section-title">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Auto-refreshing every 10 seconds with export support.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-medium text-white">
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="glass flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
          <FiSearch className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Search users"
          />
        </div>
      </div>

      {loading ? <LoadingState title="Loading leaderboard" description="Pulling the latest rankings from Render. This can take a few seconds on a cold start." rows={4} /> : null}
      {!loading && refreshing ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Refreshing leaderboard data...
        </div>
      ) : null}
      {error && !data.length ? <ErrorState message={error} onRetry={() => load(page, search)} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {podium.map((item, index) => (
              <motion.div
                key={item.userId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-3xl p-5 text-center ${index === 0 ? "ring-2 ring-yellow-400/60" : ""}`}
              >
                <p className="text-sm text-slate-500">#{item.rank}</p>
                <h3 className="mt-2 text-xl font-bold">{item.userId}</h3>
                <p className="mt-1 text-sm text-slate-500">Fairness Score</p>
                <p className="mt-2 text-3xl font-bold text-primary">{item.score}</p>
                <p className="mt-3 text-sm text-slate-500">Points: {integer(item.points)}</p>
              </motion.div>
            ))}
          </div>

          {data.length ? (
            <section className="glass rounded-3xl p-4">
              <div className="table-scroll overflow-x-auto rounded-2xl">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-white/90 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/90">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Total Points</th>
                      <th className="px-4 py-3">Transactions</th>
                      <th className="px-4 py-3">Fairness Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.userId} className="border-t border-slate-200/60 dark:border-slate-700/60">
                        <td className="px-4 py-4 font-semibold">{item.rank}</td>
                        <td className="px-4 py-4">{item.userId}</td>
                        <td className="px-4 py-4">{integer(item.points)}</td>
                        <td className="px-4 py-4">{integer(item.transactions)}</td>
                        <td className="px-4 py-4">{item.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => { const next = page - 1; setPage(next); load(next, search); }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-50 dark:border-slate-700"
                  >Prev</button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => { const next = page + 1; setPage(next); load(next, search); }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-50 dark:border-slate-700"
                  >Next</button>
                </div>
              </div>
            </section>
          ) : (
            <EmptyState title="No leaderboard entries" description="Create transactions to populate the ranking table." />
          )}
        </>
      ) : null}
    </div>
  );
}
