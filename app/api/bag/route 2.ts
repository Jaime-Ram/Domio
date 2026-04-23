import { NextRequest, NextResponse } from 'next/server'

// BAG pand lookup via Kadaster API (vereist BAG_API_KEY in .env.local)
// Geeft bouwjaar, oppervlak en status terug voor een gegeven pandIdentificatie.
export async function GET(request: NextRequest) {
  const pandId = request.nextUrl.searchParams.get('pandId')
  if (!pandId) return NextResponse.json({ error: 'pandId required' }, { status: 400 })

  const apiKey = process.env.BAG_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'BAG_API_KEY not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/panden/${pandId}`,
      {
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/hal+json',
          'Accept-Crs': 'epsg:28992',
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return NextResponse.json({ error: 'BAG lookup failed' }, { status: res.status })
    const data = await res.json()
    const pand = data.pand ?? data

    return NextResponse.json({
      bouwjaar: pand.oorspronkelijkBouwjaar ?? null,
      status: pand.status?.waarde ?? null,
      oppervlakte: pand.gebruiksoppervlakte ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'BAG lookup failed' }, { status: 500 })
  }
}
