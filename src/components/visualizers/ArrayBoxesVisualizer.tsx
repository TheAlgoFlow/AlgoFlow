'use client'

import type { AlgorithmFrame, Highlight, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Record<HighlightRole, string> = {
  compare:     '#f59e0b',
  swap:        '#ef4444',
  pivot:       '#8b5cf6',
  found:       '#10b981',
  visited:     '#475569',
  current:     '#f59e0b',
  sorted:      '#10b981',
  active:      '#06b6d4',
  inactive:    '#334155',
  head:        '#f59e0b',
  tail:        '#10b981',
  left:        '#3b82f6',
  right:       '#ef4444',
  mid:         '#8b5cf6',
  pointer:     '#f59e0b',
  selected:    '#f59e0b',
  'dp-fill':   '#10b981',
  'dp-current':'#f59e0b',
}

const ROLE_LABELS: Partial<Record<HighlightRole, string>> = {
  left:    'L',
  right:   'R',
  mid:     'M',
  pivot:   'P',
  current: '▲',
  found:   '✓',
  swap:    '⇄',
  sorted:  '✓',
  active:  '▲',
}

function getHighlight(index: number, highlights: Highlight[]): Highlight | null {
  return highlights.find(h => h.index === index) ?? null
}

/** For compare/swap roles, assign 'i' to the first occurrence and 'j' to the second. */
function buildCompareLabels(highlights: Highlight[]): Map<number | string, string> {
  const labels = new Map<number | string, string>()
  const iJRoles: HighlightRole[] = ['compare', 'swap']
  for (const role of iJRoles) {
    const group = highlights.filter(h => h.role === role)
    if (group.length >= 1) labels.set(group[0].index, 'i')
    if (group.length >= 2) labels.set(group[1].index, 'j')
  }
  return labels
}

type ArrayBoxesVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function ArrayBoxesVisualizer({ frame }: ArrayBoxesVisualizerProps) {
  if (!frame) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#64748b',
          fontSize: '0.875rem',
        }}
      >
        Press play to start
      </div>
    )
  }

  const state = frame.state as {
    array: number[]
    target?: number
    low?: number
    high?: number
    mid?: number
    countArray?: number[]
  }
  const arr = state.array ?? []
  const isSearch = state.target !== undefined

  // Adaptive box size: shrink when many elements
  const boxSize = arr.length > 24 ? 34 : arr.length > 16 ? 40 : 46

  const compareLabels = buildCompareLabels(frame.highlights)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.5rem',
        gap: '1.5rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Target badge (search algorithms) */}
      {isSearch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Target
          </span>
          <div
            style={{
              width: `${boxSize}px`,
              height: `${boxSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid #10b981',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: `${Math.max(11, boxSize * 0.35)}px`,
              color: '#10b981',
              boxShadow: '0 0 10px rgba(16,185,129,0.3)',
            }}
          >
            {state.target}
          </div>
        </div>
      )}

      {/* Main array */}
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {arr.map((val, i) => {
          const hl = getHighlight(i, frame.highlights)
          const role = hl?.role ?? null
          const color = role ? ROLE_COLORS[role] : null
          const label = compareLabels.get(i) ?? (role ? ROLE_LABELS[role] : null)
          const isActive = role === 'current' || role === 'compare' || role === 'swap' || role === 'active'
          const isGlowing = role && role !== 'inactive' && role !== 'visited' && role !== 'sorted'

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {/* Role label above box */}
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: color ?? 'transparent',
                  height: '12px',
                  lineHeight: '12px',
                  letterSpacing: '0.03em',
                }}
              >
                {label ?? ''}
              </div>

              {/* The box */}
              <div
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '5px',
                  fontSize: `${Math.max(10, boxSize * 0.33)}px`,
                  fontWeight: color ? 700 : 500,
                  border: `2px solid ${color ?? 'rgba(0,0,0,0.12)'}`,
                  background: color ? `${color}18` : 'var(--bg-surface)',
                  color: color ?? '#334155',
                  boxShadow: isGlowing ? `0 0 8px ${color}55` : 'none',
                  transform: isActive ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {val}
              </div>

              {/* Index label below box */}
              <div
                style={{
                  fontSize: '9px',
                  color: color ? `${color}99` : '#64748b',
                  fontWeight: 500,
                  height: '12px',
                  lineHeight: '12px',
                }}
              >
                {i}
              </div>
            </div>
          )
        })}
      </div>

      {/* Range indicator for binary search */}
      {(state.low !== undefined || state.high !== undefined) && (
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.75rem',
            padding: '5px 14px',
            background: '#f1f5f9',
            borderRadius: '7px',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>L: {state.low}</span>
          {state.mid !== undefined && <span style={{ color: '#8b5cf6', fontWeight: 600 }}>M: {state.mid}</span>}
          <span style={{ color: '#ef4444', fontWeight: 600 }}>R: {state.high}</span>
        </div>
      )}

      {/* Count array (counting sort) */}
      {state.countArray && state.countArray.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Count array
          </div>
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {state.countArray.map((count, i) => (
              <div
                key={i}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: count > 0 ? 'rgba(99,102,241,0.15)' : '#f1f5f9',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '3px',
                  fontSize: '0.65rem',
                  color: count > 0 ? '#4f46e5' : '#64748b',
                  fontWeight: 600,
                }}
              >
                {count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
