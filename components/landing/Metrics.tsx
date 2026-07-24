const stats = [
  ["13.000+", "eenheden beheerd"],
  ["75%", "minder handwerk"],
  ["24 uur", "gem. doorlooptijd"],
  ["99,9%", "uptime"],
];

export default function Metrics() {
  return (
    <section className="bg-forest py-20 text-paper lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-lime-2">
            Resultaten
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.5rem)] text-paper">
            Onderhoud dat zich terugverdient.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.15rem)] text-white/60">
            Beheerders die met Domio werken besparen tijd, geld en gedoe, elke
            dag opnieuw.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, l]) => (
            <div key={l} className="border-t border-white/15 pt-6">
              <div className="display text-[clamp(2.5rem,5vw,3.5rem)] text-lime">
                {n}
              </div>
              <div className="mt-2 text-[15px] text-white/70">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
