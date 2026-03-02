'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface ConfirmationBlockProps {
  icon: LucideIcon
  title: string
  description: React.ReactNode
  primaryButton: { label: string; href?: string; onClick?: () => void }
  secondaryButton?: { label: React.ReactNode; href?: string; onClick?: () => void; disabled?: boolean; loading?: boolean }
  footerLink?: { label: string; href: string }
}

export function ConfirmationBlock({
  icon: Icon,
  title,
  description,
  primaryButton,
  secondaryButton,
  footerLink,
}: ConfirmationBlockProps) {
  return (
    <div className="mt-8 sm:mt-12 space-y-8 text-center">
      <div>
        <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[#9FE870] text-[#163300]">
          <Icon className="h-12 w-12 sm:h-14 sm:w-14" />
        </div>
        <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
          {title}
        </h3>
        <div className="mt-3 text-base text-gray-600 max-w-sm mx-auto leading-relaxed">
          {description}
        </div>
      </div>
      <div className="space-y-3">
        {primaryButton.href ? (
          <Button
            asChild
            className="w-full h-14 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
          >
            {primaryButton.href.startsWith('http') ? (
              <a href={primaryButton.href} target="_blank" rel="noopener noreferrer">
                {primaryButton.label}
              </a>
            ) : (
              <Link href={primaryButton.href}>{primaryButton.label}</Link>
            )}
          </Button>
        ) : (
          <Button
            onClick={primaryButton.onClick}
            className="w-full h-14 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 font-semibold text-base border-0 shadow-sm"
          >
            {primaryButton.label}
          </Button>
        )}
        {secondaryButton && (
          secondaryButton.href ? (
            <Button
              asChild
              variant="outline"
              className="w-full h-14 rounded-full bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 font-semibold text-base"
            >
              {secondaryButton.href.startsWith('http') ? (
                <a href={secondaryButton.href} target="_blank" rel="noopener noreferrer">{secondaryButton.label}</a>
              ) : (
                <Link href={secondaryButton.href}>{secondaryButton.label}</Link>
              )}
            </Button>
          ) : (
            <Button
              onClick={secondaryButton.onClick}
              disabled={secondaryButton.disabled}
              variant="outline"
              className="w-full h-14 rounded-full bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 font-semibold text-base"
            >
              {secondaryButton.loading ? 'Bezig...' : secondaryButton.label}
            </Button>
          )
        )}
        {footerLink && (
          <Link href={footerLink.href} className="block text-sm font-medium text-[#163300] underline underline-offset-2 hover:no-underline pt-2">
            {footerLink.label}
          </Link>
        )}
      </div>
    </div>
  )
}
