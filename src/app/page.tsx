'use client'

import Link from 'next/link'
import { ArrowUpDown, Search, Database, BrainCircuit } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { categories, getCategory } from '@/algorithms/index'

const CATEGORY_META: Record<string, {
  icon: React.ReactNode
  color: string
  num: string
  tags: string[]
}> = {
  sorting: {
    icon: <ArrowUpDown size={20} strokeWidth={2} />,
    color: '#CCFF00',
    num: '01',
    tags: ['comparison', 'in-place'],
  },
  searching: {
    icon: <Search size={20} strokeWidth={2} />,
    color: '#FF6B00',
    num: '02',
    tags: ['graph', 'binary'],
  },
  'data-structures': {
    icon: <Database size={20} strokeWidth={2} />,
    color: '#F900FF',
    num: '03',
    tags: ['tree', 'linked-list'],
  },
  dp: {
    icon: <BrainCircuit size={20} strokeWidth={2} />,
    color: '#5200FF',
    num: '04',
    tags: ['memoization', 'tabulation'],
  },
}

export default function HomePage() {
  const { t } = useI18n()
  const totalAlgos = categories.reduce((n, c) => n + getCategory(c.id).length, 0)

  return (
    <div style={{ background: '#F5F1EB', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Page header ── */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: 'clamp(32px, 4vw, 48px) 24px 24px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 900,
          color: '#1C1917',
          letterSpacing: '-0.025em',
          marginBottom: '6px',
        }}>
          Algorithms
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#78716C',
          letterSpacing: '0.04em',
        }}>
          {categories.length} categories · {totalAlgos} algorithms
        </p>
      </section>

      {/* ── Category cards ── */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px clamp(48px, 7vw, 96px)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
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
                    background: '#FDFCFA',
                    borderRadius: '16px',
                    border: '1.5px solid #E5DDD0',
                    borderTop: `4px solid ${meta.color}`,
                    padding: '24px 24px 20px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 2px 8px rgba(28,25,23,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    minHeight: '200px',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 12px 32px rgba(28,25,23,0.10)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 2px 8px rgba(28,25,23,0.05)'
                  }}
                >
                  {/* Ghost number */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-16px',
                      right: '-6px',
                      fontSize: '120px',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: 'rgba(28,25,23,0.04)',
                      letterSpacing: '-0.05em',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {meta.num}
                  </span>

                  {/* Icon chip */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9px',
                      background: `${meta.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1C1917',
                      marginBottom: '18px',
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>

                  {/* Name */}
                  <h2
                    style={{
                      color: '#1C1917',
                      fontWeight: 800,
                      fontSize: '20px',
                      letterSpacing: '-0.025em',
                      marginBottom: '6px',
                      lineHeight: 1.15,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {t(`categories.${cat.id}.name`)}
                  </h2>

                  {/* Count */}
                  <p
                    style={{
                      color: '#78716C',
                      fontSize: '13px',
                      fontWeight: 500,
                      margin: 0,
                      marginBottom: 'auto',
                    }}
                  >
                    {algos.length} algorithms
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '5px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {meta.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '10px',
                          color: '#78716C',
                          background: '#F0EDE8',
                          border: '1px solid #E5DDD0',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}
