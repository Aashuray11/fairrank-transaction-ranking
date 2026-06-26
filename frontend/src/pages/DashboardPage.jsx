import { useEffect, useState } from "react";
import { FiArrowUpRight, FiDollarSign, FiRepeat, FiUsers } from "react-icons/fi";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import KpiCard from "../components/KpiCard";
import Skeleton from "../components/Skeleton";
import { fetchDashboard, fetchAnalytics } from "../api/fairrank";
import { currency, integer } from "../utils/format";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [dash, analyticData] = await Promise.all([fetchDashboard(), fetchAnalytics()]);
        if (!active) return;
        setDashboard(dash);
        setAnalytics(analyticData);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Unable to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const kpis = dashboard?.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">FairRank risk-aware transaction intelligence with leaderboard visibility.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Total Users" value={integer(kpis?.totalUsers)} subtitle="Registered accounts" icon={<FiUsers />} />
            <KpiCard title="Total Transactions" value={integer(kpis?.totalTransactions)} subtitle="Processed safely" icon={<FiRepeat />} />
            <KpiCard title="Total Revenue" value={currency(kpis?.totalRevenue)} subtitle="Aggregated amount" icon={<FiDollarSign />} />
            <KpiCard title="Total Reward Points" value={integer(kpis?.totalRewardPoints)} subtitle="Earned across users" icon={<FiArrowUpRight />} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="glass rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="section-title">Revenue Trend</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Rolling revenue and reward movement.</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueTrend || []}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="url(#trendGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass rounded-3xl p-5">
              <h2 className="section-title">Activity Mix</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Transaction distribution by type.</p>
              <div className="mt-4 h-80">
                {analytics?.transactionDistribution?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.transactionDistribution}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#7C3AED" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No transaction data" description="Charts will appear once transactions are processed." />
                )}
              </div>
            </section>
          </div>

          <section className="glass rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="section-title">Recent Transactions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">Latest activity across the platform.</p>
              </div>
            </div>
            <div className="table-scroll overflow-x-auto rounded-2xl">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-white/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/80">
                  <tr>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.recentTransactions || []).map((item) => (
                    <tr key={item.transactionId} className="border-t border-slate-200/60 dark:border-slate-700/60">
                      <td className="px-4 py-4 font-medium">{item.transactionId}</td>
                      <td className="px-4 py-4">{item.userId}</td>
                      <td className="px-4 py-4 capitalize">{item.type}</td>
                      <td className="px-4 py-4">{currency(item.amount)}</td>
                      <td className="px-4 py-4">{integer(item.pointsEarned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
