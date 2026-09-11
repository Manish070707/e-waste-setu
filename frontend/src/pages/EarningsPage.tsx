import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Card } from '../components/Card'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { TransactionCard } from '../components/TransactionCard'
import { VoiceButton } from '../components/VoiceButton'
import { api, type Earnings } from '../lib/api'
import { useApp } from '../lib/AppContext'

export function EarningsPage() {
  const { t, locale, collectorId } = useApp()
  const [data, setData] = useState<Earnings | null>(null)

  useEffect(() => {
    api.earnings(collectorId).then(setData).catch(() => setData(null))
  }, [collectorId])

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.earnings.title}</h1>
      </header>

      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 col-span-2 rounded-3xl bg-eco-800 text-white shadow-[0_8px_30px_rgba(6,78,59,0.06)]">
          <p className="text-eco-100 text-sm">{t.earnings.total}</p>
          <p className="font-display text-4xl font-bold">
            ₹{(data?.total_earnings ?? 0).toLocaleString('en-IN')}
          </p>
        </div>
        <Card className="p-4">
          <p className="text-xs text-slate-500">{t.earnings.pending}</p>
          <p className="text-2xl font-bold text-amber-700">₹{(data?.pending ?? 0).toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">{t.earnings.transactions}</p>
          <p className="text-2xl font-bold">{data?.transactions_count ?? 0}</p>
        </Card>
        <Card className="p-4 col-span-2">
          <p className="text-xs text-slate-500">{t.earnings.sold}</p>
          <p className="text-2xl font-bold">{data?.material_sold_kg ?? 0} KG</p>
        </Card>
      </div>

      <div className="px-4 mt-2 mb-4">
        <VoiceButton
          text={
            locale === 'hi'
              ? `कुल कमाई रुपये ${data?.total_earnings ?? 0}. ${data?.transactions_count ?? 0} लेनदेन. ${data?.material_sold_kg ?? 0} किलोग्राम बेचे. लंबित रुपये ${data?.pending ?? 0}.`
              : `Total earnings rupees ${data?.total_earnings ?? 0}. ${data?.transactions_count ?? 0} transactions. ${data?.material_sold_kg ?? 0} kilograms sold. Pending rupees ${data?.pending ?? 0}.`
          }
        />
      </div>

      <div className="px-4 space-y-3">
        <p className="text-sm text-slate-500">Cash fully supported · UPI optional</p>
        {data?.items.map((item) => (
          <Link key={item.transaction_id} to={`/collector/handover/${item.transaction_id}`}>
            <div className="mb-3">
              <TransactionCard item={item} />
            </div>
          </Link>
        ))}
      </div>
      <BottomNavigation />
    </div>
  )
}
