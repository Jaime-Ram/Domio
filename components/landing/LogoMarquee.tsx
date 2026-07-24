const companies = [
  "Vesteda",
  "Bouwinvest",
  "MVGM",
  "Pararius",
  "Rotsvast",
  "Interhouse",
  "123Wonen",
  "Nederwoon",
  "Rebo Groep",
  "Van der Linden",
  "Woonstad",
  "VvE Beheer NL",
];

export default function LogoMarquee() {
  return (
    <section className="border-b border-line bg-paper py-14">
      <p className="mb-9 text-center text-[13px] font-medium uppercase tracking-wide text-grey">
        Vertrouwd door meer dan 2.000 verhuurders en beheerders
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-16 px-8">
          {[...companies, ...companies].map((c, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-2xl tracking-tight text-ink/35 transition-colors hover:text-ink"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
