import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { Card } from './Card'
import type { PriceToday } from '../lib/api'

export function PriceCard({
  price,
  onSpeak,
}: {
  price: PriceToday
  onSpeak?: () => void
}) {
  const data = price.history.map((v, i) => ({ i, v }))
  const up = price.trend_pct >= 0
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {price.icon}
          </span>
          <div>
            <h3 className="font-display font-bold text-eco-900">{price.material}</h3>
            <p className="text-sm text-slate-500">{price.location}</p>
          </div>
        </div>
        {onSpeak && (
          <button type="button" className="text-xl touch-target" onClick={onSpeak} aria-label="Listen">
            🔊
          </button>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-eco-800">
        ₹{price.low} – ₹{price.high} <span className="text-sm font-semibold text-slate-500">/ {price.unit}</span>
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-sm font-bold ${up ? 'text-eco-600' : 'text-red-600'}`}>
          {up ? '↑' : '↓'} {Math.abs(price.trend_pct)}%
        </span>
        <span className="text-xs text-slate-500">Updated today</span>
      </div>
      {data.length > 1 && (
        <div className="mt-3 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
