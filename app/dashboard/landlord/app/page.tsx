'use client'

export default function AppPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      {/* Icon — zelfde stijl als MobileAppOnlyScreen */}
      <div className="relative mx-auto mb-8 h-28 w-28 flex items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-[26px] bg-[#9FE870]/22 blur-[14px]"
        />
        <span
          aria-hidden
          className="absolute -inset-3 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(159,232,112,0.24)_0%,rgba(159,232,112,0.12)_44%,rgba(159,232,112,0)_74%)]"
        />
        <div className="relative h-24 w-24 rounded-[22px] bg-[#9FE870] flex items-center justify-center shadow-[0_10px_22px_rgba(22,51,0,0.16),0_4px_10px_rgba(22,51,0,0.12),inset_0_1px_0_rgba(255,255,255,0.32)]">
          <img
            src="/images/offerla:ZA.png"
            alt="Domio app icoon"
            className="h-[56%] w-[56%] object-contain drop-shadow-[0_2px_4px_rgba(22,51,0,0.14)]"
          />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-3">
        Domio App
      </h1>
      <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-2">
        De Domio-app voor iOS en Android is in ontwikkeling. Binnenkort kun je je portefeuille, huurders en onderhoud beheren vanuit je telefoon.
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">
        Verwacht in september
      </p>

      {/* App store badges (placeholder) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 px-5 rounded-xl bg-[#163300] dark:bg-neutral-800 flex items-center gap-3 opacity-40 cursor-not-allowed select-none">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white shrink-0">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="text-left">
            <p className="text-[10px] text-white/70 leading-none">Binnenkort in de</p>
            <p className="text-sm font-semibold text-white leading-tight">App Store</p>
          </div>
        </div>
        <div className="h-12 px-5 rounded-xl bg-[#163300] dark:bg-neutral-800 flex items-center gap-3 opacity-40 cursor-not-allowed select-none">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white shrink-0">
            <path d="M3 3.269v17.462c0 .86.93 1.406 1.688.977l15.462-8.731a1.125 1.125 0 0 0 0-1.954L4.688 2.292A1.125 1.125 0 0 0 3 3.269z"/>
          </svg>
          <div className="text-left">
            <p className="text-[10px] text-white/70 leading-none">Binnenkort op</p>
            <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
          </div>
        </div>
      </div>
    </div>
  )
}
