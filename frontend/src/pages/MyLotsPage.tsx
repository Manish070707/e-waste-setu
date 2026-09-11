import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Card } from '../components/Card'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { StatusBadge } from '../components/StatusBadge'
import { api, type Lot } from '../lib/api'
import { useApp } from '../lib/AppContext'

export function MyLotsPage() {
  const { t, collectorId } = useApp()
  const [lots, setLots] = useState<Lot[]>([])

  useEffect(() => {
    api.collectorLots(collectorId).then(setLots)
  }, [collectorId])

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.collector.myLotsHi}</h1>
      </header>
      <div className="px-4 space-y-3">
        {lots.map((lot) => (
          <Link key={lot.lot_id} to={`/collector/match/${lot.lot_id}`}>
            <Card className="p-4 mb-3">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-slate-500">{lot.lot_id}</p>
                  <p className="font-bold text-lg">
                    {lot.material} · {lot.weight_kg}kg
                  </p>
                  <p className="text-sm text-slate-600">
                    ₹{lot.est_low} – ₹{lot.est_high} · {lot.location}
                  </p>
                </div>
                <StatusBadge status={lot.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <BottomNavigation />
    </div>
  )
}
