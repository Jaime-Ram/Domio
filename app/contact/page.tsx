'use client'

import { MarketingLayout } from '@/components/marketing/marketing-layout'
import { ContactSection } from '@/components/marketing/contact-section'
import { FooterSection } from '@/components/marketing/footer-section'

export default function ContactPage() {
  return (
    <MarketingLayout>
      <ContactSection />
      <FooterSection />
    </MarketingLayout>
  )
}
