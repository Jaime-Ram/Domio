export default function TenantsLoading() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-56 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Table header */}
      <div className="h-10 rounded-lg bg-gray-50 dark:bg-neutral-800/50 animate-pulse" />

      {/* Table rows */}
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
