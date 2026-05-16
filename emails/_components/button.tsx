import { Button as EmailButton } from '@react-email/components'
import * as React from 'react'
import { emailStyles } from './layout'

interface CtaButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function CtaButton({ href, children, variant = 'primary' }: CtaButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <EmailButton
      href={href}
      style={{
        display: 'block',
        width: '100%',
        backgroundColor: isPrimary ? '#9FE870' : '#ffffff',
        color: isPrimary ? '#163300' : '#163300',
        fontSize: '16px',
        fontWeight: '700',
        padding: '16px 32px',
        borderRadius: '100px',
        textDecoration: 'none',
        fontFamily: emailStyles.font,
        textAlign: 'center',
        boxSizing: 'border-box',
        border: isPrimary ? 'none' : '2px solid #163300',
      }}
    >
      {children}
    </EmailButton>
  )
}
