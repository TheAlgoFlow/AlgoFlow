'use client'

import { useState, useRef, useEffect } from 'react'
import { LayoutGrid, BarChart2 } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { getCategoryTheme } from '@/components/constants/categoryTheme'
import { CodePanel } from '@/components/molecules/CodePanel'
import { VisualizerTopBar } from '@/components/organisms/VisualizerTopBar'
import { VisualizerControlsDock } from '@/components/organisms/VisualizerControlsDock'
import { InfoPanel } from '@/components/organisms/InfoPanel'
import { ArrayBarsVisualizer } from '@/components/visualizers/ArrayBarsVisualizer'
import { ArraySearchVisualizer } from '@/components/visualizers/ArraySearchVisualizer'
import { ArrayBoxesVisualizer } from '@/components/visualizers/ArrayBoxesVisualizer'
import { GraphVisualizer } from '@/components/visualizers/GraphVisualizer'
import { TreeVisualizer } from '@/components/visualizers/TreeVisualizer'
import { GridVisualizer } from '@/components/visualizers/GridVisualizer'
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer'
import { StackQueueVisualizer } from '@/components/visualizers/StackQueueVisualizer'
import { HashTableVisualizer } from '@/components/visualizers/HashTableVisualizer'
import type { AlgorithmModule, AlgorithmFrame } from '@/engine/types'
import type { PlayerState } from '@/hooks/useAlgorithmPlayer'

// ── Slug classifiers ─────────────────────────────────────────────────────────

const SORTING_SLUGS = [
  'bubble-sort', 'selection-sort', 'insertion-sort',
  'merge-sort', 'quick-sort', 'heap-sort',
  'counting-sort', 'radix-sort',
]

function getVisualizerForSlug(slug: string, frame: AlgorithmFrame | null) {
  if (SORTING_SLUGS.includes(slug)) return <ArrayBarsVisualizer frame={frame} />
  if (slug === 'linear-search' || slug === 'binary-search') return <ArraySearchVisualizer frame={frame} />
  if (slug === 'bfs' || slug === 'dfs') return <GraphVisualizer frame={frame} />
  if (slug === 'binary-tree' || slug === 'bst') return <TreeVisualizer frame={frame} />
  if (slug === 'stack') return <StackQueueVisualizer frame={frame} mode="stack" />
  if (slug === 'queue') return <StackQueueVisualizer frame={frame} mode="queue" />
  if (slug === 'linked-list') return <LinkedListVisualizer frame={frame} />
  if (slug === 'hash-table') return <HashTableVisualizer frame={frame} />
  if (slug === 'array-ops' || slug === 'min-heap') return <ArrayBarsVisualizer frame={frame} />
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

  const frame = player.currentFrame

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
  const isTreeOrDS    = ['binary-tree', 'bst', 'linked-list', 'stack', 'queue', 'hash-table', 'min-heap', 'array-ops'].includes(slug)
  const isSortingAlgo = SORTING_SLUGS.includes(slug)
  const showArrayInput = !isGraphAlgo && !isTreeOrDS
  const isArrayAlgo   = isSortingAlgo || isSearchAlgo || slug === 'array-ops'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: 'var(--bg)' }}>

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
            ? <ArrayBoxesVisualizer frame={frame} />
            : getVisualizerForSlug(slug, frame)
          }

          {/* Viz mode toggle — only for array algorithms */}
          {isArrayAlgo && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
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
          <CodePanel snippets={algo.codeSnippets} activeLine={frame?.codeLine ?? 0} />
        </div>
      </div>

      {/* ── Controls dock + input row ── */}
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

      {/* ── Info panel ── */}
      <InfoPanel
        complexity={algo.meta.complexity}
        descriptionKey={algo.meta.descriptionKey}
        textColor={textColor}
      />
    </div>
  )
}
