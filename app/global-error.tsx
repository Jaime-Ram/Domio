'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <h1>Applicatiefout</h1>
          <p>{error.message || 'Er is een onverwachte fout opgetreden.'}</p>
          <button onClick={reset}>Probeer opnieuw</button>
        </div>
      </body>
    </html>
  )
}


