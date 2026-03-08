'use client'

import { useState } from 'react'
import type { DSOperationConfig } from '@/engine/types'

type Props = {
  operations: DSOperationConfig[]
  onRun: (op: DSOperationConfig, value?: number) => void
}

export function DSOperationsPanel({ operations, onRun }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const selected = operations[selectedIdx]

  const handleRun = () => {
    const val = selected.takesValue && inputValue !== '' ? parseInt(inputValue, 10) : undefined
    onRun(selected, val)
  }

  const ACCENT = '#F900FF'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        borderTop: `1px solid var(--border)`,
        background: 'var(--bg-surface)',
        flexWrap: 'wrap',
      }}
    >
      {/* Operation buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {operations.map((op, i) => (
          <button
            key={op.type + op.label}
            onClick={() => { setSelectedIdx(i); setInputValue('') }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1.5px solid ${i === selectedIdx ? ACCENT : 'var(--border)'}`,
              background: i === selectedIdx ? `${ACCENT}18` : 'transparent',
              color: i === selectedIdx ? ACCENT : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.04em',
            }}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Value input (when operation requires a value) */}
      {selected.takesValue && (
        <input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="value"
          style={{
            width: '80px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: `1.5px solid var(--border)`,
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: '13px',
            fontFamily: 'monospace',
            outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleRun() }}
        />
      )}

      {/* Run button */}
      <button
        onClick={handleRun}
        style={{
          padding: '6px 18px',
          borderRadius: '6px',
          border: 'none',
          background: ACCENT,
          color: '#fff',
          fontSize: '12px',
          fontWeight: 800,
          cursor: 'pointer',
          letterSpacing: '0.06em',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        RUN ▶
      </button>
    </div>
  )
}
