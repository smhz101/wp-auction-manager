// /features/public-auctions/components/LotCard.tsx
import { Clock, Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatCurrency, hoursUntil } from '../utils'
import { usePublicAuctions } from '../store'
import type { JSX } from 'react'
import type { Lot } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function LotCard(props: {
  lot: Lot
  variant?: 'grid' | 'list'
}): JSX.Element {
  const { lot, variant = 'grid' } = props
  const {
    state: { watchlist },
    actions,
  } = usePublicAuctions()

  const endingIn = hoursUntil(lot.endsAt)
  const watchOn = watchlist.has(lot.id)

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden ${variant === 'list' ? 'flex' : ''}`}
    >
      <div
        className={`${variant === 'list' ? 'w-56' : 'aspect-[4/3]'} overflow-hidden`}
      >
        <img
          src={lot.imageUrl}
          alt={lot.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to="/publicAuctions" className="block font-medium truncate">
              {lot.title}
            </Link>
            <div className="mt-1 text-xs text-zinc-500">
              {lot.location} • {lot.condition}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {lot.categories.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
              {lot.reserveMet && <Badge variant="outline">Reserve met</Badge>}
              {lot.buyNowPrice ? (
                <Badge variant="default">Buy Now</Badge>
              ) : null}
            </div>
          </div>

          <Button
            variant={watchOn ? 'default' : 'outline'}
            size="icon"
            onClick={() => actions.toggleWatch(lot.id)}
          >
            <Heart className={`h-4 w-4 ${watchOn ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">Current bid</div>
            <div className="text-lg font-semibold">
              {formatCurrency(lot.currentBid, lot.currency)}
            </div>
            {lot.buyNowPrice && (
              <div className="text-xs text-zinc-500">
                Buy now {formatCurrency(lot.buyNowPrice, lot.currency)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              {lot.status === 'ended' ? 'Ended' : `Ends in ${endingIn}h`}
            </div>
            <div className="text-xs text-zinc-500">{lot.bidsCount} bid(s)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
