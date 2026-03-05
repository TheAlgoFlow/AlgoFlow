'use client'

import { use, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { getAlgorithm } from '@/algorithms/index'
import { useAlgorithmPlayer } from '@/hooks/useAlgorithmPlayer'
import { useI18n } from '@/i18n/context'
import { CodePanel } from '@/components/molecules/CodePanel'
import { PlaybackControls } from '@/components/molecules/PlaybackControls'
import { ArrayBarsVisualizer } from '@/components/visualizers/ArrayBarsVisualizer'
import { ArraySearchVisualizer } from '@/components/visualizers/ArraySearchVisualizer'
import { GraphVisualizer } from '@/components/visualizers/GraphVisualizer'
import { TreeVisualizer } from '@/components/visualizers/TreeVisualizer'
import { GridVisualizer } from '@/components/visualizers/GridVisualizer'
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer'
import { StackQueueVisualizer } from '@/components/visualizers/StackQueueVisualizer'
import { HashTableVisualizer } from '@/components/visualizers/HashTableVisualizer'
import type { AlgorithmFrame } from '@/engine/types'

const SORTING_PRESETS: Record<string, number[]> = {
  random: [64, 34, 25, 12, 22, 11, 90],
  'nearly-sorted': [1, 2, 4, 3, 5, 7, 6],
  reversed: [90, 75, 50, 35, 20, 10, 5],
  equal: [42, 42, 42, 42, 42],
}

const SEARCH_PRESETS = {
  linear: { array: [4, 2, 7, 1, 9, 3, 8, 5, 6], target: 9 },
  binary: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
}

function interpolateMessage(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}

function getVisualizerForSlug(slug: string, frame: AlgorithmFrame | null) {
  // Sorting algorithms → ArrayBarsVisualizer
  const sortingSlugs = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort', 'radix-sort']
  if (sortingSlugs.includes(slug)) return <ArrayBarsVisualizer frame={frame} />

  // Linear/Binary search → ArraySearchVisualizer
  if (slug === 'linear-search' || slug === 'binary-search') return <ArraySearchVisualizer frame={frame} />

  // Graph-based → GraphVisualizer
  if (slug === 'bfs' || slug === 'dfs') return <GraphVisualizer frame={frame} />

  // Tree-based
  if (slug === 'binary-tree' || slug === 'bst') return <TreeVisualizer frame={frame} />

  // Stack/Queue
  if (slug === 'stack') return <StackQueueVisualizer frame={frame} mode="stack" />
  if (slug === 'queue') return <StackQueueVisualizer frame={frame} mode="queue" />

  // Linked list
  if (slug === 'linked-list') return <LinkedListVisualizer frame={frame} />

  // Hash table
  if (slug === 'hash-table') return <HashTableVisualizer frame={frame} />

  // Array ops, min-heap → bars
  if (slug === 'array-ops') return <ArrayBarsVisualizer frame={frame} />
  if (slug === 'min-heap') return <ArrayBarsVisualizer frame={frame} />

  // DP → GridVisualizer
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

  const [customInput, setCustomInput] = useState('')
  const [currentInput, setCurrentInput] = useState<unknown>(algo?.meta.defaultInput ?? null)

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
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        Algorithm &quot;{slug}&quot; not found.{' '}
        <Link href="/" style={{ color: '#6366f1' }}>
          Go home
        </Link>
      </div>
    )
  }

  const { meta, codeSnippets } = algo

  // Build step message
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

  const CATEGORY_COLORS: Record<string, string> = {
    sorting: '#7c3aed',
    searching: '#2563eb',
    'data-structures': '#16a34a',
    dp: '#ea580c',
  }
  const color = CATEGORY_COLORS[category] ?? '#6366f1'

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href={`/visualizer/${category}`}
          style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          {t('back')}
        </Link>
        <h1
          style={{
            flex: 1,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#f1f5f9',
            margin: 0,
          }}
        >
          {t(meta.nameKey)}
        </h1>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {meta.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: '20px',
                background: `${color}20`,
                color,
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: '1rem',
          minHeight: '380px',
        }}
      >
        {/* Visualization Canvas */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(99,102,241,0.2)',
            overflow: 'hidden',
            minHeight: '320px',
            position: 'relative',
          }}
        >
          {getVisualizerForSlug(slug, frame)}
        </div>

        {/* Code Panel */}
        <div style={{ minHeight: '320px' }}>
          <CodePanel snippets={codeSnippets} activeLine={frame?.codeLine ?? 0} />
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls player={player} message={stepMessage} />

      {/* Input Section */}
      {showArrayInput && (
        <div
          style={{
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.875rem', flexShrink: 0 }}>
            {t('input.custom')}:
          </span>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
            placeholder={isSearchAlgo ? 'sorted: 1,3,5,7,9 target:7' : t('input.customPlaceholder')}
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f1f5f9',
              fontSize: '0.875rem',
              outline: 'none',
              minWidth: '200px',
            }}
          />
          <button
            onClick={applyCustom}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('input.run')}
          </button>

          {/* Presets for sorting */}
          {meta.category === 'sorting' && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {Object.entries(SORTING_PRESETS).map(([name, arr]) => (
                <button
                  key={name}
                  onClick={() => { setCurrentInput(arr); setCustomInput('') }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complexity + Description */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Complexity */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '0.875rem 1rem',
          }}
        >
          <h4 style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Complexity
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}>
            <Row label={t('complexity.best')} value={meta.complexity.time.best} color="#10b981" />
            <Row label={t('complexity.average')} value={meta.complexity.time.avg} color={color} />
            <Row label={t('complexity.worst')} value={meta.complexity.time.worst} color="#ef4444" />
            <Row label={t('complexity.space')} value={meta.complexity.space} color="#64748b" />
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '0.875rem 1rem',
          }}
        >
          <h4 style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            {t('description')}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            {t(meta.descriptionKey)}
          </p>
        </div>

        {/* When to use */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '0.875rem 1rem',
          }}
        >
          <h4 style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            {t('whenToUse')}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            {t(meta.descriptionKey.replace('.description', '.whenToUse'))}
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ color: '#475569', fontSize: '0.7rem', minWidth: '48px' }}>{label}:</span>
      <span style={{ color }}>{value}</span>
    </div>
  )
}
