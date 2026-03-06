'use client'

import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from 'lucide-react'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Message */}
      <div
        style={{
          fontSize: '0.8rem',
          color: '#78716C',
          minHeight: '1.2rem',
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
      >
        {message}
      </div>

      {/* Progress bar */}
      <div
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          seekTo(Math.round(pct * (totalFrames - 1)))
        }}
        style={{
          height: '3px',
          background: '#E5DDD0',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#5200FF',
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
        {/* Step counter */}
        <span
          style={{
            color: '#C8BDB0',
            fontSize: '0.7rem',
            fontFamily: 'ui-monospace, monospace',
            minWidth: '72px',
            fontWeight: 600,
          }}
        >
          {t('controls.step')} {frameIndex + 1}/{totalFrames}
        </span>

        {/* Playback buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CtrlBtn onClick={reset} title="Reset" disabled={frameIndex === 0 && !isPlaying}>
            <SkipBack size={14} strokeWidth={2} />
          </CtrlBtn>
          <CtrlBtn onClick={stepBack} title={t('controls.stepBack')} disabled={frameIndex === 0}>
            <ChevronLeft size={16} strokeWidth={2.5} />
          </CtrlBtn>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : play}
            disabled={totalFrames === 0}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: totalFrames === 0 ? '#f1f5f9' : '#5200FF',
              color: totalFrames === 0 ? '#c1c9d2' : '#ffffff',
              cursor: totalFrames === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: totalFrames > 0 ? '0 2px 12px rgba(82,0,255,0.35)' : 'none',
              flexShrink: 0,
            }}
          >
            {isPlaying
              ? <Pause size={15} strokeWidth={2.5} />
              : <Play size={15} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
            }
          </button>

          <CtrlBtn onClick={stepForward} title={t('controls.stepForward')} disabled={frameIndex >= totalFrames - 1}>
            <ChevronRight size={16} strokeWidth={2.5} />
          </CtrlBtn>
          <CtrlBtn onClick={() => seekTo(totalFrames - 1)} title="Skip to end" disabled={frameIndex >= totalFrames - 1}>
            <SkipForward size={14} strokeWidth={2} />
          </CtrlBtn>
        </div>

        {/* Speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: '72px', justifyContent: 'flex-end' }}>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: '2px 5px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: speed === s ? '#5200FF' : '#E5DDD0',
                background: speed === s ? '#5200FF' : '#FDFCFA',
                color: speed === s ? '#ffffff' : '#78716C',
                fontSize: '0.63rem',
                cursor: 'pointer',
                fontWeight: speed === s ? 700 : 500,
                transition: 'all 0.12s',
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CtrlBtn({
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
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        border: '1px solid #E5DDD0',
        background: '#FDFCFA',
        color: disabled ? '#C8BDB0' : '#78716C',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.12s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {children}
    </button>
  )
}
