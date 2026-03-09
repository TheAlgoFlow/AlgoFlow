'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  'dp-current': '#f59e0b',
  'dp-fill': '#10b981',
  active: '#6366f1',
  current: '#f59e0b',
  visited: '#10b981',
  compare: '#8b5cf6',
  selected: '#06b6d4',
}

type GridVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function GridVisualizer({ frame }: GridVisualizerProps) {
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
    dp?: (number | null)[][]
    dp1d?: (number | null)[]
    array?: number[]
    current?: [number, number] | number | null
    s1?: string
    s2?: string
    items?: { name: string; weight: number; value: number }[]
    coins?: number[]
    amount?: number
    n?: number
  }

  const formula = (frame.auxState as { formula?: string } | undefined)?.formula

  // 2D DP table
  if (state.dp && Array.isArray(state.dp[0])) {
    const table = state.dp as (number | null)[][]
    const rows = table.length
    const cols = table[0]?.length ?? 0
    const current = state.current as [number, number] | null
    const { s1, s2, items } = state

    const getCellColor = (i: number, j: number) => {
      if (current && current[0] === i && current[1] === j) return '#f59e0b'
      const hl = frame.highlights.find(h => h.index === `${i},${j}`)
      if (hl) return ROLE_COLORS[hl.role] ?? null
      if (table[i][j] !== null && table[i][j] !== undefined) return '#10b981'
      return null
    }

    const cellSize = Math.min(44, Math.floor(480 / Math.max(cols, rows)))

    return (
      <div
        style={{
          padding: '1rem',
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Row/col headers */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: `${Math.max(10, cellSize * 0.35)}px` }}>
            <thead>
              <tr>
                <th style={{ width: cellSize, height: cellSize, color: '#475569', padding: 0 }}></th>
                {Array.from({ length: cols }).map((_, j) => (
                  <th
                    key={j}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      textAlign: 'center',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    {s2 ? (j === 0 ? '' : s2[j - 1]) : j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      textAlign: 'center',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: 0,
                      width: cellSize,
                      height: cellSize,
                    }}
                  >
                    {s1 ? (i === 0 ? '' : s1[i - 1]) : items ? (i === 0 ? '∅' : items[i - 1]?.name) : i}
                  </td>
                  {row.map((cell, j) => {
                    const color = getCellColor(i, j)
                    const isCurrent = current && current[0] === i && current[1] === j
                    const hl = frame.highlights.find(h => h.index === `${i},${j}`)
                    return (
                      <td
                        key={j}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          textAlign: 'center',
                          border: '1px solid rgba(99,102,241,0.2)',
                          background: color ? `${color}25` : '#f1f5f9',
                          color: color ?? '#475569',
                          fontWeight: isCurrent ? 700 : 400,
                          fontSize: `${Math.max(10, cellSize * 0.35)}px`,
                          transition: 'all 0.2s ease',
                          boxShadow: isCurrent ? `inset 0 0 0 2px ${color}` : 'none',
                          padding: 0,
                          position: 'relative',
                        }}
                      >
                        {cell !== null && cell !== undefined ? cell : ''}
                        {hl?.label && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1px',
                            pointerEvents: 'none',
                            zIndex: 1,
                          }}>
                            <span style={{ fontSize: '7px', color: ROLE_COLORS[hl.role] ?? color ?? '#6366f1', lineHeight: 1 }}>▲</span>
                            <span style={{ fontSize: '9px', fontFamily: 'monospace', color: ROLE_COLORS[hl.role] ?? color ?? '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {formula && (
          <div style={{
            textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-muted)', background: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: '6px',
            padding: '4px 12px', flexShrink: 0,
          }}>
            {formula}
          </div>
        )}
      </div>
    )
  }

  // 1D DP array (fibonacci, coin change, LIS)
  const dp1d = (state.dp as unknown as (number | null)[]) ?? state.dp1d
  const array = state.array
  const current1d = state.current as number | null

  const displayArr = dp1d ?? array ?? []

  return (
    <div
      style={{
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Original array (if exists alongside dp) */}
      {array && dp1d && (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.75rem', marginRight: '0.5rem', width: '60px', textAlign: 'right' }}>arr:</span>
          {array.map((v, i) => {
            const hl = frame.highlights.find(h => h.index === i)
            const color = hl ? (ROLE_COLORS[hl.role] ?? '#6366f1') : null
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: color ?? 'rgba(99,102,241,0.2)',
                    borderRadius: '4px',
                    background: color ? `${color}20` : '#f1f5f9',
                    color: color ?? '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: color ? 700 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {v}
                </div>
                {hl?.label && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', marginTop: '2px' }}>
                    <span style={{ fontSize: '9px', color: color ?? '#6366f1', lineHeight: 1 }}>▲</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: color ?? '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* DP array */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.75rem', marginRight: '0.5rem', width: '60px', textAlign: 'right' }}>dp:</span>
        {displayArr.map((v, i) => {
          const isCurrent = i === current1d
          const color = isCurrent ? '#f59e0b' : v !== null ? '#10b981' : null
          return (
            <div
              key={i}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: color ?? 'rgba(99,102,241,0.2)',
                borderRadius: '4px',
                background: color ? `${color}20` : '#f1f5f9',
                color: color ?? '#475569',
                fontSize: '0.8rem',
                fontWeight: isCurrent ? 700 : v !== null ? 600 : 400,
                boxShadow: isCurrent ? `0 0 8px ${color}60` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {v !== null && v !== undefined ? (v === Infinity ? '∞' : v) : '?'}
            </div>
          )
        })}
      </div>

      {/* Index labels */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <span style={{ width: '68px' }} />
        {displayArr.map((_, i) => (
          <div
            key={i}
            style={{
              width: '40px',
              textAlign: 'center',
              color: '#475569',
              fontSize: '0.65rem',
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Formula strip */}
      {formula && (
        <div style={{
          textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-muted)', background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '6px',
          padding: '4px 12px', flexShrink: 0,
        }}>
          {formula}
        </div>
      )}
    </div>
  )
}
