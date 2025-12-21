'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { AppStoreButton } from '@/components/ui/app-store-button'
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Github, 
  Instagram,
  Dribbble,
  Figma
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { label: 'Overview', href: '/overview' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Careers', href: '/careers' },
    { label: 'Help', href: '/help' },
    { label: 'Privacy', href: '/privacy' },
  ]

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Dribbble, href: 'https://dribbble.com', label: 'Dribbble' },
    { icon: Figma, href: 'https://figma.com', label: 'Figma' },
  ]

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left Side - Company Info */}
          <div className="flex flex-col gap-4">
            <div className="py-2">
              <Logo width={120} height={32} />
            </div>
            <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
              Design amazing digital experiences that create more happy in the world.
            </p>
            <nav className="flex flex-wrap gap-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side - App Downloads */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Get the app
            </h3>
            <div className="flex flex-col gap-3">
              <AppStoreButton 
                platform="apple" 
                href="https://apps.apple.com" 
              />
              <AppStoreButton 
                platform="google" 
                href="https://play.google.com" 
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Domio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
