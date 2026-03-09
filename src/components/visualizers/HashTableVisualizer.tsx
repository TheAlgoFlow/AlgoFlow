'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  current: '#f59e0b',
  active: '#6366f1',
  found: '#10b981',
  selected: '#8b5cf6',
}

type KVPair = { key: string; value: string }
type HTState = { buckets: KVPair[][]; currentBucket: number | null; operation: string }

type HashTableVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function HashTableVisualizer({ frame }: HashTableVisualizerProps) {
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

  const state = frame.state as HTState
  const { buckets, currentBucket, operation } = state
  const auxState = frame.auxState as { key?: string } | undefined
  const opColor = operation === 'insert' ? '#10b981' : operation === 'remove' ? '#ef4444' : '#f59e0b'

  return (
    <div
      style={{
        position: 'relative',
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {operation && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '4px',
        }}>
          <div style={{
            padding: '4px 10px', borderRadius: '12px',
            background: `${opColor}20`, border: `1px solid ${opColor}60`,
            color: opColor, fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {operation}
          </div>
          {auxState?.key !== undefined && currentBucket !== null && (
            <div style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            }}>
              hash(&quot;{auxState.key}&quot;) = {currentBucket}
            </div>
          )}
        </div>
      )}
      {buckets.map((bucket, i) => {
        const isActive = i === currentBucket
        const hl = frame.highlights.find(h => h.index === i)
        const hlColor = hl ? (ROLE_COLORS[hl.role] ?? '#6366f1') : null
        const rowColor = hlColor ?? (isActive ? '#6366f1' : null)

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Bucket index */}
            <div
              style={{
                width: '32px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                background: rowColor ? `${rowColor}20` : 'rgba(30,41,59,0.5)',
                border: '1px solid',
                borderColor: rowColor ?? 'rgba(99,102,241,0.2)',
                color: rowColor ?? '#64748b',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i}
            </div>

            {/* Bucket contents */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1, minHeight: '36px' }}>
              {bucket.length === 0 ? (
                <div
                  style={{
                    height: '36px',
                    flex: 1,
                    border: '1px dashed rgba(99,102,241,0.2)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#334155',
                    fontSize: '0.75rem',
                  }}
                >
                  —
                </div>
              ) : (
                bucket.map((kv, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0',
                      border: '1px solid',
                      borderColor: rowColor ?? 'rgba(99,102,241,0.3)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: rowColor ? `${rowColor}10` : 'rgba(30,41,59,0.8)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRight: '1px solid rgba(99,102,241,0.3)',
                        color: '#a5b4fc',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {kv.key}
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                      }}
                    >
                      {kv.value}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Label arrow */}
            {hl?.label && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <span style={{ fontSize: '9px', color: hlColor ?? '#6366f1', lineHeight: 1 }}>◄</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: hlColor ?? '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
