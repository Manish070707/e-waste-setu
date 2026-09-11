import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { MapView, type MapMarker } from '../components/MapView'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { RecyclerCard } from '../components/RecyclerCard'
import { VoiceButton } from '../components/VoiceButton'
import { api, type Recycler } from '../lib/api'
import { useApp } from '../lib/AppContext'

const CITY_CENTER: Record<string, [number, number]> = {
  Gurugram: [28.4595, 77.0266],
  Delhi: [28.6139, 77.209],
  Noida: [28.5355, 77.391],
  Faridabad: [28.4089, 77.3178],
}

const CITIES = Object.keys(CITY_CENTER)

function haversineDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function MapDiscoverPage() {
  const { t, locale } = useApp()
  const [allRecyclers, setAllRecyclers] = useState<Recycler[]>([])
  const [collectorPos, setCollectorPos] = useState<[number, number]>(CITY_CENTER.Gurugram)
  const [gpsDenied, setGpsDenied] = useState(false)
  const [usingGps, setUsingGps] = useState(false)
  const [filterCity, setFilterCity] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    api
      .listRecyclers()
      .then((rows) => setAllRecyclers(rows.filter((r) => r.authorization_status === 'Verified')))
      .catch(() => setAllRecyclers([]))

    if (!navigator.geolocation) {
      setGpsDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCollectorPos([pos.coords.latitude, pos.coords.longitude])
        setUsingGps(true)
      },
      () => setGpsDenied(true),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  // Filter by city if selected
  const filteredRecyclers = filterCity
    ? allRecyclers.filter((r) =>
        r.location?.toLowerCase().includes(filterCity.toLowerCase())
      )
    : allRecyclers

  // Sort by distance from collector position
  const sortedRecyclers = [...filteredRecyclers].sort((a, b) => {
    const da =
      a.latitude != null
        ? haversineDist(collectorPos[0], collectorPos[1], a.latitude, a.longitude ?? 0)
        : 999
    const db =
      b.latitude != null
        ? haversineDist(collectorPos[0], collectorPos[1], b.latitude, b.longitude ?? 0)
        : 999
    return da - db
  })

  const mapCenter: [number, number] = filterCity
    ? (CITY_CENTER[filterCity] ?? collectorPos)
    : collectorPos

  const markers: MapMarker[] = [
    {
      id: 'me',
      lat: collectorPos[0],
      lng: collectorPos[1],
      label: locale === 'en' ? 'You (collector)' : locale === 'hi' ? 'आप (कलेक्टर)' : 'तुम्ही (संग्राहक)',
      kind: 'collector',
    },
    ...sortedRecyclers
      .filter((r) => r.latitude != null && r.longitude != null)
      .slice(0, 8)
      .map((r) => ({
        id: r.recycler_id,
        lat: r.latitude as number,
        lng: r.longitude as number,
        label: r.facility_name,
        sublabel: `${r.distance_km} km · ₹${r.offered_rate}/kg`,
        kind: 'recycler' as const,
      })),
  ]

  function handleMarkerClick(id: string) {
    setHighlightId(id)
    const el = cardRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const gpsLabel = usingGps
    ? t.maps.usingGps
    : gpsDenied
    ? t.maps.gpsDenied
    : `${t.maps.usingCity} Gurugram`

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.maps.title}</h1>
        <p className="text-sm text-slate-600">{t.maps.subtitle}</p>
      </header>

      <div className="px-4 space-y-3">
        {/* GPS / city indicator */}
        <p className="text-xs text-slate-500 font-medium">{gpsLabel}</p>

        {/* City filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterCity(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold border ${
              !filterCity ? 'bg-eco-700 text-white border-eco-700' : 'bg-white border-eco-100'
            }`}
          >
            All
          </button>
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setFilterCity(city === filterCity ? null : city)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold border ${
                filterCity === city ? 'bg-eco-700 text-white border-eco-700' : 'bg-white border-eco-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <MapView
          center={mapCenter}
          markers={markers}
          serviceRadiusKm={15}
          className="h-72 w-full rounded-3xl overflow-hidden border border-eco-100"
          onMarkerClick={handleMarkerClick}
        />

        <VoiceButton
          text={
            locale === 'en'
              ? `Map shows your location and ${sortedRecyclers.length} authorized recyclers nearby.`
              : locale === 'hi'
              ? `नक्शे पर आपकी लोकेशन और पास के ${sortedRecyclers.length} अधिकृत रिसाइक्लर दिख रहे हैं।`
              : `नकाशावर तुमचे स्थान आणि जवळचे ${sortedRecyclers.length} अधिकृत पुनर्वापरकर्ते दाखवत आहे.`
          }
        />

        <div className="space-y-3">
          {sortedRecyclers.map((r) => (
            <div
              key={r.recycler_id}
              ref={(el) => { cardRefs.current[r.recycler_id] = el }}
              className={`transition-all ${
                highlightId === r.recycler_id ? 'ring-2 ring-eco-500 rounded-3xl' : ''
              }`}
            >
              <RecyclerCard recycler={r} />
            </div>
          ))}
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}
