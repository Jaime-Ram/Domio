export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-lg bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        <div className="h-9 w-32 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[60, 80, 72, 64].map((w, i) => (
          <div key={i} style={{ width: w }} className="h-8 rounded-full bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-[#f4f4f1] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
