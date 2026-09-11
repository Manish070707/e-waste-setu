import { Link, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Button } from '../components/Button'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { VoiceButton } from '../components/VoiceButton'
import { api } from '../lib/api'
import { useApp } from '../lib/AppContext'

const actions = [
  { to: '/collector/lot/new', icon: '📷', en: 'newLot', hi: 'newLotHi', color: 'bg-eco-100' },
  { to: '/collector/rates', icon: '💰', en: 'rates', hi: 'ratesHi', color: 'bg-amber-100' },
  { to: '/collector/match', icon: '♻️', en: 'findRecycler', hi: 'findRecyclerHi', color: 'bg-sky-100' },
  { to: '/collector/earnings', icon: '💵', en: 'earnings', hi: 'earningsHi', color: 'bg-emerald-50' },
  { to: '/collector/lots', icon: '📦', en: 'myLots', hi: 'myLotsHi', color: 'bg-white' },
  { to: '/collector/safety', icon: '🦺', en: 'safety', hi: 'safetyHi', color: 'bg-orange-50' },
] as const

export function CollectorDashboard() {
  const { t, collectorId, locale } = useApp()
  const navigate = useNavigate()

  async function runDemo() {
    const res = await api.runDemoScenario()
    navigate(`/collector/handover/${res.transaction.transaction_id}`)
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-display font-bold">
            {t.collector.greeting} 👋
          </p>
          <p className="text-sm text-slate-600">
            {collectorId} · Gurugram · <span className="text-amber-700">{t.common.demo}</span>
          </p>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="px-4 mb-4">
        <VoiceButton
          label={`🔊 ${t.collector.listenHi}`}
          lang={locale === 'en' ? 'en-IN' : 'hi-IN'}
          text={
            locale === 'en'
              ? 'Welcome to E-Waste Setu. Create a new lot, check today rates, find authorized recycler, or view earnings.'
              : 'ई-वेस्ट सेतु में आपका स्वागत है। नया लॉट बनाएं, आज के रेट देखें, अधिकृत रिसाइक्लर खोजें, या अपनी कमाई देखें।'
          }
        />
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`${a.color} rounded-3xl border border-eco-100 p-4 min-h-[120px] flex flex-col justify-between shadow-sm`}
          >
            <span className="text-4xl" aria-hidden>
              {a.icon}
            </span>
            <div>
              <p className="font-bold text-eco-900 text-base leading-tight">{t.collector[a.hi]}</p>
              <p className="text-xs text-slate-500 mt-1">{t.collector[a.en]}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-4 mt-5 space-y-3">
        <Button className="w-full" variant="warn" onClick={runDemo}>
          🎬 {t.collector.demo}
        </Button>
        <Link to="/" className="block text-center text-sm font-semibold text-eco-700">
          ← Landing
        </Link>
      </div>
      <BottomNavigation />
    </div>
  )
}
