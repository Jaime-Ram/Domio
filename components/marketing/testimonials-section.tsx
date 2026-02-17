'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonialImages = [
  '/images/smiling-waiter-standing-with-arms-crossed-cafa.jpg',
  '/images/chef-cooking-kitchen-while-wearing-professional-attire.jpg',
  '/images/chef-cooking-spaghetti-kitchen.jpg',
]

interface Testimonial {
  id: number
  quote: string
  name: string
  company: string
  role: string
  image: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Domio heeft ons duizenden uren werk bespaard. We kunnen nu onze portefeuille efficiënt beheren, automatisch indexeren en servicekosten afrekenen.",
    name: "Jan de Vries",
    company: "Vastgoedbeheer BV",
    role: "Vastgoedbeheerder",
    image: "/images/testimonials/jan-de-vries.jpg",
    rating: 5,
  },
  {
    id: 2,
    quote: "De eenvoud van het systeem is geweldig. Onze huurders kunnen nu zelf storingsmeldingen indienen en wij beheren alles vanuit één dashboard. Perfect voor vastgoedbeheer!",
    name: "Maria van der Berg",
    company: "Vastgoed Portefeuille",
    role: "Portefeuille Manager",
    image: "/images/testimonials/maria-van-der-berg.jpg",
    rating: 5,
  },
  {
    id: 3,
    quote: "De bankkoppeling en automatische betalingsmatching werkt naadloos. We hebben nu volledige controle over onze huurinkomsten en kunnen alles op één plek beheren.",
    name: "Pieter Bakker",
    company: "Vastgoed Invest",
    role: "Directeur",
    image: "/images/testimonials/pieter-bakker.jpg",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentTestimonial = testimonials[currentIndex]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="border-t bg-white/50 py-24 dark:bg-gray-900/50">
      <div className="container mx-auto w-full max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Rating Stars */}
            <div className="flex gap-1">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Codec Pro', sans-serif" }}>
              &quot;{currentTestimonial.quote}&quot;
            </blockquote>

            {/* Name and Company */}
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentTestimonial.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTestimonial.company}
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="h-10 w-10 rounded-full"
                aria-label="Vorige testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="h-10 w-10 rounded-full"
                aria-label="Volgende testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Column - Profile Image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[500px] w-full max-w-md overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 lg:h-[600px]">
              <div className="relative h-full w-full">
                {/* Profile Image */}
                <img
                  src={testimonialImages[currentTestimonial.id - 1] || testimonialImages[0]}
                  alt={currentTestimonial.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                          <div class="flex h-48 w-48 items-center justify-center rounded-full bg-white/80 text-5xl font-bold text-[#163300] shadow-lg dark:bg-gray-800/80">
                            ${currentTestimonial.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                        </div>
                      `
                    }
                  }}
                />

                {/* Overlay with Name and Role */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent p-6">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white">
                      {currentTestimonial.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      {currentTestimonial.role}, {currentTestimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

