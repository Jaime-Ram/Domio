export default function ContactsLoading() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-64 rounded bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="h-9 w-40 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Search + filter pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="h-10 w-64 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        <div className="flex items-center gap-2">
          {[80, 96, 88, 100, 84, 88, 72].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-7 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
