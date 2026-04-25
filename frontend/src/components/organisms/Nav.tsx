'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Github, Moon, Sun,
  BookOpen, TrendingUp, GitCompare, Home, Code2,
  ChevronLeft, ChevronRight, Menu,
} from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { useTheme } from '@/i18n/theme-context'
import { useSidebar } from '@/i18n/sidebar-context'

const NAV_LINKS = [
  { href: '/',           icon: Home,       labelKey: 'nav.home',       exact: true  },
  { href: '/reference',  icon: BookOpen,   labelKey: 'nav.reference',  exact: false },
  { href: '/big-o',      icon: TrendingUp, labelKey: 'nav.bigO',       exact: false },
  { href: '/compare',    icon: GitCompare, labelKey: 'nav.compare',    exact: false },
  { href: '/playground', icon: Code2,      labelKey: 'nav.playground', exact: false },
]

export function Nav() {
  const { locale, setLocale, t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { isExpanded, toggle } = useSidebar()
  const pathname = usePathname()
  const isDark = theme === 'dark'

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile hamburger (shown on small screens when sidebar is closed) */}
      <button
        onClick={toggle}
        aria-label="Open menu"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 51,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1.5px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 'var(--sidebar-width)',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'width 0.25s ease, transform 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Logo + toggle button row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isExpanded ? 'space-between' : 'center',
            padding: isExpanded ? '0 8px 0 16px' : '0',
            height: '56px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: isExpanded ? 'flex' : 'none',
              alignItems: 'center',
              textDecoration: 'none',
              fontSize: '18px',
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

          {/* Toggle button */}
          <button
            onClick={toggle}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {isExpanded
              ? <ChevronLeft size={14} strokeWidth={2.5} />
              : <ChevronRight size={14} strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', flexShrink: 0 }}>
          {NAV_LINKS.map(({ href, icon: Icon, labelKey, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                title={!isExpanded ? t(labelKey) : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: isExpanded ? '8px 10px' : '8px',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#5200FF' : 'var(--text-muted)',
                  background: active ? 'rgba(82,0,255,0.07)' : 'transparent',
                  borderLeft: active ? '3px solid #5200FF' : '3px solid transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-muted)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                {isExpanded && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{t(labelKey)}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '8px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {/* Theme toggle — label reflects current state */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '8px 10px' : '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-muted)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {isDark
              ? <Moon size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              : <Sun size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
            }
            {isExpanded && <span>{isDark ? 'Dark mode' : 'Light mode'}</span>}
          </button>

          {/* Language — segmented pill when expanded, compact badge when collapsed */}
          {isExpanded ? (
            <div style={{ display: 'flex', gap: '4px', padding: '2px 10px' }}>
              {(['en', 'pt'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: '7px',
                    border: locale === lang ? '1.5px solid #5200FF' : '1.5px solid var(--border)',
                    background: locale === lang ? 'rgba(82,0,255,0.08)' : 'transparent',
                    color: locale === lang ? '#5200FF' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-mono)',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
              <button
                onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
                title={locale === 'en' ? 'Português' : 'English'}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #5200FF',
                  background: 'rgba(82,0,255,0.06)',
                  color: '#5200FF',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {locale.toUpperCase()}
              </button>
            </div>
          )}

          {/* GitHub */}
          <a
            href="https://github.com/leo-stuart/AlgoFlow"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '8px 10px' : '8px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text)'
              e.currentTarget.style.background = 'var(--bg-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Github size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {isExpanded && <span>GitHub</span>}
          </a>
        </div>
      </aside>

      {/* Mobile-only: show hamburger button */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
