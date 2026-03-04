'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { AppStoreButton, GooglePlayButton } from '@/components/base/buttons/app-store-buttons'

export function FooterSection() {
  return (
    <footer className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto w-full max-w-7xl px-6 md:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Side - Logo, Description, and App Store Buttons */}
          <div className="flex flex-col gap-6 lg:max-w-md lg:flex-1">
            {/* Logo */}
            <div className="overflow-visible">
              <Logo width={200} height={56} />
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start met het beheren van je vastgoedportefeuille met één overzichtelijk platform.
            </p>

            {/* App Store Buttons - Side by Side */}
            <div className="flex flex-row gap-3">
              <GooglePlayButton
                size="md"
                href="https://play.google.com/store/apps/details?id=com.domio"
                className="bg-transparent border-[#163300] text-[#163300] hover:bg-[#163300]/10"
              />
              <AppStoreButton
                size="md"
                href="https://apps.apple.com/app/domio"
                className="bg-transparent border-[#163300] text-[#163300] hover:bg-[#163300]/10"
              />
            </div>
          </div>

          {/* Right Side - Link Columns */}
          <div className="flex flex-col gap-8 items-end">
            {/* Two Columns of Links */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 w-full">
            {/* Product Column - same as header */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Product</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-gray-600 transition-colors hover:text-[#163300] dark:text-gray-400 dark:hover:text-[#163300]"
                  >
                    Functies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-gray-600 transition-colors hover:text-[#163300] dark:text-gray-400 dark:hover:text-[#163300]"
                  >
                    Prijzen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/wws-calculator"
                    className="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-[#163300] dark:hover:text-[#163300]"
                  >
                    WWS Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hulp"
                    className="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-[#163300] dark:hover:text-[#163300]"
                  >
                    Hulp
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-[#163300] dark:hover:text-[#163300]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 transition-colors hover:text-[#163300] dark:text-gray-400 dark:hover:text-[#163300]"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-600 transition-colors hover:text-[#163300] dark:text-gray-400 dark:hover:text-[#163300]"
                  >
                    Voorwaarden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-[#163300] dark:hover:text-[#163300]"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Domio. Alle rechten voorbehouden. | Domio Vastgoedbeheer | KVK: 92211542 | BTW: NL003830384B29
          </p>
        </div>
      </div>
    </footer>
  )
}

