'use client'

import { useState } from 'react'
import { useI18n } from '@/i18n/context'
import type { Complexity } from '@/engine/types'

type Props = {
  complexity: Complexity
  descriptionKey: string
  textColor: string
}

export function InfoPanel({ complexity, descriptionKey, textColor }: Props) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'complexity' | 'about'>('complexity')

  return (
    <div
      style={{
        borderTop: `1px solid var(--border)`,
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}
    >
      {/* ─ Tabs ─ */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid var(--border)`,
          padding: '0 24px',
        }}
      >
        {(['complexity', 'about'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 0',
              marginRight: '24px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? textColor : 'transparent'}`,
              background: 'transparent',
              color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            {tab === 'complexity' ? 'Complexity' : 'About'}
          </button>
        ))}
      </div>

      {/* ─ Content ─ */}
      <div style={{ padding: '16px 24px' }}>
        {activeTab === 'complexity' ? (
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { label: t('complexity.best'),    value: complexity.time.best,  col: '#10b981' },
              { label: t('complexity.average'), value: complexity.time.avg,   col: textColor },
              { label: t('complexity.worst'),   value: complexity.time.worst, col: '#ef4444' },
              { label: t('complexity.space'),   value: complexity.space,      col: '#78716C' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    color: 'var(--text-faint)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    color: row.col,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '640px',
              fontWeight: 400,
            }}
          >
            {t(descriptionKey)}
          </p>
        )}
      </div>
    </div>
  )
}
