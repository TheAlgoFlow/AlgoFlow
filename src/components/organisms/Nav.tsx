'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/context'
import type { Locale } from '@/i18n/context'

export function Nav() {
  const { t, locale, setLocale } = useI18n()

  return (
    <nav
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#f1f5f9',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>⚡</span>
          <span>DSA Visualizer</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {(['en', 'pt'] as Locale[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              style={{
                padding: '0.25rem 0.625rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: locale === lang ? '#6366f1' : 'rgba(99,102,241,0.3)',
                background: locale === lang ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: locale === lang ? '#a5b4fc' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.15s ease',
              }}
            >
              {lang === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
