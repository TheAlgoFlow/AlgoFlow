'use client'

import { useState } from 'react'
import Link from 'next/link'
import { allModules, categories } from '@/algorithms/index'
import { useI18n } from '@/i18n/context'
import { getCategoryTheme, CATEGORY_COLORS } from '@/components/constants/categoryTheme'
import { Tag } from '@/components/atoms/Tag'

function getComplexityColor(notation: string): string {
  if (notation === 'O(1)') return '#0f7142'
  if (notation.includes('log n') && !notation.includes('n log')) return '#2563eb'
  if (notation === 'O(n)') return '#78716C'
  if (notation.includes('n log') || notation.includes('n·log')) return '#b45309'
  if (notation.includes('n²') || notation.includes('n^2') || notation.includes('n*n')) return '#dc2626'
  if (notation.includes('2^n') || notation.includes('n!')) return '#9333ea'
  return '#78716C'
}


export default function ReferencePage() {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = allModules.filter(
    mod => activeCategory === 'all' || mod.meta.category === activeCategory
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '3px', height: '16px', background: '#5200FF', borderRadius: '2px' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {t('reference.subtitle')}
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px,6vw,64px)',
              fontWeight: 900,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: '12px',
            }}
          >
            {t('reference.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '520px', lineHeight: 1.65 }}>
            {t('reference.description', { count: allModules.length })}
          </p>
        </div>

        {/* ── Category filter ── */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['all', ...categories.map(c => c.id)].map(cat => {
            const active = activeCategory === cat
            const { color, textColor } = cat !== 'all' ? getCategoryTheme(cat) : { color: '#5200FF', textColor: '#5200FF' }
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1.5px solid',
                  borderColor: active ? color : 'var(--border)',
                  background: active ? `${color}18` : 'var(--bg-surface)',
                  color: active ? textColor : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.12s',
                  textTransform: 'capitalize',
                }}
              >
                {cat === 'all' ? t('reference.all') : t(`categories.${cat}.name`)}
              </button>
            )
          })}
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '48px',
            boxShadow: '0 2px 12px var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-muted)' }}>
                  {[t('reference.headers.algorithm'), t('reference.headers.category'), t('reference.headers.best'), t('reference.headers.avg'), t('reference.headers.worst'), t('reference.headers.space'), t('reference.headers.tags')].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        borderBottom: `1px solid var(--border)`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((mod, i) => {
                  const { color: catColor, textColor: catTextColor } = getCategoryTheme(mod.meta.category)
                  const isEven = i % 2 === 0
                  return (
                    <tr
                      key={mod.meta.slug}
                      style={{ background: isEven ? 'var(--bg-surface)' : 'var(--bg)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-muted)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isEven ? 'var(--bg-surface)' : 'var(--bg)' }}
                    >
                      {/* Algorithm name */}
                      <td style={{ padding: '11px 16px', borderBottom: `1px solid var(--bg-muted)` }}>
                        <Link
                          href={`/visualizer/${mod.meta.category}/${mod.meta.slug}`}
                          style={{
                            color: 'var(--text)',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            borderBottom: '1px dotted var(--text-faint)',
                            transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#5200FF' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)' }}
                        >
                          {t(mod.meta.nameKey)}
                        </Link>
                      </td>

                      {/* Category badge */}
                      <td style={{ padding: '11px 16px', borderBottom: `1px solid var(--bg-muted)` }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            background: `${catColor}18`,
                            border: `1.5px solid ${catColor}35`,
                            color: catTextColor,
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'capitalize',
                            fontFamily: 'var(--font-mono)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mod.meta.category === 'data-structures' ? 'DS' : mod.meta.category === 'dp' ? 'DP' : mod.meta.category}
                        </span>
                      </td>

                      {/* Complexity cells */}
                      {[mod.meta.complexity.time.best, mod.meta.complexity.time.avg, mod.meta.complexity.time.worst, mod.meta.complexity.space].map((val, ci) => (
                        <td key={ci} style={{ padding: '11px 16px', borderBottom: `1px solid var(--bg-muted)` }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: getComplexityColor(val),
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      ))}

                      {/* Tags */}
                      <td style={{ padding: '11px 16px', borderBottom: `1px solid var(--bg-muted)` }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {mod.meta.tags.slice(0, 3).map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Big-O Guide promo ── */}
        <Link
          href="/big-o"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'var(--bg-surface)',
            border: `1.5px solid var(--border)`,
            borderLeft: '4px solid #5200FF',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '48px',
            boxShadow: '0 1px 6px var(--shadow-sm)',
            textDecoration: 'none',
            transition: 'box-shadow 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(82,0,255,0.1)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#5200FF'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 1px 6px rgba(28,25,23,0.04)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              {t('reference.bigOGuide')}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
              {t('reference.bigODesc')}
            </p>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              color: '#5200FF',
              flexShrink: 0,
            }}
          >
            {t('reference.openGuide')}
          </span>
        </Link>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid var(--border)`,
            paddingTop: '24px',
            color: 'var(--text-faint)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
          }}
        >
          {t('reference.footerLink')}
        </div>
      </div>
    </div>
  )
}
