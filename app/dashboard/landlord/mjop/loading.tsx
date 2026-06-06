export default function MjopLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Tab bar skeleton */}
      <div className="flex gap-6 border-b border-gray-100 dark:border-neutral-800 pb-3">
        {[16, 20, 16].map((w, i) => (
          <div key={i} className="h-4 rounded bg-gray-100 dark:bg-neutral-800 animate-pulse" style={{ width: w * 4 }} />
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
