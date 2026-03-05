'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import enCommon from '../../public/locales/en/common.json'
import enAlgorithms from '../../public/locales/en/algorithms.json'
import enCategories from '../../public/locales/en/categories.json'
import ptCommon from '../../public/locales/pt/common.json'
import ptAlgorithms from '../../public/locales/pt/algorithms.json'
import ptCategories from '../../public/locales/pt/categories.json'

export type Locale = 'en' | 'pt'

type Translations = Record<string, string>

const translations: Record<Locale, Translations> = {
  en: {
    ...flattenObject(enCommon),
    ...flattenObject(enAlgorithms),
    ...flattenObject(enCategories),
  },
  pt: {
    ...flattenObject(ptCommon),
    ...flattenObject(ptAlgorithms),
    ...flattenObject(ptCategories),
  },
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Translations {
  const result: Translations = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[fullKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    }
  }
  return result
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = translations[locale][key] ?? translations['en'][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{{${k}}}`, String(v))
        }
      }
      return str
    },
    [locale]
  )

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
