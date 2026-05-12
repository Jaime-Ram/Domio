'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HelpCircle, MessageCircle, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-[#163300] hover:bg-[#356258]"
          >
            <HelpCircle className="h-5 w-5 text-white" />
            <span className="sr-only">Help</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
          <DropdownMenuItem asChild>
            <Link 
              href="/dashboard/landlord/hulp" 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Live chat voor vragen</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

