'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/context'
import { categories, getCategory } from '@/algorithms/index'

const CATEGORY_ICONS: Record<string, string> = {
  sorting: '↕',
  searching: '🔍',
  'data-structures': '🗂',
  dp: '🧩',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  sorting: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
  searching: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
  'data-structures': 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
  dp: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
}

const CATEGORY_COLORS: Record<string, string> = {
  sorting: '#7c3aed',
  searching: '#2563eb',
  'data-structures': '#16a34a',
  dp: '#ea580c',
}

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Hero */}
      <section
        style={{
          padding: '5rem 1rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.875rem',
              borderRadius: '20px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <span>⚡</span>
            <span>Interactive • Step-by-step • Free</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: '#f1f5f9' }}>{t('hero.title')}</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('hero.tagline')}
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '480px',
              margin: '0 auto 2.5rem',
            }}
          >
            {t('hero.subtitle')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/visualizer/sorting"
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                background: '#6366f1',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {t('hero.explore')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 4rem' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '2rem',
          }}
        >
          {t('algorithms')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {categories.map(cat => {
            const algos = getCategory(cat.id)
            const color = CATEGORY_COLORS[cat.id]
            const gradient = CATEGORY_GRADIENTS[cat.id]
            const icon = CATEGORY_ICONS[cat.id]

            return (
              <Link
                key={cat.id}
                href={`/visualizer/${cat.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${color}30`
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  {/* Header with gradient */}
                  <div
                    style={{
                      background: gradient,
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                        {t(`categories.${cat.id}.name`)}
                      </h3>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '2px' }}>
                        {algos.length} {algos.length === 1 ? 'algorithm' : 'algorithms'}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      background: '#1e293b',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                      {t(`categories.${cat.id}.description`)}
                    </p>

                    {/* Algorithm name pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {algos.slice(0, 4).map(algo => (
                        <span
                          key={algo.meta.slug}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: `${color}15`,
                            color,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {t(algo.meta.nameKey)}
                        </span>
                      ))}
                      {algos.length > 4 && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(99,102,241,0.1)',
                            color: '#64748b',
                            fontSize: '0.7rem',
                          }}
                        >
                          +{algos.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(99,102,241,0.2)',
          padding: '2rem 1rem',
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.875rem',
        }}
      >
        <p>Free & Open Source • Built for AEDS students in Brazil and beyond</p>
      </footer>
    </div>
  )
}
