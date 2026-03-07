'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Search } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Locale } from '@/i18n/context'
import { NavLink } from '@/components/atoms/NavLink'
import { Kbd } from '@/components/atoms/Kbd'
import { SearchOverlay } from '@/components/organisms/SearchOverlay'

export function Nav() {
  const { locale, setLocale } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <nav
        style={{
          background: '#F5F1EB',
          borderBottom: '1px solid #E5DDD0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'box-shadow 0.2s ease',
          boxShadow: scrolled ? '0 1px 12px rgba(28,25,23,0.06)' : 'none',
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
            gap: '24px',
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
              fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#1C1917' }}>Algo</span>
            <span style={{ color: '#CCFF00' }}>F</span>
            <span style={{ color: '#FF6B00' }}>l</span>
            <span style={{ color: '#F900FF' }}>o</span>
            <span style={{ color: '#5200FF' }}>w</span>
          </Link>

          {/* Nav links — using NavLink atom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavLink href="/reference">Reference</NavLink>
            <NavLink href="/big-o">Big-O</NavLink>
            <NavLink href="/compare">Compare</NavLink>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search pill */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              background: '#FDFCFA',
              border: '1px solid #E5DDD0',
              borderRadius: '999px',
              color: '#78716C',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 1px 3px rgba(28,25,23,0.05)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C8BDB0'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(28,25,23,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5DDD0'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(28,25,23,0.05)'
            }}
          >
            <Search size={13} strokeWidth={2} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Search algorithms…
              <Kbd>⌘K</Kbd>
            </span>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/leo-stuart/AlgoFlow"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#78716C',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1C1917' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#78716C' }}
          >
            <Github size={18} strokeWidth={1.75} />
          </a>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#E5DDD0' }} />

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
                  color: locale === lang ? '#5200FF' : '#78716C',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {lang === 'en' ? 'EN' : 'PT'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
