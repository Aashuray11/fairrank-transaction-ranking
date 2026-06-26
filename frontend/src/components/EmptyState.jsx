export default function EmptyState({ title, description }) {
  return (
    <div className="glass rounded-3xl p-8 text-center">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{description}</p>
    </div>
  );
}
