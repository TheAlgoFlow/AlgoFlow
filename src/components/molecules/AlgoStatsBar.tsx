'use client'
import type { AlgorithmFrame } from '@/engine/types'

const SORTING_SLUGS  = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort', 'radix-sort', 'shell-sort']
const SEARCH_SLUGS   = ['linear-search', 'binary-search']
const GRAPH_SLUGS    = ['bfs', 'dfs']
const TREE_SLUGS     = ['bst', 'binary-tree']
const DP_SLUGS       = ['fibonacci', 'coin-change', 'lis', 'knapsack', 'lcs']
const DS_SLUGS       = ['stack', 'queue', 'linked-list', 'doubly-linked-list', 'hash-table', 'min-heap']

const ALL_STATS_SLUGS = [...SORTING_SLUGS, ...SEARCH_SLUGS, ...GRAPH_SLUGS, ...TREE_SLUGS, ...DP_SLUGS, ...DS_SLUGS]

export function AlgoStatsBar({ frame, slug }: { frame: AlgorithmFrame | null; slug: string }) {
  if (!ALL_STATS_SLUGS.includes(slug) || !frame) return null

  const aux = frame.auxState as Record<string, unknown> | undefined

  // Sorting
  if (SORTING_SLUGS.includes(slug)) {
    const comparisons = (aux?.comparisons as number) ?? 0
    const swaps = (aux?.swaps as number) ?? 0
    const isNonComparison = slug === 'counting-sort' || slug === 'radix-sort'
    return (
      <div style={barStyle}>
        <StatChip icon="⟳" label="comparisons" value={comparisons} color="#f59e0b" />
        <Divider />
        <StatChip icon="⇄" label={isNonComparison ? 'writes' : 'swaps'} value={swaps} color="#ef4444" />
      </div>
    )
  }

  // Searching
  if (SEARCH_SLUGS.includes(slug)) {
    const comparisons = (aux?.comparisons as number) ?? 0
    return (
      <div style={barStyle}>
        <StatChip icon="⟳" label="comparisons" value={comparisons} color="#f59e0b" />
      </div>
    )
  }

  // Graph
  if (GRAPH_SLUGS.includes(slug)) {
    const nodesVisited = (aux?.nodesVisited as number) ?? 0
    return (
      <div style={barStyle}>
        <StatChip icon="◉" label="visited" value={nodesVisited} color="#10b981" />
      </div>
    )
  }

  // Trees
  if (TREE_SLUGS.includes(slug)) {
    const comparisons = (aux?.comparisons as number) ?? 0
    return (
      <div style={barStyle}>
        <StatChip icon="⟳" label="comparisons" value={comparisons} color="#f59e0b" />
      </div>
    )
  }

  // DP
  if (DP_SLUGS.includes(slug)) {
    const fills = ((aux?.fills as number) ?? (aux?.updates as number) ?? 0)
    const comparisons = (aux?.comparisons as number) ?? 0
    return (
      <div style={barStyle}>
        <StatChip icon="✓" label="fills" value={fills} color="#10b981" />
        {slug === 'lis' && (
          <>
            <Divider />
            <StatChip icon="⟳" label="comparisons" value={comparisons} color="#f59e0b" />
          </>
        )}
      </div>
    )
  }

  // Data Structures
  if (DS_SLUGS.includes(slug)) {
    const operation = aux?.operation as string | undefined
    const swaps = (aux?.swaps as number) ?? 0
    return (
      <div style={barStyle}>
        {operation && <StatChip icon="▶" label="operation" textValue={operation} color="#6366f1" />}
        {slug === 'min-heap' && (
          <>
            {operation && <Divider />}
            <StatChip icon="⇄" label="swaps" value={swaps} color="#ef4444" />
          </>
        )}
      </div>
    )
  }

  return null
}

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  padding: '6px 24px',
  background: 'var(--bg-surface)',
  borderTop: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
}

function Divider() {
  return <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
}

function StatChip({ icon, label, value, textValue, color }: {
  icon: string
  label: string
  value?: number
  textValue?: string
  color: string
}) {
  const displayVal = textValue ?? value ?? 0
  const isActive = textValue ? !!textValue : (value ?? 0) > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '13px', color }}>{icon}</span>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        fontFamily: 'var(--font-body)',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '15px',
        fontWeight: 700,
        color: isActive ? 'var(--text)' : 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums',
        minWidth: '2.5ch',
      }}>{displayVal}</span>
    </div>
  )
}
