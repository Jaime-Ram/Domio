function FileIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 2.5h7l5 5V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21V3a.5.5 0 0 1 .5-.5Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-grey-2"
      />
      <path d="M13 2.5V7.5h5" stroke="currentColor" strokeWidth="1.4" className="text-grey-2" />
    </svg>
  );
}

function Window({
  title,
  children,
  className = "",
  style,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute overflow-hidden rounded-lg bg-paper shadow-xl ring-1 ring-black/10 ${className}`}
      style={style}
    >
      {title && (
        <div className="flex items-center gap-1.5 border-b border-line bg-panel px-2.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="ml-2 text-[10px] text-grey-2">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Bubble({
  name,
  text,
  className = "",
  style,
}: {
  name: string;
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute max-w-[220px] rounded-2xl bg-paper p-3 shadow-lg ring-1 ring-black/10 ${className}`}
      style={style}
    >
      <div className="text-[11px] font-medium text-grey-2">{name}</div>
      <div className="text-[13px] text-ink">{text}</div>
    </div>
  );
}

export default function SystemsSection() {
  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 text-center lg:px-16">
        <h2 className="display mx-auto max-w-3xl text-[clamp(2rem,4vw,3rem)] text-ink">
          Systemen die nooit met elkaar praatten
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.25rem)] text-grey">
          Zo ziet het eruit als vijf losse systemen samen één lekkage moeten
          oplossen.
        </p>

        {/* chaotic collage */}
        <div className="relative mx-auto mt-12 h-[560px] max-w-5xl">
          {/* dotted connective lines */}
          <div className="absolute inset-0 dotgrid opacity-40" />

          {/* receipt photo */}
          <Window
            title="Bon"
            className="w-44 rotate-[-6deg]"
            style={{ left: "4%", top: "6%" }}
          >
            <div className="p-3">
              <div className="mx-auto h-36 w-24 space-y-1.5 rounded bg-panel p-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-1.5 rounded bg-line" style={{ width: `${60 + (i % 3) * 15}%` }} />
                ))}
              </div>
            </div>
          </Window>

          {/* spreadsheet stack */}
          <Window className="w-64 rotate-[3deg]" style={{ left: "8%", top: "52%" }}>
            <div className="bg-[#217346] px-3 py-1.5 text-left text-[11px] font-medium text-white">Onderhoud.xlsx</div>
            <div className="grid grid-cols-4 text-[9px] text-grey">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="border border-line px-1.5 py-1 text-left">
                  {i % 4 === 0 ? "2026-05" : i % 4 === 2 ? "€42,10" : ""}
                </div>
              ))}
            </div>
          </Window>

          {/* vakman portal login */}
          <Window
            title="vakman-portaal.nl"
            className="w-56 rotate-[-3deg]"
            style={{ left: "40%", top: "30%" }}
          >
            <div className="space-y-2 p-4 text-left">
              <div className="text-[11px] text-grey">Log in bij het aannemersportaal</div>
              <div className="h-6 rounded border border-red-300 bg-red-50" />
              <div className="h-6 rounded border border-line" />
              <div className="text-[10px] text-grey-2">Wachtwoord vergeten? Weer.</div>
              <div className="h-6 rounded border border-line" />
              <div className="text-[10px] font-medium text-red-500">Onjuiste inloggegevens</div>
            </div>
          </Window>

          {/* company policy pdf */}
          <Window
            title="Onderhoudscontract.pdf"
            className="w-52 rotate-[4deg]"
            style={{ right: "3%", top: "8%" }}
          >
            <div className="space-y-1.5 p-4 text-left">
              <div className="text-[12px] font-medium text-ink">Onderhoudscontract</div>
              <div className="text-[9px] text-grey-2">Laatst bijgewerkt juni 2026</div>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-1 rounded bg-line" style={{ width: `${70 + (i % 4) * 8}%` }} />
              ))}
            </div>
          </Window>

          {/* chat bubbles */}
          <Bubble
            name="Lisa"
            text="Is de lekkage al gemaakt?"
            className="rotate-[-2deg]"
            style={{ left: "26%", top: "16%" }}
          />
          <Bubble
            name="Sander"
            text="Welke loodgieter was dit ook alweer?"
            className="rotate-[2deg]"
            style={{ right: "20%", top: "62%" }}
          />

          {/* email chip */}
          <div
            className="absolute rounded-full bg-paper px-3 py-1.5 text-[11px] text-ink shadow-lg ring-1 ring-black/10"
            style={{ right: "8%", top: "52%" }}
          >
            Re: Offerte dakreparatie
          </div>

          {/* file chips */}
          <div className="absolute flex flex-col items-center gap-1" style={{ left: "48%", top: "8%" }}>
            <FileIcon />
            <span className="text-[11px] text-grey">foto-lekkage.jpg</span>
          </div>
          <div className="absolute flex flex-col items-center gap-1" style={{ left: "40%", top: "72%" }}>
            <FileIcon />
            <span className="text-[11px] text-grey">offerte.pdf</span>
          </div>
        </div>
      </div>
    </section>
  );
}
