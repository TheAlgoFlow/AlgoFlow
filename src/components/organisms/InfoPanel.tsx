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
            {tab === 'complexity' ? t('infopanel.complexity') : t('infopanel.about')}
          </button>
        ))}
      </div>

      {/* ─ Content ─ */}
      <div style={{ padding: '16px 24px' }}>
        {activeTab === 'complexity' ? (
          complexity.operations && complexity.operations.length > 0 ? (
            /* Per-operation table for data structures */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '13px', width: '100%', maxWidth: '600px' }}>
                  <thead>
                    <tr>
                      {['Operation', 'Best', 'Average', 'Worst'].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: '6px 16px 6px 0',
                            textAlign: 'left',
                            color: 'var(--text-faint)',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            borderBottom: `1px solid var(--border)`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complexity.operations.map((op, i) => (
                      <tr key={i}>
                        <td style={{ padding: '6px 16px 6px 0', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {op.name}
                        </td>
                        <td style={{ padding: '6px 16px 6px 0', fontFamily: 'ui-monospace, monospace', color: '#10b981', fontWeight: 700 }}>
                          {op.best}
                        </td>
                        <td style={{ padding: '6px 16px 6px 0', fontFamily: 'ui-monospace, monospace', color: textColor, fontWeight: 700 }}>
                          {op.avg}
                        </td>
                        <td style={{ padding: '6px 16px 6px 0', fontFamily: 'ui-monospace, monospace', color: '#ef4444', fontWeight: 700 }}>
                          {op.worst}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    color: 'var(--text-faint)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {t('complexity.space')}
                </span>
                <span
                  style={{
                    color: '#78716C',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  {complexity.space}
                </span>
              </div>
            </div>
          ) : (
            /* Flat best/avg/worst for non-DS algorithms */
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
          )
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
