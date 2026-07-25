export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        <div className="h-4 w-48 rounded bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        <div className="h-72 rounded-2xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>
    </div>
  )
}
