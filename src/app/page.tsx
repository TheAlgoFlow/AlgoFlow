'use client'

import Link from 'next/link'
import { ArrowUpDown, Search, Database, BrainCircuit, ArrowRight } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { categories, getCategory } from '@/algorithms/index'

const CATEGORY_META: Record<string, {
  icon: React.ReactNode
  color: string
  num: string
  textColor: string
  mutedColor: string
}> = {
  sorting: {
    icon: <ArrowUpDown size={22} strokeWidth={2} />,
    color: '#CCFF00',
    num: '01',
    textColor: '#0a0f1a',
    mutedColor: 'rgba(0,0,0,0.4)',
  },
  searching: {
    icon: <Search size={22} strokeWidth={2} />,
    color: '#FF6B00',
    num: '02',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.55)',
  },
  'data-structures': {
    icon: <Database size={22} strokeWidth={2} />,
    color: '#F900FF',
    num: '03',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.55)',
  },
  dp: {
    icon: <BrainCircuit size={22} strokeWidth={2} />,
    color: '#5200FF',
    num: '04',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.55)',
  },
}

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div>
      {/* ── Topics ────────────────────────────────────────── */}
      <section
        style={{
          background: '#f8f9fb',
          padding: 'clamp(48px, 7vw, 96px) 24px',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto', width: '100%' }}>
          {/* 2 × 2 card grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {categories.map(cat => {
              const algos = getCategory(cat.id)
              const meta = CATEGORY_META[cat.id]

              return (
                <Link
                  key={cat.id}
                  href={`/visualizer/${cat.id}`}
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <div
                    style={{
                      flex: 1,
                      background: meta.color,
                      borderRadius: '20px',
                      padding: '28px 28px 24px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0',
                      minHeight: '220px',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'translateY(-5px)'
                      el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.16)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Decorative number — bleeds off the bottom-right edge */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-18px',
                        right: '-8px',
                        fontSize: '130px',
                        fontWeight: 900,
                        lineHeight: 1,
                        color: 'rgba(0,0,0,0.13)',
                        letterSpacing: '-0.05em',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    >
                      {meta.num}
                    </span>

                    {/* Icon */}
                    <div style={{ color: meta.textColor, marginBottom: '22px', opacity: 0.9 }}>
                      {meta.icon}
                    </div>

                    {/* Name */}
                    <h2
                      style={{
                        color: meta.textColor,
                        fontWeight: 800,
                        fontSize: '22px',
                        letterSpacing: '-0.025em',
                        marginBottom: '8px',
                        lineHeight: 1.15,
                      }}
                    >
                      {t(`categories.${cat.id}.name`)}
                    </h2>

                    {/* Count */}
                    <p
                      style={{
                        color: meta.mutedColor,
                        fontSize: '15px',
                        fontWeight: 500,
                        margin: 0,
                        marginBottom: 'auto',
                      }}
                    >
                      {algos.length} algorithms
                    </p>

                    {/* Footer row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '24px',
                        color: meta.textColor,
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        opacity: 0.8,
                        textTransform: 'uppercase',
                      }}
                    >
                      Explore
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          padding: '24px',
          textAlign: 'center',
          color: '#cbd5e1',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        Free &amp; Open Source · Built for CS students
      </footer>
    </div>
  )
}
