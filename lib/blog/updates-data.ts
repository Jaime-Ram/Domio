import type { UpdateItem } from './types'

export function getUpdates(): UpdateItem[] {
  return [
    {
      date: '2026-01-01',
      title: 'Nieuwe maximale huurprijsgrenzen en indexering',
      description:
        'Sociaal max €932,93, midden max €1.228,07. Indexering huurprijsgrenzen met 3,65%. WOZ-waarden voor WWS aangepast (landelijk +10,6%).',
      relatedArticle: 'huurverhogingsregels-2026',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2026-01-01',
      title: 'Nieuwe huurtoeslag en inkomensgrenzen middenhuur',
      description:
        'Vereenvoudigde huurtoeslag, meer mensen in aanmerking. Inkomensgrenzen middenhuur: €70.149 (1-persoon) / €93.531 (meerpersoon).',
      relatedArticle: 'ws-puntentelling-2026',
      type: 'actief',
      importance: 'midden',
    },
    {
      date: '2026-01-01',
      title: 'Huurverhogingen 2026 van kracht',
      description: 'Vrije sector max 4,4%, middenhuur max 6,1%. Realisatiestimulans €7.000 per betaalbare woning. Bbl-drempels max 2 cm.',
      relatedArticle: 'huurverhogingsregels-2026',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2025-07-01',
      title: 'Huurcommissie voor onterecht geliberaliseerde huur',
      description:
        'Huurders met woning ≤143 punten kunnen naar Huurcommissie. Verhuurders moeten te hoge huren verlaagd hebben.',
      relatedArticle: 'wet-betaalbare-huur-gids',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2025-01-01',
      title: 'Verplichte WWS-puntentelling bij elk nieuw contract',
      description:
        'Ook in vrije sector. Gemeenten starten handhaving. Boetes tot €25.750 per overtreding, bij herhaling €103.000.',
      relatedArticle: 'ws-puntentelling-2026',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2024-07-01',
      title: 'Wet Betaalbare Huur in werking',
      description: 'Nieuw WWS(O), middenhuur 144-186 punten gereguleerd. Maximale waarborgsom 2x kale huur.',
      relatedArticle: 'wet-betaalbare-huur-gids',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2023-07-01',
      title: 'Wet Goed Verhuurderschap in werking',
      description: 'Discriminatieverbod, intimidatieverbod, informatieplicht.',
      relatedArticle: 'wet-goed-verhuurderschap',
      type: 'actief',
      importance: 'hoog',
    },
    {
      date: '2026-07-01',
      title: 'Sociale huurverhoging max 4,1%',
      description: 'Maximum huurverhoging sociale sector per 1 juli 2026.',
      relatedArticle: 'huurverhogingsregels-2026',
      type: 'aankomend',
      importance: 'midden',
    },
    {
      date: '2026-05-01',
      title: 'Nieuwe energielabelmethodiek en monumenten',
      description: 'Monumenten: labelplicht bij verhuur.',
      relatedArticle: 'energielabel-verplichtingen-verhuurders',
      type: 'aankomend',
      importance: 'hoog',
    },
    {
      date: '2026-07-01',
      title: 'Energielabel verplicht bij verkoop, verhuur, renovatie',
      description: 'Uitbreiding labelplicht.',
      relatedArticle: 'energielabel-verplichtingen-verhuurders',
      type: 'aankomend',
      importance: 'hoog',
    },
    {
      date: '2029-01-01',
      title: 'Minimaal energielabel D voor alle huurwoningen',
      description: 'E, F, G moeten verduurzaamd. SVOH-subsidie loopt tot 31 december 2029.',
      relatedArticle: 'verduurzaming-huurwoningen-subsidies',
      type: 'aankomend',
      importance: 'hoog',
    },
    {
      date: '2030-01-01',
      title: 'Nieuwe energielabel-indeling A t/m G',
      description: 'Oude A+/A++/etc. vervalt. Minimumeisen utiliteitsgebouwen.',
      relatedArticle: 'energielabel-verplichtingen-verhuurders',
      type: 'aankomend',
      importance: 'midden',
    },
  ]
}
