'use client'

import type { TraceStep, TraceValue, HeapObject } from '@/types/execution'

function PrimitiveChip({ val }: { val: TraceValue }) {
  const text =
    val === null ? 'null'
    : typeof val === 'string' ? `"${val}"`
    : String(val)

  const color =
    typeof val === 'number' ? '#5200FF'
    : typeof val === 'boolean' ? '#F900FF'
    : typeof val === 'string' ? '#FF6B00'
    : 'var(--text-muted)'

  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color,
      padding: '1px 5px',
      borderRadius: '4px',
      background: 'var(--bg-muted)',
      border: '1px solid var(--border)',
    }}>
      {text}
    </span>
  )
}

function HeapCard({ id, obj, heap }: { id: string; obj: HeapObject; heap: Record<string, HeapObject> }) {
  const shortId = id.slice(-6)

  const renderVal = (val: TraceValue): React.ReactNode => {
    if (val === null || typeof val !== 'object') return <PrimitiveChip val={val} />
    if ('__ref__' in val) {
      return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5200FF' }}>
          → {val.__desc__ ?? `ref`}
        </span>
      )
    }
    if ('__type__' in val) return <PrimitiveChip val={val.repr} />
    return <PrimitiveChip val={JSON.stringify(val)} />
  }

  return (
    <div style={{
      borderRadius: '10px',
      border: '1.5px solid var(--border)',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
      flexShrink: 0,
      minWidth: '160px',
      maxWidth: '260px',
    }}>
      <div style={{
        padding: '5px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
          #{shortId}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#F900FF' }}>
          {'type' in obj ? obj.type : 'object'}
          {'class' in obj ? ` (${obj.class})` : ''}
        </span>
      </div>
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {'elements' in obj && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
            {obj.elements.map((el, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>[{i}]</span>
                {renderVal(el)}
              </span>
            ))}
          </div>
        )}
        {'pairs' in obj && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {obj.pairs.map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderVal(k)}
                <span style={{ color: 'var(--text-faint)', fontSize: '10px' }}>:</span>
                {renderVal(v)}
              </div>
            ))}
          </div>
        )}
        {'fields' in obj && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.entries(obj.fields).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '10px' }}>=</span>
                {renderVal(v)}
              </div>
            ))}
          </div>
        )}
        {'desc' in obj && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {obj.desc}
          </span>
        )}
      </div>
    </div>
  )
}

type Props = { step: TraceStep }

export function HeapPanel({ step }: Props) {
  const entries = Object.entries(step.heap)

  if (entries.length === 0) {
    return (
      <p style={{ color: 'var(--text-faint)', fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '8px' }}>
        No heap objects
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', overflowY: 'auto', padding: '2px' }}>
      {entries.map(([id, obj]) => (
        <HeapCard key={id} id={id} obj={obj} heap={step.heap} />
      ))}
    </div>
  )
}
