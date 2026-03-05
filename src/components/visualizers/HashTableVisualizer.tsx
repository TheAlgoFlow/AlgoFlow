'use client'

import type { AlgorithmFrame } from '@/engine/types'

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
  const { buckets, currentBucket } = state

  return (
    <div
      style={{
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {buckets.map((bucket, i) => {
        const isActive = i === currentBucket
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
                background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.5)',
                border: '1px solid',
                borderColor: isActive ? '#6366f1' : 'rgba(99,102,241,0.2)',
                color: isActive ? '#a5b4fc' : '#64748b',
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
                      borderColor: isActive ? '#6366f1' : 'rgba(99,102,241,0.3)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: isActive ? 'rgba(99,102,241,0.1)' : 'rgba(30,41,59,0.8)',
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
          </div>
        )
      })}
    </div>
  )
}
