export default function PortfolioLoading() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Header + button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-lg bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-56 rounded bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        {[100, 120, 110, 130].map((w, i) => (
          <div key={i} className="h-20 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Property cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
