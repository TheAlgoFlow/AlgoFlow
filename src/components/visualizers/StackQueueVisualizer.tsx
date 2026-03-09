'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  current: '#f59e0b',
  active: '#6366f1',
  found: '#10b981',
  selected: '#8b5cf6',
  swap: '#ef4444',
}

type SQState = { items: number[]; highlighted?: number; operation?: string }

type StackQueueVisualizerProps = {
  frame: AlgorithmFrame | null
  mode: 'stack' | 'queue'
}

export function StackQueueVisualizer({ frame, mode }: StackQueueVisualizerProps) {
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

  const state = frame.state as SQState
  const { items, highlighted, operation } = state

  const opColor = operation === 'push' || operation === 'enqueue' ? '#10b981'
    : operation === 'pop' || operation === 'dequeue' ? '#ef4444'
    : '#f59e0b'

  if (mode === 'stack') {
    // Stack: vertical, top at top
    const reversed = [...items].reverse()
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {operation && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            padding: '4px 10px', borderRadius: '12px',
            background: `${opColor}20`, border: `1px solid ${opColor}60`,
            color: opColor, fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {operation}
          </div>
        )}
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          ← TOP
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            border: '2px solid rgba(99,102,241,0.3)',
            borderRadius: '8px',
            padding: '8px',
            background: 'rgba(15,23,42,0.5)',
            minWidth: '80px',
            minHeight: '60px',
          }}
        >
          {reversed.map((val, i) => {
            const actualIdx = items.length - 1 - i
            const isTop = i === 0
            const hl = frame.highlights.find(h => h.index === actualIdx)
            const hlColor = hl ? (ROLE_COLORS[hl.role] ?? '#6366f1') : null
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    height: '44px',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    background: hlColor ? `${hlColor}25` : isTop ? 'rgba(99,102,241,0.25)' : 'rgba(30,41,59,0.8)',
                    border: '1px solid',
                    borderColor: hlColor ?? (isTop ? '#6366f1' : 'rgba(99,102,241,0.2)'),
                    color: hlColor ?? (isTop ? '#a5b4fc' : '#94a3b8'),
                    fontSize: '1rem',
                    fontWeight: isTop ? 700 : 400,
                    boxShadow: hlColor ? `0 0 8px ${hlColor}40` : (isTop ? '0 0 8px rgba(99,102,241,0.3)' : 'none'),
                    transition: 'all 0.2s ease',
                    minWidth: '64px',
                  }}
                >
                  {val}
                </div>
                {hl?.label && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontSize: '9px', color: hlColor ?? '#6366f1', lineHeight: 1 }}>◄</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: hlColor ?? '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                  </div>
                )}
              </div>
            )
          })}
          {items.length === 0 && (
            <div style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
              empty
            </div>
          )}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
          BOTTOM
        </div>
      </div>
    )
  }

  // Queue: horizontal, front at left
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      {operation && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          padding: '4px 10px', borderRadius: '12px',
          background: `${opColor}20`, border: `1px solid ${opColor}60`,
          color: opColor, fontSize: '11px', fontWeight: 700,
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {operation}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 600 }}>FRONT →</div>
        <div
          style={{
            display: 'flex',
            gap: '3px',
            border: '2px solid rgba(99,102,241,0.3)',
            borderRadius: '8px',
            padding: '8px',
            background: 'rgba(15,23,42,0.5)',
            minHeight: '60px',
            minWidth: '60px',
            alignItems: 'flex-start',
          }}
        >
          {items.map((val, i) => {
            const isFront = i === 0
            const isRear = i === items.length - 1
            const hl = frame.highlights.find(h => h.index === i)
            const hlColor = hl ? (ROLE_COLORS[hl.role] ?? '#6366f1') : null
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    background: hlColor ? `${hlColor}25` : isFront ? 'rgba(6,182,212,0.2)' : isRear ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
                    border: '1px solid',
                    borderColor: hlColor ?? (isFront ? '#06b6d4' : isRear ? '#6366f1' : 'rgba(99,102,241,0.2)'),
                    color: hlColor ?? (isFront ? '#67e8f9' : isRear ? '#a5b4fc' : '#94a3b8'),
                    fontSize: '1rem',
                    fontWeight: (isFront || isRear) ? 700 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {val}
                </div>
                {hl?.label && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', marginTop: '4px' }}>
                    <span style={{ fontSize: '9px', color: hlColor ?? '#6366f1', lineHeight: 1 }}>▲</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: hlColor ?? '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                  </div>
                )}
              </div>
            )
          })}
          {items.length === 0 && (
            <div style={{ color: '#475569', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              empty
            </div>
          )}
        </div>
        <div style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>← REAR</div>
      </div>
    </div>
  )
}
