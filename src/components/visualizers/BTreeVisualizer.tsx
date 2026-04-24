'use client'

import type { AlgorithmFrame } from '@/engine/types'
import type { BTreeState, BNode } from '@/algorithms/data-structures/b-tree'

type Props = { frame: AlgorithmFrame | null; variant?: 'b-tree' | 'b-star-tree' }

// Layout: compute (x, y) for each node using a simple width-based recursive layout
type LayoutNode = { id: number; x: number; y: number; width: number }

function computeLayout(nodes: BNode[], rootId: number): Map<number, LayoutNode> {
  const map = new Map<number, LayoutNode>()
  const NODE_W_PER_KEY = 36
  const NODE_PAD = 20
  const LEVEL_H = 90

  function subtreeWidth(id: number): number {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return 0
    if (n.isLeaf || n.children.length === 0) return Math.max(n.keys.length * NODE_W_PER_KEY + NODE_PAD, 60)
    return n.children.reduce((sum, cid) => sum + subtreeWidth(cid) + 12, -12)
  }

  function layout(id: number, x: number, y: number) {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return
    const w = Math.max(n.keys.length * NODE_W_PER_KEY + NODE_PAD, 60)
    map.set(id, { id, x, y, width: w })
    if (n.isLeaf || n.children.length === 0) return

    const totalW = n.children.reduce((sum, cid) => sum + subtreeWidth(cid) + 12, -12)
    let cx = x + w / 2 - totalW / 2
    for (const cid of n.children) {
      const cw = subtreeWidth(cid)
      layout(cid, cx + cw / 2 - subtreeW(nodes, cid) / 2, y + LEVEL_H)
      cx += cw + 12
    }
  }

  function subtreeW(nodes: BNode[], id: number): number {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return 0
    return Math.max(n.keys.length * NODE_W_PER_KEY + NODE_PAD, 60)
  }

  layout(rootId, 0, 30)
  return map
}

const ROLE_COLORS: Record<string, string> = {
  current: '#f59e0b',
  compare: '#6366f1',
  found: '#10b981',
  active: '#22d3ee',
  swap: '#ef4444',
  selected: '#8b5cf6',
}

export function BTreeVisualizer({ frame, variant = 'b-tree' }: Props) {
  if (!frame) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>
        Press play to start
      </div>
    )
  }

  const state = frame.state as BTreeState
  if (!state?.nodes || state.nodes.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>No data</div>
  }

  const { nodes, root, activeNode, activeKeyIdx, newNodeId } = state
  const layout = computeLayout(nodes, root)

  // Compute SVG bounds
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity
  layout.forEach(({ x, y, width }) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y)
  })
  const svgW = Math.max(maxX - minX + 60, 320)
  const svgH = maxY + 80
  const offsetX = -minX + 30

  const NODE_H = 36
  const CORNER = 6

  const safeFrame = frame

  function renderNode(n: BNode) {
    const pos = layout.get(n.id)
    if (!pos) return null
    const nx = pos.x + offsetX
    const ny = pos.y

    const isActive   = n.id === activeNode
    const isNew      = n.id === newNodeId
    const hlRole     = safeFrame.highlights.find(h => h.index === n.id)?.role
    const borderColor = isNew ? '#22d3ee' : isActive ? (ROLE_COLORS[hlRole ?? 'current'] ?? '#f59e0b') : '#334155'
    const bgColor     = isNew ? 'rgba(34,211,238,0.1)' : isActive ? `${borderColor}18` : 'rgba(30,41,59,0.9)'

    const keyW = Math.max(pos.width / Math.max(n.keys.length, 1), 32)

    return (
      <g key={n.id}>
        {/* Node box */}
        <rect
          x={nx} y={ny}
          width={pos.width} height={NODE_H}
          rx={CORNER} ry={CORNER}
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={isActive || isNew ? 2 : 1}
        />
        {/* Key cells */}
        {n.keys.map((k, i) => {
          const kx = nx + i * keyW
          const isActiveKey = isActive && activeKeyIdx === i
          return (
            <g key={i}>
              {i > 0 && (
                <line x1={kx} y1={ny + 4} x2={kx} y2={ny + NODE_H - 4} stroke={borderColor} strokeWidth={0.5} strokeOpacity={0.4} />
              )}
              <text
                x={kx + keyW / 2}
                y={ny + NODE_H / 2 + 5}
                textAnchor="middle"
                fill={isActiveKey ? '#fbbf24' : isNew ? '#22d3ee' : '#e2e8f0'}
                fontSize={isActiveKey ? 14 : 13}
                fontWeight={isActiveKey ? 700 : 600}
                fontFamily="var(--font-mono, monospace)"
              >
                {k}
              </text>
              {isActiveKey && (
                <rect x={kx + 2} y={ny + 2} width={keyW - 4} height={NODE_H - 4} rx={4} fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth={1} />
              )}
            </g>
          )
        })}
        {/* Node id label (small, top-right) */}
        <text x={nx + pos.width - 4} y={ny - 4} textAnchor="end" fill="#475569" fontSize={9} fontFamily="monospace">
          {variant === 'b-star-tree' ? `B* id:${n.id}` : `id:${n.id}`}
        </text>
        {/* "new" badge */}
        {isNew && (
          <text x={nx + pos.width / 2} y={ny - 5} textAnchor="middle" fill="#22d3ee" fontSize={10} fontWeight={700}>NEW</text>
        )}
      </g>
    )
  }

  function renderEdges() {
    const edges: React.ReactNode[] = []

    for (const n of nodes) {
      const pos = layout.get(n.id)
      if (!pos || n.isLeaf || n.children.length === 0) continue
      const px = pos.x + offsetX + pos.width / 2
      const py = pos.y + NODE_H

      n.children.forEach(cid => {
        const cpos = layout.get(cid)
        if (!cpos) return
        const cx = cpos.x + offsetX + cpos.width / 2
        const cy = cpos.y
        edges.push(
          <line
            key={`${n.id}-${cid}`}
            x1={px} y1={py}
            x2={cx} y2={cy}
            stroke="#334155"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
          />
        )
      })
    }
    return edges
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
      <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#334155" />
          </marker>
        </defs>
        {renderEdges()}
        {nodes.map(n => renderNode(n))}
      </svg>
    </div>
  )
}
