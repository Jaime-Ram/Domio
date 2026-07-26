"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Sparkles, Phone, Mail, MapPin, Trash2, Star, Clock, Euro, Wrench,
  Droplets, Flame, Zap, PaintRoller, DoorOpen, AlertTriangle, TrendingUp, Shield,
} from "lucide-react";
import {
  PageHeader, Toolbar, ToolbarSearch, ToolbarToggle, StatusDot, ListShell, ListHead,
  HeadCell, ListGroup, ListRow, CellMain, Avatar, EmptyState, BulkBar, BulkAction,
  DetailPanel, DetailVeld, DetailVelden, Progress, type SorteerRichting,
} from "../_ui";
import { KpiRow, KpiCard, KpiPill, MiniRing, MiniBars, useCountUp, euro, procent } from "../_kpi";

/* ─────────────────────────── model ─────────────────────────── */

type Partner = {
  id: string;
  naam: string;
  contact: string;
  telefoon: string;
  email: string;
  plaats: string;
  categorie: string;
  vast: boolean;        // vaste partner met prijsafspraak
  opTijd: number;       // percentage afspraken op tijd
  klussen: number;
  gemKosten: number;
  gemReactie: number;   // gemiddelde reactietijd in uren
  eenKeer: number;      // percentage in één keer opgelost
  omzet: number;
  actief: boolean;
  laatste: string;
  tarief: string;
  notitie: string;
};

const CATEGORIE_ICOON: Record<string, React.ElementType> = {
  Loodgieterswerk: Droplets,
  "CV en verwarming": Flame,
  Elektra: Zap,
  Schilderwerk: PaintRoller,
  "Deuren en sloten": DoorOpen,
  Overig: Wrench,
};

const PARTNERS: Partner[] = [
  {
    id: "P-01", naam: "Loodgieter Jansen", contact: "Rob Jansen", telefoon: "020 123 4567",
    email: "rob@loodgieterjansen.nl", plaats: "Amsterdam", categorie: "Loodgieterswerk", vast: true,
    opTijd: 96, klussen: 34, gemKosten: 285, gemReactie: 3, eenKeer: 91, omzet: 9690, actief: true,
    laatste: "vandaag", tarief: "€ 65 per uur, € 45 voorrijkosten",
    notitie: "Vaste partner sinds 2023. Neemt spoed vrijwel altijd binnen vier uur aan.",
  },
  {
    id: "P-02", naam: "Elektro Bakker", contact: "Sanne Bakker", telefoon: "020 234 5678",
    email: "info@elektrobakker.nl", plaats: "Amsterdam", categorie: "Elektra", vast: true,
    opTijd: 88, klussen: 21, gemKosten: 310, gemReactie: 6, eenKeer: 86, omzet: 6510, actief: true,
    laatste: "gisteren", tarief: "€ 72 per uur, € 50 voorrijkosten",
    notitie: "Goed werk, maar factureert regelmatig boven de offerte. Leg de offerte vooraf altijd vast.",
  },
  {
    id: "P-03", naam: "Liftservice Nederland", contact: "Servicedesk", telefoon: "088 555 0100",
    email: "service@liftservice.nl", plaats: "Utrecht", categorie: "Overig", vast: true,
    opTijd: 99, klussen: 8, gemKosten: 540, gemReactie: 1, eenKeer: 100, omzet: 4320, actief: true,
    laatste: "3 dagen geleden", tarief: "Contract, € 1.850 per jaar per lift",
    notitie: "Onderhoudscontract met bereikbaarheid rond de klok. Snelste partner in het bestand.",
  },
  {
    id: "P-04", naam: "Schildersbedrijf De Vries", contact: "Peter de Vries", telefoon: "030 345 6789",
    email: "peter@devriesschilders.nl", plaats: "Utrecht", categorie: "Schilderwerk", vast: true,
    opTijd: 82, klussen: 6, gemKosten: 2140, gemReactie: 48, eenKeer: 100, omzet: 12840, actief: true,
    laatste: "vorige week", tarief: "Op offerte, staffelkorting vanaf 5 dagen",
    notitie: "Voor groot schilderwerk en MJOP-posten. De planning loopt zes weken vooruit.",
  },
  {
    id: "P-05", naam: "Slotenservice Amsterdam", contact: "Meldkamer", telefoon: "020 456 7890",
    email: "spoed@slotenservice-adam.nl", plaats: "Amsterdam", categorie: "Deuren en sloten", vast: false,
    opTijd: 74, klussen: 5, gemKosten: 390, gemReactie: 2, eenKeer: 80, omzet: 1950, actief: true,
    laatste: "3 weken geleden", tarief: "Spoedtarief € 120, daarna € 85 per uur",
    notitie: "Alleen voor spoed buiten kantooruren. De prijzen liggen aan de hoge kant.",
  },
  {
    id: "P-06", naam: "Verwarming Zuid", contact: "Ahmed Yilmaz", telefoon: "010 567 8901",
    email: "ahmed@verwarmingzuid.nl", plaats: "Rotterdam", categorie: "CV en verwarming", vast: true,
    opTijd: 93, klussen: 18, gemKosten: 245, gemReactie: 5, eenKeer: 89, omzet: 4410, actief: true,
    laatste: "vorige week", tarief: "€ 68 per uur, jaaronderhoud € 180 per ketel",
    notitie: "Doet het jaarlijkse ketelonderhoud voor de Rotterdamse panden.",
  },
  {
    id: "P-07", naam: "Klusbedrijf Molenaar", contact: "Dirk Molenaar", telefoon: "030 678 9012",
    email: "dirk@klusmolenaar.nl", plaats: "Utrecht", categorie: "Overig", vast: false,
    opTijd: 61, klussen: 4, gemKosten: 175, gemReactie: 26, eenKeer: 50, omzet: 700, actief: false,
    laatste: "4 maanden geleden", tarief: "€ 55 per uur",
    notitie: "Reageert traag en moest twee keer terugkomen. Niet meer inzetten voor spoed.",
  },
];

/* ─────────────────────────── hulpjes ─────────────────────────── */

const COL = {
  status: "w-4 shrink-0",
  categorie: "hidden w-[136px] shrink-0 lg:flex",
  plaats: "hidden w-[92px] shrink-0 2xl:block",
  opTijd: "w-[76px] shrink-0 text-right",
  reactie: "hidden w-[76px] shrink-0 text-right md:block",
  klussen: "hidden w-[68px] shrink-0 text-right xl:block",
  kosten: "w-[84px] shrink-0 text-right",
  avatar: "w-6 shrink-0",
};

/* prestatie in één signaal: op tijd en in één keer opgelost samen */
function gezondheid(p: Partner): { toon: "goed" | "let-op" | "slecht"; titel: string } {
  if (!p.actief) return { toon: "slecht", titel: "Op non-actief gezet" };
  if (p.opTijd < 80 || p.eenKeer < 75) return { toon: "slecht", titel: `${p.opTijd}% op tijd, ${p.eenKeer}% in één keer` };
  if (p.opTijd < 90) return { toon: "let-op", titel: `${p.opTijd}% van de afspraken op tijd` };
  return { toon: "goed", titel: `${p.opTijd}% op tijd, ${p.eenKeer}% in één keer opgelost` };
}

const KOLOM_WAARDE: Record<string, (p: Partner) => string> = {
  categorie: (p) => p.categorie,
  plaats: (p) => p.plaats,
  soort: (p) => (p.vast ? "Vaste partner" : "Losse opdracht"),
};

const KOLOM_OPTIES: Record<string, string[]> = {
  categorie: Object.keys(CATEGORIE_ICOON),
  plaats: Array.from(new Set(PARTNERS.map((p) => p.plaats))).sort(),
};

const SORTEER: Record<string, (p: Partner) => number | string> = {
  partner: (p) => p.naam.toLowerCase(),
  opTijd: (p) => p.opTijd,
  reactie: (p) => p.gemReactie,
  klussen: (p) => p.klussen,
  kosten: (p) => p.gemKosten,
};

const reactieTekst = (u: number) => (u < 24 ? `${u} u` : `${Math.round(u / 24)} d`);

/* ─────────────────────────── pagina ─────────────────────────── */

type GroepOp = "categorie" | "plaats" | "soort" | "geen";

export default function PartnersPage() {
  const [partners, setPartners] = useState(PARTNERS);
  const [groepOp, setGroepOp] = useState<GroepOp>("categorie");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sorteer, setSorteer] = useState<{ kolom: string; richting: SorteerRichting } | null>(null);
  const [query, setQuery] = useState("");
  const [alleenVast, setAlleenVast] = useState(false);
  const [dicht, setDicht] = useState<string[]>([]);
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const zetFilter = (k: string, v: string[]) => setFilters((f) => ({ ...f, [k]: v }));
  const zetSorteer = (kolom: string, richting: SorteerRichting) =>
    setSorteer((s) => (s?.kolom === kolom && s.richting === richting ? null : { kolom, richting }));

  const q = query.trim().toLowerCase();
  const zichtbaar = useMemo(() => {
    const lijst = partners.filter((p) => {
      const mq = !q || p.naam.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q) || p.plaats.toLowerCase().includes(q);
      const mf = Object.entries(filters).every(([k, v]) => !v.length || v.includes(KOLOM_WAARDE[k](p)));
      return mq && mf && (!alleenVast || p.vast);
    });
    if (!sorteer) return lijst;
    const w = SORTEER[sorteer.kolom];
    return [...lijst].sort((a, b) => {
      const va = w(a), vb = w(b);
      const vgl = typeof va === "string" ? String(va).localeCompare(String(vb)) : Number(va) - Number(vb);
      return sorteer.richting === "hoog" ? -vgl : vgl;
    });
  }, [partners, q, filters, alleenVast, sorteer]);

  const groepen = useMemo(() => {
    if (groepOp === "geen") return [{ key: "alles", label: "", items: zichtbaar }];
    const sleutel = KOLOM_WAARDE[groepOp];
    const namen = Array.from(new Set(zichtbaar.map(sleutel))).sort();
    return namen.map((n) => ({ key: n, label: n, items: zichtbaar.filter((p) => sleutel(p) === n) }));
  }, [zichtbaar, groepOp]);

  const toggleKies = useCallback((id: string) => {
    setGekozen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const maakVast = useCallback((ids: string[]) => {
    setPartners((p) => p.map((x) => (ids.includes(x.id) ? { ...x, vast: true } : x)));
    setGekozen([]);
  }, []);
  const opNonactief = useCallback((ids: string[]) => {
    setPartners((p) => p.map((x) => (ids.includes(x.id) ? { ...x, actief: false } : x)));
    setGekozen([]);
  }, []);
  const verwijder = useCallback((ids: string[]) => {
    setPartners((p) => p.filter((x) => !ids.includes(x.id)));
    setGekozen([]);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [detail]);

  const actief = partners.filter((p) => p.actief);
  const vast = partners.filter((p) => p.vast).length;
  const klussen = partners.reduce((s, p) => s + p.klussen, 0);
  const omzet = partners.reduce((s, p) => s + p.omzet, 0);
  const actieveKlussen = actief.reduce((s, p) => s + p.klussen, 0);
  const gemOpTijd = actieveKlussen ? actief.reduce((s, p) => s + p.opTijd * p.klussen, 0) / actieveKlussen : 0;
  const aandacht = partners.filter((p) => gezondheid(p).toon !== "goed").length;
  const detailPartner = partners.find((p) => p.id === detail) || null;

  const klussenTeller = useCountUp(klussen);
  const omzetTeller = useCountUp(omzet);

  return (
    <>
      <PageHeader
        title="Partners"
        subtitle={
          <>
            {partners.length} partners · <span className="font-medium text-forest">{vast} met prijsafspraak</span>
            {aandacht > 0 && <> · <span className="font-medium text-[#c99a1f]">{aandacht} met aandachtspunt</span></>}
          </>
        }
        action={{ label: "Partner toevoegen" }}
      />

      <KpiRow>
        <div className="flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-line">
          <span className="text-[12px] uppercase tracking-wide text-grey-2">Afspraken op tijd</span>
          <div className="mt-4 flex flex-1 items-center gap-4">
            <MiniRing pct={gemOpTijd} formaat={72} dik={3.4} kleur="#5cc93f" tekstKlasse="text-[15px] text-forest" />
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-ink">Gewogen gemiddelde</div>
              <div className="mt-1 text-[12px] text-grey-2">over {klussen} klussen</div>
            </div>
          </div>
        </div>

        <KpiCard
          label="Klussen dit jaar"
          waarde={String(Math.round(klussenTeller))}
          sub={`verdeeld over ${actief.length} actieve partners`}
        >
          <MiniBars data={[38, 44, 40, 55, 48, 62, 58, 70]} vanaf={5} />
        </KpiCard>

        <KpiCard
          label="Uitgegeven aan partners"
          waarde={euro(omzetTeller)}
          sub={`${euro(omzet / Math.max(1, klussen))} gemiddeld per klus`}
          badge={<KpiPill>{vast} vast</KpiPill>}
        />

        <KpiCard
          label="Aandachtspunten"
          waarde={String(aandacht)}
          toon={aandacht > 0 ? "let-op" : "goed"}
          sub={aandacht > 0 ? "partners die achterblijven op de afspraken" : "alle partners presteren goed"}
        />
      </KpiRow>

      <Toolbar>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Zoek op partner, contactpersoon of plaats..." />
        <ToolbarToggle actief={alleenVast} onClick={() => setAlleenVast((v) => !v)} icon={Shield}>
          Met prijsafspraak
        </ToolbarToggle>
      </Toolbar>

      <ListShell>
        {zichtbaar.length === 0 ? (
          <EmptyState icon={Wrench} titel="Geen partners gevonden" tekst="Pas je zoekopdracht of filter aan." />
        ) : (
          <>
            <ListHead>
              <span className={COL.status} />
              <HeadCell
                label="Partner" className="min-w-0 flex-1"
                sorteerbaar sorteerId="partner" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Z naar A", laag: "A naar Z" }}
                groep={groepOp} onGroep={(id) => setGroepOp(id as GroepOp)}
                groepeerOpties={[
                  { id: "categorie", label: "Vakgebied" },
                  { id: "plaats", label: "Plaats" },
                  { id: "soort", label: "Soort afspraak" },
                  { id: "geen", label: "Geen groepering" },
                ]}
              />
              <HeadCell
                label="Vakgebied" className={COL.categorie}
                opties={KOLOM_OPTIES.categorie} actief={filters.categorie ?? []}
                onWijzig={(v) => zetFilter("categorie", v)}
              />
              <HeadCell
                label="Plaats" className={COL.plaats}
                opties={KOLOM_OPTIES.plaats} actief={filters.plaats ?? []}
                onWijzig={(v) => zetFilter("plaats", v)}
              />
              <HeadCell
                label="Op tijd" className={COL.opTijd} rechts
                sorteerbaar sorteerId="opTijd" sorteer={sorteer} onSorteer={zetSorteer}
              />
              <HeadCell
                label="Reactie" className={COL.reactie} rechts
                sorteerbaar sorteerId="reactie" sorteer={sorteer} onSorteer={zetSorteer}
                sorteerLabels={{ hoog: "Traagste eerst", laag: "Snelste eerst" }}
              />
              <HeadCell
                label="Klussen" className={COL.klussen} rechts
                sorteerbaar sorteerId="klussen" sorteer={sorteer} onSorteer={zetSorteer}
              />
              <HeadCell
                label="Gem. prijs" className={COL.kosten} rechts
                sorteerbaar sorteerId="kosten" sorteer={sorteer} onSorteer={zetSorteer}
              />
              <span className={COL.avatar} />
            </ListHead>

            {groepen.map((g) => {
              if (g.items.length === 0) return null;
              const isDicht = dicht.includes(g.key);
              return (
                <ListGroup
                  key={g.key} label={g.label} aantal={g.items.length} dicht={isDicht}
                  onToggle={() => setDicht((d) => (isDicht ? d.filter((x) => x !== g.key) : [...d, g.key]))}
                >
                  {g.items.map((p) => {
                    const isGekozen = gekozen.includes(p.id);
                    const gz = gezondheid(p);
                    const Icoon = CATEGORIE_ICOON[p.categorie] ?? Wrench;
                    return (
                      <ListRow key={p.id} gekozen={isGekozen} onClick={() => setDetail(p.id)}>
                        <span className={`${COL.status} relative grid h-4 place-items-center`}>
                          <span className={isGekozen ? "hidden" : "group-hover:hidden"}>
                            <StatusDot toon={gz.toon} titel={gz.titel} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleKies(p.id); }}
                            aria-label="Selecteren"
                            className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                              isGekozen ? "border-forest bg-forest text-paper" : "hidden border-grey-2 text-transparent group-hover:grid"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </button>
                        </span>

                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          {p.vast && <Star className="h-3.5 w-3.5 shrink-0 fill-lime-2 text-lime-2" aria-label="Vaste partner" />}
                          <CellMain titel={p.naam} sub={`${p.contact} · laatst ingezet ${p.laatste}`} doorgehaald={!p.actief} />
                        </span>

                        <span className={`${COL.categorie} items-center gap-1.5 text-[13px] text-grey`}>
                          <Icoon className="h-3.5 w-3.5 shrink-0 text-grey-2" />
                          <span className="truncate">{p.categorie}</span>
                        </span>

                        <span className={`${COL.plaats} truncate text-[13px] text-grey-2`}>{p.plaats}</span>

                        <span className={`${COL.opTijd} text-[13px] tabular-nums ${
                          p.opTijd < 80 ? "font-medium text-red-500" : p.opTijd < 90 ? "font-medium text-[#c99a1f]" : "text-grey"
                        }`}>
                          {p.opTijd}%
                        </span>

                        <span className={`${COL.reactie} text-[13px] tabular-nums text-grey-2`}>{reactieTekst(p.gemReactie)}</span>
                        <span className={`${COL.klussen} text-[13px] tabular-nums text-grey-2`}>{p.klussen}</span>
                        <span className={`${COL.kosten} text-[13px] tabular-nums text-ink`}>{euro(p.gemKosten)}</span>

                        <span className={COL.avatar}>
                          <Avatar naam={p.naam.split(" ").map((w) => w[0]).slice(0, 2).join("")} />
                        </span>
                      </ListRow>
                    );
                  })}
                </ListGroup>
              );
            })}
          </>
        )}
      </ListShell>

      <BulkBar aantal={gekozen.length} onSluit={() => setGekozen([])}>
        <BulkAction onClick={() => maakVast(gekozen)} icon={Star}>Vaste partner</BulkAction>
        <BulkAction onClick={() => opNonactief(gekozen)} icon={AlertTriangle}>Op non-actief</BulkAction>
        <BulkAction onClick={() => verwijder(gekozen)} icon={Trash2} gevaar>Verwijder</BulkAction>
      </BulkBar>

      <DetailPanel
        open={!!detailPartner}
        onClose={() => setDetail(null)}
        kop={
          detailPartner && (
            <>
              <span className="text-[12px] tabular-nums text-grey-2">{detailPartner.id}</span>
              {detailPartner.vast && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-medium text-forest">
                  <Star className="h-3 w-3" /> Vaste partner
                </span>
              )}
            </>
          )
        }
        voet={
          detailPartner && (
            <>
              <a
                href={`tel:${detailPartner.telefoon.replace(/\s/g, "")}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-panel px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-panel-2"
              >
                <Phone className="h-4 w-4" /> Bellen
              </a>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-lime-2 px-3 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-lime"
              >
                <Sparkles className="h-4 w-4" /> Offerte opvragen
              </button>
            </>
          )
        }
      >
        {detailPartner && (
          <>
            <div>
              <div className="flex items-center gap-2">
                <StatusDot {...gezondheid(detailPartner)} />
                <h2 className="text-[18px] font-medium leading-snug text-ink">{detailPartner.naam}</h2>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-grey">
                <MapPin className="h-3.5 w-3.5 text-grey-2" /> {detailPartner.plaats} · {detailPartner.categorie}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Op tijd", waarde: `${detailPartner.opTijd}%`, icon: Clock },
                { label: "In één keer", waarde: `${detailPartner.eenKeer}%`, icon: Check },
                { label: "Gem. prijs", waarde: euro(detailPartner.gemKosten), icon: Euro },
              ].map((k) => {
                const Icoon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl bg-panel/70 p-3">
                    <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-grey-2">
                      <Icoon className="h-3 w-3" /> {k.label}
                    </span>
                    <span className="mt-1 block text-[16px] font-medium tabular-nums text-ink">{k.waarde}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-grey-2">Afspraken op tijd</span>
                <span className="text-[11px] tabular-nums text-grey-2">{detailPartner.opTijd}%</span>
              </div>
              <Progress pct={detailPartner.opTijd} />
            </div>

            <p className="rounded-xl bg-panel/70 p-3 text-[13px] leading-relaxed text-grey">{detailPartner.notitie}</p>

            <DetailVelden>
              <DetailVeld label="Contact">{detailPartner.contact}</DetailVeld>
              <DetailVeld label="Telefoon">
                <Phone className="h-3.5 w-3.5 text-grey-2" /> {detailPartner.telefoon}
              </DetailVeld>
              <DetailVeld label="E-mail">
                <Mail className="h-3.5 w-3.5 text-grey-2" /> {detailPartner.email}
              </DetailVeld>
              <DetailVeld label="Tarief">{detailPartner.tarief}</DetailVeld>
              <DetailVeld label="Reactietijd">
                <Clock className="h-3.5 w-3.5 text-grey-2" /> gemiddeld {reactieTekst(detailPartner.gemReactie)}
              </DetailVeld>
              <DetailVeld label="Klussen">
                <Wrench className="h-3.5 w-3.5 text-grey-2" /> {detailPartner.klussen} dit jaar
              </DetailVeld>
              <DetailVeld label="Status">
                {detailPartner.actief ? "Actief" : <span className="text-red-500">Op non-actief</span>}
              </DetailVeld>
            </DetailVelden>

            <div className="flex items-center gap-4 border-t border-line pt-4 text-[12px] text-grey-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> {euro(detailPartner.omzet)} uitgegeven dit jaar
              </span>
              <span className="ml-auto">{procent((detailPartner.klussen / Math.max(1, klussen)) * 100)} van alle klussen</span>
            </div>
          </>
        )}
      </DetailPanel>
    </>
  );
}
