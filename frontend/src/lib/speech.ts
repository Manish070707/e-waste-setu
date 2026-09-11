export function speechLang(locale: string) {
  if (locale === 'hi') return 'hi-IN'
  if (locale === 'mr') return 'mr-IN'
  return 'en-IN'
}

export function speak(text: string, lang = 'hi-IN'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.9
  u.pitch = 1.0
  window.speechSynthesis.speak(u)
  return true
}

export function speakWithFallback(text: string, primaryLang: string, fallbackLang = 'en-IN'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  const voices = window.speechSynthesis.getVoices()
  const hasVoice = voices.some((v) => v.lang.startsWith(primaryLang.split('-')[0]))
  return speak(text, hasVoice ? primaryLang : fallbackLang)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis.speaking
    : false
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
