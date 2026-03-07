'use client'

import type { AlgorithmFrame, Highlight, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Record<HighlightRole, string> = {
  compare: '#f59e0b',
  swap: '#ef4444',
  pivot: '#8b5cf6',
  found: '#10b981',
  visited: '#475569',
  current: '#f59e0b',
  sorted: '#10b981',
  active: '#06b6d4',
  inactive: '#334155',
  head: '#f59e0b',
  tail: '#10b981',
  left: '#3b82f6',
  right: '#ef4444',
  mid: '#8b5cf6',
  pointer: '#f59e0b',
  selected: '#f59e0b',
  'dp-fill': '#10b981',
  'dp-current': '#f59e0b',
}

function getHighlight(index: number, highlights: Highlight[]): Highlight | null {
  return highlights.find(h => h.index === index) ?? null
}

type ArraySearchVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function ArraySearchVisualizer({ frame }: ArraySearchVisualizerProps) {
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

  const state = frame.state as { array: number[]; target: number; low?: number; high?: number; mid?: number }
  const arr = state.array ?? []
  const target = state.target

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.5rem',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Target display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Target:</span>
        <div
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#10b981',
          }}
        >
          {target}
        </div>
      </div>

      {/* Array elements */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {arr.map((val, i) => {
          const hl = getHighlight(i, frame.highlights)
          const role = hl?.role
          const color = role ? ROLE_COLORS[role] : null
          const isCurrent = role === 'current'
          const isFound = role === 'found'
          const isRange = role === 'left' || role === 'right' || role === 'mid'

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: color ? 700 : 400,
                  border: '2px solid',
                  borderColor: color ?? 'rgba(0,0,0,0.12)',
                  background: color ? `${color}18` : 'var(--bg-surface)',
                  color: color ?? '#334155',
                  boxShadow: isFound || isCurrent ? `0 0 12px ${color}60` : 'none',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#475569' }}>{i}</div>
              {role && (
                <div
                  style={{
                    fontSize: '0.6rem',
                    color: color ?? '#475569',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {role}
                </div>
              )}
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
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            background: '#f1f5f9',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <span style={{ color: '#3b82f6' }}>Low: {state.low}</span>
          {state.mid !== undefined && <span style={{ color: '#8b5cf6' }}>Mid: {state.mid}</span>}
          <span style={{ color: '#ef4444' }}>High: {state.high}</span>
        </div>
      )}
    </div>
  )
}
