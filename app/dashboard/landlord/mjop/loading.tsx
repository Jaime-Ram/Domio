export default function MjopLoading() {
  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-700 shrink-0">
        <div className="h-6 w-16 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        <div className="h-4 w-80 rounded bg-gray-100 dark:bg-neutral-800 animate-pulse mt-2" />
      </div>

      {/* Card grid */}
      <div className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
