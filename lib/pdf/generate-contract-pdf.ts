/**
 * Genereer een huurcontract-PDF als downloadbare HTML.
 * Wordt client-side gerendered en via window.print() of een iframe geprint naar PDF.
 */

export interface ContractData {
  propertyAddress: string
  monthlyRent: number
  tenants: { name: string; email?: string; phone?: string }[]
  startDate?: string
  endDate?: string
  deposit?: number
  landlordName?: string
  landlordAddress?: string
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
  const tenantBlock = data.tenants
    .map(
      (t, i) => `
      <tr>
        <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;"><strong>Huurder ${data.tenants.length > 1 ? i + 1 : ''}</strong></td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${t.name}</td>
      </tr>
      ${t.email ? `<tr><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">E-mail</td><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${t.email}</td></tr>` : ''}
      ${t.phone ? `<tr><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Telefoon</td><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${t.phone}</td></tr>` : ''}
    `
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>Huurovereenkomst — ${data.propertyAddress}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none !important; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; color: #163300; }
    h2 { font-size: 16px; margin-top: 28px; margin-bottom: 8px; color: #163300; border-bottom: 2px solid #163300; padding-bottom: 4px; }
    p { margin-bottom: 8px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #163300; padding-bottom: 16px; }
    .header-logo { font-size: 28px; font-weight: 700; color: #163300; }
    .header-meta { text-align: right; font-size: 12px; color: #64748b; }
    .article { margin-bottom: 16px; }
    .article-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
    .article-body { font-size: 13px; color: #334155; }
    .signatures { display: flex; gap: 40px; margin-top: 40px; }
    .sig-block { flex: 1; border-top: 1px solid #cbd5e1; padding-top: 12px; }
    .sig-label { font-size: 12px; color: #64748b; }
    .sig-line { margin-top: 40px; border-top: 1px solid #0f172a; padding-top: 4px; font-size: 12px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-logo">Domio</div>
      <p style="font-size:12px; color:#64748b; margin:0;">Vastgoedbeheer</p>
    </div>
    <div class="header-meta">
      <p style="margin:0;">Datum: ${formatDate(new Date().toISOString())}</p>
      <p style="margin:0;">Ref: DOM-${Date.now().toString(36).toUpperCase()}</p>
    </div>
  </div>

  <h1>Huurovereenkomst</h1>
  <p style="color:#64748b; margin-bottom: 24px;">${data.propertyAddress}</p>

  <h2>Partijen</h2>
  <table>
    <tr>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; width: 160px;"><strong>Verhuurder</strong></td>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${data.landlordName || '_______________'}</td>
    </tr>
    ${data.landlordAddress ? `<tr><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Adres</td><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${data.landlordAddress}</td></tr>` : ''}
    ${tenantBlock}
  </table>

  <h2>Het gehuurde</h2>
  <table>
    <tr>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; width: 160px;">Adres</td>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;"><strong>${data.propertyAddress}</strong></td>
    </tr>
  </table>

  <h2>Huurprijs en voorwaarden</h2>
  <table>
    <tr>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; width: 160px;">Huurprijs per maand</td>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;"><strong>${formatCurrency(data.monthlyRent)}</strong></td>
    </tr>
    <tr>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">Ingangsdatum</td>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${formatDate(data.startDate)}</td>
    </tr>
    <tr>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">Einddatum</td>
      <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${data.endDate ? formatDate(data.endDate) : 'Onbepaalde tijd'}</td>
    </tr>
    ${data.deposit ? `<tr><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">Waarborgsom</td><td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${formatCurrency(data.deposit)}</td></tr>` : ''}
  </table>

  <h2>Artikelen</h2>

  <div class="article">
    <p class="article-title">Artikel 1 — Bestemming</p>
    <p class="article-body">Het gehuurde is uitsluitend bestemd om te worden gebruikt als woonruimte door ${tenantNames}.</p>
  </div>

  <div class="article">
    <p class="article-title">Artikel 2 — Betaling</p>
    <p class="article-body">De huurprijs van ${formatCurrency(data.monthlyRent)} is bij vooruitbetaling verschuldigd, uiterlijk op de eerste dag van elke kalendermaand.</p>
  </div>

  <div class="article">
    <p class="article-title">Artikel 3 — Onderhoud</p>
    <p class="article-body">Klein onderhoud en kleine herstellingen zijn voor rekening van de huurder. Groot onderhoud is voor rekening van de verhuurder, conform artikel 7:240 BW.</p>
  </div>

  <div class="article">
    <p class="article-title">Artikel 4 — Opzegging</p>
    <p class="article-body">Opzegging geschiedt schriftelijk met inachtneming van een opzegtermijn van minimaal één maand voor huurder en drie maanden voor verhuurder, tenzij anders overeengekomen.</p>
  </div>

  <div class="article">
    <p class="article-title">Artikel 5 — Toepasselijk recht</p>
    <p class="article-body">Op deze overeenkomst is Nederlands recht van toepassing.</p>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <p class="sig-label">Verhuurder</p>
      <p class="sig-line">Naam: ${data.landlordName || '_______________'}</p>
      <p class="sig-line">Datum: _______________</p>
      <p class="sig-line">Handtekening: _______________</p>
    </div>
    <div class="sig-block">
      <p class="sig-label">Huurder${data.tenants.length > 1 ? 's' : ''}</p>
      ${data.tenants
        .map(
          (t) => `
        <p class="sig-line">Naam: ${t.name}</p>
        <p class="sig-line">Datum: _______________</p>
        <p class="sig-line">Handtekening: _______________</p>
      `
        )
        .join('<br/>')}
    </div>
  </div>

  <div class="footer">
    Gegenereerd door Domio Vastgoedbeheer — ${formatDate(new Date().toISOString())}
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
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
