'use client'

import { useState } from 'react'
import type { CodeSnippets } from '@/engine/types'
import { useI18n } from '@/i18n/context'

type Language = keyof CodeSnippets

const LANGUAGES: { key: Language; label: string; logo: string; logoW: number; logoH: number; right: number }[] = [
  { key: 'c',          label: 'C',          logo: '/logos/c-program-icon.svg', logoW: 48,  logoH: 48, right: 14 },
  { key: 'cpp',        label: 'C++',        logo: '/logos/cpp.svg',            logoW: 48,  logoH: 48, right: 14 },
  { key: 'csharp',     label: 'C#',         logo: '/logos/csharp.svg',         logoW: 48,  logoH: 48, right: 14 },
  { key: 'java',       label: 'Java',       logo: '/logos/java.svg',           logoW: 48,  logoH: 48, right: 14 },
  { key: 'python',     label: 'Python',     logo: '/logos/python.svg',         logoW: 48,  logoH: 48, right: 14 },
  { key: 'go',         label: 'Go',         logo: '/logos/golang-ar21.svg',    logoW: 128, logoH: 48, right: 0  },
  { key: 'javascript', label: 'JavaScript', logo: '/logos/javascript.svg',     logoW: 48,  logoH: 48, right: 14 },
  { key: 'typescript', label: 'TypeScript', logo: '/logos/typescript.svg',     logoW: 48,  logoH: 48, right: 14 },
]

const TOKEN_COLORS = {
  keyword: '#7c3aed',
  number:  '#dc2626',
  default: 'var(--text)',
}

function colorize(code: string, lang: Language): React.ReactNode[] {
  const keywords: Record<Language, string[]> = {
    c:          ['void', 'int', 'long', 'char', 'float', 'double', 'for', 'while', 'if', 'else', 'return', 'sizeof', 'struct', 'typedef', 'NULL'],
    cpp:        ['void', 'int', 'long', 'bool', 'auto', 'for', 'while', 'if', 'else', 'return', 'new', 'delete', 'class', 'public', 'private', 'nullptr', 'true', 'false', 'namespace', 'using', 'std'],
    csharp:     ['void', 'int', 'long', 'bool', 'string', 'var', 'for', 'foreach', 'while', 'if', 'else', 'return', 'new', 'class', 'public', 'private', 'static', 'null', 'true', 'false', 'using'],
    java:       ['void', 'int', 'long', 'boolean', 'for', 'while', 'if', 'else', 'return', 'new', 'static', 'public', 'private', 'class', 'null', 'true', 'false'],
    python:     ['def', 'for', 'while', 'if', 'else', 'elif', 'return', 'in', 'range', 'len', 'None', 'True', 'False', 'and', 'or', 'not', 'class', 'self'],
    go:         ['func', 'for', 'if', 'else', 'return', 'var', 'nil', 'true', 'false', 'len', 'append', 'range', 'make', 'int', 'package', 'import'],
    javascript: ['function', 'const', 'let', 'var', 'for', 'while', 'if', 'else', 'return', 'null', 'undefined', 'new', 'of', 'in', 'true', 'false', 'class', 'this'],
    typescript: ['function', 'const', 'let', 'var', 'for', 'while', 'if', 'else', 'return', 'void', 'number', 'string', 'boolean', 'null', 'undefined', 'new', 'of', 'in', 'true', 'false', 'class', 'interface', 'type', 'readonly'],
  }

  const kw = keywords[lang] ?? []
  const parts: { text: string; color: string }[] = []
  const words = code.split(/(\b\w+\b|[^\w])/)

  for (const word of words) {
    if (!word) continue
    if (kw.includes(word))           parts.push({ text: word, color: TOKEN_COLORS.keyword })
    else if (/^\d+(\.\d+)?$/.test(word)) parts.push({ text: word, color: TOKEN_COLORS.number })
    else                             parts.push({ text: word, color: TOKEN_COLORS.default })
  }

  return parts.map((p, idx) => (
    <span key={idx} style={{ color: p.color }}>{p.text}</span>
  ))
}

type CodePanelProps = {
  snippets: CodeSnippets
  activeLine: number
}

export function CodePanel({ snippets, activeLine }: CodePanelProps) {
  const [lang, setLang] = useState<Language>('c')
  const { t } = useI18n()
  const lines = snippets[lang] ?? []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid var(--border)`,
      }}
    >
      {/* Language tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          background: 'var(--bg-muted)',
          padding: '4px 4px 0',
          borderBottom: `1px solid var(--border)`,
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
              background: lang === key ? 'var(--bg-surface)' : 'transparent',
              color: lang === key ? 'var(--text)' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: lang === key ? '2px solid #5200FF' : '2px solid transparent',
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
                background: isActive ? 'var(--code-active)' : 'transparent',
                borderLeft: isActive ? '3px solid #5200FF' : '3px solid transparent',
                  paddingLeft: isActive ? '9px' : '12px',
                  paddingRight: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    color: isActive ? '#5200FF' : 'var(--text-faint)',
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
                <code style={{ color: 'var(--text)', whiteSpace: 'pre' }}>
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
