'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { LayoutGrid, BarChart2 } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { getCategoryTheme } from '@/components/constants/categoryTheme'
import { CodePanel } from '@/components/molecules/CodePanel'
import { VisualizerTopBar } from '@/components/organisms/VisualizerTopBar'
import { VisualizerControlsDock } from '@/components/organisms/VisualizerControlsDock'
import { DSOperationsPanel } from '@/components/organisms/DSOperationsPanel'
import { InfoPanel } from '@/components/organisms/InfoPanel'
import { PracticeSection } from '@/components/molecules/PracticeSection'
import { ArrayBarsVisualizer } from '@/components/visualizers/ArrayBarsVisualizer'
import { AlgoStatsBar } from '@/components/molecules/AlgoStatsBar'
import { ArraySearchVisualizer } from '@/components/visualizers/ArraySearchVisualizer'
import { ArrayBoxesVisualizer } from '@/components/visualizers/ArrayBoxesVisualizer'
import { GraphVisualizer } from '@/components/visualizers/GraphVisualizer'
import { TreeVisualizer } from '@/components/visualizers/TreeVisualizer'
import { GridVisualizer } from '@/components/visualizers/GridVisualizer'
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer'
import { StackQueueVisualizer } from '@/components/visualizers/StackQueueVisualizer'
import { HashTableVisualizer } from '@/components/visualizers/HashTableVisualizer'
import { BTreeVisualizer } from '@/components/visualizers/BTreeVisualizer'
import { BPlusTreeVisualizer } from '@/components/visualizers/BPlusTreeVisualizer'
import { ExtHashVisualizer } from '@/components/visualizers/ExtHashVisualizer'
import { useAlgorithmPlayer } from '@/hooks/useAlgorithmPlayer'
import type { AlgorithmModule, AlgorithmFrame, DSOperationConfig, CodeSnippets } from '@/engine/types'
import type { PlayerState } from '@/hooks/useAlgorithmPlayer'

// ── Slug classifiers ─────────────────────────────────────────────────────────

const SORTING_SLUGS = [
  'bubble-sort', 'selection-sort', 'insertion-sort',
  'merge-sort', 'quick-sort', 'heap-sort',
  'counting-sort', 'radix-sort', 'shell-sort',
]

function getVisualizerForSlug(slug: string, frame: AlgorithmFrame | null) {
  if (SORTING_SLUGS.includes(slug)) return <ArrayBarsVisualizer frame={frame} />
  if (slug === 'linear-search' || slug === 'binary-search') return <ArraySearchVisualizer frame={frame} />
  if (slug === 'bfs' || slug === 'dfs') return <GraphVisualizer frame={frame} />
  if (slug === 'binary-tree' || slug === 'bst') return <TreeVisualizer frame={frame} />
  if (slug === 'stack') return <StackQueueVisualizer frame={frame} mode="stack" />
  if (slug === 'queue') return <StackQueueVisualizer frame={frame} mode="queue" />
  if (slug === 'linked-list') return <LinkedListVisualizer frame={frame} />
  if (slug === 'doubly-linked-list') return <LinkedListVisualizer frame={frame} />
  if (slug === 'hash-table') return <HashTableVisualizer frame={frame} />
  if (slug === 'array-ops' || slug === 'min-heap') return <ArrayBarsVisualizer frame={frame} />
  if (slug === 'b-tree' || slug === 'b-star-tree') return <BTreeVisualizer frame={frame} variant={slug as 'b-tree' | 'b-star-tree'} />
  if (slug === 'b-plus-tree') return <BPlusTreeVisualizer frame={frame} />
  if (slug === 'ext-hash') return <ExtHashVisualizer frame={frame} />
  return <GridVisualizer frame={frame} />
}

function interpolateMessage(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  algo: AlgorithmModule
  category: string
  slug: string
  player: PlayerState
  showCode: boolean
  onToggleCode: () => void
  onInputChange: (input: unknown) => void
}

// ── Template ─────────────────────────────────────────────────────────────────

/**
 * VisualizerPageTemplate
 *
 * The full layout shell for any algorithm visualizer page.
 * Receives all data from the page; manages only visual layout state
 * (drag width, viz mode) internally.
 * For DS pages with dsOperations, manages operation selection internally
 * and drives a separate player.
 */
export function VisualizerPageTemplate({
  algo,
  category,
  slug,
  player,
  showCode,
  onToggleCode,
  onInputChange,
}: Props) {
  const { t } = useI18n()
  const { color, textColor } = getCategoryTheme(category)
  const [vizMode, setVizMode] = useState<'array' | 'classic'>('array')
  const [codeWidthPct, setCodeWidthPct] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // DS operations state
  const [dsOpKey, setDsOpKey] = useState(0)  // bump to re-initialize player
  const [activeDsOp, setActiveDsOp] = useState<DSOperationConfig | null>(
    algo.dsOperations?.[0] ?? null
  )
  const [activeSnippets, setActiveSnippets] = useState<CodeSnippets | null>(
    algo.dsOperations?.[0]?.codeSnippets ?? null
  )
  const [operationHistory, setOperationHistory] = useState<string[]>([])

  // Persistent DS state — survives across operations
  const persistentDSStateRef = useRef<unknown>(null)

  const dsGenerator = useMemo(() => {
    if (!activeDsOp) return null
    // dsOpKey is captured so bumping it creates a new fn reference → player re-initializes
    return () => activeDsOp.generator(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDsOp, dsOpKey])

  const dsPlayer = useAlgorithmPlayer(algo.dsOperations ? dsGenerator : null)

  // Capture final frame state after each DS operation completes
  useEffect(() => {
    if (dsPlayer.frames.length > 0) {
      persistentDSStateRef.current = dsPlayer.frames[dsPlayer.frames.length - 1].state
    }
  }, [dsPlayer.frames])

  // Idle frame: show accumulated DS state when no animation is playing
  const idleFrame: AlgorithmFrame | null = useMemo(() => {
    if (!persistentDSStateRef.current) return null
    return { state: persistentDSStateRef.current, highlights: [], message: '', codeLine: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsPlayer.frames])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      setCodeWidthPct(100 - Math.max(25, Math.min(72, pct)))
    }
    const onMouseUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  // Choose which player to display
  const isDsPage = !!(algo.dsOperations && algo.dsOperations.length > 0)
  const activePlayer = isDsPage ? dsPlayer : player

  const frame = activePlayer.currentFrame
  // For DS pages: show accumulated state when animation is idle
  const displayFrame = isDsPage ? (frame ?? idleFrame) : frame

  // Resolve step message
  let stepMessage = ''
  if (frame) {
    const rawMsg = t(frame.message)
    const auxState = frame.auxState as Record<string, unknown> | undefined
    stepMessage = interpolateMessage(rawMsg, auxState)
    if (stepMessage === frame.message) stepMessage = rawMsg
  }

  const isSearchAlgo  = ['linear-search', 'binary-search'].includes(slug)
  const isGraphAlgo   = ['bfs', 'dfs'].includes(slug)
  const isTreeOrDS    = ['binary-tree', 'bst', 'linked-list', 'doubly-linked-list', 'stack', 'queue', 'hash-table', 'min-heap', 'array-ops', 'b-tree', 'b-plus-tree', 'b-star-tree', 'ext-hash'].includes(slug)
  const isSortingAlgo = SORTING_SLUGS.includes(slug)
  const showArrayInput = !isGraphAlgo && !isTreeOrDS && !isDsPage
  const isArrayAlgo   = isSortingAlgo || isSearchAlgo || slug === 'array-ops'

  const handleDsRun = useCallback((op: DSOperationConfig, value?: number) => {
    // Create a new generator that captures the value and persistent state
    const opWithValue: DSOperationConfig = {
      ...op,
      generator: () => op.generator(value, persistentDSStateRef.current),
    }
    setActiveDsOp(opWithValue)
    setActiveSnippets(op.codeSnippets)
    setDsOpKey(k => k + 1)
    setOperationHistory(prev => [...prev, value !== undefined ? `${op.label}(${value})` : op.label])
  }, [])

  const handleDsReset = useCallback(() => {
    persistentDSStateRef.current = null
    setOperationHistory([])
    setDsOpKey(k => k + 1)
  }, [])

  // Snippets to show in code panel
  const displaySnippets = isDsPage && activeSnippets ? activeSnippets : algo.codeSnippets

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top bar ── */}
      <VisualizerTopBar
        category={category}
        algoName={t(algo.meta.nameKey)}
        tags={algo.meta.tags}
        color={color}
        textColor={textColor}
        showCode={showCode}
        onToggleCode={onToggleCode}
      />

      {/* ── Canvas + optional code panel ── */}
      <div
        ref={canvasRef}
        style={{ flex: 1, display: 'flex', minHeight: '52vh', position: 'relative' }}
      >
        {/* Drag cursor overlay */}
        {isDragging && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'col-resize' }} />
        )}

        {/* Visualizer canvas */}
        <div
          style={{
            position: 'relative',
            minHeight: '52vh',
            background: 'var(--bg-muted)',
            flex: showCode ? `0 0 ${100 - codeWidthPct}%` : '1 1 100%',
            transition: 'flex-basis 0.3s ease',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {isArrayAlgo && vizMode === 'array'
            ? <ArrayBoxesVisualizer frame={displayFrame} />
            : getVisualizerForSlug(slug, displayFrame)
          }

          {/* Viz mode toggle — only for array algorithms */}
          {isArrayAlgo && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 50,
                display: 'flex',
                gap: '2px',
                background: 'rgba(253,252,250,0.92)',
                borderRadius: '8px',
                border: `1px solid var(--border)`,
                padding: '3px',
                backdropFilter: 'blur(8px)',
              }}
            >
              {([
                { mode: 'array',   icon: <LayoutGrid size={12} strokeWidth={2.5} />, label: t('viz.modeArray') },
                { mode: 'classic', icon: <BarChart2  size={12} strokeWidth={2.5} />, label: t('viz.modeClassic') },
              ] as const).map(btn => (
                <button
                  key={btn.mode}
                  onClick={() => setVizMode(btn.mode)}
                  title={`${btn.label} view`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: vizMode === btn.mode ? '#5200FF' : 'transparent',
                    color: vizMode === btn.mode ? '#ffffff' : '#64748b',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    letterSpacing: '0.03em',
                  }}
                >
                  {btn.icon}{btn.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width: showCode ? '5px' : '0px',
            flexShrink: 0,
            background: isDragging ? 'var(--border-hover)' : 'var(--border)',
            cursor: 'col-resize',
            zIndex: 10,
            overflow: 'hidden',
            transition: 'width 0.3s ease, background 0.15s',
            borderLeft:  showCode ? '1px solid rgba(0,0,0,0.08)' : 'none',
            borderRight: showCode ? '1px solid rgba(0,0,0,0.08)' : 'none',
          }}
          onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border-hover)' }}
          onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border)' }}
        />

        {/* Code panel */}
        <div
          style={{
            flex: `0 0 ${showCode ? codeWidthPct : 0}%`,
            minWidth: 0,
            overflow: 'hidden',
            background: 'var(--bg-muted)',
            transition: 'flex-basis 0.3s ease',
          }}
        >
          <CodePanel snippets={displaySnippets} activeLine={displayFrame?.codeLine ?? 0} />
        </div>
      </div>

      {/* ── Stats bar (sorting algorithms only) ── */}
      <AlgoStatsBar frame={frame} slug={slug} />

      {/* ── DS Operation history strip ── */}
      {isDsPage && operationHistory.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
            maxHeight: '44px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            {operationHistory.map((op, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <span
                  style={{
                    background: 'rgba(249,0,255,0.1)',
                    border: '1px solid rgba(249,0,255,0.3)',
                    color: '#F900FF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {op}
                </span>
                {i < operationHistory.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>→</span>
                )}
              </span>
            ))}
          </div>
          <button
            onClick={handleDsReset}
            style={{
              flexShrink: 0,
              marginLeft: '0.5rem',
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          >
            Reset DS
          </button>
        </div>
      )}

      {/* ── Controls dock / DS operations ── */}
      {isDsPage && algo.dsOperations ? (
        <>
          <DSOperationsPanel
            operations={algo.dsOperations}
            onRun={handleDsRun}
          />
          <VisualizerControlsDock
            player={dsPlayer}
            message={stepMessage}
            showArrayInput={false}
            isSearchAlgo={false}
            isSortingAlgo={false}
            color={color}
            textColor={textColor}
            onInputChange={onInputChange}
          />
        </>
      ) : (
        <VisualizerControlsDock
          player={player}
          message={stepMessage}
          showArrayInput={showArrayInput}
          isSearchAlgo={isSearchAlgo}
          isSortingAlgo={isSortingAlgo}
          color={color}
          textColor={textColor}
          onInputChange={onInputChange}
        />
      )}

      {/* ── Practice exercises ── */}
      <PracticeSection exercises={algo.meta.exercises} />

      {/* ── Info panel ── */}
      <InfoPanel
        complexity={algo.meta.complexity}
        descriptionKey={algo.meta.descriptionKey}
        textColor={textColor}
      />
    </div>
  )
}
