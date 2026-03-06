'use client'

import { useState } from 'react'
import type { CodeSnippets } from '@/engine/types'
import { useI18n } from '@/i18n/context'

type Language = keyof CodeSnippets

const LANGUAGES: { key: Language; label: string; logo: string; logoW: number; logoH: number; right: number }[] = [
  { key: 'ts',     label: 'TypeScript', logo: '/logos/typescript.svg',    logoW: 48,  logoH: 48, right: 14 },
  { key: 'python', label: 'Python',     logo: '/logos/python.svg',        logoW: 48,  logoH: 48, right: 14 },
  { key: 'c',      label: 'C',          logo: '/logos/c-program-icon.svg',logoW: 48,  logoH: 48, right: 14 },
  { key: 'java',   label: 'Java',       logo: '/logos/java.svg',          logoW: 48,  logoH: 48, right: 14 },
  { key: 'go',     label: 'Go',         logo: '/logos/golang-ar21.svg',   logoW: 128, logoH: 48, right: 0  },
]

// Syntax token colors (light theme)
const TOKEN_COLORS = {
  keyword: '#7c3aed',
  string: '#059669',
  number: '#dc2626',
  comment: '#64748b',
  function: '#2563eb',
  type: '#b45309',
  operator: '#0d9488',
  default: '#1e293b',
}

function colorize(code: string, lang: Language): React.ReactNode[] {
  // Very simple tokenizer for basic syntax highlighting
  const keywords: Record<Language, string[]> = {
    ts: ['function', 'const', 'let', 'var', 'for', 'while', 'if', 'else', 'return', 'void', 'number', 'string', 'boolean', 'null', 'undefined', 'new', 'of', 'in', 'true', 'false'],
    python: ['def', 'for', 'while', 'if', 'else', 'elif', 'return', 'in', 'range', 'len', 'None', 'True', 'False', 'and', 'or', 'not'],
    c: ['void', 'int', 'for', 'while', 'if', 'else', 'return', 'sizeof'],
    java: ['void', 'int', 'for', 'while', 'if', 'else', 'return', 'new', 'static', 'public', 'class', 'null', 'true', 'false'],
    go: ['func', 'for', 'if', 'else', 'return', 'var', 'nil', 'true', 'false', 'len', 'append', 'range'],
  }

  const kw = keywords[lang] ?? []
  const parts: { text: string; color: string }[] = []

  // Simple word-by-word tokenization
  let i = 0
  const words = code.split(/(\b\w+\b|[^\w])/)

  for (const word of words) {
    if (!word) continue
    if (kw.includes(word)) {
      parts.push({ text: word, color: TOKEN_COLORS.keyword })
    } else if (/^\d+$/.test(word)) {
      parts.push({ text: word, color: TOKEN_COLORS.number })
    } else if (word === '//' || word.startsWith('#')) {
      parts.push({ text: word, color: TOKEN_COLORS.comment })
    } else {
      parts.push({ text: word, color: TOKEN_COLORS.default })
    }
  }

  return parts.map((p, idx) => (
    <span key={idx} style={{ color: p.color }}>
      {p.text}
    </span>
  ))
}

type CodePanelProps = {
  snippets: CodeSnippets
  activeLine: number
}

export function CodePanel({ snippets, activeLine }: CodePanelProps) {
  const [lang, setLang] = useState<Language>('ts')
  const { t } = useI18n()
  const lines = snippets[lang] ?? []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Language tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          background: '#f0f9ff',
          padding: '4px 4px 0',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flexShrink: 0,
        }}
      >
        {LANGUAGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px 6px 0 0',
              border: 'none',
              background: lang === key ? '#ffffff' : 'transparent',
              color: lang === key ? '#0f172a' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: lang === key ? '2px solid #0ea5e9' : '2px solid transparent',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code lines + watermark wrapper */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Scrollable code lines */}
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            padding: '8px 0',
            fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
            fontSize: '0.8125rem',
            lineHeight: '1.7',
          }}
        >
          {lines.map(({ line, code }) => {
            const isActive = line === activeLine
            return (
              <div
                key={line}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent',
                  paddingLeft: isActive ? '9px' : '12px',
                  paddingRight: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    color: isActive ? '#0369a1' : '#64748b',
                    fontSize: '0.7rem',
                    width: '28px',
                    flexShrink: 0,
                    userSelect: 'none',
                    textAlign: 'right',
                    marginRight: '12px',
                  }}
                >
                  {line}
                </span>
                <code style={{ color: '#1e293b', whiteSpace: 'pre' }}>
                  {colorize(code, lang)}
                </code>
              </div>
            )
          })}
        </div>

        {/* Language watermark — always at bottom-right of visible area */}
        {(() => {
          const activeLang = LANGUAGES.find(l => l.key === lang)!
          return (
            <img
              src={activeLang.logo}
              alt=""
              width={activeLang.logoW}
              height={activeLang.logoH}
              style={{
                position: 'absolute',
                bottom: '14px',
                right: `${activeLang.right}px`,
                objectFit: 'contain',
                opacity: 0.07,
                pointerEvents: 'none',
                filter: 'grayscale(1)',
              }}
            />
          )
        })()}
      </div>
    </div>
  )
}
