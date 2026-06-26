import { motion } from "framer-motion";

export default function KpiCard({ title, value, subtitle, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <h3 className="font-display text-2xl font-bold md:text-3xl">{value}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </motion.div>
  );
}
