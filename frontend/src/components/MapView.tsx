import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
  sublabel?: string
  kind?: 'collector' | 'recycler' | 'other'
}

const icon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

export function MapView({
  center = [28.4595, 77.0266],
  zoom = 11,
  markers = [],
  serviceRadiusKm,
  className = 'h-56 w-full rounded-2xl overflow-hidden',
  onMarkerClick,
}: {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  serviceRadiusKm?: number
  className?: string
  onMarkerClick?: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onClickRef = useRef(onMarkerClick)
  onClickRef.current = onMarkerClick

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = L.map(ref.current, { zoomControl: false, attributionControl: true }).setView(center, zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // clear previous overlays except base tile
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) map.removeLayer(layer)
    })

    const bounds: L.LatLngExpression[] = []
    for (const m of markers) {
      const color = m.kind === 'collector' ? '#2563eb' : m.kind === 'recycler' ? '#059669' : '#f59e0b'
      const marker = L.marker([m.lat, m.lng], { icon: icon(color) }).addTo(map)
      const popupHtml = `<div style="font-family:system-ui;min-width:140px">
        <strong style="font-size:13px">${m.label}</strong>
        ${m.sublabel ? `<br/><span style="font-size:11px;color:#64748b">${m.sublabel}</span>` : ''}
        ${m.kind === 'recycler' ? '<br/><span style="font-size:11px;color:#059669;font-weight:600">✓ Verified</span>' : ''}
      </div>`
      marker.bindPopup(popupHtml)
      if (onClickRef.current) {
        marker.on('click', () => onClickRef.current?.(m.id))
      }
      bounds.push([m.lat, m.lng])
    }

    if (serviceRadiusKm && markers[0]) {
      L.circle([markers[0].lat, markers[0].lng], {
        radius: serviceRadiusKm * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 1.5,
      }).addTo(map)
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [28, 28] })
    } else if (bounds.length === 1) {
      map.setView(bounds[0] as L.LatLngExpression, zoom)
    }
  }, [markers, serviceRadiusKm, zoom])

  return <div ref={ref} className={className} role="img" aria-label="Map of collector and recyclers" />
}
