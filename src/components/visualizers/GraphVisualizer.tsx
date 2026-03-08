'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  current: '#f59e0b',
  visited: '#10b981',
  active: '#6366f1',
  found: '#10b981',
}

type GraphNode = { id: string; x: number; y: number; label: string }
type GraphEdge = { from: string; to: string }
type GraphState = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  visited: string[]
  queue?: string[]
  stack?: string[]
  current?: string
}

type GraphVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function GraphVisualizer({ frame }: GraphVisualizerProps) {
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

  const state = frame.state as GraphState
  const { nodes, edges, visited, queue, stack, current } = state

  const getNodeColor = (nodeId: string) => {
    const hl = frame.highlights.find(h => h.index === nodeId)
    if (hl) return ROLE_COLORS[hl.role] ?? '#6366f1'
    if (current === nodeId) return '#f59e0b'
    if (visited?.includes(nodeId)) return '#10b981'
    if ((queue ?? stack ?? []).includes(nodeId)) return '#6366f1'
    return '#e2e8f0'
  }

  const getNodeBorder = (nodeId: string) => {
    if (current === nodeId) return '#f59e0b'
    if (visited?.includes(nodeId)) return '#10b981'
    if ((queue ?? stack ?? []).includes(nodeId)) return '#8b5cf6'
    return 'rgba(99,102,241,0.3)'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
      <svg
        width="100%"
        height="calc(100% - 60px)"
        viewBox="0 0 600 300"
        style={{ overflow: 'visible' }}
      >
        {/* Edges */}
        {edges?.map((edge, i) => {
          const fromNode = nodes?.find(n => n.id === edge.from)
          const toNode = nodes?.find(n => n.id === edge.to)
          if (!fromNode || !toNode) return null
          return (
            <line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="rgba(99,102,241,0.3)"
              strokeWidth="2"
            />
          )
        })}

        {/* Nodes */}
        {nodes?.map(node => {
          const color = getNodeColor(node.id)
          const border = getNodeBorder(node.id)
          const isCurrent = current === node.id
          const hl = frame.highlights.find(h => h.index === node.id)

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isCurrent ? 26 : 22}
                fill={`${color}20`}
                stroke={border}
                strokeWidth={isCurrent ? 3 : 2}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={isCurrent ? '16' : '14'}
                fontWeight={isCurrent ? 'bold' : 'normal'}
                style={{ transition: 'all 0.2s ease' }}
              >
                {node.label}
              </text>
              {hl?.label && (
                <>
                  <text
                    x={node.x}
                    y={node.y + 34}
                    textAnchor="middle"
                    fill={ROLE_COLORS[hl.role] ?? color}
                    fontSize="9"
                  >
                    ▲
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 46}
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

      {/* Queue/Stack display */}
      {(queue ?? stack) && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
            {queue ? 'Queue:' : 'Stack:'}
          </span>
          {(queue ?? stack ?? []).map((id, i) => (
            <div
              key={i}
              style={{
                padding: '2px 10px',
                borderRadius: '4px',
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {id}
            </div>
          ))}
          {(queue ?? stack ?? []).length === 0 && (
            <span style={{ color: '#475569', fontSize: '0.75rem' }}>empty</span>
          )}
        </div>
      )}
    </div>
  )
}
