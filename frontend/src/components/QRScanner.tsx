import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Button } from './Button'

export function QRScanner({
  onResult,
  onClose,
}: {
  onResult: (value: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          requestAnimationFrame(tick)
        }
      } catch {
        setError('Camera access denied. Please allow camera permission.')
        setScanning(false)
      }
    }

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      if (code?.data) {
        setScanning(false)
        stopStream()
        onResult(code.data)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    void start()
    return () => {
      cancelAnimationFrame(rafRef.current)
      stopStream()
    }
  }, [onResult])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <p className="text-white font-bold">Scan Collector QR</p>
        <Button variant="ghost" onClick={() => { stopStream(); onClose() }} className="text-white">
          ✕ Close
        </Button>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full max-h-full object-cover"
          playsInline
          muted
        />
        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-eco-400 rounded-2xl opacity-80" />
        </div>
        {scanning && (
          <p className="absolute bottom-8 text-white text-sm bg-black/60 px-4 py-2 rounded-full">
            Point camera at QR code…
          </p>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {error && (
        <div className="p-4 bg-red-900 text-white text-sm text-center">{error}</div>
      )}
    </div>
  )
}
