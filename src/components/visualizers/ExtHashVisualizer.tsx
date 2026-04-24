'use client'

import type { AlgorithmFrame } from '@/engine/types'
import type { EHashState } from '@/algorithms/data-structures/ext-hash'

type Props = { frame: AlgorithmFrame | null }

export function ExtHashVisualizer({ frame }: Props) {
  if (!frame) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>
        Press play to start
      </div>
    )
  }

  const state = frame.state as EHashState
  if (!state?.buckets) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>No data</div>
  }

  const { directory, buckets, globalDepth, activeDir, activeBucket } = state

  // Group directory entries by bucket
  const bucketDirEntries = new Map<number, number[]>()
  directory.forEach((bid, idx) => {
    if (!bucketDirEntries.has(bid)) bucketDirEntries.set(bid, [])
    bucketDirEntries.get(bid)!.push(idx)
  })

  function toBinary(n: number, bits: number) {
    return n.toString(2).padStart(bits, '0')
  }

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {/* ── Directory column ── */}
      <div style={{ flexShrink: 0, minWidth: 140 }}>
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Directory
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#818cf8',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            d={globalDepth}
          </span>
        </div>

        {directory.map((bucketId, idx) => {
          const isActive = idx === activeDir
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              {/* Index + binary label */}
              <div
                style={{
                  width: 56,
                  height: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.6)',
                  border: `1px solid ${isActive ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '9px', color: isActive ? '#a5b4fc' : '#64748b', lineHeight: 1 }}>
                  [{idx}]
                </span>
                <span style={{ fontSize: '12px', color: isActive ? '#e0e7ff' : '#94a3b8', fontWeight: 700, lineHeight: 1.2 }}>
                  {toBinary(idx, globalDepth)}
                </span>
              </div>

              {/* Arrow */}
              <svg width="20" height="16" style={{ flexShrink: 0 }}>
                <line x1="0" y1="8" x2="14" y2="8" stroke={isActive ? '#6366f1' : '#334155'} strokeWidth="1.5" />
                <polygon points="14,4 20,8 14,12" fill={isActive ? '#6366f1' : '#334155'} />
              </svg>

              {/* Bucket ref */}
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: `1px solid ${isActive ? '#6366f1' : 'rgba(99,102,241,0.15)'}`,
                  color: isActive ? '#a5b4fc' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                B{bucketId}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Vertical separator ── */}
      <div style={{ width: 1, alignSelf: 'stretch', background: '#1e293b', flexShrink: 0 }} />

      {/* ── Buckets column ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '0.75rem', fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Buckets  <span style={{ color: '#475569', fontWeight: 400 }}>(cap=2)</span>
        </div>

        {buckets.map(bucket => {
          const isActive = bucket.id === activeBucket
          const hlRole = frame.highlights.find(h => h.index === bucket.id)?.role
          const borderColor = isActive
            ? (hlRole === 'found' ? '#10b981' : hlRole === 'swap' ? '#ef4444' : '#f59e0b')
            : '#1e293b'
          const bgColor = isActive ? `${borderColor}15` : 'rgba(15,23,42,0.7)'

          const dirEntries = bucketDirEntries.get(bucket.id) ?? []

          return (
            <div
              key={bucket.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                transition: 'all 0.2s',
              }}
            >
              {/* Bucket header */}
              <div style={{ flexShrink: 0, width: 60 }}>
                <div style={{ fontSize: '12px', color: isActive ? '#fbbf24' : '#94a3b8', fontWeight: 700, lineHeight: 1 }}>
                  B{bucket.id}
                </div>
                <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.4 }}>
                  d={bucket.localDepth}
                </div>
              </div>

              {/* Keys */}
              <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                {bucket.keys.length === 0 ? (
                  <div style={{ color: '#334155', fontSize: '12px' }}>—</div>
                ) : bucket.keys.map((k, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: isActive ? `${borderColor}25` : 'rgba(30,41,59,0.8)',
                      border: `1px solid ${isActive ? borderColor : '#334155'}`,
                      color: isActive ? '#e2e8f0' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: 700,
                      minWidth: 32,
                      textAlign: 'center',
                    }}
                  >
                    {k}
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 2 - bucket.keys.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px dashed rgba(51,65,85,0.6)',
                      color: '#1e293b',
                      fontSize: '13px',
                      minWidth: 32,
                      textAlign: 'center',
                    }}
                  >
                    ·
                  </div>
                ))}
              </div>

              {/* Dir entries pointing here */}
              <div style={{ flexShrink: 0, display: 'flex', gap: '3px', flexWrap: 'wrap', maxWidth: 100 }}>
                {dirEntries.map(idx => (
                  <span
                    key={idx}
                    style={{
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: 'rgba(51,65,85,0.5)',
                      color: '#64748b',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}
                  >
                    {toBinary(idx, globalDepth)}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
