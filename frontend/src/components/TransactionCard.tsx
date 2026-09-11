import { StatusBadge } from './StatusBadge'
import type { Transaction } from '../lib/api'
import { Card } from './Card'

export function TransactionCard({ item }: { item: Transaction }) {
  return (
    <Card className="p-4 flex items-center justify-between gap-3">
      <div>
        <p className="font-bold text-eco-900">
          {item.material} · {item.final_weight ?? item.weight_kg}kg
        </p>
        <p className="text-sm text-slate-500">
          {item.recycler_name || item.recycler_id} · {item.payment_method || '—'}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">₹{(item.final_price ?? item.quoted_price_per_kg * item.weight_kg).toLocaleString('en-IN')}</p>
        <StatusBadge status={item.payment_status} />
      </div>
    </Card>
  )
}
