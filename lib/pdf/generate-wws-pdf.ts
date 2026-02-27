/**
 * Genereer een WWS-puntentelling PDF als printbaar HTML-document.
 */

import type { WWResult, WWInput } from '@/lib/wws-calculator'

export interface WWSPDFData {
  propertyAddress: string
  result: WWResult
  input: WWInput
  currentRent?: number
}

function formatDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date()
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function generateWWSHTML(data: WWSPDFData): string {
  const { propertyAddress, result, input, currentRent } = data
  const sectorLabel =
    result.sector === 'sociaal' ? 'Sociaal (≤143 pt)' : result.sector === 'midden' ? 'Midden (144-186 pt)' : 'Vrij (≥187 pt)'
  const sectorColor =
    result.sector === 'sociaal' ? '#64748b' : result.sector === 'midden' ? '#d97706' : '#059669'

  const breakdownRows = result.breakdown
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${item.category}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:600;">${item.punten}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:12px;">${item.toelichting}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>WWS Puntentelling — ${propertyAddress}</title>
  <style>
    @media print { body { margin: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; color: #163300; margin-bottom: 4px; }
    h2 { font-size: 15px; margin-top: 24px; margin-bottom: 8px; color: #163300; border-bottom: 2px solid #163300; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #163300; padding-bottom: 14px; }
    .header-logo { font-size: 26px; font-weight: 700; color: #163300; }
    .header-meta { text-align: right; font-size: 12px; color: #64748b; }
    .score-box { display: flex; gap: 24px; margin: 20px 0; }
    .score-card { flex: 1; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
    .score-card.primary { border-color: #163300; background: #f0fdf4; }
    .score-value { font-size: 28px; font-weight: 700; }
    .score-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    .disclaimer { margin-top: 20px; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #92400e; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-logo">Domio</div>
      <p style="font-size:12px; color:#64748b;">WWS Puntentelling</p>
    </div>
    <div class="header-meta">
      <p style="margin:0;">Datum: ${formatDate()}</p>
      <p style="margin:0;">Ref: WWS-${Date.now().toString(36).toUpperCase()}</p>
    </div>
  </div>

  <h1>Puntentelling Woningwaarderingsstelsel</h1>
  <p style="color:#64748b; margin-bottom:20px;">${propertyAddress}</p>

  <div class="score-box">
    <div class="score-card primary">
      <div class="score-value">${result.punten}</div>
      <div class="score-label">WWS-punten</div>
    </div>
    <div class="score-card" style="border-color:${sectorColor};">
      <div class="score-value" style="color:${sectorColor};">${sectorLabel}</div>
      <div class="score-label">Sector</div>
    </div>
    <div class="score-card">
      <div class="score-value">${formatCurrency(result.maxHuur)}</div>
      <div class="score-label">Max. huurprijs</div>
    </div>
  </div>

  ${currentRent ? `<p style="font-size:13px; color:#64748b; margin-bottom:16px;">Huidige huur: ${formatCurrency(currentRent)} — ${result.maxHuur >= currentRent ? `<span style="color:#059669;">€${(result.maxHuur - currentRent).toFixed(0)} onder maximum</span>` : `<span style="color:#dc2626;">€${Math.abs(result.maxHuur - currentRent).toFixed(0)} boven maximum!</span>`}</p>` : ''}

  <h2>Woninggegevens</h2>
  <table>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; width:200px; color:#64748b;">Type woning</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.typeWoning}</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Bouwjaar</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.bouwjaar}</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Postcode / huisnummer</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.postcode} ${input.huisnummer}</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Woonoppervlakte</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.woonOpp} m²</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Overige ruimtes</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.overigeOpp} m²</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Buitenruimte</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.buitenOpp} m²</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Energielabel</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.energielabel}</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">WOZ-waarde</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${formatCurrency(input.wozWaarde)}</td></tr>
    <tr><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">Verwarming</td><td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">${input.verwarming}</td></tr>
  </table>

  <h2>Puntenbreakdown</h2>
  <table>
    <thead>
      <tr style="background:#f8fafc;">
        <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #163300;">Categorie</th>
        <th style="padding:8px 12px; text-align:right; border-bottom:2px solid #163300;">Punten</th>
        <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #163300;">Toelichting</th>
      </tr>
    </thead>
    <tbody>
      ${breakdownRows}
      <tr style="background:#f0fdf4;">
        <td style="padding:8px 12px; font-weight:700;">Totaal</td>
        <td style="padding:8px 12px; text-align:right; font-weight:700; font-size:16px; color:#163300;">${result.punten}</td>
        <td style="padding:8px 12px;"></td>
      </tr>
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> Deze berekening is indicatief en gebaseerd op vereenvoudigde formules conform het Woningwaarderingsstelsel. 
    Voor een officiële puntentelling dient u de Huurcommissie te raadplegen (huurcommissie.nl).
  </div>

  <div class="footer">
    Gegenereerd door Domio Vastgoedbeheer — ${formatDate()}
  </div>
</body>
</html>`
}

export function downloadWWSPDF(data: WWSPDFData) {
  const html = generateWWSHTML(data)
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
