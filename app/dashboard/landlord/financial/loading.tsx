export default function FinancialLoading() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>

      {/* Chart area */}
      <div className="h-64 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />

      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
