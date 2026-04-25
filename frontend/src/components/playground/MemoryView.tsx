'use client'

import { useRef, useLayoutEffect, useState, useCallback } from 'react'
import type { TraceStep, TraceValue, HeapObject } from '@/types/execution'

/* ─── colour palette for pointer arrows ─── */
const PTR_COLORS = ['#5200FF', '#FF6B00', '#F900FF', '#00B4D8', '#22c55e', '#f59e0b']

/* ─── helpers ─── */
function isRef(v: TraceValue): v is { __ref__: string } {
  return typeof v === 'object' && v !== null && '__ref__' in v
}

function primitiveColor(v: TraceValue): string {
  if (typeof v === 'number')  return '#5200FF'
  if (typeof v === 'string')  return '#FF6B00'
  if (typeof v === 'boolean') return '#F900FF'
  return 'var(--text-muted)'
}

function primitiveText(v: TraceValue): string {
  if (v === null)              return 'null'
  if (typeof v === 'string')   return `"${v}"`
  return String(v)
}

function heapLabel(obj: HeapObject): string {
  if ('elements' in obj) return obj.type
  if ('pairs'    in obj) return 'dict'
  if ('fields'   in obj) return (obj as { class?: string }).class ?? 'object'
  if ('desc'     in obj) return (obj as { desc: string }).desc
  return 'object'
}

/* ─── small chip used everywhere ─── */
function ValChip({ val }: { val: TraceValue }) {
  if (isRef(val)) return null          // refs are handled by the caller
  const text  = val === null ? 'null' : typeof val === 'object' && '__type__' in val ? (val as { repr: string }).repr : primitiveText(val)
  const color = val === null ? 'var(--text-faint)' : primitiveColor(val)
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color }}>{text}</span>
  )
}

/* ─── ref chip (has data-ref-id for arrow targeting) ─── */
function RefChip({ refId, heap }: { refId: string; heap: Record<string, HeapObject> }) {
  const obj   = heap[refId]
  const label = obj ? heapLabel(obj) : 'ref'
  return (
    <span
      data-ref-id={refId}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: '#5200FF',
        background: 'rgba(82,0,255,0.08)',
        padding: '1px 7px',
        borderRadius: '4px',
        border: '1px solid rgba(82,0,255,0.25)',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/* ─── heap object card ─── */
function HeapCard({ id, obj, heap }: { id: string; obj: HeapObject; heap: Record<string, HeapObject> }) {
  const label = heapLabel(obj)

  const renderVal = (val: TraceValue) =>
    isRef(val) ? <RefChip refId={val.__ref__} heap={heap} /> : <ValChip val={val} />

  return (
    <div
      data-heap-id={id}
      style={{
        borderRadius: '8px',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-muted)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-faint)' }}>
          #{id.slice(-5)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#F900FF' }}>
          {label}
        </span>
      </div>

      {/* body */}
      <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {'elements' in obj && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {obj.elements.map((el, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-faint)' }}>[{i}]</span>
                {renderVal(el)}
              </span>
            ))}
            {obj.elements.length === 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>(empty)</span>
            )}
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
            {Object.entries((obj as { fields: Record<string, TraceValue> }).fields).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: '10px' }}>=</span>
                {renderVal(v)}
              </div>
            ))}
          </div>
        )}
        {'desc' in obj && !(('elements' in obj) || ('pairs' in obj) || ('fields' in obj)) && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {(obj as { desc: string }).desc}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── arrow type ─── */
type Arrow = { x1: number; y1: number; x2: number; y2: number; color: string }

/* ─── main component ─── */
export function MemoryView({ step }: { step: TraceStep }) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const [arrows, setArrows]   = useState<Arrow[]>([])
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

  const frames     = [...step.stack_frames].reverse()
  const heapItems  = Object.entries(step.heap)

  const recalc = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const base = wrap.getBoundingClientRect()
    setSvgSize({ w: base.width, h: base.height })

    const next: Arrow[] = []
    let ci = 0
    wrap.querySelectorAll<HTMLElement>('[data-ref-id]').forEach(el => {
      const rid    = el.getAttribute('data-ref-id')!
      const target = wrap.querySelector<HTMLElement>(`[data-heap-id="${rid}"]`)
      if (!target) return
      const sr = el.getBoundingClientRect()
      const tr = target.getBoundingClientRect()
      next.push({
        x1: sr.right  - base.left,
        y1: sr.top    + sr.height / 2 - base.top,
        x2: tr.left   - base.left,
        y2: tr.top    + tr.height / 2 - base.top,
        color: PTR_COLORS[ci++ % PTR_COLORS.length],
      })
    })
    setArrows(next)
  }, [])

  useLayoutEffect(() => { recalc() }, [step, recalc])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── SVG arrow overlay ── */}
      <svg
        style={{
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
          width: svgSize.w, height: svgSize.h, zIndex: 10, overflow: 'visible',
        }}
      >
        <defs>
          {PTR_COLORS.map(c => (
            <marker key={c} id={`arr-${c.slice(1)}`}
              viewBox="0 0 8 8" refX="7" refY="4"
              markerWidth="5" markerHeight="5" orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={c} />
            </marker>
          ))}
        </defs>
        {arrows.map((a, i) => {
          const mid = (a.x2 - a.x1) * 0.5
          return (
            <path
              key={i}
              d={`M${a.x1},${a.y1} C${a.x1 + mid},${a.y1} ${a.x2 - mid * 0.4},${a.y2} ${a.x2},${a.y2}`}
              stroke={a.color} strokeWidth={1.5} fill="none" opacity={0.75}
              markerEnd={`url(#arr-${a.color.slice(1)})`}
            />
          )
        })}
      </svg>

      {/* ── LEFT: Stack frames ── */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        <SectionLabel>Frames</SectionLabel>
        {frames.length === 0 && <EmptyNote>No active frames</EmptyNote>}
        {frames.map((frame, fi) => {
          const isTop = fi === frames.length - 1
          return (
            <div key={fi} style={{
              borderRadius: '8px',
              border: `1.5px solid ${isTop ? 'rgba(82,0,255,0.35)' : 'var(--border)'}`,
              background: isTop ? 'rgba(82,0,255,0.04)' : 'var(--bg-surface)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px',
                borderBottom: '1px solid var(--border)',
                background: isTop ? 'rgba(82,0,255,0.07)' : 'var(--bg-muted)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: isTop ? '#5200FF' : 'var(--text-muted)' }}>
                  {frame.func_name}()
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                  line {frame.line}
                </span>
              </div>
              <div style={{ padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.keys(frame.locals).length === 0
                  ? <EmptyNote>(empty)</EmptyNote>
                  : Object.entries(frame.locals).map(([name, val]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600,
                        color: 'var(--text)', minWidth: '55px', flexShrink: 0,
                      }}>
                        {name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>=</span>
                      {isRef(val)
                        ? <RefChip refId={val.__ref__} heap={step.heap} />
                        : <ValChip val={val} />
                      }
                    </div>
                  ))
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* ── RIGHT: Heap ── */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
        <SectionLabel>Heap</SectionLabel>
        {heapItems.length === 0 && <EmptyNote>No heap objects</EmptyNote>}
        {heapItems.map(([id, obj]) => (
          <HeapCard key={id} id={id} obj={obj} heap={step.heap} />
        ))}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
      color: 'var(--text-faint)', letterSpacing: '0.1em',
      textTransform: 'uppercase', margin: 0, flexShrink: 0,
    }}>
      {children}
    </p>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
      {children}
    </span>
  )
}
