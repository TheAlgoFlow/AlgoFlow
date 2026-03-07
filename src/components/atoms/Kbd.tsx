'use client'

import type { ReactNode } from 'react'

/**
 * Keyboard shortcut key — e.g. <Kbd>⌘K</Kbd> or <Kbd>Esc</Kbd>.
 * Used in Nav (search pill) and SearchOverlay (footer hints).
 */
type Props = {
  children: ReactNode
}

export function Kbd({ children }: Props) {
  return (
    <kbd
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: '#C8BDB0',
        background: '#F0EDE8',
        border: '1px solid #E5DDD0',
        borderRadius: '4px',
        padding: '1px 5px',
        display: 'inline-block',
        lineHeight: 1.4,
      }}
    >
      {children}
    </kbd>
  )
}
