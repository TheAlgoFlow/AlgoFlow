'use client'

import type { ReactNode } from 'react'

/**
 * Square icon container with a colour-tinted background.
 * Used in the home page category cards for the icon area.
 */
type Props = {
  /** Accent colour — background will be a 10 % tint of this */
  color: string
  size?: number
  borderRadius?: number
  children: ReactNode
}

export function IconChip({ color, size = 36, borderRadius = 9, children }: Props) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
        background: `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text)',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}
