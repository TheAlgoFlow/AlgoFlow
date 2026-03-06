'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link2, Unlink2, CheckCircle2, XCircle } from 'lucide-react'
import { allModules } from '@/algorithms/index'
import { useAlgorithmPlayer } from '@/hooks/useAlgorithmPlayer'
import { useI18n } from '@/i18n/context'
import { PlaybackControls } from '@/components/molecules/PlaybackControls'
import { ArrayBarsVisualizer } from '@/components/visualizers/ArrayBarsVisualizer'
import { ArraySearchVisualizer } from '@/components/visualizers/ArraySearchVisualizer'
import { ArrayBoxesVisualizer } from '@/components/visualizers/ArrayBoxesVisualizer'
import { GraphVisualizer } from '@/components/visualizers/GraphVisualizer'
import { TreeVisualizer } from '@/components/visualizers/TreeVisualizer'
import { GridVisualizer } from '@/components/visualizers/GridVisualizer'
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer'
import { StackQueueVisualizer } from '@/components/visualizers/StackQueueVisualizer'
import { HashTableVisualizer } from '@/components/visualizers/HashTableVisualizer'
import type { AlgorithmFrame } from '@/engine/types'

const CATEGORY_COLORS: Record<string, string> = {
  sorting:           '#CCFF00',
  searching:         '#FF6B00',
  'data-structures': '#F900FF',
  dp:                '#5200FF',
}

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  sorting:           '#4a6600',
  searching:         '#FF6B00',
  'data-structures': '#c000cc',
  dp:                '#5200FF',
}

function getComplexityRank(notation: string): number {
  if (notation === 'O(1)') return 1
  if (notation.includes('log n') && !notation.includes('n log')) return 2
  if (notation === 'O(n)') return 3
  if (notation.includes('n log') || notation.includes('n·log')) return 4
  if (notation.includes('n²') || notation.includes('n^2')) return 5
  if (notation.includes('2^n') || notation.includes('n!')) return 6
  return 99
}

function getVisualizerForSlug(slug: string, frame: AlgorithmFrame | null) {
  const sortingSlugs = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort', 'radix-sort']
  if (sortingSlugs.includes(slug)) return <ArrayBarsVisualizer frame={frame} />
  if (slug === 'linear-search' || slug === 'binary-search') return <ArraySearchVisualizer frame={frame} />
  if (slug === 'bfs' || slug === 'dfs') return <GraphVisualizer frame={frame} />
  if (slug === 'binary-tree' || slug === 'bst') return <TreeVisualizer frame={frame} />
  if (slug === 'stack') return <StackQueueVisualizer frame={frame} mode="stack" />
  if (slug === 'queue') return <StackQueueVisualizer frame={frame} mode="queue" />
  if (slug === 'linked-list') return <LinkedListVisualizer frame={frame} />
  if (slug === 'hash-table') return <HashTableVisualizer frame={frame} />
  if (slug === 'array-ops' || slug === 'min-heap') return <ArrayBoxesVisualizer frame={frame} />
  return <GridVisualizer frame={frame} />
}

function interpolateMessage(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}

function ComparePageInner() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [slotASlug, setSlotASlug] = useState<string>(searchParams.get('a') ?? '')
  const [slotBSlug, setSlotBSlug] = useState<string>(searchParams.get('b') ?? '')
  const [linked, setLinked] = useState(false)
  const [linkedFrame, setLinkedFrame] = useState(0)
  const [isLinkedPlaying, setIsLinkedPlaying] = useState(false)
  const [linkedSpeed, setLinkedSpeed] = useState(1)

  const algoA = allModules.find(m => m.meta.slug === slotASlug) ?? null
  const algoB = allModules.find(m => m.meta.slug === slotBSlug) ?? null

  const generatorA = useMemo(() => {
    if (!algoA) return null
    return () => algoA.generator(algoA.meta.defaultInput)
  }, [algoA])

  const generatorB = useMemo(() => {
    if (!algoB) return null
    return () => algoB.generator(algoB.meta.defaultInput)
  }, [algoB])

  const playerA = useAlgorithmPlayer(generatorA)
  const playerB = useAlgorithmPlayer(generatorB)

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (slotASlug) params.set('a', slotASlug)
    if (slotBSlug) params.set('b', slotBSlug)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [slotASlug, slotBSlug, router])

  // Linked playback interval
  const SPEED_INTERVALS: Record<number, number> = { 0.25: 2000, 0.5: 1000, 1: 500, 2: 250, 4: 125 }
  useEffect(() => {
    if (!linked || !isLinkedPlaying) return
    const interval = SPEED_INTERVALS[linkedSpeed] ?? 500
    const maxFrames = Math.max(playerA.totalFrames, playerB.totalFrames)
    if (linkedFrame >= maxFrames - 1) { setIsLinkedPlaying(false); return }
    const id = setInterval(() => {
      setLinkedFrame(f => {
        const next = f + 1
        if (next >= maxFrames - 1) { setIsLinkedPlaying(false); return maxFrames - 1 }
        return next
      })
    }, interval)
    return () => clearInterval(id)
  }, [linked, isLinkedPlaying, linkedSpeed, linkedFrame, playerA.totalFrames, playerB.totalFrames])

  useEffect(() => {
    if (!linked) return
    playerA.seekTo(Math.min(linkedFrame, playerA.totalFrames - 1))
    playerB.seekTo(Math.min(linkedFrame, playerB.totalFrames - 1))
  }, [linked, linkedFrame])

  const linkedPlayer = {
    isPlaying: isLinkedPlaying,
    frameIndex: linkedFrame,
    totalFrames: Math.max(playerA.totalFrames, playerB.totalFrames),
    speed: linkedSpeed,
    play: () => { if (linkedFrame >= Math.max(playerA.totalFrames, playerB.totalFrames) - 1) setLinkedFrame(0); setIsLinkedPlaying(true) },
    pause: () => setIsLinkedPlaying(false),
    stepForward: () => { setIsLinkedPlaying(false); setLinkedFrame(f => Math.min(f + 1, Math.max(playerA.totalFrames, playerB.totalFrames) - 1)) },
    stepBack: () => { setIsLinkedPlaying(false); setLinkedFrame(f => Math.max(f - 1, 0)) },
    reset: () => { setIsLinkedPlaying(false); setLinkedFrame(0) },
    setSpeed: setLinkedSpeed,
    seekTo: (i: number) => { setIsLinkedPlaying(false); setLinkedFrame(Math.max(0, Math.min(i, Math.max(playerA.totalFrames, playerB.totalFrames) - 1))) },
    frames: [],
    currentFrame: null,
  }

  const msgA = playerA.currentFrame ? interpolateMessage(t(playerA.currentFrame.message), playerA.currentFrame.auxState as Record<string, unknown> | undefined) : ''
  const msgB = playerB.currentFrame ? interpolateMessage(t(playerB.currentFrame.message), playerB.currentFrame.auxState as Record<string, unknown> | undefined) : ''

  const complexityRows = algoA && algoB ? [
    { label: 'Best', a: algoA.meta.complexity.time.best, b: algoB.meta.complexity.time.best },
    { label: 'Average', a: algoA.meta.complexity.time.avg, b: algoB.meta.complexity.time.avg },
    { label: 'Worst', a: algoA.meta.complexity.time.worst, b: algoB.meta.complexity.time.worst },
    { label: 'Space', a: algoA.meta.complexity.space, b: algoB.meta.complexity.space },
  ] : []

  return (
    <div style={{ background: '#F5F1EB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(32px,5vw,60px) 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '3px', height: '16px', background: '#5200FF', borderRadius: '2px' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#78716C',
              }}
            >
              Side-by-Side
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px,5vw,56px)',
              fontWeight: 900,
              color: '#1C1917',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Compare Algorithms
          </h1>
        </div>

        {/* ── Picker row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <AlgorithmPicker value={slotASlug} onChange={setSlotASlug} label="Algorithm A" accent="#5200FF" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#C8BDB0',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            VS
          </div>
          <AlgorithmPicker value={slotBSlug} onChange={setSlotBSlug} label="Algorithm B" accent="#FF6B00" />
        </div>

        {/* ── Link toggle ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => { setLinked(l => !l); setLinkedFrame(0); setIsLinkedPlaying(false) }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '10px',
              border: `1.5px solid ${linked ? '#5200FF' : '#E5DDD0'}`,
              background: linked ? 'rgba(82,0,255,0.07)' : '#FDFCFA',
              color: linked ? '#5200FF' : '#78716C',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '-0.01em',
            }}
          >
            {linked ? <Link2 size={14} strokeWidth={2} /> : <Unlink2 size={14} strokeWidth={2} />}
            {linked ? 'Linked Playback' : 'Link Playback'}
          </button>
        </div>

        {/* ── Canvas columns ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: linked ? '0' : '16px',
          }}
        >
          {/* Slot A */}
          <VisualizerSlot
            slug={slotASlug}
            player={playerA}
            message={msgA}
            showControls={!linked}
            accentColor={algoA ? (CATEGORY_COLORS[algoA.meta.category] ?? '#5200FF') : '#5200FF'}
            label={algoA ? t(algoA.meta.nameKey) : 'Select Algorithm A'}
          />
          {/* Slot B */}
          <VisualizerSlot
            slug={slotBSlug}
            player={playerB}
            message={msgB}
            showControls={!linked}
            accentColor={algoB ? (CATEGORY_COLORS[algoB.meta.category] ?? '#FF6B00') : '#FF6B00'}
            label={algoB ? t(algoB.meta.nameKey) : 'Select Algorithm B'}
          />
        </div>

        {/* ── Linked controls ── */}
        {linked && (
          <div
            style={{
              background: '#FDFCFA',
              border: '1.5px solid #E5DDD0',
              borderRadius: '12px',
              padding: '16px 24px',
              marginTop: '8px',
              marginBottom: '16px',
            }}
          >
            <PlaybackControls player={linkedPlayer} message="" />
          </div>
        )}

        {/* ── Complexity diff ── */}
        {algoA && algoB && (
          <div
            style={{
              background: '#FDFCFA',
              border: '1.5px solid #E5DDD0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(28,25,23,0.05)',
            }}
          >
            <div
              style={{
                background: '#F0EDE8',
                padding: '12px 20px',
                borderBottom: '1px solid #E5DDD0',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#78716C',
                  margin: 0,
                }}
              >
                Complexity Comparison
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Metric</th>
                    <th style={{ ...thStyle, color: CATEGORY_TEXT_COLORS[algoA.meta.category] ?? '#5200FF' }}>
                      {t(algoA.meta.nameKey)}
                    </th>
                    <th style={{ ...thStyle, color: CATEGORY_TEXT_COLORS[algoB.meta.category] ?? '#FF6B00' }}>
                      {t(algoB.meta.nameKey)}
                    </th>
                    <th style={thStyle}>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {complexityRows.map((row, i) => {
                    const rankA = getComplexityRank(row.a)
                    const rankB = getComplexityRank(row.b)
                    const aWins = rankA < rankB
                    const bWins = rankB < rankA
                    const tie = rankA === rankB
                    return (
                      <tr key={row.label} style={{ background: i % 2 === 0 ? '#FDFCFA' : '#F5F1EB' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#78716C' }}>
                            {row.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, background: aWins ? 'rgba(15,113,66,0.06)' : undefined }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: aWins ? '#0f7142' : '#78716C' }}>
                            {row.a}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, background: bWins ? 'rgba(15,113,66,0.06)' : undefined }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: bWins ? '#0f7142' : '#78716C' }}>
                            {row.b}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {tie ? (
                            <span style={{ fontSize: '12px', color: '#C8BDB0', fontWeight: 600 }}>Tie</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <CheckCircle2 size={13} style={{ color: '#0f7142' }} />
                              <span style={{ fontSize: '12px', color: '#0f7142', fontWeight: 700 }}>
                                {aWins ? t(algoA.meta.nameKey) : t(algoB.meta.nameKey)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#78716C',
  borderBottom: '1px solid #E5DDD0',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #F0EDE8',
}

function AlgorithmPicker({
  value, onChange, label, accent,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  accent: string
}) {
  const { t } = useI18n()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#78716C',
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '10px 14px',
          background: '#FDFCFA',
          border: `1.5px solid ${value ? accent + '60' : '#E5DDD0'}`,
          borderRadius: '10px',
          color: value ? '#1C1917' : '#C8BDB0',
          fontSize: '14px',
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          width: '100%',
          transition: 'border-color 0.15s',
        }}
      >
        <option value="">Select algorithm…</option>
        {allModules.map(mod => (
          <option key={mod.meta.slug} value={mod.meta.slug}>
            {t(mod.meta.nameKey)} ({mod.meta.category === 'data-structures' ? 'DS' : mod.meta.category === 'dp' ? 'DP' : mod.meta.category})
          </option>
        ))}
      </select>
    </div>
  )
}

function VisualizerSlot({
  slug, player, message, showControls, accentColor, label,
}: {
  slug: string
  player: ReturnType<typeof useAlgorithmPlayer>
  message: string
  showControls: boolean
  accentColor: string
  label: string
}) {
  return (
    <div
      style={{
        background: '#FDFCFA',
        border: '1.5px solid #E5DDD0',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Label bar */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #E5DDD0',
          background: '#F5F1EB',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#1C1917',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Visualizer canvas */}
      <div
        style={{
          background: '#F0EDE8',
          minHeight: '240px',
          flex: 1,
          position: 'relative',
        }}
      >
        {slug ? getVisualizerForSlug(slug, player.currentFrame) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '240px',
              color: '#C8BDB0',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            No algorithm selected
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && slug && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E5DDD0' }}>
          <PlaybackControls player={player} message={message} />
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#F5F1EB', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        Loading…
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  )
}
