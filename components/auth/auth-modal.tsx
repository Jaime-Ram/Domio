'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: 'login' | 'signup'
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Demo mode - simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show demo message
    alert('🎯 Demo Modus\n\nAuth functionaliteit is uitgeschakeld.\nDit is alleen een UI demonstratie.')
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Log in om toegang te krijgen tot je dashboard'
              : 'Maak een account aan om te starten'}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription>
            🎯 Demo modus - Auth functionaliteit is uitgeschakeld
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Volledige naam</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jan Jansen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Bezig...' : mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:underline"
            >
              {mode === 'login' 
                ? 'Nog geen account? Registreer hier'
                : 'Al een account? Log hier in'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => alert('🎯 Demo Modus - Wachtwoord reset is uitgeschakeld')}
                className="text-muted-foreground hover:underline"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
