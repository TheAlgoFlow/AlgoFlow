'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { getCategoryTheme } from '@/components/constants/categoryTheme'
import { AlgorithmCard } from '@/components/molecules/AlgorithmCard'
import type { AlgorithmModule } from '@/engine/types'

type Props = {
  category: string
  algorithms: AlgorithmModule[]
}

/**
 * CategoryPageTemplate
 *
 * Layout shell for the /visualizer/[category] route.
 * Renders the page header + algorithm list.
 */
export function CategoryPageTemplate({ category, algorithms }: Props) {
  const { t } = useI18n()
  const { color } = getCategoryTheme(category)
  const catName = t(`categories.${category}.name`)

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#F5F1EB',
        animation: 'pageIn 0.2s ease',
      }}
    >
      <style>{`@keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* ── Page header ── */}
      <div
        style={{
          borderBottom: '1px solid #E5DDD0',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#78716C',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px',
              transition: 'color 0.15s',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1C1917' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#78716C' }}
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            {/* Colour dot */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                marginBottom: '8px',
                boxShadow: `0 0 10px ${color}90`,
              }}
            />
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 900,
                color: '#1C1917',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              {catName}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#78716C',
                textTransform: 'uppercase',
                marginBottom: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {algorithms.length} algorithms
            </span>
          </div>
        </div>
      </div>

      {/* ── Algorithm list ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {algorithms.map((algo, i) => (
            <AlgorithmCard
              key={algo.meta.slug}
              slug={algo.meta.slug}
              categoryId={category}
              name={t(algo.meta.nameKey)}
              complexity={algo.meta.complexity.time.avg}
              tags={algo.meta.tags}
              accentColor={color}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
