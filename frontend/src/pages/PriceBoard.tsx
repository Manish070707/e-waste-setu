import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { PriceCard } from '../components/PriceCard'
import { VoiceButton } from '../components/VoiceButton'
import { api, type PriceToday } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { cachePrices, getCachedPrices } from '../lib/offlineDb'
import { speak } from '../lib/speech'

export function PriceBoard() {
  const { t, locale } = useApp()
  const [location, setLocation] = useState('Gurugram')
  const [days, setDays] = useState(30)
  const [prices, setPrices] = useState<PriceToday[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await api.todayPrices(location, days)
        if (cancelled) return
        setPrices(data)
        setError(null)
        await cachePrices(location, days, data)
      } catch {
        const cached = await getCachedPrices(location, days)
        if (cached?.data && !cancelled) {
          setPrices(cached.data as PriceToday[])
          setError(null)
        } else if (!cancelled) {
          setError(t.common.error)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [location, days, t.common.error])

  function speakPrice(p: PriceToday) {
    const text =
      locale === 'en'
        ? `Today in ${p.location}, ${p.material} estimated rate is ${p.low} to ${p.high} rupees per kilo.`
        : `आज ${p.location} में ${p.material} का अनुमानित भाव ${p.low} से ${p.high} रुपये प्रति किलो है।`
    speak(text, locale === 'en' ? 'en-IN' : 'hi-IN')
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.rates.title}</h1>
        <p className="text-xs text-amber-700">{t.common.demo}</p>
      </header>

      <div className="px-4 flex flex-wrap gap-2 mb-4">
        {['Gurugram', 'Delhi', 'Noida'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setLocation(c)}
            className={`rounded-full px-4 py-2 text-sm font-bold border ${
              location === c ? 'bg-eco-700 text-white border-eco-700' : 'bg-white border-eco-100'
            }`}
          >
            {c}
          </button>
        ))}
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-2 text-xs font-bold border ${
              days === d ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-eco-100'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="px-4 mb-3">
        <VoiceButton
          label={`🔊 ${t.rates.listen}`}
          text={
            prices[0]
              ? locale === 'en'
                ? `Today in ${location}, ${prices[0].material} estimated rate is ${prices[0].low} to ${prices[0].high} rupees per kilo.`
                : `आज ${location} में ${prices[0]?.material} का अनुमानित भाव ${prices[0]?.low} से ${prices[0]?.high} रुपये प्रति किलो है।`
              : 'Rates loading'
          }
        />
      </div>

      {error && <p className="px-4 text-red-700">{error}</p>}

      <div className="px-4 grid gap-3">
        {prices.map((p) => (
          <PriceCard key={p.material} price={p} onSpeak={() => speakPrice(p)} />
        ))}
      </div>
      <BottomNavigation />
    </div>
  )
}
