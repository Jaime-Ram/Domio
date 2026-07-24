export default function StackSection() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] items-stretch gap-8 px-6 lg:grid-cols-2 lg:px-16">
        {/* left column */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="display max-w-md text-[clamp(1.8rem,3vw,2.5rem)]">
              <span className="text-ink">Maak kennis met Domio Assist.</span>{" "}
              <span className="text-grey-2">
                De agent die je meldingen opvangt, de juiste vakman aanstuurt en
                de werkbon bijhoudt.
              </span>
            </h2>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:opacity-60"
            >
              Ontdek Domio Assist
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          <figure className="mt-12">
            <blockquote className="max-w-md text-[17px] leading-snug text-ink">
              &ldquo;Assist vangt elke melding op, stuurt de juiste vakman aan en
              houdt de werkbon bij. Wij keuren alleen nog goed.&rdquo;
            </blockquote>
            <figcaption className="mt-4">
              <div className="text-[14px] font-medium text-ink">Mark de Vries</div>
              <div className="text-[14px] text-grey">
                Directeur, Havenstad Beheer
              </div>
              <a
                href="#"
                className="mt-3 inline-block text-[14px] font-medium text-ink underline underline-offset-2 hover:opacity-60"
              >
                Lees hun verhaal
              </a>
            </figcaption>
          </figure>
        </div>

        {/* rechterkolom: Assist woordmerk */}
        <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-2xl bg-panel-2">
          <span
            className="select-none text-[clamp(4rem,11vw,9rem)] font-medium tracking-[-0.04em]"
            style={{
              background:
                "linear-gradient(180deg, #161f13 55%, #94f477 120%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Assist
          </span>
          <button className="absolute bottom-6 right-6 rounded-full bg-forest/80 px-5 py-2.5 text-[14px] font-medium text-paper backdrop-blur hover:bg-forest">
            Bekijk video
          </button>
        </div>
      </div>
    </section>
  );
}
