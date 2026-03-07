'use client'

import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'

/**
 * Navigation link atom — styled Next.js Link used in the Nav organism.
 */
type Props = {
  href: string
  children: ReactNode
}

export function NavLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      style={{
        color: '#78716C',
        textDecoration: 'none',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.color = '#1C1917'
      }}
      onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.color = '#78716C'
      }}
    >
      {children}
    </Link>
  )
}
