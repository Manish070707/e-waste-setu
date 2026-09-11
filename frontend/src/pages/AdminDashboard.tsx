import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { api } from '../lib/api'

export function AdminDashboard() {
  const [m, setM] = useState<Awaited<ReturnType<typeof api.adminMetrics>> | null>(null)

  useEffect(() => {
    api.adminMetrics().then(setM)
  }, [])

  const metrics = m || {
    total_ewaste_kg: 450,
    formal_recycling_pct: 82,
    active_collectors: 14,
    authorized_recyclers: 3,
    total_collector_earnings: 24500,
    avg_price_improvement_pct: 12,
    transactions: 28,
    pending_handovers: 5,
    hazardous_material_count: 2,
  }

  const cards = [
    { label: 'Total E-Waste Collected', value: `${metrics.total_ewaste_kg} KG`, color: 'bg-eco-100 text-eco-800' },
    { label: 'Formal Recycling %', value: `${metrics.formal_recycling_pct}%`, color: 'bg-teal-100 text-teal-800' },
    { label: 'Active Collectors', value: metrics.active_collectors, color: 'bg-sky-100 text-sky-800' },
    { label: 'Authorized Recyclers', value: metrics.authorized_recyclers, color: 'bg-eco-100 text-eco-800' },
    { label: 'Collector Earnings', value: `₹${metrics.total_collector_earnings.toLocaleString('en-IN')}`, color: 'bg-amber-100 text-amber-800' },
    { label: 'Avg Price Improvement %', value: `${metrics.avg_price_improvement_pct}%`, color: 'bg-teal-100 text-teal-800' },
    { label: 'Transactions', value: metrics.transactions, color: 'bg-sky-100 text-sky-800' },
    { label: 'Pending Handovers', value: metrics.pending_handovers, color: 'bg-amber-100 text-amber-800' },
    { label: 'Hazardous Lots', value: metrics.hazardous_material_count, color: 'bg-red-100 text-red-800' },
  ]

  const weights = [
    { label: 'Authorization', pct: 30, color: 'bg-eco-600' },
    { label: 'Price', pct: 25, color: 'bg-teal-500' },
    { label: 'Distance', pct: 20, color: 'bg-sky-500' },
    { label: 'Pickup', pct: 15, color: 'bg-amber-500' },
    { label: 'Material', pct: 10, color: 'bg-purple-500' },
  ]

  const recyclers = [
    { name: 'Green Recovery Solutions', status: '✓ Verified', color: 'text-eco-600' },
    { name: 'EcoCycle India', status: '✓ Verified', color: 'text-eco-600' },
    { name: 'SafeWaste Recyclers', status: '✓ Verified', color: 'text-eco-600' },
    { name: 'Pending Auth Recyclers', status: '⏳ Pending', color: 'text-amber-600' },
    { name: 'Expired Cert Facility', status: '❌ Expired', color: 'text-red-600' },
    { name: 'Suspended Yard', status: '🔴 Suspended', color: 'text-red-600' },
  ]

  const phases = [
    { title: 'Phase 1', desc: 'Core matchmaking & SIH Demo', active: true },
    { title: 'Phase 2', desc: 'Mobile App & Offline Support', active: false },
    { title: 'Phase 3', desc: 'Hardware Integration & IoT', active: false },
    { title: 'Phase 4', desc: 'Full Analytics & Heatmaps', active: false },
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-eco-800 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-display text-xl font-bold">E-Waste Setu</div>
          <span className="bg-white/20 text-xs px-2 py-1 rounded-full">Admin Analytics · Phase 1</span>
        </div>
        <nav className="hidden sm:flex gap-4 text-sm font-bold">
          <Link to="/" className="hover:text-eco-200">Home</Link>
          <Link to="/collector" className="hover:text-eco-200">Collector</Link>
          <Link to="/recycler" className="hover:text-eco-200">Recycler</Link>
          <Link to="/demo" className="hover:text-eco-200">Demo</Link>
        </nav>
      </header>
      
      <div className="mx-auto max-w-6xl p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-3xl font-bold text-slate-900">SIH Impact Snapshot</h1>
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">Demo data</span>
        </div>
        
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {cards.map((c, i) => (
            <Card key={i} className="p-5 flex flex-col justify-between border border-slate-100 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${c.color}`}>
                  {c.label[0]}
                </div>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-slate-800">{c.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{c.label}</p>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-right">Demo</p>
            </Card>
          ))}
        </div>

        <Card className="p-5 mt-6 border border-slate-100 shadow-sm bg-white">
          <h2 className="font-bold text-lg mb-4">Matching Score Weights</h2>
          <div className="space-y-4">
            {weights.map(w => (
              <div key={w.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{w.label}</span>
                  <span className="text-slate-500">{w.pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${w.color}`} style={{ width: `${w.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="p-5 border border-slate-100 shadow-sm bg-white">
            <h2 className="font-bold text-lg mb-4">Authorized Recyclers Status</h2>
            <ul className="space-y-3">
              {recyclers.map(r => (
                <li key={r.name} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-medium text-slate-700">{r.name}</span>
                  <span className={`font-semibold ${r.color}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 border border-slate-100 shadow-sm bg-white">
            <h2 className="font-bold text-lg mb-4">Phase Roadmap</h2>
            <div className="space-y-4">
              {phases.map(p => (
                <div key={p.title} className="flex gap-3">
                  <div className="mt-1">
                    <div className={`w-3 h-3 rounded-full ${p.active ? 'bg-eco-600' : 'bg-slate-300'}`}></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${p.active ? 'text-eco-700' : 'text-slate-500'}`}>{p.title}</h3>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 pb-8">
          <p>This admin view is a Phase 1 stub. Full analytics, unit economics, field research forms, and regional heatmap ship in Phase 4.</p>
        </div>
      </div>
    </div>
  )
}
