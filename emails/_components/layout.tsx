import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components'
import * as React from 'react'

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const LOGO_URL = 'https://domiovastgoedbeheer.nl/images/DomioLogo.png'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', margin: 0, padding: 0, fontFamily: font }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Logo */}
          <Section style={{ textAlign: 'center', padding: '40px 0 28px' }}>
            <Img
              src={LOGO_URL}
              width="110"
              alt="Domio"
              style={{ display: 'inline-block' }}
            />
          </Section>

          {/* Body — flat white, no card rounding */}
          <Section style={{
            backgroundColor: '#ffffff',
            padding: '48px 48px 40px',
            textAlign: 'center',
          }}>
            {children}
          </Section>

          {/* Footer — full-width dark green */}
          <Section style={{
            backgroundColor: '#163300',
            padding: '32px 40px',
            textAlign: 'center',
          }}>
            <Img
              src={LOGO_URL}
              width="72"
              alt="Domio"
              style={{ display: 'inline-block', marginBottom: '16px', filter: 'brightness(0) invert(1)' }}
            />
            <Text style={{ color: '#9FE870', fontSize: '12px', margin: '0 0 8px', fontFamily: font }}>
              <Link href="https://domiovastgoedbeheer.nl/privacy" style={{ color: '#9FE870', textDecoration: 'underline' }}>
                Privacybeleid
              </Link>
              {' · '}
              <Link href="mailto:hallo@domiovastgoedbeheer.nl" style={{ color: '#9FE870', textDecoration: 'underline' }}>
                Contact
              </Link>
            </Text>
            <Text style={{ color: '#4d7a3a', fontSize: '11px', margin: 0, fontFamily: font }}>
              Domio Vastgoedbeheer B.V. · KvK 12345678
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export const emailStyles = {
  font,
  h1: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111111',
    margin: '0 0 12px',
    lineHeight: '1.25',
    letterSpacing: '-0.3px',
    fontFamily: font,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  body: {
    fontSize: '15px',
    color: '#555555',
    lineHeight: '1.65',
    margin: '0 0 24px',
    fontFamily: font,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  small: {
    fontSize: '12px',
    color: '#aaaaaa',
    lineHeight: '1.5',
    fontFamily: font,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  monoLink: {
    fontSize: '12px',
    color: '#aaaaaa',
    fontFamily: 'Monaco, Menlo, Courier New, monospace',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  divider: {
    borderColor: '#f0f0f0',
    margin: '32px 0',
  } as React.CSSProperties,
}
