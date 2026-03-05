'use client'

import type { AlgorithmFrame } from '@/engine/types'

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
  const { items, highlighted } = state

  if (mode === 'stack') {
    // Stack: vertical, top at top
    const reversed = [...items].reverse()
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
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
            const isHighlighted = actualIdx === highlighted || actualIdx === items.length - 1
            const isTop = i === 0
            return (
              <div
                key={i}
                style={{
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: isTop ? 'rgba(99,102,241,0.25)' : 'rgba(30,41,59,0.8)',
                  border: '1px solid',
                  borderColor: isTop ? '#6366f1' : 'rgba(99,102,241,0.2)',
                  color: isTop ? '#a5b4fc' : '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: isTop ? 700 : 400,
                  boxShadow: isTop ? '0 0 8px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  minWidth: '64px',
                }}
              >
                {val}
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
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
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
            alignItems: 'center',
          }}
        >
          {items.map((val, i) => {
            const isFront = i === 0
            const isRear = i === items.length - 1
            return (
              <div
                key={i}
                style={{
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: isFront ? 'rgba(6,182,212,0.2)' : isRear ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
                  border: '1px solid',
                  borderColor: isFront ? '#06b6d4' : isRear ? '#6366f1' : 'rgba(99,102,241,0.2)',
                  color: isFront ? '#67e8f9' : isRear ? '#a5b4fc' : '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: (isFront || isRear) ? 700 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                {val}
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
