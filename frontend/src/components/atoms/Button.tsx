'use client'

import type { CSSProperties, MouseEvent, ReactNode } from 'react'

/** Variants map to distinct visual weight / purpose */
export type ButtonVariant = 'primary' | 'ghost' | 'icon' | 'ctrl' | 'code'

type Props = {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
  children: ReactNode
  style?: CSSProperties
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: 'inherit',
}

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: '#5200FF',
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: 700,
    boxShadow: '0 2px 10px rgba(82,0,255,0.28)',
  },
  ghost: {
    background: 'transparent',
    color: '#78716C',
    border: '1.5px solid #E5DDD0',
    borderRadius: '8px',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  icon: {
    background: 'transparent',
    color: '#78716C',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
  },
  ctrl: {
    background: '#FDFCFA',
    color: '#78716C',
    border: '1px solid #E5DDD0',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  code: {
    background: 'transparent',
    color: '#78716C',
    border: '1.5px solid rgba(0,0,0,0.1)',
    borderRadius: '8px',
    fontWeight: 700,
  },
}

const sizes: Record<'sm' | 'md' | 'lg', CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: '11px', gap: '4px' },
  md: { padding: '6px 14px', fontSize: '12px', gap: '6px' },
  lg: { padding: '7px 20px', fontSize: '13px', gap: '8px' },
}

const ctrlSize: CSSProperties = { width: '30px', height: '30px' }
const playSize: CSSProperties = { width: '38px', height: '38px', borderRadius: '50%', border: 'none' }

export function Button({
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  onClick,
  title,
  children,
  style,
}: Props) {
  const variantStyle = variants[variant]
  const sizeStyle = variant === 'ctrl' ? ctrlSize : sizes[size]

  const activeOverride: CSSProperties = active
    ? { background: '#5200FF', color: '#ffffff', borderColor: '#5200FF' }
    : {}

  const disabledOverride: CSSProperties = disabled
    ? { opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }
    : {}

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        ...base,
        ...variantStyle,
        ...sizeStyle,
        ...activeOverride,
        ...disabledOverride,
        ...style,
      }}
      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 4px 18px rgba(82,0,255,0.4)'
        } else if (variant === 'ghost' || variant === 'ctrl') {
          e.currentTarget.style.borderColor = '#C8BDB0'
        }
      }}
      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(82,0,255,0.28)'
        } else if (variant === 'ghost' || variant === 'ctrl') {
          e.currentTarget.style.borderColor = '#E5DDD0'
        }
      }}
    >
      {children}
    </button>
  )
}
