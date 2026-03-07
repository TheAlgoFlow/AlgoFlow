'use client'

import Link from 'next/link'
import { ArrowLeft, Code2, X } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { Tag } from '@/components/atoms/Tag'

type Props = {
  category: string
  algoName: string
  tags: string[]
  color: string
  textColor: string
  showCode: boolean
  onToggleCode: () => void
}

export function VisualizerTopBar({
  category,
  algoName,
  tags,
  color,
  textColor,
  showCode,
  onToggleCode,
}: Props) {
  const { t } = useI18n()

  return (
    <div
      style={{
        background: '#FDFCFA',
        borderBottom: '1px solid #E5DDD0',
        boxShadow: '0 1px 4px rgba(28,25,23,0.04)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      {/* Back link */}
      <Link
        href={`/visualizer/${category}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          color: '#78716C',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          transition: 'color 0.15s',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1C1917' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#78716C' }}
      >
        <ArrowLeft size={13} strokeWidth={2.5} />
        {t(`categories.${category}.name`)}
      </Link>

      <span style={{ color: '#E5DDD0', fontSize: '16px', fontWeight: 300 }}>/</span>

      {/* Algorithm name */}
      <span
        style={{
          color: '#1C1917',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '-0.01em',
          fontFamily: 'var(--font-display)',
        }}
      >
        {algoName}
      </span>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            style={{
              padding: '2px 8px',
              borderRadius: '5px',
              background: `${color}18`,
              border: `1.5px solid ${color}35`,
              color: textColor,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Code toggle button */}
      <button
        onClick={onToggleCode}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '8px',
          border: `1.5px solid ${showCode ? '#5200FF' : 'rgba(0,0,0,0.1)'}`,
          background: showCode ? '#5200FF' : 'transparent',
          color: showCode ? '#ffffff' : '#78716C',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {showCode ? <X size={13} strokeWidth={2.5} /> : <Code2 size={13} strokeWidth={2.5} />}
        {showCode ? 'Hide code' : 'Code'}
      </button>
    </div>
  )
}
