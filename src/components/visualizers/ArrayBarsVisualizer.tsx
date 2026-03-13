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

  const state = frame.state as { array: number[]; countArray?: number[]; buckets?: number[][] }
  const auxState = frame.auxState as { bucketIdx?: number; lo?: number; mid?: number; hi?: number; val?: number; i?: number } | undefined
  const arr = state.array ?? []
  const maxVal = Math.max(...arr, 1)
  const n = arr.length

  // Merge Sort boundary overlay values
  const mergeLo = auxState?.lo
  const mergeMid = auxState?.mid
  const mergeHi = auxState?.hi
  const showMergeOverlay = mergeLo !== undefined && mergeHi !== undefined && mergeLo < mergeHi

  // Radix Sort bucket panel
  const buckets = state.buckets
  const activeBucketIdx = auxState?.bucketIdx
  const showBuckets = !!buckets && buckets.some(b => b.length > 0)

  // Active count array cell for Counting Sort
  const activeCountIdx = auxState?.val ?? auxState?.i

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1rem',
        paddingTop: '3.5rem',
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
          paddingBottom: '3.2rem',
          position: 'relative',
        }}
      >
        {/* Merge Sort boundary overlay */}
        {showMergeOverlay && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: '3.2rem',
              left: `${(mergeLo! / n) * 100}%`,
              width: `${((mergeHi! - mergeLo! + 1) / n) * 100}%`,
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '3px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Purple mid-line */}
            {mergeMid !== undefined && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${((mergeMid - mergeLo! + 1) / (mergeHi! - mergeLo! + 1)) * 100}%`,
                  width: '2px',
                  background: 'rgba(139,92,246,0.6)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        )}

        {arr.map((val, i) => {
          const hl = getHighlight(i, frame.highlights)
          const role = hl?.role ?? null
          const color = role ? ROLE_COLORS[role] : DEFAULT_COLOR
          const heightPct = (val / maxVal) * 100
          const showBadge = !!(hl?.label && ['pivot', 'selected', 'current', 'active'].includes(hl.role))

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
              {/* Semantic badge above bar */}
              {showBadge && (
                <div style={{
                  position: 'absolute',
                  top: `calc(${100 - heightPct}% - 1.8rem)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: `${color}22`,
                  border: `1px solid ${color}60`,
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}>{hl!.label}</div>
              )}

              {/* Bar */}
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
                  zIndex: 2,
                }}
              />

              {/* Value label */}
              {arr.length <= 20 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1.5rem',
                    fontSize: '0.7rem',
                    color: role ? color : '#64748b',
                    fontWeight: role ? 700 : 400,
                    transition: 'color 0.15s ease',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {val}
                </div>
              )}

              {/* Pointer arrow below bar */}
              {hl?.label && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-3.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: '10px', color: ROLE_COLORS[hl.role], lineHeight: 1 }}>▲</span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: ROLE_COLORS[hl.role], fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Radix Sort bucket panel */}
      {showBuckets && buckets && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            Buckets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '3px' }}>
            {buckets.map((bucket, bi) => {
              const isActive = bi === activeBucketIdx
              return (
                <div key={bi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {/* Bucket index label */}
                  <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>{bi}</span>
                  {/* Bucket container */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    minHeight: '36px',
                    width: '100%',
                    border: isActive ? '1px solid #06b6d4' : '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '3px',
                    background: isActive ? 'rgba(6,182,212,0.06)' : 'transparent',
                    boxShadow: isActive ? '0 0 6px rgba(6,182,212,0.3)' : 'none',
                    transition: 'all 0.15s',
                    padding: '2px',
                    gap: '1px',
                    overflow: 'hidden',
                  }}>
                    {bucket.map((v, vi) => (
                      <div key={vi} style={{
                        width: '100%',
                        background: isActive ? '#06b6d4' : 'rgba(99,102,241,0.2)',
                        borderRadius: '2px',
                        fontSize: '7px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: isActive ? '#fff' : '#4f46e5',
                        textAlign: 'center',
                        padding: '1px 0',
                        lineHeight: 1.2,
                      }}>{v}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Count array (for counting sort) */}
      {state.countArray && state.countArray.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            Count array
          </div>
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
            {state.countArray.map((count, i) => {
              const isActive = i === activeCountIdx
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                  {/* Index label above */}
                  <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>{i}</span>
                  {/* Count cell */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isActive ? 'rgba(79,70,229,0.15)' : count > 0 ? 'rgba(79,70,229,0.08)' : 'var(--bg-surface)',
                      border: isActive ? '1px solid #4f46e5' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '3px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? '#4f46e5' : count > 0 ? '#4f46e5' : '#64748b',
                      boxShadow: isActive ? '0 0 6px rgba(79,70,229,0.3)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
