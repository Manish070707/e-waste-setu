import { useEffect, useState } from 'react'
import { useApp } from '../lib/AppContext'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'ews-install-dismissed'

export function InstallBanner() {
  const { t, locale } = useApp()
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(() =>
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(DISMISSED_KEY) === '1'
      : true
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  async function install() {
    if (!prompt) return
    setInstalling(true)
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setPrompt(null)
    }
    setInstalling(false)
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  const installLabel = locale === 'hi' ? '📲 ऐप इंस्टॉल करें' : locale === 'mr' ? '📲 ॲप इंस्टॉल करा' : '📲 Install App'
  const hintText = t.common.installHint

  return (
    <div className="bg-eco-800 text-white px-4 py-3 flex items-center justify-between gap-3 text-sm" role="banner">
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{installLabel}</p>
        <p className="text-eco-200 text-xs truncate">{hintText}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => void install()}
          disabled={installing}
          className="bg-white text-eco-900 font-bold px-3 py-1.5 rounded-full text-xs hover:bg-eco-50 disabled:opacity-60"
        >
          {installing ? t.offline.installing : (locale === 'hi' ? 'इंस्टॉल' : locale === 'mr' ? 'इंस्टॉल करा' : 'Install')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-eco-200 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
