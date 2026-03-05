'use client'

import { useI18n } from '@/i18n/context'
import type { PlayerState } from '@/hooks/useAlgorithmPlayer'

const SPEEDS = [0.25, 0.5, 1, 2, 4]

type PlaybackControlsProps = {
  player: PlayerState
  message: string
}

export function PlaybackControls({ player, message }: PlaybackControlsProps) {
  const { t } = useI18n()
  const { isPlaying, frameIndex, totalFrames, speed, play, pause, stepBack, stepForward, reset, setSpeed, seekTo } = player

  const progress = totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {/* Message */}
      <div
        style={{
          fontSize: '0.875rem',
          color: '#94a3b8',
          minHeight: '1.25rem',
          textAlign: 'center',
        }}
      >
        {message}
      </div>

      {/* Progress bar */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          seekTo(Math.round(pct * (totalFrames - 1)))
        }}
        style={{
          height: '4px',
          background: 'rgba(99,102,241,0.2)',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#6366f1',
            borderRadius: '2px',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        {/* Left: step counter */}
        <span style={{ color: '#64748b', fontSize: '0.75rem', minWidth: '80px' }}>
          {t('controls.step')} {frameIndex + 1}/{totalFrames}
        </span>

        {/* Center: playback buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ControlBtn onClick={reset} title="Reset" disabled={frameIndex === 0 && !isPlaying}>
            ⏮
          </ControlBtn>
          <ControlBtn onClick={stepBack} title={t('controls.stepBack')} disabled={frameIndex === 0}>
            ◀
          </ControlBtn>
          <button
            onClick={isPlaying ? pause : play}
            disabled={totalFrames === 0}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: totalFrames === 0 ? '#1e293b' : '#6366f1',
              color: '#fff',
              fontSize: '1rem',
              cursor: totalFrames === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: totalFrames > 0 ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <ControlBtn onClick={stepForward} title={t('controls.stepForward')} disabled={frameIndex >= totalFrames - 1}>
            ▶
          </ControlBtn>
          <ControlBtn onClick={() => seekTo(totalFrames - 1)} title="Skip to end" disabled={frameIndex >= totalFrames - 1}>
            ⏭
          </ControlBtn>
        </div>

        {/* Right: speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '80px', justifyContent: 'flex-end' }}>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid',
                borderColor: speed === s ? '#6366f1' : 'rgba(99,102,241,0.2)',
                background: speed === s ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: speed === s ? '#a5b4fc' : '#64748b',
                fontSize: '0.65rem',
                cursor: 'pointer',
                fontWeight: speed === s ? 700 : 400,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ControlBtn({
  onClick,
  children,
  title,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  title: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: '1px solid rgba(99,102,241,0.3)',
        background: 'transparent',
        color: disabled ? '#334155' : '#94a3b8',
        fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}
