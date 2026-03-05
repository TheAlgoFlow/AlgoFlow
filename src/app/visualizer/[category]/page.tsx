'use client'

import Link from 'next/link'
import { use } from 'react'
import { getCategory } from '@/algorithms/index'
import { useI18n } from '@/i18n/context'
import type { AlgorithmCategory } from '@/engine/types'

const CATEGORY_COLORS: Record<string, string> = {
  sorting: '#7c3aed',
  searching: '#2563eb',
  'data-structures': '#16a34a',
  dp: '#ea580c',
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)
  const { t } = useI18n()
  const algorithms = getCategory(category as AlgorithmCategory)
  const color = CATEGORY_COLORS[category] ?? '#6366f1'
  const catName = t(`categories.${category}.name`)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          {t('back')}
        </Link>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#f1f5f9',
            marginBottom: '0.5rem',
          }}
        >
          {catName}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          {t(`categories.${category}.description`)}
        </p>
      </div>

      {/* Algorithm cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {algorithms.map(algo => (
          <Link
            key={algo.meta.slug}
            href={`/visualizer/${category}/${algo.meta.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              }}
            >
              {/* Color accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: color,
                  borderRadius: '12px 0 0 12px',
                }}
              />

              <div style={{ paddingLeft: '0.75rem' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {t(algo.meta.nameKey)}
                </h3>

                {/* Complexity badges */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <ComplexityBadge label="Best" value={algo.meta.complexity.time.best} color="#10b981" />
                  <ComplexityBadge label="Avg" value={algo.meta.complexity.time.avg} color={color} />
                  <ComplexityBadge label="Space" value={algo.meta.complexity.space} color="#64748b" />
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {algo.meta.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: `${color}20`,
                        color,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ComplexityBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        color,
        fontSize: '0.7rem',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
    >
      <span style={{ color: '#64748b', fontSize: '0.65rem' }}>{label}:</span>
      {value}
    </span>
  )
}
