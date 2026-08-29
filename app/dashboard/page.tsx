// Deze route wordt door de proxy (middleware) doorgestuurd naar het juiste
// dashboard op basis van de rol. Tot die redirect rendert een neutrale,
// rustige laadstaat in plaats van ruwe tekst.
export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-neutral-700 border-t-[#1d3014] dark:border-t-[#c8e957] animate-spin" />
    </div>
  )
}
