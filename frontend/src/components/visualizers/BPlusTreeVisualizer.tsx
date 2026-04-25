'use client'

import type { AlgorithmFrame } from '@/engine/types'
import type { BPlusTreeState, BPNode } from '@/algorithms/data-structures/b-plus-tree'

type Props = { frame: AlgorithmFrame | null }

type LayoutNode = { id: number; x: number; y: number; width: number }

function computeLayout(nodes: BPNode[], rootId: number): Map<number, LayoutNode> {
  const NODE_W_PER_KEY = 36
  const NODE_PAD = 20
  const LEVEL_H = 90
  const map = new Map<number, LayoutNode>()

  function subtreeWidth(id: number): number {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return 60
    if (n.isLeaf || n.children.length === 0) return Math.max(n.keys.length * NODE_W_PER_KEY + NODE_PAD, 60)
    return n.children.reduce((sum, cid) => sum + subtreeWidth(cid) + 16, -16)
  }

  function nodeW(id: number): number {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return 60
    return Math.max(n.keys.length * NODE_W_PER_KEY + NODE_PAD, 60)
  }

  function layout(id: number, x: number, y: number) {
    const n = nodes.find(nd => nd.id === id)
    if (!n) return
    const w = nodeW(id)
    map.set(id, { id, x, y, width: w })
    if (n.isLeaf || n.children.length === 0) return

    const totalW = n.children.reduce((sum, cid) => sum + subtreeWidth(cid) + 16, -16)
    let cx = x + w / 2 - totalW / 2
    for (const cid of n.children) {
      const csw = subtreeWidth(cid)
      const cw  = nodeW(cid)
      layout(cid, cx + csw / 2 - cw / 2, y + LEVEL_H)
      cx += csw + 16
    }
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
}

export function BPlusTreeVisualizer({ frame }: Props) {
  if (!frame) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>Press play to start</div>
  }

  const state = frame.state as BPlusTreeState
  if (!state?.nodes || state.nodes.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>No data</div>
  }

  const { nodes, root, activeNode, activeKeyIdx, scanChain } = state
  const layout = computeLayout(nodes, root)

  let minX = Infinity, maxX = -Infinity, maxY = -Infinity
  layout.forEach(({ x, y, width }) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y)
  })
  const svgW = Math.max(maxX - minX + 80, 320)
  const svgH = maxY + 100
  const offsetX = -minX + 40

  const NODE_H = 36
  const LEAF_H = 42

  const safeFrame = frame

  function renderNode(n: BPNode) {
    const pos = layout.get(n.id)
    if (!pos) return null
    const nx = pos.x + offsetX
    const ny = pos.y
    const h = n.isLeaf ? LEAF_H : NODE_H

    const isActive   = n.id === activeNode
    const isScanning = scanChain.includes(n.id)
    const hlRole     = safeFrame.highlights.find(h => h.index === n.id)?.role
    const borderColor = isScanning ? '#a855f7'
      : isActive ? (ROLE_COLORS[hlRole ?? 'current'] ?? '#f59e0b')
      : n.isLeaf ? '#1e40af'
      : '#334155'
    const bgColor = isScanning ? 'rgba(168,85,247,0.12)'
      : isActive ? `${borderColor}18`
      : n.isLeaf ? 'rgba(30,58,138,0.5)'
      : 'rgba(30,41,59,0.9)'

    const keyW = Math.max(pos.width / Math.max(n.keys.length, 1), 32)

    return (
      <g key={n.id}>
        <rect
          x={nx} y={ny}
          width={pos.width} height={h}
          rx={n.isLeaf ? 4 : 6} ry={n.isLeaf ? 4 : 6}
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={isActive || isScanning ? 2 : 1}
          strokeDasharray={n.isLeaf ? undefined : undefined}
        />
        {/* Leaf indicator stripe */}
        {n.isLeaf && (
          <rect x={nx} y={ny} width={pos.width} height={3} rx={2} fill={borderColor} opacity={0.6} />
        )}
        {n.keys.map((k, i) => {
          const kx = nx + i * keyW
          const isActiveKey = isActive && activeKeyIdx === i
          return (
            <g key={i}>
              {i > 0 && (
                <line x1={kx} y1={ny + 4} x2={kx} y2={ny + h - 4} stroke={borderColor} strokeWidth={0.5} strokeOpacity={0.4} />
              )}
              <text
                x={kx + keyW / 2}
                y={ny + h / 2 + 5}
                textAnchor="middle"
                fill={isActiveKey ? '#fbbf24' : isScanning ? '#c084fc' : n.isLeaf ? '#93c5fd' : '#e2e8f0'}
                fontSize={isActiveKey ? 14 : 13}
                fontWeight={isActiveKey ? 700 : 600}
                fontFamily="var(--font-mono, monospace)"
              >
                {k}
              </text>
              {isActiveKey && (
                <rect x={kx + 2} y={ny + 2} width={keyW - 4} height={h - 4} rx={4} fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth={1} />
              )}
            </g>
          )
        })}
        {/* "LEAF" label */}
        {n.isLeaf && (
          <text x={nx + pos.width - 4} y={ny + h - 4} textAnchor="end" fill="#1d4ed8" fontSize={9} fontFamily="monospace" fontWeight={700}>LEAF</text>
        )}
      </g>
    )
  }

  function renderTreeEdges() {
    const edges: React.ReactNode[] = []
    for (const n of nodes) {
      if (n.isLeaf || n.children.length === 0) continue
      const pos = layout.get(n.id)
      if (!pos) continue
      const px = pos.x + offsetX + pos.width / 2
      const py = pos.y + NODE_H

      n.children.forEach(cid => {
        const cpos = layout.get(cid)
        if (!cpos) return
        const cx = cpos.x + offsetX + cpos.width / 2
        const cy = cpos.y
        edges.push(
          <line key={`${n.id}-${cid}`} x1={px} y1={py} x2={cx} y2={cy} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arr)" />
        )
      })
    }
    return edges
  }

  function renderLeafChain() {
    const chainEdges: React.ReactNode[] = []
    for (const n of nodes) {
      if (!n.isLeaf || n.nextLeaf === null) continue
      const pos  = layout.get(n.id)
      const npos = layout.get(n.nextLeaf)
      if (!pos || !npos) continue

      const x1 = pos.x + offsetX + pos.width
      const y1 = pos.y + LEAF_H / 2
      const x2 = npos.x + offsetX
      const y2 = npos.y + LEAF_H / 2

      const isScanned = scanChain.includes(n.id) && scanChain.includes(n.nextLeaf)
      chainEdges.push(
        <g key={`chain-${n.id}`}>
          <path
            d={`M${x1},${y1} C${x1 + 20},${y1 + 20} ${x2 - 20},${y2 + 20} ${x2},${y2}`}
            fill="none"
            stroke={isScanned ? '#a855f7' : '#1e40af'}
            strokeWidth={isScanned ? 2 : 1.5}
            strokeDasharray={isScanned ? undefined : '4 3'}
            markerEnd="url(#arrLeaf)"
          />
        </g>
      )
    }
    return chainEdges
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
      <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#334155" />
          </marker>
          <marker id="arrLeaf" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#1e40af" />
          </marker>
        </defs>
        {renderLeafChain()}
        {renderTreeEdges()}
        {nodes.map(n => renderNode(n))}
      </svg>
    </div>
  )
}
