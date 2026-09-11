import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { MapView } from '../components/MapView'
import { OfflineIndicator } from '../components/OfflineIndicator'
import { VoiceButton } from '../components/VoiceButton'
import { requestSyncNow } from '../hooks/useOfflineSync'
import { api } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { enqueueSync, getDraft, listSyncQueue, saveDraft, uid } from '../lib/offlineDb'

const MATERIALS = ['PCB', 'Cable', 'Battery', 'CRT', 'LCD', 'Motor', 'Magnet Assembly', 'Mixed Plastic', 'Other']
const CONDITIONS = ['Good', 'Damaged', 'Mixed', 'Unknown']
const CITIES = ['Gurugram', 'Delhi', 'Noida', 'Faridabad']
const DRAFT_ID = 'active-lot-draft'

const CITY_COORDS: Record<string, [number, number]> = {
  Gurugram: [28.4595, 77.0266],
  Delhi: [28.6139, 77.209],
  Noida: [28.5355, 77.391],
  Faridabad: [28.4089, 77.3178],
}

export function CreateLot() {
  const { t, collectorId, locale, online, setPendingSync } = useApp()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [material, setMaterial] = useState('PCB')
  const [aiPred, setAiPred] = useState('PCB')
  const [aiConf, setAiConf] = useState(0.92)
  const [weight, setWeight] = useState(20)
  const [condition, setCondition] = useState('Good')
  const [location, setLocation] = useState('Gurugram')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [estimate, setEstimate] = useState<{
    low: number
    high: number
    rate_low: number
    rate_high: number
    disclaimer_hi: string
    disclaimer_en: string
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftNote, setDraftNote] = useState<string | null>(null)

  useEffect(() => {
    void getDraft(DRAFT_ID).then((d) => {
      if (!d) return
      setMaterial(d.material)
      setWeight(d.weight_kg)
      setCondition(d.condition)
      setLocation(d.location)
      setPhoto(d.photo_data_url || null)
      setAiPred(d.ai_prediction || 'PCB')
      setAiConf(d.ai_confidence || 0.92)
      if (d.latitude != null && d.longitude != null) {
        setCoords({ lat: d.latitude, lng: d.longitude })
      }
      setDraftNote(t.offline.savedDraft)
    })
  }, [t.offline.savedDraft])

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((tr) => tr.stop())
    }
  }, [stream])

  async function persistDraft() {
    await saveDraft({
      id: DRAFT_ID,
      collector_id: collectorId,
      material,
      weight_kg: weight,
      condition,
      photo_data_url: photo,
      location,
      latitude: coords?.lat,
      longitude: coords?.lng,
      ai_prediction: aiPred,
      ai_confidence: aiConf,
      updated_at: new Date().toISOString(),
    })
    setDraftNote(t.offline.savedDraft)
  }

  async function startCamera() {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
    } catch {
      setCameraError(locale === 'hi' ? 'कैमरा अनुमति नहीं मिली। फाइल अपलोड करें।' : 'Camera denied. Please upload a file.')
    }
  }

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0)
    const data = canvas.toDataURL('image/jpeg', 0.7)
    setPhoto(data)
    stream?.getTracks().forEach((tr) => tr.stop())
    setStream(null)
    void runClassify('pcb photo')
  }

  function onFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result))
      void runClassify(file.name)
    }
    reader.readAsDataURL(file)
  }

  async function runClassify(hint: string) {
    try {
      const res = await api.classify(hint)
      setAiPred(res.predicted_category)
      setAiConf(res.confidence)
      setMaterial(res.predicted_category)
    } catch {
      setAiPred('PCB')
      setAiConf(0.92)
    }
  }

  function requestGeo() {
    if (!navigator.geolocation) {
      setError(locale === 'hi' ? 'GPS उपलब्ध नहीं। शहर चुनें।' : 'GPS unavailable. Select a city.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocation('Gurugram')
      },
      () => {
        setError(locale === 'hi' ? 'GPS अनुमति नहीं मिली। शहर चुनें।' : 'GPS denied. Select city manually.')
      },
    )
  }

  async function loadEstimate() {
    try {
      const res = await api.estimate(material, weight, condition, location)
      setEstimate(res)
    } catch {
      const rateLow = material === 'PCB' ? 120 : 40
      const rateHigh = material === 'PCB' ? 150 : 80
      setEstimate({
        low: Math.round(rateLow * weight * 0.98),
        high: Math.round(rateHigh * weight * 1.02),
        rate_low: rateLow,
        rate_high: rateHigh,
        disclaimer_en: t.lot.disclaimer,
        disclaimer_hi: t.lot.disclaimer,
      })
    }
  }

  async function create() {
    setBusy(true)
    setError(null)
    const payload = {
      collector_id: collectorId,
      material,
      weight_kg: weight,
      condition,
      photo_data_url: photo,
      location,
      latitude: coords?.lat ?? CITY_COORDS[location]?.[0],
      longitude: coords?.lng ?? CITY_COORDS[location]?.[1],
      ai_prediction: aiPred,
      ai_confidence: aiConf,
    }
    try {
      await persistDraft()
      if (!online) {
        await enqueueSync({
          id: uid('sync-lot'),
          type: 'create_lot',
          payload,
          created_at: new Date().toISOString(),
        })
        setPendingSync((await listSyncQueue()).length)
        setDraftNote(t.offline.queuedLot)
        navigate('/collector')
        return
      }
      const lot = await api.createLot(payload)
      navigate(`/collector/match/${lot.lot_id}`)
    } catch {
      await enqueueSync({
        id: uid('sync-lot'),
        type: 'create_lot',
        payload,
        created_at: new Date().toISOString(),
      })
      setPendingSync((await listSyncQueue()).length)
      setDraftNote(t.offline.queuedLot)
      requestSyncNow()
      navigate('/collector')
    } finally {
      setBusy(false)
    }
  }

  async function next() {
    await persistDraft()
    if (step === 5) await loadEstimate()
    setStep((s) => Math.min(7, s + 1))
  }

  const titles = [
    t.lot.stepPhoto,
    t.lot.stepMaterial,
    t.lot.stepWeight,
    t.lot.stepCondition,
    t.lot.stepLocation,
    t.lot.stepEstimate,
    t.lot.stepCreate,
  ]

  const mapCenter = coords
    ? ([coords.lat, coords.lng] as [number, number])
    : CITY_COORDS[location] || CITY_COORDS.Gurugram

  return (
    <div className="min-h-screen bg-cream pb-28">
      <OfflineIndicator />
      <header className="px-4 pt-5 pb-3">
        <Link to="/collector" className="text-sm font-bold text-eco-700">
          ← {t.common.back}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{t.lot.create}</h1>
        <p className="text-sm text-slate-600">
          Step {step}/7 · {titles[step - 1]}
        </p>
        {draftNote && <p className="text-xs text-eco-700 mt-1">💾 {draftNote}</p>}
        <div className="mt-3 h-2 rounded-full bg-eco-100 overflow-hidden">
          <div className="h-full bg-eco-600 transition-all" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      </header>

      <div className="px-4">
        {step === 1 && (
          <Card className="p-4 space-y-3">
            {photo ? (
              <img src={photo} alt="Lot material" className="w-full rounded-2xl max-h-72 object-cover" />
            ) : (
              <div className="rounded-2xl bg-slate-900 overflow-hidden aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              </div>
            )}
            {cameraError && <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3">{cameraError}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={startCamera}>
                Open Camera
              </Button>
              <Button variant="secondary" onClick={capture} disabled={!stream}>
                Capture
              </Button>
            </div>
            <label className="block">
              <span className="sr-only">Upload image</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="block w-full text-sm"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </label>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-4 space-y-4">
            <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
              <p className="text-sm text-sky-800">
                {t.lot.aiLabel}: <strong>{aiPred}</strong>
              </p>
              <p className="text-sm">
                {t.lot.confidence}: {Math.round(aiConf * 100)}% · DEMO/MOCK AI
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MATERIALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`rounded-2xl border p-4 text-left font-bold touch-target ${
                    material === m ? 'border-eco-600 bg-eco-50' : 'border-eco-100 bg-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <VoiceButton
              text={
                locale === 'en'
                  ? `AI identification ${aiPred} with ${Math.round(aiConf * 100)} percent confidence. You can correct the material.`
                  : `AI पहचान ${aiPred}, विश्वास ${Math.round(aiConf * 100)} प्रतिशत। आप सामग्री सही कर सकते हैं।`
              }
            />
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 text-center space-y-4">
            <p className="text-6xl font-display font-bold text-eco-800">{weight} KG</p>
            <div className="flex justify-center gap-4">
              <Button aria-label="Decrease weight" onClick={() => setWeight((w) => Math.max(1, w - 1))}>
                −
              </Button>
              <Button aria-label="Increase weight" onClick={() => setWeight((w) => w + 1)}>
                +
              </Button>
            </div>
            <div className="flex justify-center gap-2">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="rounded-full bg-white border px-3 py-2 text-sm font-bold"
                  onClick={() => setWeight(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 4 && (
          <div className="grid grid-cols-2 gap-3">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`rounded-3xl border p-6 font-bold text-lg ${
                  condition === c ? 'border-eco-600 bg-eco-50' : 'border-eco-100 bg-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <Card className="p-4 space-y-3">
            <Button variant="secondary" className="w-full" onClick={requestGeo}>
              Use GPS location
            </Button>
            {coords && (
              <p className="text-xs text-slate-500">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setLocation(c)
                    const cc = CITY_COORDS[c]
                    if (cc) setCoords({ lat: cc[0], lng: cc[1] })
                  }}
                  className={`rounded-2xl border p-4 font-bold ${
                    location === c ? 'border-eco-600 bg-eco-50' : 'border-eco-100 bg-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <MapView
              center={mapCenter}
              markers={[{ id: 'me', lat: mapCenter[0], lng: mapCenter[1], label: location, kind: 'collector' }]}
              className="h-44 w-full rounded-2xl overflow-hidden border border-eco-100"
            />
          </Card>
        )}

        {step === 6 && (
          <Card className="p-5 space-y-3">
            {!estimate ? (
              <Button className="w-full" onClick={() => void loadEstimate()}>
                Calculate estimate
              </Button>
            ) : (
              <>
                <p className="text-sm text-slate-500">Estimated Range</p>
                <p className="font-display text-4xl font-bold text-eco-800">
                  ₹{estimate.low.toLocaleString('en-IN')} – ₹{estimate.high.toLocaleString('en-IN')}
                </p>
                <p className="text-sm">
                  Current local rate: ₹{estimate.rate_low} – ₹{estimate.rate_high}/kg
                </p>
                <p className="rounded-2xl bg-amber-50 text-amber-950 p-3 text-sm font-medium">
                  {locale === 'en' ? estimate.disclaimer_en : estimate.disclaimer_hi}
                </p>
                <VoiceButton
                  text={
                    locale === 'en'
                      ? `Estimated value ${estimate.low} to ${estimate.high} rupees. Final price after recycler check.`
                      : `अनुमानित कीमत ${estimate.low} से ${estimate.high} रुपये। अंतिम कीमत रिसाइक्लर जांच के बाद।`
                  }
                />
              </>
            )}
          </Card>
        )}

        {step === 7 && (
          <Card className="p-5 space-y-2">
            <p>
              <strong>Material:</strong> {material}
            </p>
            <p>
              <strong>Weight:</strong> {weight} KG
            </p>
            <p>
              <strong>Condition:</strong> {condition}
            </p>
            <p>
              <strong>Location:</strong> {location}
            </p>
            {photo && <img src={photo} alt="" className="rounded-xl max-h-40 object-cover w-full" />}
            {error && <p className="text-red-700 text-sm">{error}</p>}
            <Button className="w-full mt-3" disabled={busy} onClick={() => void create()}>
              {busy ? t.common.loading : t.lot.createLot}
            </Button>
          </Card>
        )}

        <div className="mt-4 flex gap-2">
          {step > 1 && (
            <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              {t.common.back}
            </Button>
          )}
          {step < 7 && (
            <Button className="flex-1" onClick={() => void next()} disabled={step === 1 && !photo}>
              {t.common.next}
            </Button>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}
