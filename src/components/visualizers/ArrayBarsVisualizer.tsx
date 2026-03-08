'use client'

import type { AlgorithmFrame, Highlight, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Record<HighlightRole, string> = {
  compare: '#f59e0b',
  swap: '#ef4444',
  pivot: '#8b5cf6',
  found: '#10b981',
  visited: '#6366f1',
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

const DEFAULT_COLOR = '#6366f1'

function getHighlight(index: number, highlights: Highlight[]): Highlight | null {
  return highlights.find(h => h.index === index) ?? null
}

type ArrayBarsVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function ArrayBarsVisualizer({ frame }: ArrayBarsVisualizerProps) {
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

  const state = frame.state as { array: number[]; countArray?: number[] }
  const arr = state.array ?? []
  const maxVal = Math.max(...arr, 1)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1rem',
        gap: '0.5rem',
      }}
    >
      {/* Main array bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          height: 'calc(100% - 2rem)',
          paddingBottom: '2.5rem',
          position: 'relative',
        }}
      >
        {arr.map((val, i) => {
          const hl = getHighlight(i, frame.highlights)
          const role = hl?.role ?? null
          const color = role ? ROLE_COLORS[role] : DEFAULT_COLOR
          const heightPct = (val / maxVal) * 100

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: color,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.25s ease, background-color 0.15s ease',
                  boxShadow: role ? `0 0 8px ${color}60` : 'none',
                  position: 'relative',
                  minHeight: '4px',
                }}
              />
              {arr.length <= 20 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1.25rem',
                    fontSize: '0.7rem',
                    color: role ? color : '#64748b',
                    fontWeight: role ? 700 : 400,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {val}
                </div>
              )}
              {hl?.label && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: '9px', color: ROLE_COLORS[hl.role], lineHeight: 1 }}>▲</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: ROLE_COLORS[hl.role], fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Count array (for counting sort) */}
      {state.countArray && state.countArray.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>
            Count array
          </div>
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
            {state.countArray.map((count, i) => (
              <div
                key={i}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: count > 0 ? 'rgba(99,102,241,0.2)' : '#f1f5f9',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  color: count > 0 ? '#4f46e5' : '#64748b',
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
