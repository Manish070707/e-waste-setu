import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Card } from './Card'
import { Button } from './Button'
import { VoiceButton } from './VoiceButton'
import { useApp } from '../lib/AppContext'

export function QRCard({
  value,
  label,
  meta,
  speakText,
}: {
  value: string
  label: string
  meta?: string
  speakText?: string
}) {
  const { t } = useApp()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  function downloadPng() {
    // Find the canvas rendered by QRCodeCanvas
    const canvas = document.getElementById('ews-qr-canvas') as HTMLCanvasElement | null
    if (!canvas) return
    const padded = document.createElement('canvas')
    padded.width = 560
    padded.height = 560
    const ctx = padded.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 560, 560)
    ctx.drawImage(canvas, 40, 40, 480, 480)
    const a = document.createElement('a')
    a.download = `EWS-${value}.png`
    a.href = padded.toDataURL('image/png')
    a.click()
  }

  async function shareQr() {
    const canvas = document.getElementById('ews-qr-canvas') as HTMLCanvasElement | null
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `EWS-${value}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `E-Waste Setu — ${value}`,
          text: `E-Waste Handover: ${value}`,
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard or just download
        downloadPng()
      }
    })
  }

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <Card className="p-5 flex flex-col items-center gap-4 print:shadow-none">
      {/* White bordered QR for scanner contrast */}
      <div className="bg-white p-4 rounded-2xl border-4 border-eco-100 shadow-sm">
        <QRCodeCanvas
          id="ews-qr-canvas"
          value={value}
          size={220}
          bgColor="#ffffff"
          fgColor="#064e3b"
          level="M"
          ref={canvasRef}
        />
      </div>
      <div className="text-center w-full">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="font-mono font-bold text-eco-900 text-xl mt-1 break-all">{value}</p>
        {meta && <p className="text-xs text-slate-500 mt-1">{meta}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2 w-full print:hidden">
        <Button type="button" variant="secondary" size="md" onClick={downloadPng}>
          ⬇ {t.handover.downloadQr}
        </Button>
        {canShare && (
          <Button type="button" variant="secondary" size="md" onClick={() => void shareQr()}>
            ↗ {t.handover.shareQr}
          </Button>
        )}
        {speakText && <VoiceButton text={speakText} compact />}
      </div>
    </Card>
  )
}
