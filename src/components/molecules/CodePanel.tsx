'use client'

import { useState } from 'react'
import type { CodeSnippets } from '@/engine/types'
import { useI18n } from '@/i18n/context'

type Language = keyof CodeSnippets

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'ts', label: 'TS' },
  { key: 'python', label: 'PY' },
  { key: 'c', label: 'C' },
  { key: 'java', label: 'Java' },
  { key: 'go', label: 'Go' },
]

// Syntax token colors (simplified)
const TOKEN_COLORS = {
  keyword: '#c792ea',
  string: '#c3e88d',
  number: '#f78c6c',
  comment: '#546e7a',
  function: '#82aaff',
  type: '#ffcb6b',
  operator: '#89ddff',
  default: '#eeffff',
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
        background: '#0d1117',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      {/* Language tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          background: '#161b22',
          padding: '4px 4px 0',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        {LANGUAGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px 4px 0 0',
              border: 'none',
              background: lang === key ? '#0d1117' : 'transparent',
              color: lang === key ? '#a5b4fc' : '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: lang === key ? '2px solid #6366f1' : '2px solid transparent',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code lines */}
      <div
        style={{
          flex: 1,
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
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                paddingLeft: isActive ? '9px' : '12px',
                paddingRight: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  color: isActive ? '#4f46e5' : '#3d4f69',
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
              <code style={{ color: '#eeffff', whiteSpace: 'pre' }}>
                {colorize(code, lang)}
              </code>
            </div>
          )
        })}
      </div>
    </div>
  )
}
