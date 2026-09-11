import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Button } from '../components/Button'
import { useApp } from '../lib/AppContext'

const HOW_ICONS = ['📷', '🧩', '⚖️', '💰', '♻️', '🤝', '💵', '📈']

export function Landing() {
  const { t } = useApp()

  return (
    <div className="min-h-screen bg-cream text-eco-900">
      <header className="sticky top-0 z-50 border-b border-eco-100/70 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-eco-800">
            E-Waste Setu
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-eco-800/80">
            <a href="#how">{t.nav.how}</a>
            <a href="#rates">{t.nav.rates}</a>
            <a href="#recyclers">{t.nav.recyclers}</a>
            <a href="#safety">{t.nav.safety}</a>
            <a href="#impact">{t.nav.impact}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/collector" className="hidden sm:block">
              <Button size="md">{t.nav.cta}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#a7f3d0_0%,_transparent_50%),linear-gradient(160deg,#ecfdf5_0%,#f7f5f0_45%,#fef3c7_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23059669\' fill-opacity=\'0.12\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:items-center md:pt-16">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-eco-700 border border-eco-100">
              Smart India Hackathon · Climate-tech
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-eco-900 sm:text-5xl">
              E-Waste Setu
            </h1>
            <p className="mt-2 text-lg font-semibold text-eco-800">{t.hero.headline}</p>
            <p className="mt-3 text-base text-eco-900/80">{t.hero.subhi}</p>
            <p className="mt-3 text-sm font-medium text-amber-800 bg-amber-50/80 inline-block rounded-xl px-3 py-2">
              {t.hero.notMarketplace}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/collector/lot/new">
                <Button className="w-full sm:w-auto">{t.hero.primaryCta}</Button>
              </Link>
              <Link to="/collector/rates">
                <Button variant="secondary" className="w-full sm:w-auto">
                  {t.hero.secondaryCta}
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['10,000+ KG', t.stats.kg],
                ['100+', t.stats.recyclers],
                ['₹18L+', t.stats.earnings],
                ['95%', t.stats.safe],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/70 border border-white p-3">
                  <div className="font-display text-xl font-bold text-eco-800">{n}</div>
                  <div className="text-[11px] font-semibold text-slate-600">{l}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">* {t.common.demo}</p>
          </div>

          <div className="relative min-h-[320px]">
            <div className="absolute -right-4 top-4 h-56 w-56 rounded-full bg-eco-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_30px_80px_rgba(6,78,59,0.12)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eco-100 text-3xl">🧑‍🌾</div>
                <div>
                  <p className="font-bold">Collector ready</p>
                  <p className="text-sm text-slate-600">Photo → Price → Authorized recycler</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['🔌 PCB', '🔗 Cable', '🔋 Battery'].map((m) => (
                  <div key={m} className="rounded-2xl bg-eco-50 p-3 text-center text-xs font-bold text-eco-800">
                    {m}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-eco-800 text-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>✓ Verified recycler</span>
                  <span className="text-eco-200">8 km</span>
                </div>
                <p className="mt-2 font-display text-2xl font-bold">₹130 – ₹150 / kg</p>
                <p className="text-eco-100 text-sm">Price transparency · Gurugram</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">{t.how.title}</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Informal collection → fair price → authorized recycler → verified handover → earnings history.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((step, i) => (
            <div key={step} className="rounded-3xl bg-white border border-eco-100 p-5">
              <div className="text-3xl" aria-hidden>
                {HOW_ICONS[i]}
              </div>
              <p className="mt-3 text-xs font-bold text-eco-600">STEP {i + 1}</p>
              <p className="mt-1 font-semibold text-eco-900">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rates" className="bg-eco-900 text-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold">{t.nav.rates}</h2>
          <p className="mt-2 text-eco-100">Live demo rates for Gurugram — transparent bands, not middleman guesses.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['PCB', '₹130 – ₹150', '+6%'],
              ['Copper Cable', '₹280 – ₹360', '+3%'],
              ['Battery', '₹80 – ₹120', '-1%'],
            ].map(([m, p, tr]) => (
              <div key={m} className="rounded-3xl bg-white/10 border border-white/10 p-5">
                <p className="font-bold">{m}</p>
                <p className="mt-2 text-2xl font-display font-bold">{p}</p>
                <p className="text-eco-200 text-sm">{tr} · Demo</p>
              </div>
            ))}
          </div>
          <Link to="/collector/rates" className="inline-block mt-6">
            <Button variant="secondary">Open price board</Button>
          </Link>
        </div>
      </section>

      <section id="recyclers" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">{t.nav.recyclers}</h2>
        <p className="mt-2 text-slate-600">Only Verified facilities are recommended. Expired / Suspended never appear in match results.</p>
        <div className="mt-6 rounded-3xl bg-white border border-eco-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold">Green Recovery Solutions</p>
            <p className="text-sm text-slate-600">✓ Authorized · Pickup · Gurugram · 8 km</p>
          </div>
          <Link to="/collector">
            <Button>Find nearby recycler</Button>
          </Link>
        </div>
      </section>

      <section id="safety" className="bg-amber-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold text-amber-950">{t.nav.safety}</h2>
          <p className="mt-2 text-amber-900/80">Visual, low-literacy safety cards for batteries, CRT, cables, and PCBs.</p>
          <Link to="/collector/safety" className="inline-block mt-6">
            <Button variant="warn">Open safety guide</Button>
          </Link>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">{t.nav.impact}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            'More collector income through price transparency',
            'Higher formal recycling via authorized matching',
            'Reduced unsafe acid/open-burning practices',
            'Documented material trail for EPR readiness',
            'Worker safety guidance with audio support',
            'Cash + optional UPI — collectors stay in control',
          ].map((item) => (
            <li key={item} className="rounded-2xl bg-white border border-eco-100 px-4 py-3 font-medium">
              ✓ {item}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-eco-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display font-bold text-eco-800">E-Waste Setu</p>
            <p className="text-sm text-slate-600">{t.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/collector">
              <Button size="md">Collector</Button>
            </Link>
            <Link to="/recycler">
              <Button size="md" variant="secondary">
                Recycler
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="md" variant="ghost">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
