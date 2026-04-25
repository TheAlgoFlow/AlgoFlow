'use client'

import type { TraceStep, TraceValue, HeapObject } from '@/types/execution'

function renderValue(val: TraceValue, heap: Record<string, HeapObject>): string {
  if (val === null) return 'null'
  if (typeof val === 'boolean') return String(val)
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') return `"${val}"`
  if ('__ref__' in val) {
    const obj = heap[val.__ref__]
    if (!obj) return val.__desc__ ?? `ref(${val.__ref__})`
    if ('elements' in obj) {
      const items = obj.elements.map(e => renderValue(e, heap)).join(', ')
      return obj.type === 'tuple' ? `(${items})` : `[${items}]`
    }
    if ('pairs' in obj) {
      const pairs = obj.pairs.map(([k, v]) => `${renderValue(k, heap)}: ${renderValue(v, heap)}`).join(', ')
      return `{${pairs}}`
    }
    if ('fields' in obj) {
      return `${obj.class ?? 'obj'}{...}`
    }
    if ('desc' in obj) return obj.desc
  }
  if ('__type__' in val) return val.repr
  return JSON.stringify(val)
}

type Props = {
  step: TraceStep
}

export function StackPanel({ step }: Props) {
  const frames = [...step.stack_frames].reverse()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', padding: '2px' }}>
      {frames.length === 0 && (
        <p style={{ color: 'var(--text-faint)', fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '8px' }}>
          No active frames
        </p>
      )}
      {frames.map((frame, fi) => {
        const isTop = fi === frames.length - 1
        return (
          <div
            key={fi}
            style={{
              borderRadius: '10px',
              border: `1.5px solid ${isTop ? '#5200FF44' : 'var(--border)'}`,
              background: isTop ? 'rgba(82,0,255,0.04)' : 'var(--bg-surface)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Frame header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderBottom: '1px solid var(--border)',
              background: isTop ? 'rgba(82,0,255,0.06)' : 'var(--bg-muted)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: isTop ? '#5200FF' : 'var(--text-muted)',
              }}>
                {frame.func_name}()
              </span>
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-faint)',
              }}>
                line {frame.line}
              </span>
            </div>

            {/* Variables */}
            <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(frame.locals).length === 0 ? (
                <span style={{ color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  (empty)
                </span>
              ) : (
                Object.entries(frame.locals).map(([name, val]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      minWidth: '80px',
                    }}>
                      {name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#FF6B00',
                    }}>
                      =
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: '#5200FF',
                      wordBreak: 'break-all',
                    }}>
                      {renderValue(val, step.heap)}
                    </span>
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
