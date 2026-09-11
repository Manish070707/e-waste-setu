import { StatusBadge } from './StatusBadge'
import type { Recycler } from '../lib/api'
import { Button } from './Button'
import { Card } from './Card'

export function RecyclerCard({
  recycler,
  onSelect,
  selectLabel = 'Select Recycler',
}: {
  recycler: Recycler
  onSelect?: () => void
  selectLabel?: string
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-eco-900">{recycler.facility_name}</h3>
          <p className="text-sm text-slate-600">{recycler.location} · {recycler.distance_km} km</p>
        </div>
        <StatusBadge status={recycler.authorization_status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-eco-50 p-3">
          <div className="text-slate-500">Rate</div>
          <div className="font-bold text-eco-800">₹{recycler.offered_rate}/kg</div>
        </div>
        <div className="rounded-2xl bg-eco-50 p-3">
          <div className="text-slate-500">Estimate</div>
          <div className="font-bold text-eco-800">
            {recycler.estimated_total != null ? `₹${recycler.estimated_total.toLocaleString('en-IN')}` : '—'}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {recycler.pickup_available && (
          <span className="rounded-full bg-sky-50 text-sky-800 px-3 py-1 text-xs font-semibold">Pickup Available</span>
        )}
        <span className="rounded-full bg-slate-50 text-slate-700 px-3 py-1 text-xs font-semibold">★ {recycler.rating}</span>
      </div>
      {recycler.reasons?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 mb-1">Why recommended?</p>
          <div className="flex flex-wrap gap-1.5">
            {recycler.reasons.map((r) => (
              <span key={r} className="rounded-full bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-semibold">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500">Accepts: {recycler.materials_accepted.join(', ')}</p>
      {onSelect && (
        <Button className="w-full" onClick={onSelect}>
          {selectLabel}
        </Button>
      )}
    </Card>
  )
}
