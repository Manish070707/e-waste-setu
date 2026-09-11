import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { api, type Transaction } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { QRScanner } from '../components/QRScanner'

function Shell({ children }: { children: React.ReactNode }) {
  const links = [
    ['', 'Dashboard'],
    ['incoming', 'Incoming Lots'],
    ['prices', 'Price Management'],
    ['profile', 'Profile'],
  ]
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="md:w-64 bg-eco-900 text-white p-5">
        <Link to="/" className="font-display text-xl font-bold">
          E-Waste Setu
        </Link>
        <p className="text-eco-200 text-sm mt-1">Recycler Console</p>
        <nav className="mt-8 space-y-1">
          {links.map(([path, label]) => (
            <NavLink
              key={path}
              to={path ? `/recycler/${path}` : '/recycler'}
              end={!path}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/collector" className="block mt-8 text-sm text-eco-200 underline">
          Collector app
        </Link>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}

function DashboardHome() {
  const { recyclerId } = useApp()
  const [items, setItems] = useState<Transaction[]>([])

  useEffect(() => {
    api.recyclerIncoming(recyclerId).then(setItems)
  }, [recyclerId])

  const pending = items.filter((i) => i.payment_status === 'Pending').length
  const completed = items.filter((i) => i.payment_status === 'Paid').length
  const volume = items.reduce((s, i) => s + (i.final_weight || i.weight_kg), 0)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-eco-900">Dashboard</h1>
      <p className="text-sm text-slate-500 mt-1">Demo recycler · {recyclerId}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Incoming Lots', items.length],
          ['Completed', completed],
          ['Pending Payments', pending],
          ['Volume (kg)', Math.round(volume)],
        ].map(([l, v]) => (
          <Card key={String(l)} className="p-5">
            <p className="text-sm text-slate-500">{l}</p>
            <p className="font-display text-3xl font-bold mt-1">{v}</p>
          </Card>
        ))}
      </div>
      <IncomingTable items={items.slice(0, 8)} />
    </div>
  )
}

function IncomingTable({ items }: { items: Transaction[] }) {
  return (
    <Card className="mt-6 overflow-x-auto">
      <div className="p-4 border-b border-eco-50 font-bold">Incoming Lots</div>
      <table className="w-full text-sm text-left min-w-[640px]">
        <thead className="text-slate-500 bg-slate-50">
          <tr>
            <th className="p-3">Lot ID</th>
            <th className="p-3">Material</th>
            <th className="p-3">Weight</th>
            <th className="p-3">Area</th>
            <th className="p-3">Est. Value</th>
            <th className="p-3">Status</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.transaction_id} className="border-t border-slate-100">
              <td className="p-3 font-mono text-xs">{i.lot_id}</td>
              <td className="p-3">{i.material}</td>
              <td className="p-3">{i.weight_kg} kg</td>
              <td className="p-3">{i.collection_location}</td>
              <td className="p-3">₹{Math.round(i.quoted_price_per_kg * i.weight_kg).toLocaleString('en-IN')}</td>
              <td className="p-3">
                <StatusBadge status={i.payment_status} />
              </td>
              <td className="p-3">
                <Link className="text-eco-700 font-bold" to={`/recycler/lots/${i.transaction_id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function IncomingPage() {
  const { recyclerId } = useApp()
  const [items, setItems] = useState<Transaction[]>([])
  useEffect(() => {
    api.recyclerIncoming(recyclerId).then(setItems)
  }, [recyclerId])
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Incoming Lots</h1>
      <IncomingTable items={items} />
    </div>
  )
}

function LotDetail() {
  const { trxId } = useParams()
  const navigate = useNavigate()
  const [finalWeight, setFinalWeight] = useState(20.4)
  const [method, setMethod] = useState('Cash')
  const [msg, setMsg] = useState<string | null>(null)
  const [trx, setTrx] = useState<Transaction | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (!trxId) return
    api.getHandover(trxId).then((h) => {
      setTrx(h.transaction)
      setFinalWeight(h.transaction.final_weight || h.transaction.weight_kg)
    })
  }, [trxId])

  async function confirm() {
    if (!trxId || !trx) return
    const price = Math.round(finalWeight * trx.quoted_price_per_kg * 100) / 100
    await api.confirmHandover(trxId, {
      final_weight: finalWeight,
      final_price: price,
      payment_method: method,
      mark_paid: true,
    })
    setMsg(`Confirmed · ₹${price} · ${method}`)
    navigate(`/collector/handover/${trxId}`)
  }

  if (!trx) return <p>Loading…</p>

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-bold">Verify & Confirm</h1>
      <Card className="p-5 mt-4 space-y-3">
        <p className="font-mono text-sm">{trx.transaction_id}</p>
        <p>
          {trx.material} · quoted ₹{trx.quoted_price_per_kg}/kg
        </p>
        {trx.anomaly_flag && (
          <p className="rounded-xl bg-amber-50 text-amber-950 p-3 text-sm">⚠️ {trx.anomaly_message}</p>
        )}
        <label className="block text-sm font-semibold">
          Final verified weight (kg)
          <input
            type="number"
            step="0.1"
            value={finalWeight}
            onChange={(e) => setFinalWeight(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Payment method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 w-full rounded-xl border border-eco-200 px-3 py-3"
          >
            <option>Cash</option>
            <option>UPI</option>
          </select>
        </label>
        <p className="text-lg font-bold">
          Final: ₹{Math.round(finalWeight * trx.quoted_price_per_kg).toLocaleString('en-IN')}
        </p>
        <Button variant="secondary" className="w-full" onClick={() => setShowScanner(true)}>
          📷 Scan Collector QR
        </Button>
        <Button className="w-full" onClick={() => void confirm()}>
          Confirm Handover
        </Button>
        {msg && <p className="text-eco-700 font-semibold">{msg}</p>}
      </Card>
      {showScanner && (
        <QRScanner
          onResult={(val) => {
            setShowScanner(false)
            if (trx && val === trx.transaction_id) {
              void confirm()
            }
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}

function PriceManagement() {
  const { recyclerId } = useApp()
  const [material, setMaterial] = useState('PCB')
  const [price, setPrice] = useState(145)
  const [location, setLocation] = useState('Gurugram')
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    const res = await api.createPrice({
      recycler_id: recyclerId,
      material,
      subcategory: '',
      price_per_kg: price,
      location,
      pickup_available: true,
    })
    setMsg(`Appended ${res.price_id} — history preserved`)
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-bold">Price Management</h1>
      <p className="text-sm text-slate-500 mt-1">Append-only entries. Old rates are never overwritten.</p>
      <Card className="p-5 mt-4 space-y-3">
        <label className="block text-sm font-semibold">
          Material
          <select className="mt-1 w-full rounded-xl border px-3 py-3" value={material} onChange={(e) => setMaterial(e.target.value)}>
            {['PCB', 'Cable', 'Battery', 'Aluminium', 'Motor', 'LCD', 'Mixed Plastic'].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Price / kg
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-3 py-3"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
        <label className="block text-sm font-semibold">
          Location
          <input className="mt-1 w-full rounded-xl border px-3 py-3" value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <Button className="w-full" onClick={() => void save()}>
          Add price entry
        </Button>
        {msg && <p className="text-eco-700 text-sm font-semibold">{msg}</p>}
      </Card>
    </div>
  )
}

function ProfilePage() {
  const { recyclerId } = useApp()
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <Card className="p-5 mt-4 max-w-lg space-y-2">
        <p>
          <strong>ID:</strong> {recyclerId}
        </p>
        <p>
          <strong>Facility:</strong> Green Recovery Solutions
        </p>
        <p>
          <strong>Authorization:</strong> Verified · HR-EPR-2024-1182
        </p>
        <StatusBadge status="Verified" />
      </Card>
    </div>
  )
}

export function RecyclerDashboard() {
  return (
    <Shell>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="incoming" element={<IncomingPage />} />
        <Route path="lots/:trxId" element={<LotDetail />} />
        <Route path="prices" element={<PriceManagement />} />
        <Route path="profile" element={<ProfilePage />} />
      </Routes>
    </Shell>
  )
}
