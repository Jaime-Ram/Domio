export default function IntelligenceSection() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 lg:grid-cols-2 lg:px-16">
        {/* customer video poster */}
        <div
          className="relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-2xl p-8"
          style={{
            background:
              "radial-gradient(120% 90% at 70% 15%, #25361d 0%, #1d3014 55%, #0f160c 100%)",
          }}
        >
          {/* soft light limes */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-lime/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

          <button
            aria-label="Video afspelen"
            className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-xl transition-transform hover:scale-105"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="ml-0.5" aria-hidden>
              <path d="M5 3.5v13l11-6.5-11-6.5Z" />
            </svg>
          </button>

          <div className="relative">
            <div className="text-[15px] font-medium text-paper">Sanne Bakker</div>
            <div className="text-[14px] text-white/60">
              Vastgoedbeheerder, Bakker Vastgoed
            </div>
          </div>
        </div>

        {/* copy */}
        <div>
          <h2 className="display max-w-md text-[clamp(1.8rem,3vw,2.5rem)]">
            <span className="text-ink">
              Houd je team bezig met wat er echt toe doet.
            </span>{" "}
            <span className="text-grey-2">Laat agents het onderhoudswerk regelen.</span>
          </h2>
          <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:opacity-60"
          >
            Ontdek wat Domio automatiseert
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
