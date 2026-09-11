import en from './en.json'
import hi from './hi.json'
import mr from './mr.json'

export type Locale = 'en' | 'hi' | 'mr'

// Dictionary type is structurally derived from English source of truth
export type Dictionary = typeof en

const dictionaries: Record<Locale, Dictionary> = { en, hi: hi as Dictionary, mr: mr as Dictionary }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en
}
