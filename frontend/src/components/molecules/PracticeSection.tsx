'use client'

import type { ExerciseLink, ExercisePlatform } from '@/engine/types'

const PLATFORM_CONFIG: Record<ExercisePlatform, { label: string; color: string; bg: string }> = {
  leetcode:   { label: 'LeetCode',   color: '#FF6B00', bg: 'rgba(255,107,0,0.08)' },
  hackerrank: { label: 'HackerRank', color: '#00a859', bg: 'rgba(0,168,89,0.08)' },
  beecrowd:   { label: 'Beecrowd',   color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  neetcode:   { label: 'NeetCode',   color: '#14b8a6', bg: 'rgba(20,184,166,0.08)' },
}

const DIFFICULTY_COLORS = {
  Easy:   '#0f7142',
  Medium: '#b45309',
  Hard:   '#dc2626',
}

type Props = {
  exercises?: ExerciseLink[]
}

export function PracticeSection({ exercises }: Props) {
  if (!exercises || exercises.length === 0) return null

  return (
    <section
      style={{
        padding: '28px 32px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}
    >
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          marginBottom: '14px',
        }}
      >
        Practice
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {exercises.map((ex, i) => {
          const platform = PLATFORM_CONFIG[ex.platform]
          const diffColor = DIFFICULTY_COLORS[ex.difficulty]
          return (
            <a
              key={i}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1.5px solid ${platform.color}30`,
                background: platform.bg,
                textDecoration: 'none',
                color: 'var(--text)',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = platform.color
                e.currentTarget.style.boxShadow = `0 2px 12px ${platform.color}25`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${platform.color}30`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: platform.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  flexShrink: 0,
                }}
              >
                {platform.label}
              </span>

              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>·</span>

              <span style={{ fontWeight: 500, color: 'var(--text)' }}>{ex.title}</span>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: diffColor,
                  fontFamily: 'var(--font-mono)',
                  marginLeft: '2px',
                }}
              >
                {ex.difficulty}
              </span>

              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{ color: 'var(--text-faint)', flexShrink: 0, marginLeft: '2px' }}
              >
                <path
                  d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )
        })}
      </div>
    </section>
  )
}
