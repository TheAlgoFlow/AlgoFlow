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
    <div style={{ background: '#F5F1EB', minHeight: 'calc(100vh - 64px)' }}>
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
                color: '#78716C',
              }}
            >
              Big-O Reference
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px,6vw,64px)',
              fontWeight: 900,
              color: '#1C1917',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: '12px',
            }}
          >
            Complexity Cheat Sheet
          </h1>
          <p style={{ color: '#78716C', fontSize: '16px', maxWidth: '520px', lineHeight: 1.65 }}>
            Time and space complexity for all {allModules.length} algorithms, filterable by category.
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
                  borderColor: active ? color : '#E5DDD0',
                  background: active ? `${color}18` : '#FDFCFA',
                  color: active ? textColor : '#78716C',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.12s',
                  textTransform: 'capitalize',
                }}
              >
                {cat === 'all' ? 'All' : cat === 'data-structures' ? 'Data Structures' : cat === 'dp' ? 'DP' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          })}
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: '#FDFCFA',
            border: '1.5px solid #E5DDD0',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '48px',
            boxShadow: '0 2px 12px rgba(28,25,23,0.05)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F0EDE8' }}>
                  {['Algorithm', 'Category', 'Best', 'Average', 'Worst', 'Space', 'Tags'].map(h => (
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
                        color: '#78716C',
                        borderBottom: '1px solid #E5DDD0',
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
                      style={{ background: isEven ? '#FDFCFA' : '#F5F1EB' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F0EDE8' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isEven ? '#FDFCFA' : '#F5F1EB' }}
                    >
                      {/* Algorithm name */}
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #F0EDE8' }}>
                        <Link
                          href={`/visualizer/${mod.meta.category}/${mod.meta.slug}`}
                          style={{
                            color: '#1C1917',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            borderBottom: '1px dotted #C8BDB0',
                            transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#5200FF' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1C1917' }}
                        >
                          {t(mod.meta.nameKey)}
                        </Link>
                      </td>

                      {/* Category badge */}
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #F0EDE8' }}>
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
                        <td key={ci} style={{ padding: '11px 16px', borderBottom: '1px solid #F0EDE8' }}>
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
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #F0EDE8' }}>
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
            background: '#FDFCFA',
            border: '1.5px solid #E5DDD0',
            borderLeft: '4px solid #5200FF',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '48px',
            boxShadow: '0 1px 6px rgba(28,25,23,0.04)',
            textDecoration: 'none',
            transition: 'box-shadow 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(82,0,255,0.1)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#5200FF'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 1px 6px rgba(28,25,23,0.04)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5DDD0'
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#1C1917',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              Big-O Notation Guide
            </div>
            <p style={{ color: '#78716C', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
              Interactive growth curves, complexity cards, and algorithm examples — all in one place.
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
            → Open Guide
          </span>
        </Link>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #E5DDD0',
            paddingTop: '24px',
            color: '#C8BDB0',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
          }}
        >
          Click any algorithm name to open its interactive visualizer.
        </div>
      </div>
    </div>
  )
}
