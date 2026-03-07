'use client'

import { useState, useCallback } from 'react'
import {
  Shuffle, TrendingDown, TrendingUp, Equal,
} from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { PlaybackControls } from '@/components/molecules/PlaybackControls'
import type { PlayerState } from '@/hooks/useAlgorithmPlayer'

const SORTING_PRESETS: { label: string; icon: React.ReactNode; arr: number[] }[] = [
  { label: 'Random',   icon: <Shuffle size={12} strokeWidth={2.5} />,      arr: [64, 34, 25, 12, 22, 11, 90] },
  { label: 'Nearly ↑', icon: <TrendingUp size={12} strokeWidth={2.5} />,   arr: [1, 2, 4, 3, 5, 7, 6] },
  { label: 'Reversed', icon: <TrendingDown size={12} strokeWidth={2.5} />, arr: [90, 75, 50, 35, 20, 10, 5] },
  { label: 'Equal',    icon: <Equal size={12} strokeWidth={2.5} />,        arr: [42, 42, 42, 42, 42] },
]

const SEARCH_PRESETS = {
  linear: { array: [4, 2, 7, 1, 9, 3, 8, 5, 6], target: 9 },
  binary: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
}

type Props = {
  player: PlayerState
  message: string
  showArrayInput: boolean
  isSearchAlgo: boolean
  isSortingAlgo: boolean
  color: string
  textColor: string
  onInputChange: (input: unknown) => void
}

export function VisualizerControlsDock({
  player,
  message,
  showArrayInput,
  isSearchAlgo,
  isSortingAlgo,
  color,
  textColor,
  onInputChange,
}: Props) {
  const { t } = useI18n()
  const [customInput, setCustomInput] = useState('')

  const applyCustom = useCallback(() => {
    if (!customInput.trim()) return
    const nums = customInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
    if (nums.length > 0) onInputChange(nums)
  }, [customInput, onInputChange])

  return (
    <>
      {/* ─ Playback controls ─ */}
      <div
        style={{
          borderTop: '1px solid #E5DDD0',
          background: '#FDFCFA',
          padding: '16px 24px',
          flexShrink: 0,
          boxShadow: '0 -1px 8px rgba(28,25,23,0.04)',
        }}
      >
        <PlaybackControls player={player} message={message} />
      </div>

      {/* ─ Input row ─ */}
      {showArrayInput && (
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: '#F5F1EB',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {isSortingAlgo && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SORTING_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { onInputChange(p.arr); setCustomInput('') }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #E5DDD0',
                    background: '#FDFCFA',
                    color: '#78716C',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}50`
                    e.currentTarget.style.color = textColor
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'
                    e.currentTarget.style.color = '#78716C'
                  }}
                >
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
          )}

          {isSearchAlgo && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(SEARCH_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => onInputChange(preset)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #E5DDD0',
                    background: '#FDFCFA',
                    color: '#78716C',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div style={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.08)' }} />

          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
            placeholder={isSearchAlgo ? 'sorted: 1,3,5  target:5' : t('input.customPlaceholder')}
            style={{
              flex: 1,
              minWidth: '160px',
              background: '#FDFCFA',
              border: '1.5px solid #E5DDD0',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#1C1917',
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
          <button
            onClick={applyCustom}
            style={{
              padding: '7px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#5200FF',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(82,0,255,0.28)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(82,0,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(82,0,255,0.28)' }}
          >
            Run
          </button>
        </div>
      )}
    </>
  )
}
