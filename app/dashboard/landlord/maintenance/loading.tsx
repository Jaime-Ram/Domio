export default function MaintenanceLoading() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-56 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3">
        {[72, 80, 72, 88].map((w, i) => (
          <div key={i} style={{ width: w }} className="h-7 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>

      {/* Column headers */}
      <div className="h-8 rounded-lg bg-[#f4f4f1] dark:bg-neutral-800/50 animate-pulse" />

      {/* Ticket rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
