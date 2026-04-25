'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  current: '#f59e0b',
  visited: '#10b981',
  active: '#6366f1',
  found: '#10b981',
  compare: '#f59e0b',
  selected: '#8b5cf6',
  sorted: '#10b981',
}

type TreeNodeData = {
  id: number
  value: number
  left: number | null
  right: number | null
}

type TreeVisualizerProps = {
  frame: AlgorithmFrame | null
}

// Layout nodes in a tree structure
function layoutTree(nodes: TreeNodeData[]): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>()
  if (nodes.length === 0) return positions

  // Find root (node not referenced as child)
  const childIds = new Set<number>()
  for (const n of nodes) {
    if (n.left !== null) childIds.add(n.left)
    if (n.right !== null) childIds.add(n.right)
  }
  const rootNode = nodes.find(n => !childIds.has(n.id))
  if (!rootNode) return positions

  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const W = 560

  function assign(id: number | null, depth: number, leftBound: number, rightBound: number) {
    if (id === null || !nodeMap.has(id)) return
    const node = nodeMap.get(id)!
    const x = (leftBound + rightBound) / 2
    const y = 30 + depth * 65
    positions.set(id, { x, y })
    const mid = (leftBound + rightBound) / 2
    assign(node.left, depth + 1, leftBound, mid)
    assign(node.right, depth + 1, mid, rightBound)
  }

  assign(rootNode.id, 0, 0, W)
  return positions
}

export function TreeVisualizer({ frame }: TreeVisualizerProps) {
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

  const state = frame.state as {
    nodes: TreeNodeData[]
    current: number | null
    visited?: number[]
    comparing?: number | null
  }
  const { nodes, current, visited = [], comparing } = state
  const positions = layoutTree(nodes)

  const getEdgeStroke = (parentId: number, childId: number) => {
    if (childId === current) return '#f59e0b'
    if (visited.includes(parentId) && visited.includes(childId)) return '#10b98160'
    return 'rgba(99,102,241,0.3)'
  }
  const getEdgeWidth = (parentId: number, childId: number) => {
    if (childId === current) return '2.5'
    if (visited.includes(parentId) && visited.includes(childId)) return '2'
    return '1.5'
  }

  const getNodeColor = (id: number) => {
    const hl = frame.highlights.find(h => h.index === id)
    if (hl) return ROLE_COLORS[hl.role] ?? '#6366f1'
    if (id === current) return '#f59e0b'
    if (visited.includes(id)) return '#10b981'
    if (id === comparing) return '#f59e0b'
    return '#6366f1'
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '0.5rem' }}>
      <svg width="100%" height="100%" viewBox="0 0 560 280" style={{ overflow: 'visible' }}>
        {/* Edges */}
        {nodes.map(node => {
          const pos = positions.get(node.id)
          if (!pos) return null
          return (
            <>
              {node.left !== null && positions.get(node.left) && (
                <line
                  key={`${node.id}-left`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={positions.get(node.left)!.x}
                  y2={positions.get(node.left)!.y}
                  stroke={getEdgeStroke(node.id, node.left)}
                  strokeWidth={getEdgeWidth(node.id, node.left)}
                  style={{ transition: 'stroke 0.2s ease' }}
                />
              )}
              {node.right !== null && positions.get(node.right) && (
                <line
                  key={`${node.id}-right`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={positions.get(node.right)!.x}
                  y2={positions.get(node.right)!.y}
                  stroke={getEdgeStroke(node.id, node.right)}
                  strokeWidth={getEdgeWidth(node.id, node.right)}
                  style={{ transition: 'stroke 0.2s ease' }}
                />
              )}
            </>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = positions.get(node.id)
          if (!pos) return null
          const color = getNodeColor(node.id)
          const isCurrent = node.id === current
          const hl = frame.highlights.find(h => h.index === node.id)

          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isCurrent ? 22 : 20}
                fill={`${color}20`}
                stroke={color}
                strokeWidth={isCurrent ? 3 : 2}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize="13"
                fontWeight={isCurrent ? 'bold' : 'normal'}
              >
                {node.value}
              </text>
              {hl?.label && (
                <>
                  <text
                    x={pos.x}
                    y={pos.y + 30}
                    textAnchor="middle"
                    fill={ROLE_COLORS[hl.role] ?? color}
                    fontSize="9"
                  >
                    ▲
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 42}
                    textAnchor="middle"
                    fill={ROLE_COLORS[hl.role] ?? color}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {hl.label}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* Traversal order */}
      {visited.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Order:</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {visited.map((v, i) => (
              <div
                key={i}
                style={{
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  borderRadius: '4px',
                  color: '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
