'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Locale } from '@/i18n/context'

export function Nav() {
  const { locale, setLocale } = useI18n()

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#0f172a' }}>Algo</span>
          <span style={{ color: '#CCFF00' }}>F</span>
          <span style={{ color: '#FF6B00' }}>l</span>
          <span style={{ color: '#F900FF' }}>o</span>
          <span style={{ color: '#5200FF' }}>w</span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* GitHub */}
          <a
            href="https://github.com/leo-stuart/AlgoFlow"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#0f172a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
          >
            <Github size={19} strokeWidth={1.75} />
          </a>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.07)' }} />

          {/* Language toggle */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['en', 'pt'] as Locale[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: locale === lang ? '#5200FF' : 'transparent',
                  background: locale === lang ? 'rgba(82,0,255,0.06)' : 'transparent',
                  color: locale === lang ? '#5200FF' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  transition: 'all 0.15s',
                }}
              >
                {lang === 'en' ? 'EN' : 'PT'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
