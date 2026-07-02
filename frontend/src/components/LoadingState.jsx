function MetricSkeleton() {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/10" />
      </div>
      <div className="h-8 w-20 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/80" />
      <div className="mt-3 h-3 w-28 animate-pulse rounded-full bg-slate-200/70 dark:bg-slate-700/70" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-primary/10" />
      </div>
      <div className="mt-6 grid h-64 grid-cols-12 items-end gap-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-t-2xl bg-gradient-to-t from-primary/25 to-primary/5"
            style={{ height: `${28 + ((index * 11) % 72)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
          <div className="h-3 w-48 animate-pulse rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200/70 dark:bg-slate-700/70" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-3 rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <div key={cellIndex} className="h-4 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingState({
  title = "Loading data",
  description = "Fetching the latest information from the server.",
  rows = 4,
  variant = "default",
}) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="glass overflow-hidden rounded-3xl border border-white/50 p-6 dark:border-slate-700/60">
          <div className="relative flex items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%)]" />
            <div className="relative max-w-xl">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">{title}</p>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
                Building your dashboard snapshot
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
            </div>
            <div className="relative hidden h-14 w-14 animate-pulse rounded-2xl bg-white/60 shadow-sm md:block dark:bg-slate-800/80" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <TableSkeleton rows={rows} />
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{description}</p>
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
        ))}
      </div>
    </div>
  );
}