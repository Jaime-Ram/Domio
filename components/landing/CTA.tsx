"use client";

export default function CTA() {
  return (
    <section className="bg-paper px-6 py-24 text-center lg:px-16 lg:py-32">
      <div className="mx-auto max-w-2xl">
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.5rem)] text-ink">
          Laat je onderhoud draaien op agents.
        </h2>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl border border-line bg-panel p-2"
        >
          <input
            type="email"
            placeholder="Je zakelijke e-mailadres"
            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-grey-2"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-lime px-4 py-2.5 text-[15px] font-medium text-forest transition-colors hover:bg-lime-2"
          >
            Gratis starten
          </button>
        </form>
      </div>
    </section>
  );
}
