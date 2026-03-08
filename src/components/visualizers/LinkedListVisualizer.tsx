'use client'

import type { AlgorithmFrame, HighlightRole } from '@/engine/types'

const ROLE_COLORS: Partial<Record<HighlightRole, string>> = {
  current: '#f59e0b',
  visited: '#10b981',
  active: '#6366f1',
  head: '#06b6d4',
  tail: '#10b981',
  found: '#10b981',
  compare: '#f59e0b',
  selected: '#8b5cf6',
}

type LLNode = { value: number; id: string; next: string | null }
type LLState = { nodes: LLNode[]; head: string | null; current?: string; prev?: string; highlighted?: string[] }

type LinkedListVisualizerProps = {
  frame: AlgorithmFrame | null
}

export function LinkedListVisualizer({ frame }: LinkedListVisualizerProps) {
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

  const state = frame.state as LLState
  const { nodes, head, current, prev, highlighted = [] } = state

  // Order nodes by following next pointers from head
  const orderedNodes: LLNode[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  let cur = head
  const visitedSet = new Set<string>()
  while (cur && !visitedSet.has(cur)) {
    const node = nodeMap.get(cur)
    if (!node) break
    orderedNodes.push(node)
    visitedSet.add(cur)
    cur = node.next
  }

  const getNodeColor = (id: string) => {
    const hl = frame.highlights.find(h => h.index === id)
    if (hl) return ROLE_COLORS[hl.role] ?? '#6366f1'
    if (id === current) return '#f59e0b'
    if (id === prev) return '#8b5cf6'
    if (highlighted.includes(id)) return '#6366f1'
    if (id === head) return '#06b6d4'
    return '#6366f1'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '1rem',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
        {orderedNodes.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Empty list</div>
        ) : (
          <>
            {/* HEAD label */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '8px',
              }}
            >
              <div style={{ color: '#06b6d4', fontSize: '0.7rem', fontWeight: 700, marginBottom: '4px' }}>
                HEAD
              </div>
              <div style={{ color: '#06b6d4', fontSize: '1rem' }}>→</div>
            </div>

            {orderedNodes.map((node) => {
              const color = getNodeColor(node.id)
              const isLast = node.next === null
              const hl = frame.highlights.find(h => h.index === node.id)

              return (
                <div
                  key={node.id}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {/* Node + label wrapper */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Node box */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '2px solid',
                        borderColor: color,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: `${color}15`,
                        transition: 'all 0.2s ease',
                        boxShadow: color === '#f59e0b' ? `0 0 12px ${color}50` : 'none',
                      }}
                    >
                      {/* Value section */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color,
                          fontWeight: 700,
                          fontSize: '1rem',
                          borderRight: `1px solid ${color}50`,
                        }}
                      >
                        {node.value}
                      </div>
                      {/* Next pointer section */}
                      <div
                        style={{
                          width: '32px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isLast ? '#475569' : color,
                          fontSize: '0.75rem',
                        }}
                      >
                        {isLast ? '∅' : '→'}
                      </div>
                    </div>

                    {/* Label arrow */}
                    {hl?.label && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', marginTop: '4px' }}>
                        <span style={{ fontSize: '9px', color: ROLE_COLORS[hl.role] ?? color, lineHeight: 1 }}>▲</span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: ROLE_COLORS[hl.role] ?? color, fontWeight: 700, whiteSpace: 'nowrap' }}>{hl.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow between nodes */}
                  {!isLast && (
                    <div
                      style={{
                        width: '20px',
                        height: '2px',
                        background: 'rgba(99,102,241,0.4)',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          top: '-5px',
                          color: 'rgba(99,102,241,0.6)',
                          fontSize: '0.75rem',
                        }}
                      >
                        ▶
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* NULL label */}
            <div
              style={{
                marginLeft: '8px',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              NULL
            </div>
          </>
        )}
      </div>
    </div>
  )
}
