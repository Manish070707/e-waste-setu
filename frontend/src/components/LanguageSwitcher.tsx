import { useApp } from '../lib/AppContext'
import type { Locale } from '../i18n'

export function LanguageSwitcher() {
  const { locale, setLocale } = useApp()
  const options: { id: Locale; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'hi', label: 'हिं' },
    { id: 'mr', label: 'मर' },
  ]
  return (
    <div className="inline-flex rounded-full bg-white/80 border border-eco-200 p-1" role="group" aria-label="Language">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLocale(o.id)}
          className={`min-w-10 rounded-full px-2.5 py-1.5 text-xs font-bold ${
            locale === o.id ? 'bg-eco-700 text-white' : 'text-eco-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
