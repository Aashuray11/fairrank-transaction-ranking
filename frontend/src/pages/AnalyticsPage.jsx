import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fetchAnalytics } from "../api/fairrank";
import ErrorState from "../components/ErrorState";
import Skeleton from "../components/Skeleton";

const pieColors = ["#4F46E5", "#7C3AED", "#10B981", "#EF4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchAnalytics();
        if (active) setData(response);
        setError("");
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load analytics");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Visual breakdown of revenue, activity, and reward distribution.</p>
      </div>

      {loading ? <Skeleton className="h-[32rem]" /> : null}
      {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : null}

      {data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass rounded-3xl p-5">
            <h2 className="section-title">Revenue Trend</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend || []}>
                  <defs>
                    <linearGradient id="analyticsArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="revenue" stroke="#4F46E5" fill="url(#analyticsArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="section-title">Transaction Distribution</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.transactionDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7C3AED" radius={[14, 14, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="section-title">Reward Points Distribution</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.pointsDistribution || []} dataKey="users" nameKey="range" outerRadius={120} label>
                    {(data.pointsDistribution || []).map((entry, index) => (
                      <Cell key={entry.range} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="section-title">Weekly Activity</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
