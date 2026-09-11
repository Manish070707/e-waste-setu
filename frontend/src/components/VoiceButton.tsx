import { useEffect, useState } from 'react'
import { canSpeak, isSpeaking, speak, speechLang, stopSpeaking } from '../lib/speech'
import { useApp } from '../lib/AppContext'
import { Button } from './Button'

export function VoiceButton({
  text,
  label,
  lang,
  compact = false,
}: {
  text: string
  label?: string
  lang?: string
  compact?: boolean
}) {
  const { locale } = useApp()
  const resolvedLang = lang || speechLang(locale)
  const [playing, setPlaying] = useState(false)

  // Poll speaking state
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      if (!isSpeaking()) {
        setPlaying(false)
        clearInterval(id)
      }
    }, 250)
    return () => clearInterval(id)
  }, [playing])

  if (!canSpeak()) return null

  function handleSpeak() {
    speak(text, resolvedLang)
    setPlaying(true)
  }

  function handleStop() {
    stopSpeaking()
    setPlaying(false)
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={playing ? handleStop : handleSpeak}
        aria-label={playing ? 'Stop' : (label || '🔊')}
        className={`rounded-full w-9 h-9 flex items-center justify-center border text-base transition-all ${
          playing
            ? 'bg-eco-600 border-eco-600 text-white animate-pulse'
            : 'bg-white border-eco-200 text-eco-700 hover:bg-eco-50'
        }`}
      >
        {playing ? '⏹' : '🔊'}
      </button>
    )
  }

  return (
    <div className="inline-flex gap-2 items-center">
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={handleSpeak}
        aria-label={label || '🔊 सुनें'}
        className={playing ? 'border-eco-500 bg-eco-50' : ''}
      >
        <span className={playing ? 'animate-pulse' : ''}>{playing ? '🔊' : '🔊'}</span>
        {label || '🔊 सुनें'}
      </Button>
      {playing && (
        <Button type="button" variant="ghost" size="md" onClick={handleStop} aria-label="Stop">
          ⏹
        </Button>
      )}
    </div>
  )
}
