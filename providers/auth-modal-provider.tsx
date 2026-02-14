'use client'

import React, { createContext, useContext, useState } from 'react'
import { AuthModal } from '@/components/auth/auth-modal'

type AuthModalContextType = {
  openLogin: () => void
  openSignup: () => void
}

const AuthModalContext = createContext<AuthModalContextType | null>(null)

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const openLogin = () => { setMode('login'); setOpen(true) }
  const openSignup = () => { setMode('signup'); setOpen(true) }
  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup }}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} defaultMode={mode} />
    </AuthModalContext.Provider>
  )
}
