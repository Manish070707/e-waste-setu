import { NavLink } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

const items = [
  { to: '/collector', icon: '🏠', key: 'home' },
  { to: '/collector/lot/new', icon: '📷', key: 'lot' },
  { to: '/collector/rates', icon: '💰', key: 'rates' },
  { to: '/collector/earnings', icon: '💵', key: 'earn' },
  { to: '/collector/safety', icon: '🦺', key: 'safe' },
]

export function BottomNavigation() {
  const { t } = useApp()
  const labels: Record<string, string> = {
    home: 'Home',
    lot: t.collector.newLot,
    rates: t.collector.rates,
    earn: t.collector.earnings,
    safe: t.collector.safety,
  }
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-eco-100 bg-white/95 backdrop-blur safe-bottom"
      aria-label="Collector navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-2">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/collector'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-bold ${
                  isActive ? 'bg-eco-50 text-eco-800' : 'text-slate-500'
                }`
              }
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span className="truncate max-w-[4.5rem]">{labels[item.key]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
