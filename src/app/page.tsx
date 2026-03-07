'use client'

import Link from 'next/link'
import { ArrowUpDown, Search, Database, BrainCircuit } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { categories, getCategory } from '@/algorithms/index'
import { CATEGORY_COLORS } from '@/components/constants/categoryTheme'
import { Tag } from '@/components/atoms/Tag'
import { IconChip } from '@/components/atoms/IconChip'

const CATEGORY_META: Record<string, {
  icon: React.ReactNode
  num: string
  tags: string[]
}> = {
  sorting: {
    icon: <ArrowUpDown size={20} strokeWidth={2} />,
    num: '01',
    tags: ['comparison', 'in-place'],
  },
  searching: {
    icon: <Search size={20} strokeWidth={2} />,
    num: '02',
    tags: ['graph', 'binary'],
  },
  'data-structures': {
    icon: <Database size={20} strokeWidth={2} />,
    num: '03',
    tags: ['tree', 'linked-list'],
  },
  dp: {
    icon: <BrainCircuit size={20} strokeWidth={2} />,
    num: '04',
    tags: ['memoization', 'tabulation'],
  },
}

export default function HomePage() {
  const { t } = useI18n()
  const totalAlgos = categories.reduce((n, c) => n + getCategory(c.id).length, 0)

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>

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
          color: 'var(--text)',
          letterSpacing: '-0.025em',
          marginBottom: '6px',
        }}>
          {t('algorithms')}
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>
          {t('home.stats', { categories: categories.length, total: totalAlgos })}
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
            const color = CATEGORY_COLORS[cat.id]

            return (
              <Link
                key={cat.id}
                href={`/visualizer/${cat.id}`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <div
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: `1.5px solid var(--border)`,
                    borderTop: `4px solid ${color}`,
                    padding: '24px 24px 20px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 2px 8px var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    minHeight: '200px',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 12px 32px var(--shadow-md)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 2px 8px var(--shadow-sm)'
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
                      color: 'var(--text)',
                      opacity: 0.06,
                      letterSpacing: '-0.05em',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {meta.num}
                  </span>

                  {/* Icon chip — using atom */}
                  <div style={{ marginBottom: '18px' }}>
                    <IconChip color={color}>{meta.icon}</IconChip>
                  </div>

                  {/* Name */}
                  <h2
                    style={{
                      color: 'var(--text)',
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
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: 500,
                      margin: 0,
                      marginBottom: 'auto',
                    }}
                  >
                    {t('home.algorithmCount', { count: algos.length })}
                  </p>

                  {/* Tags — using atom */}
                  <div style={{ display: 'flex', gap: '5px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {meta.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
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
