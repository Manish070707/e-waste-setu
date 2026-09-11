import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Button } from '../components/Button'
import { MapView, type MapMarker } from '../components/MapView'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { RecyclerCard } from '../components/RecyclerCard'
import { VoiceButton } from '../components/VoiceButton'
import { api, type Lot, type Recycler } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { enqueueSync, listSyncQueue, uid } from '../lib/offlineDb'

export function RecyclerMatching() {
  const { lotId } = useParams()
  const { t, locale, online, setPendingSync } = useApp()
  const navigate = useNavigate()
  const [lot, setLot] = useState<Lot | null>(null)
  const [recyclers, setRecyclers] = useState<Recycler[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (lotId && lotId !== 'undefined') {
          const l = await api.getLot(lotId)
          setLot(l)
          const rec = await api.recommend(lotId)
          setRecyclers(rec.recyclers)
        } else {
          const listed = await api.listRecyclers()
          setRecyclers(listed.filter((r) => r.authorization_status === 'Verified'))
          const lots = await api.collectorLots('C-102')
          if (lots[0]) {
            navigate(`/collector/match/${lots[0].lot_id}`, { replace: true })
          }
        }
      } catch {
        try {
          const listed = await api.listRecyclers()
          setRecyclers(listed.filter((r) => r.authorization_status === 'Verified'))
        } catch {
          setError(t.common.error)
        }
      }
    }
    void load()
  }, [lotId, navigate, t.common.error])

  async function select(r: Recycler) {
    if (!lot) {
      navigate('/collector/lot/new')
      return
    }
    setBusy(true)
    setInfo(null)
    try {
      if (!online) {
        await enqueueSync({
          id: uid('sync-txn'),
          type: 'create_transaction',
          payload: {
            lot_id: lot.lot_id,
            recycler_id: r.recycler_id,
            quoted_price_per_kg: r.offered_rate,
          },
          created_at: new Date().toISOString(),
        })
        setPendingSync((await listSyncQueue()).length)
        setInfo(t.offline.queuedTxn)
        return
      }
      const trx = await api.createTransaction(lot.lot_id, r.recycler_id, r.offered_rate)
      navigate(`/collector/handover/${trx.transaction_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error)
    } finally {
      setBusy(false)
    }
  }

  const collectorLat = lot?.latitude ?? 28.4595
  const collectorLng = lot?.longitude ?? 77.0266
  const markers: MapMarker[] = [
    {
      id: 'collector',
      lat: collectorLat,
      lng: collectorLng,
      label: locale === 'en' ? 'Your lot' : 'आपका लॉट',
      kind: 'collector',
    },
    ...recyclers
      .filter((r) => r.latitude != null && r.longitude != null)
      .slice(0, 8)
      .map((r) => ({
        id: r.recycler_id,
        lat: r.latitude as number,
        lng: r.longitude as number,
        label: r.facility_name,
        sublabel: `${r.distance_km} km · ₹${r.offered_rate}/kg`,
        kind: 'recycler' as const,
      })),
  ]

  const top = recyclers[0]

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.match.title}</h1>
        {lot && (
          <p className="text-sm text-slate-600">
            {lot.lot_id} · {lot.material} · {lot.weight_kg}kg · Est. ₹{lot.est_low}–₹{lot.est_high}
          </p>
        )}
      </header>

      <div className="px-4 mb-3 space-y-3">
        <MapView
          center={[collectorLat, collectorLng]}
          markers={markers}
          serviceRadiusKm={12}
          className="h-56 w-full rounded-3xl overflow-hidden border border-eco-100"
        />
        {top && (
          <VoiceButton
            text={
              locale === 'en'
                ? `${top.facility_name} recommended. Rate ${top.offered_rate} rupees per kilo. Distance ${top.distance_km} kilometers. ${top.pickup_available ? 'Pickup available.' : ''}`
                : `${top.facility_name} सुझाया गया। भाव ${top.offered_rate} रुपये प्रति किलो। दूरी ${top.distance_km} किलोमीटर। ${top.pickup_available ? 'पिकअप उपलब्ध।' : ''}`
            }
          />
        )}
        <Link to="/collector/map" className="text-sm font-bold text-eco-700">
          🗺 {t.maps.openMap}
        </Link>
      </div>

      {error && (
        <div className="px-4 mb-3">
          <p className="rounded-2xl bg-amber-50 text-amber-950 p-3 text-sm">{error}</p>
          <Link to="/collector/lot/new">
            <Button className="mt-2 w-full">Create New Lot</Button>
          </Link>
        </div>
      )}
      {info && <p className="px-4 mb-3 rounded-2xl bg-sky-50 text-sky-900 p-3 text-sm">{info}</p>}

      <div className="px-4 space-y-3">
        {recyclers.map((r) => (
          <RecyclerCard
            key={r.recycler_id}
            recycler={r}
            selectLabel={busy ? t.common.loading : t.match.select}
            onSelect={() => void select(r)}
          />
        ))}
        {!error && recyclers.length === 0 && <p className="text-slate-600">{t.common.loading}</p>}
      </div>
      <BottomNavigation />
    </div>
  )
}
