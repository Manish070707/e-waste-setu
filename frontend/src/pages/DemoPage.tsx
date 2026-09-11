import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { api } from '../lib/api'

export function DemoPage() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function run() {
    setBusy(true)
    setErrorMsg(null)
    setMsg(null)
    try {
      const res = await api.runDemoScenario()
      setMsg(`Demo complete! ${res.transaction.transaction_id} generated.`)
      setTimeout(() => {
        navigate(`/collector/handover/${res.transaction.transaction_id}`)
      }, 1500)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to run demo scenario')
    } finally {
      setBusy(false)
    }
  }

  const steps = [
    { title: 'Collector C-102 · Gurugram', desc: 'PCB 20 KG registered', icon: '🧑‍🌾' },
    { title: 'AI identification: PCB', desc: 'Confidence 92% (demo mock)', icon: '🤖' },
    { title: 'Estimated: ₹2,400 – ₹3,000', desc: 'Local rate ₹120–₹145/kg', icon: '💰' },
    { title: 'Matched: Green Recovery Solutions', desc: '₹145/kg · 8 km · Pickup ✓ · Authorized ✓', icon: '♻️' },
    { title: 'Final: 20.4 KG · ₹2,958', desc: 'TRX-982731 · Payment: Cash', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-900 via-eco-800 to-teal-900 text-white flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <Link to="/" className="text-white hover:text-eco-200 flex items-center gap-2 font-semibold">
          <span>←</span> Back
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-lg">SIH Demo Scenario</h1>
        </div>
        <div className="bg-white/20 text-xs px-3 py-1 rounded-full font-medium">
          Smart India Hackathon 2024
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10 mt-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">E-Waste Setu in Action</h2>
          <p className="text-eco-100 text-lg md:text-xl opacity-90">Complete collector journey in under 3 minutes</p>
        </div>

        <div className="w-full space-y-4 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-start gap-4 border border-white/10 hover:bg-white/15 transition-colors">
              <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm mt-1">
                {i + 1}
              </div>
              <div className="text-2xl mt-0.5">{s.icon}</div>
              <div>
                <h3 className="font-bold text-lg text-white">{s.title}</h3>
                <p className="text-eco-100 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="w-full bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-6 text-center font-semibold text-sm">
            {errorMsg}
          </div>
        )}

        {msg && (
          <div className="w-full bg-eco-500/20 border border-eco-400/50 text-eco-100 p-4 rounded-xl mb-6 text-center font-semibold text-sm">
            {msg}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <Button 
            className="w-full py-4 text-lg font-bold bg-white text-eco-900 hover:bg-eco-50" 
            disabled={busy} 
            onClick={() => void run()}
          >
            {busy ? 'Running Demo...' : '🎬 Run Full Demo'}
          </Button>
          <Button 
            variant="ghost"
            className="w-full text-white hover:bg-white/10" 
            onClick={() => navigate('/collector')}
          >
            Open Collector Dashboard
          </Button>
        </div>
      </main>

      <footer className="p-6 mt-auto">
        <div className="flex justify-center gap-6 text-sm">
          <Link to="/collector" className="text-eco-200 hover:text-white flex items-center gap-1 font-medium">
            Collector <span>→</span>
          </Link>
          <Link to="/recycler" className="text-eco-200 hover:text-white flex items-center gap-1 font-medium">
            Recycler <span>→</span>
          </Link>
          <Link to="/admin" className="text-eco-200 hover:text-white flex items-center gap-1 font-medium">
            Admin <span>→</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
