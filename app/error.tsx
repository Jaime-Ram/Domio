'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Er is iets misgegaan</CardTitle>
          <CardDescription>
            Er is een fout opgetreden bij het laden van de pagina
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-semibold">Fout:</p>
            <p>{error.message || 'Onbekende fout'}</p>
            {error.digest && (
              <p className="mt-2 text-xs">Fout-ID: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Probeer opnieuw
            </Button>
            <Button asChild>
              <Link href="/">Naar home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



