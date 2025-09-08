// /features/help/components/HelpHero.tsx
import { ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { QUICK_LINKS } from '../data'
import type { JSX } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HelpHero({
  onContact,
}: {
  onContact: () => void
}): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg text-zinc-600">Need a hand?</div>
            <div className="text-2xl font-semibold">
              Documentation & Support for the Auction Plugin
            </div>
            <div className="text-sm text-zinc-500 mt-1">
              Browse guides, search FAQs, check release notes, or contact
              support.
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onContact}>
              Contact support
            </Button>
            <Link to="/publicAuctions">
              <Button>
                Explore auctions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} to={link.href}>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:opacity-90"
              >
                {link.label}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
