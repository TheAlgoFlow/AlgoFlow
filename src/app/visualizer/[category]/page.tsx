'use client'

import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { getCategory } from '@/algorithms/index'
import { useI18n } from '@/i18n/context'
import type { AlgorithmCategory } from '@/engine/types'

const CATEGORY_COLORS: Record<string, string> = {
  sorting:          '#CCFF00',
  searching:        '#FF6B00',
  'data-structures':'#F900FF',
  dp:               '#5200FF',
}

// Readable text variant for each color on white bg
const CATEGORY_TEXT_COLORS: Record<string, string> = {
  sorting:          '#4a6600',
  searching:        '#FF6B00',
  'data-structures':'#c000cc',
  dp:               '#5200FF',
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)
  const { t } = useI18n()
  const algorithms = getCategory(category as AlgorithmCategory)
  const color = CATEGORY_COLORS[category] ?? '#5200FF'
  const textColor = CATEGORY_TEXT_COLORS[category] ?? '#5200FF'
  const catName = t(`categories.${category}.name`)

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#f8f9fb',
      }}
    >
      {/* ── Page header ─── */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
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
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            {/* Color dot */}
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                marginBottom: '6px',
                boxShadow: `0 0 10px ${color}90`,
              }}
            />
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {catName}
            </h1>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {algorithms.length} algorithms
            </span>
          </div>
        </div>
      </div>

      {/* ── Algorithm list ─── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {algorithms.map((algo, i) => (
            <Link
              key={algo.meta.slug}
              href={`/visualizer/${category}/${algo.meta.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = `${color}50`
                  el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.08)`
                  el.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(0,0,0,0.06)'
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                  el.style.transform = 'translateX(0)'
                }}
              >
                {/* Number */}
                <span
                  style={{
                    color: '#e2e8f0',
                    fontSize: '12px',
                    fontWeight: 700,
                    minWidth: '24px',
                    textAlign: 'right',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Name */}
                <span
                  style={{
                    flex: 1,
                    color: '#0f172a',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t(algo.meta.nameKey)}
                </span>

                {/* Avg complexity */}
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '12px',
                    color: textColor,
                    background: `${color}14`,
                    border: `1.5px solid ${color}30`,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {algo.meta.complexity.time.avg}
                </span>

                <ChevronRight size={15} strokeWidth={2} style={{ color: '#d1d9e0', flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
