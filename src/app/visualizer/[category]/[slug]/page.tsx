'use client'

import { use, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Code2, X, Shuffle, TrendingDown, TrendingUp, Equal, LayoutGrid, BarChart2 } from 'lucide-react'
import { getAlgorithm } from '@/algorithms/index'
import { useAlgorithmPlayer } from '@/hooks/useAlgorithmPlayer'
import { useI18n } from '@/i18n/context'
import { CodePanel } from '@/components/molecules/CodePanel'
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
  sorting:          '#CCFF00',
  searching:        '#FF6B00',
  'data-structures':'#F900FF',
  dp:               '#5200FF',
}

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  sorting:          '#4a6600',
  searching:        '#FF6B00',
  'data-structures':'#c000cc',
  dp:               '#5200FF',
}

const SORTING_PRESETS: { label: string; icon: React.ReactNode; arr: number[] }[] = [
  { label: 'Random',   icon: <Shuffle size={12} strokeWidth={2.5} />,      arr: [64, 34, 25, 12, 22, 11, 90] },
  { label: 'Nearly ↑', icon: <TrendingUp size={12} strokeWidth={2.5} />,   arr: [1, 2, 4, 3, 5, 7, 6] },
  { label: 'Reversed', icon: <TrendingDown size={12} strokeWidth={2.5} />, arr: [90, 75, 50, 35, 20, 10, 5] },
  { label: 'Equal',    icon: <Equal size={12} strokeWidth={2.5} />,        arr: [42, 42, 42, 42, 42] },
]

const SEARCH_PRESETS = {
  linear: { array: [4, 2, 7, 1, 9, 3, 8, 5, 6], target: 9 },
  binary: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
}

function interpolateMessage(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
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
  if (slug === 'array-ops' || slug === 'min-heap') return <ArrayBarsVisualizer frame={frame} />
  return <GridVisualizer frame={frame} />
}

export default function VisualizerPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = use(params)
  const { t } = useI18n()
  const algo = getAlgorithm(slug)

  const [showCode, setShowCode] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [currentInput, setCurrentInput] = useState<unknown>(algo?.meta.defaultInput ?? null)
  const [infoTab, setInfoTab] = useState<'complexity' | 'about'>('complexity')
  const [vizMode, setVizMode] = useState<'array' | 'classic'>('array')
  const [codeWidthPct, setCodeWidthPct] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const pct = (mouseX / rect.width) * 100
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

  const generator = useMemo(() => {
    if (!algo) return null
    const input = currentInput ?? algo.meta.defaultInput
    return () => algo.generator(input)
  }, [algo, currentInput])

  const player = useAlgorithmPlayer(generator)
  const frame = player.currentFrame

  const applyCustom = useCallback(() => {
    if (!customInput.trim()) return
    const nums = customInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
    if (nums.length > 0) setCurrentInput(nums)
  }, [customInput])

  if (!algo) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8', fontWeight: 500 }}>
        Algorithm not found.{' '}
        <Link href="/" style={{ color: '#5200FF', fontWeight: 700 }}>Go home</Link>
      </div>
    )
  }

  const { meta, codeSnippets } = algo
  const color = CATEGORY_COLORS[category] ?? '#5200FF'
  const textColor = CATEGORY_TEXT_COLORS[category] ?? '#5200FF'

  let stepMessage = ''
  if (frame) {
    const rawMsg = t(frame.message)
    const auxState = frame.auxState as Record<string, unknown> | undefined
    stepMessage = interpolateMessage(rawMsg, auxState)
    if (stepMessage === frame.message) stepMessage = rawMsg
  }

  const isSearchAlgo = ['linear-search', 'binary-search'].includes(slug)
  const isGraphAlgo = ['bfs', 'dfs'].includes(slug)
  const isTreeOrDS = ['binary-tree', 'bst', 'linked-list', 'stack', 'queue', 'hash-table', 'min-heap', 'array-ops'].includes(slug)
  const showArrayInput = !isGraphAlgo && !isTreeOrDS
  const sortingSlugs = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort', 'radix-sort']
  const isArrayAlgo = sortingSlugs.includes(slug) || isSearchAlgo || slug === 'array-ops'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: '#f8f9fb' }}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: '0 24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <Link
          href={`/visualizer/${category}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          {t(`categories.${category}.name`)}
        </Link>

        <span style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 300 }}>/</span>

        {/* Algorithm name */}
        <span
          style={{
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '-0.01em',
          }}
        >
          {t(meta.nameKey)}
        </span>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {meta.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: '5px',
                background: `${color}14`,
                border: `1.5px solid ${color}28`,
                color: textColor,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Code toggle */}
        <button
          onClick={() => setShowCode(v => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: `1.5px solid ${showCode ? '#5200FF' : 'rgba(0,0,0,0.1)'}`,
            background: showCode ? '#5200FF' : 'transparent',
            color: showCode ? '#ffffff' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {showCode ? <X size={13} strokeWidth={2.5} /> : <Code2 size={13} strokeWidth={2.5} />}
          {showCode ? 'Hide code' : 'Code'}
        </button>
      </div>

      {/* ── Canvas + optional code panel ─────────────────── */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          display: 'flex',
          minHeight: '52vh',
          position: 'relative',
        }}
      >
        {/* Drag-in-progress overlay — keeps cursor consistent while moving */}
        {isDragging && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'col-resize' }} />
        )}

        {/* Visualizer canvas */}
        <div
          style={{
            position: 'relative',
            minHeight: '52vh',
            background: '#e0f2fe',
            flex: showCode ? `0 0 ${100 - codeWidthPct}%` : '1 1 100%',
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
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '3px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <button
                onClick={() => setVizMode('array')}
                title="Array view"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: vizMode === 'array' ? '#5200FF' : 'transparent',
                  color: vizMode === 'array' ? '#ffffff' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.03em',
                }}
              >
                <LayoutGrid size={12} strokeWidth={2.5} />
                Array
              </button>
              <button
                onClick={() => setVizMode('classic')}
                title="Classic view"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: vizMode === 'classic' ? '#5200FF' : 'transparent',
                  color: vizMode === 'classic' ? '#ffffff' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.03em',
                }}
              >
                <BarChart2 size={12} strokeWidth={2.5} />
                Classic
              </button>
            </div>
          )}
        </div>

        {/* Drag handle */}
        {showCode && (
          <div
            onMouseDown={() => setIsDragging(true)}
            style={{
              width: '5px',
              flexShrink: 0,
              background: isDragging ? '#7dd3fc' : '#bae6fd',
              cursor: 'col-resize',
              zIndex: 10,
              transition: 'background 0.15s',
              borderLeft: '1px solid rgba(0,0,0,0.08)',
              borderRight: '1px solid rgba(0,0,0,0.08)',
            }}
            onMouseEnter={e => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = '#7dd3fc' }}
            onMouseLeave={e => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = '#bae6fd' }}
          />
        )}

        {/* Code panel */}
        {showCode && (
          <div
            style={{
              flex: `0 0 ${codeWidthPct}%`,
              minWidth: 0,
              overflow: 'auto',
              background: '#e0f2fe',
            }}
          >
            <CodePanel snippets={codeSnippets} activeLine={frame?.codeLine ?? 0} />
          </div>
        )}
      </div>

      {/* ── Controls dock ────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.07)',
          background: '#ffffff',
          padding: '16px 24px',
          flexShrink: 0,
          boxShadow: '0 -1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <PlaybackControls player={player} message={stepMessage} />
      </div>

      {/* ── Input row ────────────────────────────────────── */}
      {showArrayInput && (
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: '#f8f9fb',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {meta.category === 'sorting' && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SORTING_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setCurrentInput(p.arr); setCustomInput('') }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(0,0,0,0.09)',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = `${color}50`
                    el.style.color = textColor
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(0,0,0,0.09)'
                    el.style.color = '#475569'
                  }}
                >
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
          )}

          {isSearchAlgo && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(SEARCH_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => setCurrentInput(preset)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(0,0,0,0.09)',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div style={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.08)' }} />

          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
            placeholder={isSearchAlgo ? 'sorted: 1,3,5  target:5' : t('input.customPlaceholder')}
            style={{
              flex: 1,
              minWidth: '160px',
              background: '#ffffff',
              border: '1.5px solid rgba(0,0,0,0.09)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
          <button
            onClick={applyCustom}
            style={{
              padding: '7px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#5200FF',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(82,0,255,0.28)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(82,0,255,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(82,0,255,0.28)' }}
          >
            Run
          </button>
        </div>
      )}

      {/* ── Info panel ───────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.07)',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            padding: '0 24px',
          }}
        >
          {(['complexity', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setInfoTab(tab)}
              style={{
                padding: '10px 0',
                marginRight: '24px',
                border: 'none',
                borderBottom: `2px solid ${infoTab === tab ? textColor : 'transparent'}`,
                background: 'transparent',
                color: infoTab === tab ? '#0f172a' : '#94a3b8',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              {tab === 'complexity' ? 'Complexity' : 'About'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px' }}>
          {infoTab === 'complexity' ? (
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { label: t('complexity.best'),    value: meta.complexity.time.best,  col: '#10b981' },
                { label: t('complexity.average'), value: meta.complexity.time.avg,   col: textColor },
                { label: t('complexity.worst'),   value: meta.complexity.time.worst, col: '#ef4444' },
                { label: t('complexity.space'),   value: meta.complexity.space,      col: '#94a3b8' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    style={{
                      color: '#c1c9d2',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      color: row.col,
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                color: '#64748b',
                fontSize: '14px',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '640px',
                fontWeight: 400,
              }}
            >
              {t(meta.descriptionKey)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
