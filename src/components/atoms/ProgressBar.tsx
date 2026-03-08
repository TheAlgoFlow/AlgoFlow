'use client'

/**
 * Thin horizontal progress bar used in PlaybackControls.
 * Clickable — calls `onSeek` with a fraction 0..1.
 */
type Props = {
  progress: number   // 0 – 100 (percentage)
  onSeek: (pct: number) => void
}

export function ProgressBar({ progress, onSeek }: Props) {
  return (
    <div
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        onSeek(Math.max(0, Math.min(1, pct)))
      }}
      style={{
        height: '3px',
        background: 'var(--border)',
        borderRadius: '2px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, progress))}%`,
          background: '#5200FF',
          borderRadius: '2px',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}
