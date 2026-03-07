'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge'
import { Tag } from '@/components/atoms/Tag'
import { getCategoryTheme } from '@/components/constants/categoryTheme'

type Props = {
  slug: string
  categoryId: string
  name: string
  complexity: string
  tags: string[]
  accentColor: string
  index: number
  compact?: boolean
}

export function AlgorithmCard({ slug, categoryId, name, complexity, tags, accentColor, index, compact }: Props) {
  const { textColor } = getCategoryTheme(categoryId)

  return (
    <Link href={`/visualizer/${categoryId}/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: compact ? '12px 16px' : '16px 20px',
          background: '#FDFCFA',
          border: '1.5px solid #E5DDD0',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 4px rgba(28,25,23,0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateX(3px)'
          el.style.boxShadow = '0 4px 16px rgba(28,25,23,0.08)'
          el.style.borderColor = `${accentColor}60`
          const bar = el.querySelector('.accent-bar') as HTMLDivElement | null
          if (bar) bar.style.opacity = '1'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateX(0)'
          el.style.boxShadow = '0 1px 4px rgba(28,25,23,0.04)'
          el.style.borderColor = '#E5DDD0'
          const bar = el.querySelector('.accent-bar') as HTMLDivElement | null
          if (bar) bar.style.opacity = '0'
        }}
      >
        {/* Left accent bar */}
        <div
          className="accent-bar"
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: '3px',
            background: accentColor,
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        />

        {/* Index number */}
        <span
          style={{
            color: '#C8BDB0',
            fontSize: '11px',
            fontWeight: 700,
            minWidth: '22px',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Name */}
        <span
          style={{
            flex: 1,
            color: '#1C1917',
            fontSize: compact ? '14px' : '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </span>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {/* Complexity badge */}
        <Badge accentColor={accentColor} textColor={textColor}>{complexity}</Badge>

        <ChevronRight size={14} strokeWidth={2} style={{ color: '#C8BDB0', flexShrink: 0 }} />
      </div>
    </Link>
  )
}
