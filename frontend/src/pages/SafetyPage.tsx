import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Card } from '../components/Card'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { VoiceButton } from '../components/VoiceButton'
import { api, type SafetyCard } from '../lib/api'
import { useApp } from '../lib/AppContext'

export function SafetyPage() {
  const { t, locale } = useApp()
  const [cards, setCards] = useState<SafetyCard[]>([])

  useEffect(() => {
    api.safety().then((r) => setCards(r.cards))
  }, [])

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.safety.title}</h1>
      </header>

      <div className="px-4 space-y-4">
        {cards.map((c) => (
          <Card key={c.id} className="p-5 border-l-4 border-l-amber-500">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-5xl" aria-hidden>
                  {c.icon}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {locale === 'en' ? c.title_en : c.title_hi}
                  </h2>
                  <p className="text-xs text-slate-500">{locale === 'en' ? c.title_hi : c.title_en}</p>
                </div>
              </div>
              <span className="text-3xl" aria-hidden>
                ⚠️
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {c.dont.map((d) => (
                <li key={d.en} className="text-base font-semibold text-red-700">
                  ❌ {locale === 'en' ? d.en : d.hi}
                </li>
              ))}
              {c.do.map((d) => (
                <li key={d.en} className="text-base font-semibold text-eco-700">
                  ✓ {locale === 'en' ? d.en : d.hi}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <VoiceButton
                text={locale === 'en' ? c.audio_en : c.audio_hi}
                lang={locale === 'en' ? 'en-IN' : 'hi-IN'}
              />
            </div>
          </Card>
        ))}
      </div>
      <BottomNavigation />
    </div>
  )
}
