'use client'

import type { ReactNode } from 'react'

/**
 * Complexity badge — e.g. "O(n log n)" — used in AlgorithmCard, SearchOverlay, etc.
 */
type Props = {
  children: ReactNode
  /** Accent colour (category colour) for background tint and border */
  accentColor: string
  /** Text / foreground colour */
  textColor: string
}

export function Badge({ children, accentColor, textColor }: Props) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: textColor,
        background: `${accentColor}18`,
        border: `1.5px solid ${accentColor}35`,
        padding: '3px 10px',
        borderRadius: '6px',
        fontWeight: 700,
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
