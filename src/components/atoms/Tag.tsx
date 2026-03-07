'use client'

import type { ReactNode } from 'react'

/**
 * Small keyword/label chip — e.g. "comparison", "in-place", "graph".
 * Used in AlgorithmCard, SearchOverlay, VisualizerPage top bar, and the home page.
 */
type Props = {
  children: ReactNode
}

export function Tag({ children }: Props) {
  return (
    <span
      style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        background: 'var(--bg-muted)',
        border: `1px solid var(--border)`,
        padding: '2px 7px',
        borderRadius: '4px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
