import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { QRCard } from '../components/QRCard'
import { StatusBadge } from '../components/StatusBadge'
import { MapView } from '../components/MapView'
import { VoiceButton } from '../components/VoiceButton'
import { api, type Handover } from '../lib/api'
import { useApp } from '../lib/AppContext'

export function HandoverPage() {
  const { trxId } = useParams()
  const { t, locale } = useApp()
  const [data, setData] = useState<Handover | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!trxId) return
    try {
      setData(await api.getHandover(trxId))
    } catch {
      setError(t.common.error)
    }
  }

  useEffect(() => {
    void load()
  }, [trxId])

  async function confirm() {
    if (!trxId || !data) return
    setBusy(true)
    try {
      const weight = data.transaction.final_weight ?? data.lot.weight_kg
      const updated = await api.confirmHandover(trxId, {
        final_weight: weight,
        final_price: Math.round(weight * data.transaction.quoted_price_per_kg * 100) / 100,
        payment_method: 'Cash',
        mark_paid: true,
        handover_location: data.lot.location,
      })
      setData(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error)
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <p>{error || t.common.loading}</p>
      </div>
    )
  }

  const trx = data.transaction
  const verified = trx.transaction_status === 'PaymentCompleted' || data.lot.status === 'RecyclerVerified'

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector/earnings" className="text-sm font-bold text-eco-700">
          ← Earnings
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.handover.title}</h1>
        {verified && (
          <p className="mt-2 inline-flex rounded-full bg-eco-100 text-eco-800 px-3 py-1 text-sm font-bold">
            ✓ {t.handover.verified}
          </p>
        )}
        <div className="mt-3">
          <VoiceButton
            text={
              locale === 'hi'
                ? `लेनदेन ${trxId}. सामग्री ${trx.material}. अंतिम कीमत रुपये ${trx.final_price ?? 0}. भुगतान स्थिति ${trx.payment_status}.`
                : `Transaction ${trxId}. Material ${trx.material}. Final price rupees ${trx.final_price ?? 0}. Payment status ${trx.payment_status}.`
            }
          />
        </div>
      </header>

      <div className="px-4 space-y-3">
        <Card className="p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Lot ID</p>
            <p className="font-mono font-bold">{data.lot.lot_id}</p>
          </div>
          <div>
            <p className="text-slate-500">Transaction</p>
            <p className="font-mono font-bold">{trx.transaction_id}</p>
          </div>
          <div>
            <p className="text-slate-500">Collector</p>
            <p className="font-bold">{trx.collector_id}</p>
          </div>
          <div>
            <p className="text-slate-500">Recycler</p>
            <p className="font-bold">{data.recycler.facility_name}</p>
          </div>
          <div>
            <p className="text-slate-500">Material</p>
            <p className="font-bold">{trx.material}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment</p>
            <StatusBadge status={trx.payment_status} />
          </div>
          <div>
            <p className="text-slate-500">Initial weight</p>
            <p className="font-bold">{trx.weight_kg} kg</p>
          </div>
          <div>
            <p className="text-slate-500">Final weight</p>
            <p className="font-bold">{trx.final_weight ?? '—'} kg</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500">Final price</p>
            <p className="font-display text-3xl font-bold text-eco-800">
              {trx.final_price != null ? `₹${trx.final_price.toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
        </Card>

        <QRCard
          value={trx.transaction_id}
          label={t.handover.qrLabel}
          meta={`${data.lot.lot_id} · ${trx.material} · ${trx.final_weight ?? trx.weight_kg}kg`}
          speakText={
            locale === 'en'
              ? `${t.handover.qrSpeak} ${trx.transaction_id}. Material ${trx.material}. Final price ${trx.final_price ?? 'pending'} rupees.`
              : `${t.handover.qrSpeak} ${trx.transaction_id}. सामग्री ${trx.material}. अंतिम कीमत ${trx.final_price ?? 'लंबित'} रुपये।`
          }
        />

        {(data.lot.latitude != null || data.recycler.latitude != null) && (
          <Card className="p-3">
            <MapView
              center={[data.lot.latitude ?? 28.4595, data.lot.longitude ?? 77.0266]}
              markers={[
                {
                  id: 'lot',
                  lat: data.lot.latitude ?? 28.4595,
                  lng: data.lot.longitude ?? 77.0266,
                  label: data.lot.lot_id,
                  kind: 'collector',
                },
                {
                  id: data.recycler.recycler_id,
                  lat: data.recycler.latitude ?? 28.46,
                  lng: data.recycler.longitude ?? 77.03,
                  label: data.recycler.facility_name,
                  kind: 'recycler',
                },
              ]}
              className="h-44 w-full rounded-2xl overflow-hidden"
            />
          </Card>
        )}

        <Card className="p-4">
          <h2 className="font-bold mb-3">Timeline</h2>
          <ol className="space-y-3">
            {data.timeline.map((ev, idx) => (
              <li key={ev.event_key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`h-3 w-3 rounded-full ${ev.completed ? 'bg-eco-600' : 'bg-slate-300'}`}
                  />
                  {idx < data.timeline.length - 1 && <span className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                <div className="pb-3">
                  <p className={`font-semibold ${ev.completed ? 'text-eco-900' : 'text-slate-400'}`}>
                    {locale === 'hi' ? ev.label_hi || ev.label_en : ev.label_en}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {!verified && (
          <Button className="w-full" disabled={busy} onClick={() => void confirm()}>
            {busy ? t.common.loading : t.handover.confirm}
          </Button>
        )}
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>
      <BottomNavigation />
    </div>
  )
}
