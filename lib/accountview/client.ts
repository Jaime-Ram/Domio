/**
 * Accountview Webservices client (SOAP/XML).
 *
 * Accountview is on-premise Windows-boekhoudsoftware. Read-toegang tot
 * betalingen/debiteuren loopt via de Webservices/Backoffice-module van de
 * klant. Deze module exposeert een SOAP-endpoint dat per Accountview-omgeving
 * verschilt.
 *
 * STATUS: de transport-structuur (basic-auth SOAP POST) staat klaar; de exacte
 * operatienaam en response-velden hangen af van de WSDL van de klant en zijn
 * hieronder gemarkeerd met TODO(WSDL). Tot die ingevuld zijn, faalt de fetch
 * luid (geen stille of verkeerde data).
 */

export interface AccountviewCredentials {
  endpoint: string // bv. https://av.klant.nl:8080/services
  username: string
  password: string
}

/** Genormaliseerde betaling, klaar om naar de `payments`-tabel te mappen. */
export interface AccountviewPayment {
  externalId: string
  amount: number // positief = inkomend
  currency: string
  bookingDate: string // ISO yyyy-mm-dd
  valueDate: string | null
  counterpartyIban: string | null
  counterpartyName: string | null
  description: string | null
  raw: unknown
}

// TODO(WSDL): naam van de webservice-operatie die binnengekomen betalingen /
// afgeletterde verkoopfacturen teruggeeft. In te vullen vanaf de Accountview
// Webservices-documentatie van de klant.
const SOAP_OPERATION = '' // bv. 'GetCashEntries' of 'ReadDebtorPayments'
const SOAP_NAMESPACE = 'http://www.accountview.nl/webservices'

function buildEnvelope(op: string, sinceIso: string | null): string {
  // TODO(WSDL): pas de body-parameters aan op de echte operatie.
  const filter = sinceIso ? `<since>${sinceIso}</since>` : ''
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:av="${SOAP_NAMESPACE}">
  <soap:Body>
    <av:${op}>${filter}</av:${op}>
  </soap:Body>
</soap:Envelope>`
}

/**
 * Parse de SOAP-response naar genormaliseerde betalingen.
 * TODO(WSDL): map de echte XML-elementen. Aanrader: voeg `fast-xml-parser` toe
 * en map de repeating payment-nodes naar AccountviewPayment.
 */
function parseAccountviewResponse(_xml: string): AccountviewPayment[] {
  throw new Error(
    'Accountview-response parsing nog niet geconfigureerd. ' +
      'Vul SOAP_OPERATION + parseAccountviewResponse in op basis van de Webservices-WSDL van de klant.',
  )
}

/**
 * Haal betalingen op uit Accountview sinds een optionele datum.
 * Faalt met een duidelijke fout zolang de WSDL-specifieke delen niet zijn ingevuld.
 */
export async function fetchAccountviewPayments(
  creds: AccountviewCredentials,
  sinceIso: string | null = null,
): Promise<AccountviewPayment[]> {
  if (!creds.endpoint) throw new Error('Accountview endpoint ontbreekt')
  if (!SOAP_OPERATION) {
    throw new Error(
      'Accountview-koppeling nog niet geconfigureerd: SOAP_OPERATION leeg. ' +
        'Vereist de Webservices-WSDL van de klant.',
    )
  }

  const auth = Buffer.from(`${creds.username}:${creds.password}`).toString('base64')
  const res = await fetch(creds.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `${SOAP_NAMESPACE}/${SOAP_OPERATION}`,
      Authorization: `Basic ${auth}`,
    },
    body: buildEnvelope(SOAP_OPERATION, sinceIso),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Accountview webservice ${res.status}: ${text.slice(0, 300)}`)
  }

  return parseAccountviewResponse(await res.text())
}
