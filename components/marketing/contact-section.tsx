'use client'

import { useState } from 'react'
import { Phone, MessageSquare, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    details: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would typically send the form data to your backend/API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        details: '',
      })
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="max-w-[85rem] px-6 py-10 md:px-8 lg:py-14 mx-auto">
      <div className="max-w-2xl lg:max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl dark:text-white">
            Nog vragen?
          </h1>
          <p className="mt-2 text-lg font-medium text-pretty text-gray-600 sm:text-xl leading-8 dark:text-gray-400">
            We helpen je graag verder met al je vragen.
          </p>
        </div>

        <div className="mt-12 grid items-center lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Form Card */}
          <div className="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 dark:border-neutral-700">
            <h2 className="mb-8 text-xl font-semibold text-gray-800 dark:text-neutral-200">
              Vul het formulier in
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hs-firstname-contacts-1" className="sr-only">
                      Voornaam
                    </label>
                    <input
                      type="text"
                      name="hs-firstname-contacts-1"
                      id="hs-firstname-contacts-1"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-[#002A1F] focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Voornaam"
                    />
                  </div>

                  <div>
                    <label htmlFor="hs-lastname-contacts-1" className="sr-only">
                      Achternaam
                    </label>
                    <input
                      type="text"
                      name="hs-lastname-contacts-1"
                      id="hs-lastname-contacts-1"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-[#002A1F] focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Achternaam"
                    />
                  </div>
                </div>
                {/* End Grid */}

                <div>
                  <label htmlFor="hs-email-contacts-1" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="hs-email-contacts-1"
                    id="hs-email-contacts-1"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-[#002A1F] focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label htmlFor="hs-phone-number-1" className="sr-only">
                    Telefoonnummer
                  </label>
                  <input
                    type="text"
                    name="hs-phone-number-1"
                    id="hs-phone-number-1"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-[#002A1F] focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Telefoonnummer"
                  />
                </div>

                <div>
                  <label htmlFor="hs-about-contacts-1" className="sr-only">
                    Details
                  </label>
                  <textarea
                    id="hs-about-contacts-1"
                    name="hs-about-contacts-1"
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-[#002A1F] focus:ring-[#002A1F] disabled:opacity-50 disabled:pointer-events-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Details"
                  ></textarea>
                </div>
              </div>
              {/* End Grid */}

              <div className="mt-4 grid">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-xl border border-transparent bg-[#002A1F] text-white hover:bg-[#356258] focus:outline-none focus:bg-[#356258] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'Verzenden...' : 'Verstuur bericht'}
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                  We nemen binnen 1-2 werkdagen contact met je op.
                </p>
              </div>
            </form>
          </div>
          {/* End Card */}

          <div className="divide-y divide-gray-200 dark:divide-neutral-800">
            {/* Icon Block */}
            <div className="flex gap-x-7 py-6">
              <Phone className="shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" />
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">Direct contact</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Bel ons direct voor hulp met al je vragen over Domio.
                </p>
                <Link
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="tel:+31646231696"
                >
                  +31 6 46 23 16 96
                  <ArrowRight className="shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1" />
                </Link>
              </div>
            </div>
            {/* End Icon Block */}

            {/* Icon Block */}
            <div className="flex gap-x-7 py-6">
              <MessageSquare className="shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" />
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">Veelgestelde vragen</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Vind snel antwoorden op veelgestelde vragen over Domio.
                </p>
                <Link
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="#faq"
                >
                  Bekijk FAQ
                  <ArrowRight className="shrink-0 size-2.5 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1" />
                </Link>
              </div>
            </div>
            {/* End Icon Block */}

            {/* Icon Block */}
            <div className="flex gap-x-7 py-6">
              <Mail className="shrink-0 size-6 mt-1.5 text-gray-800 dark:text-neutral-200" />
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">Contact via email</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Als je liever een email stuurt, gebruik dan
                </p>
                <Link
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="mailto:contact@domiovastgoedbeheer.nl"
                >
                  contact@domiovastgoedbeheer.nl
                </Link>
              </div>
            </div>
            {/* End Icon Block */}
          </div>
        </div>
      </div>
    </section>
  )
}

