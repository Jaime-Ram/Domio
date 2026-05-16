export interface ContractData {
  propertyAddress: string
  monthlyRent: number
  tenants: { name: string; email?: string; phone?: string }[]
  startDate?: string
  endDate?: string
  deposit?: number
  landlordName?: string
  landlordAddress?: string
  landlordEmail?: string
  billingDay?: number
  billingPeriod?: string
  indexation?: string
  noticePeriodMonths?: number
  bankAccount?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '_______________'
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function generateContractHTML(data: ContractData): string {
  const tenantNames = data.tenants.map((t) => t.name).join(' en ')
  const refNr = `DOM-${Date.now().toString(36).toUpperCase()}`
  const today = formatDate(new Date().toISOString())
  const isFixed = !!data.endDate
  const noticePeriod = data.noticePeriodMonths ?? 1
  const indexLabel =
    data.indexation === 'cbs' ? 'overeenkomstig de CBS-inflatie (consumentenprijsindex)'
    : data.indexation === 'vast' ? 'met een vast percentage'
    : 'niet van toepassing (geen indexatie)'

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<title>Huurovereenkomst — ${data.propertyAddress}</title>
<style>
  @page { margin: 20mm 18mm; }
  @media print { body { margin: 0; } .no-print { display: none !important; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, Georgia, serif; color: #1a1a1a; line-height: 1.65; font-size: 11pt; padding: 28px 36px; max-width: 820px; margin: 0 auto; }

  h1 { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16pt; font-weight: 700; color: #163300; margin-bottom: 3px; }
  .doc-address { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; color: #6b7280; margin-bottom: 20px; }

  h2 { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #163300; margin-top: 22px; margin-bottom: 6px; border-bottom: 1px solid #d1fae5; padding-bottom: 3px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; }
  td { padding: 5px 10px; vertical-align: top; border-bottom: 1px solid #f0f0f0; }
  td:first-child { width: 170px; color: #4b5563; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; white-space: nowrap; }
  td:last-child { font-weight: 500; }

  .articles { margin-top: 16px; }
  .art { margin-bottom: 14px; }
  .art-heading { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 10pt; color: #111827; margin-bottom: 4px; }
  .art-body { font-size: 10pt; color: #374151; text-align: justify; }
  .art-body p { margin-bottom: 6px; }
  .art-sub { margin-left: 16px; margin-bottom: 4px; font-size: 10pt; color: #374151; }

  .law-ref { font-size: 8pt; color: #9ca3af; font-style: italic; }

  .signatures { display: flex; gap: 32px; margin-top: 36px; padding-top: 20px; border-top: 2px solid #163300; }
  .sig-block { flex: 1; }
  .sig-party { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; font-weight: 700; color: #163300; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .sig-field { margin-top: 12px; }
  .sig-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8pt; color: #6b7280; margin-bottom: 2px; }
  .sig-line { border-bottom: 1px solid #374151; height: 24px; margin-bottom: 8px; }

  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; align-items: center; }
  .disclaimer { margin-top: 16px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5pt; color: #9ca3af; text-align: center; padding: 8px 0; }
</style>
</head>
<body>

<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #163300;padding-bottom:16px;margin-bottom:24px;">
  <div>
    <h1 style="margin-bottom:3px;">Huurovereenkomst woonruimte</h1>
    <div class="doc-address" style="margin-bottom:0;">${data.propertyAddress}</div>
  </div>
  <div style="text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:8pt;color:#6b7280;line-height:1.8;">
    <div>Nr: <strong>${refNr}</strong></div>
    <div>Datum: ${today}</div>
  </div>
</div>

<h2>Partijen</h2>
<table>
  <tr>
    <td colspan="2" style="padding:4px 10px 2px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:8.5pt; font-weight:700; color:#374151; border:none;">Verhuurder</td>
  </tr>
  <tr>
    <td>Naam</td>
    <td>${data.landlordName || '_______________'}</td>
  </tr>
  ${data.landlordAddress ? `<tr><td>Adres</td><td>${data.landlordAddress}</td></tr>` : ''}
  ${data.landlordEmail ? `<tr><td>E-mail</td><td>${data.landlordEmail}</td></tr>` : ''}
  <tr>
    <td colspan="2" style="padding:10px 10px 2px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:8.5pt; font-weight:700; color:#374151; border:none;">Huurder${data.tenants.length > 1 ? 's' : ''}</td>
  </tr>
  ${data.tenants.map((t, i) => `
    ${data.tenants.length > 1 ? `<tr><td colspan="2" style="padding:6px 10px 2px; font-size:8pt; color:#6b7280; border:none;">Huurder ${i + 1}</td></tr>` : ''}
    <tr><td>Naam</td><td>${t.name}</td></tr>
    ${t.email ? `<tr><td>E-mail</td><td>${t.email}</td></tr>` : ''}
    ${t.phone ? `<tr><td>Telefoon</td><td>${t.phone}</td></tr>` : ''}
  `).join('')}
</table>

<h2>Het gehuurde</h2>
<table>
  <tr><td>Adres</td><td><strong>${data.propertyAddress}</strong></td></tr>
  <tr><td>Bestemming</td><td>Zelfstandige woonruimte, uitsluitend te gebruiken als woning</td></tr>
</table>

<h2>Financiële voorwaarden</h2>
<table>
  <tr><td>Huurprijs per maand</td><td><strong>${formatCurrency(data.monthlyRent)}</strong></td></tr>
  ${data.billingPeriod && data.billingPeriod !== 'maandelijks' ? `<tr><td>Betalingsperiode</td><td>${data.billingPeriod === 'kwartaal' ? 'Per kwartaal' : 'Jaarlijks'}</td></tr>` : ''}
  ${data.billingDay ? `<tr><td>Vervaldatum betaling</td><td>Uiterlijk op de ${data.billingDay}e van iedere ${data.billingPeriod === 'kwartaal' ? 'kwartaalmaand' : 'kalendermaand'}</td></tr>` : ''}
  ${data.deposit ? `<tr><td>Waarborgsom</td><td>${formatCurrency(data.deposit)} (${(data.deposit / data.monthlyRent).toFixed(1)}× maandhuur)</td></tr>` : ''}
  ${data.bankAccount ? `<tr><td>Bankrekening huurder</td><td>${data.bankAccount}</td></tr>` : ''}
  <tr><td>Indexatie</td><td>${indexLabel.charAt(0).toUpperCase() + indexLabel.slice(1)}</td></tr>
</table>

<h2>Duur en beëindiging</h2>
<table>
  <tr><td>Ingangsdatum</td><td><strong>${formatDate(data.startDate)}</strong></td></tr>
  <tr><td>Contractduur</td><td>${isFixed ? `Bepaalde tijd tot en met ${formatDate(data.endDate)}` : 'Onbepaalde tijd'}</td></tr>
  <tr><td>Opzegtermijn huurder</td><td>${noticePeriod} ${noticePeriod === 1 ? 'maand' : 'maanden'}</td></tr>
  <tr><td>Opzegtermijn verhuurder</td><td>Conform Burgerlijk Wetboek art. 7:271 BW</td></tr>
</table>

<div class="articles">

<h2>Artikelen</h2>

<div class="art">
  <div class="art-heading">Artikel 1 &mdash; Omschrijving en bestemming van het gehuurde</div>
  <div class="art-body">
    <p>1.1 Verhuurder verhuurt aan huurder(s), die van verhuurder huurt/huren, de hierboven omschreven woonruimte, hierna te noemen &ldquo;het gehuurde&rdquo;.</p>
    <p>1.2 Het gehuurde is uitsluitend bestemd om te worden gebruikt als woonruimte voor de in de aanhef genoemde huurder(s) en de tot zijn/haar/hun huishouden behorende personen.</p>
    <p>1.3 Huurder is niet gerechtigd het gehuurde geheel of gedeeltelijk onder te verhuren of in gebruik af te staan aan derden zonder voorafgaande schriftelijke toestemming van verhuurder.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 2 &mdash; Huurprijs en betaling</div>
  <div class="art-body">
    <p>2.1 De huurprijs bedraagt <strong>${formatCurrency(data.monthlyRent)}</strong> per kalendermaand, bij vooruitbetaling te voldoen, uiterlijk op de ${data.billingDay ?? 1}e dag van de periode waarop de betaling betrekking heeft.</p>
    <p>2.2 Betaling geschiedt per bankoverschrijving op een door verhuurder op te geven rekeningnummer. Het is huurder niet toegestaan de huurprijs te verrekenen met eventuele vorderingen op verhuurder.</p>
    <p>2.3 Bij te late betaling is huurder van rechtswege in verzuim en is over de verschuldigde som de wettelijke rente verschuldigd conform art. 6:119 BW, te rekenen vanaf de vervaldatum.</p>
    ${data.deposit ? `<p>2.4 Huurder heeft bij aanvang van de huurovereenkomst een waarborgsom van <strong>${formatCurrency(data.deposit)}</strong> betaald. Verhuurder restituteert de waarborgsom na beëindiging van de huur, verminderd met eventuele vorderingen, uiterlijk binnen 14 dagen.</p>` : ''}
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 3 &mdash; Huurprijswijziging en indexatie</div>
  <div class="art-body">
    <p>3.1 De huurprijs wordt jaarlijks per 1 juli aangepast ${indexLabel}.</p>
    ${data.indexation !== 'geen' ? `<p>3.2 Verhuurder stelt huurder uiterlijk twee maanden voor de ingangsdatum schriftelijk op de hoogte van de nieuwe huurprijs. Huurder heeft het recht om de huurprijswijziging voor te leggen aan de Huurcommissie conform de Uitvoeringswet huurprijzen woonruimte.</p>` : ''}
    <p>${data.indexation !== 'geen' ? '3.3' : '3.2'} Verhuurder kan met instemming van huurder de huurprijs ook tussentijds aanpassen in verband met aangebrachte verbeteringen conform art. 7:255 BW.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 4 &mdash; Staat van oplevering en onderhoud</div>
  <div class="art-body">
    <p>4.1 Het gehuurde wordt bij aanvang van de huurovereenkomst in goede staat van onderhoud aan huurder opgeleverd. Partijen stellen bij aanvang een inspectierapport op dat als bijlage aan deze overeenkomst wordt gehecht.</p>
    <p>4.2 Verhuurder is verplicht op verlangen van huurder gebreken te verhelpen conform art. 7:206 BW, tenzij dit onmogelijk is of uitgaven vereist die in de gegeven omstandigheden niet van verhuurder gevergd kunnen worden.</p>
    <p>4.3 Klein dagelijks onderhoud is voor rekening van huurder conform het Besluit kleine herstellingen (art. 7:240 BW), waaronder begrepen: het vervangen van kapotte lampen, verstopte afvoerleidingen, kraanleren, hang- en sluitwerk en schilderwerk van binnen.</p>
    <p>4.4 Groot onderhoud en herstel van structurele gebreken zijn voor rekening van verhuurder.</p>
    <p>4.5 Huurder meldt gebreken zo spoedig mogelijk schriftelijk aan verhuurder. Verhuurder heeft toegang tot het gehuurde voor onderhoud en inspectie, na voorafgaande aankondiging met een termijn van 48 uur, tenzij sprake is van spoed.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 5 &mdash; Verplichtingen van huurder</div>
  <div class="art-body">
    <p>5.1 Huurder is verplicht het gehuurde als een goed huurder te gebruiken conform art. 7:213 BW en de daarvoor geldende woonregels, plaatselijke verordeningen en gedragsregels van de Vereniging van Eigenaren (VvE), indien van toepassing.</p>
    <p>5.2 Huurder mag zonder schriftelijke toestemming van verhuurder geen veranderingen aan het gehuurde aanbrengen die bij het einde van de huur niet gemakkelijk kunnen worden verwijderd, conform art. 7:215 BW.</p>
    <p>5.3 Huurder is aansprakelijk voor schade aan het gehuurde voor zover deze door zijn/haar schuld of toedoen is veroorzaakt. Huurder is verplicht een inboedelverzekering af te sluiten en deze gedurende de huurperiode in stand te houden.</p>
    <p>5.4 Huurder verbindt zich ertoe geen overlast te veroorzaken aan omwonenden en te handelen in overeenstemming met burenrechtelijke bepalingen (art. 5:37 e.v. BW).</p>
    <p>5.5 Huurder is niet gerechtigd in het gehuurde een bedrijf of praktijk uit te oefenen, tenzij schriftelijk anders overeengekomen.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 6 &mdash; Beëindiging en opzegging</div>
  <div class="art-body">
    ${isFixed
      ? `<p>6.1 Deze huurovereenkomst is aangegaan voor bepaalde tijd en eindigt van rechtswege op ${formatDate(data.endDate)}, zonder dat daarvoor opzegging vereist is, conform art. 7:228 BW.</p>
    <p>6.2 Indien verhuurder de huurovereenkomst niet wenst voort te zetten, stelt hij/zij huurder hiervan schriftelijk op de hoogte uiterlijk drie maanden voor de einddatum.</p>`
      : `<p>6.1 Deze huurovereenkomst is aangegaan voor onbepaalde tijd en kan door huurder worden beëindigd door schriftelijke opzegging met een opzegtermijn van <strong>${noticePeriod} ${noticePeriod === 1 ? 'maand' : 'maanden'}</strong>.</p>
    <p>6.2 Verhuurder kan de huurovereenkomst uitsluitend opzeggen op de in art. 7:274 BW limitatief opgesomde gronden, met inachtneming van de geldende opzegtermijnen.</p>`}
    <p>${isFixed ? '6.3' : '6.3'} Bij beëindiging levert huurder het gehuurde in de staat zoals beschreven in het inspectierapport op, vrij van achtergebleven zaken en met aanlevering van alle sleutels.</p>
    <p>6.4 Kosten van herstel van schade boven normale slijtage worden bij eindoplevering in rekening gebracht en verrekend met de waarborgsom.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 7 &mdash; Verzekering en aansprakelijkheid</div>
  <div class="art-body">
    <p>7.1 Verhuurder draagt zorg voor een adequate opstalverzekering van het gehuurde. Huurder is verantwoordelijk voor een inboedelverzekering voor zijn/haar eigendommen.</p>
    <p>7.2 Verhuurder is niet aansprakelijk voor schade aan de inboedel van huurder, tenzij er sprake is van een gebrek aan het gehuurde dat aan verhuurder is toe te rekenen en waarvan verhuurder op de hoogte was of had behoren te zijn.</p>
  </div>
</div>

<div class="art">
  <div class="art-heading">Artikel 8 &mdash; Overige bepalingen</div>
  <div class="art-body">
    <p>8.1 Op deze overeenkomst is uitsluitend Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement waar het gehuurde is gelegen, met dien verstande dat huurder zich te allen tijde kan wenden tot de Huurcommissie voor geschillen over huurprijzen en servicekosten.</p>
    <p>8.2 Indien een bepaling van deze overeenkomst nietig of vernietigbaar blijkt, laat dit de geldigheid van de overige bepalingen onverlet. Partijen zullen in dat geval een vervangende bepaling overeenkomen die de strekking van de nietige bepaling zo dicht mogelijk benadert.</p>
    <p>8.3 Wijzigingen in of aanvullingen op deze overeenkomst zijn slechts geldig indien schriftelijk overeengekomen en door beide partijen ondertekend.</p>
    <p>8.4 Op deze huurovereenkomst zijn de bepalingen van Boek 7, titel 4 van het Burgerlijk Wetboek van toepassing.</p>
  </div>
</div>

</div>

<div class="signatures">
  <div class="sig-block">
    <div class="sig-party">Verhuurder</div>
    <div class="sig-field">
      <div class="sig-label">Naam</div>
      <div class="sig-line"></div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Datum</div>
      <div class="sig-line"></div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Handtekening</div>
      <div class="sig-line" style="height:40px;"></div>
    </div>
  </div>
  ${data.tenants.map((t, i) => `
  <div class="sig-block">
    <div class="sig-party">Huurder${data.tenants.length > 1 ? ' ' + (i + 1) : ''}</div>
    <div class="sig-field">
      <div class="sig-label">Naam</div>
      <div class="sig-line">${t.name}</div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Datum</div>
      <div class="sig-line"></div>
    </div>
    <div class="sig-field">
      <div class="sig-label">Handtekening</div>
      <div class="sig-line" style="height:40px;"></div>
    </div>
  </div>`).join('')}
</div>

<div class="disclaimer">
  Dit contract is opgesteld op basis van het ROZ-model huurovereenkomst woonruimte en de bepalingen van Boek 7 BW. Raadpleeg bij twijfel een juridisch adviseur of de Huurcommissie (0800-4887243, gratis).
</div>

<div class="footer">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1900 360" role="img" aria-label="Domio" style="height:16px;width:auto;opacity:0.3;">
    <text x="974" y="290" font-family="'Helvetica Neue',Arial,sans-serif" font-weight="700" font-size="320" letter-spacing="-8" fill="#163300">Domio</text>
  </svg>
</div>

</body>
</html>`
}

export function downloadContractPDF(data: ContractData) {
  const html = generateContractHTML(data)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500)
    }
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
