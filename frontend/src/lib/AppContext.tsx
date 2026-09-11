import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getDictionary, type Dictionary, type Locale } from '../i18n'

export type SyncBanner = 'offline' | 'restored' | 'pending' | 'complete' | null

type AppContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
  collectorId: string
  setCollectorId: (id: string) => void
  recyclerId: string
  setRecyclerId: (id: string) => void
  online: boolean
  pendingSync: number
  setPendingSync: (n: number) => void
  syncBanner: SyncBanner
  setSyncBanner: (b: SyncBanner | ((prev: SyncBanner) => SyncBanner)) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const LOCALE_KEY = 'ews-locale'

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof localStorage === 'undefined') return 'hi'
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null
    return saved === 'en' || saved === 'hi' || saved === 'mr' ? saved : 'hi'
  })
  const [collectorId, setCollectorId] = useState('C-102')
  const [recyclerId, setRecyclerId] = useState('R-GRS')
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [pendingSync, setPendingSync] = useState(0)
  const [syncBanner, setSyncBanner] = useState<SyncBanner>(null)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(LOCALE_KEY, l)
    document.documentElement.lang = l === 'hi' ? 'hi' : l === 'mr' ? 'mr' : 'en'
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'hi' ? 'hi' : locale === 'mr' ? 'mr' : 'en'
  }, [locale])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const value: AppContextValue = {
    locale,
    setLocale,
    t: getDictionary(locale),
    collectorId,
    setCollectorId,
    recyclerId,
    setRecyclerId,
    online,
    pendingSync,
    setPendingSync,
    syncBanner,
    setSyncBanner,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
