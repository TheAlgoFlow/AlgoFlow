'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Search, Moon, Sun } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { useTheme } from '@/i18n/theme-context'
import type { Locale } from '@/i18n/context'
import { NavLink } from '@/components/atoms/NavLink'
import { Kbd } from '@/components/atoms/Kbd'
import { SearchOverlay } from '@/components/organisms/SearchOverlay'

export function Nav() {
  const { locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const isDark = theme === 'dark'

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
          background: 'var(--bg)',
          borderBottom: `1px solid var(--border)`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: scrolled ? `0 1px 12px var(--shadow-sm)` : 'none',
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
            <span style={{ color: 'var(--text)' }}>Algo</span>
            <span style={{ color: '#CCFF00' }}>F</span>
            <span style={{ color: '#FF6B00' }}>l</span>
            <span style={{ color: '#F900FF' }}>o</span>
            <span style={{ color: '#5200FF' }}>w</span>
          </Link>

          {/* Nav links */}
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
              background: 'var(--bg-surface)',
              border: `1px solid var(--border)`,
              borderRadius: '999px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: `0 1px 3px var(--shadow-sm)`,
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.boxShadow = `0 2px 8px var(--shadow-md)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = `0 1px 3px var(--shadow-sm)`
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
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Github size={18} strokeWidth={1.75} />
          </a>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: `1.5px solid var(--border)`,
              background: isDark ? 'rgba(82,0,255,0.12)' : 'transparent',
              color: isDark ? '#5200FF' : 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.background = isDark ? 'rgba(82,0,255,0.18)' : 'var(--bg-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = isDark ? 'rgba(82,0,255,0.12)' : 'transparent'
            }}
          >
            {isDark
              ? <Sun size={15} strokeWidth={2} />
              : <Moon size={15} strokeWidth={2} />
            }
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

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
                  color: locale === lang ? '#5200FF' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
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
