'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, ChevronRight } from 'lucide-react'
import { allModules, categories } from '@/algorithms/index'
import { useI18n } from '@/i18n/context'
import { Badge } from '@/components/atoms/Badge'
import { Tag } from '@/components/atoms/Tag'
import { Kbd } from '@/components/atoms/Kbd'
import { getCategoryTheme, CATEGORY_COLORS } from '@/components/constants/categoryTheme'

const RECENT_KEY = 'algoflow_recent'
const MAX_RECENT = 5

type SearchResult = {
  slug: string
  category: string
  name: string
  tags: string[]
  complexity: string
}

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [highlighted, setHighlighted] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlighted(0)
      setActiveCategory('all')
      try {
        const raw = localStorage.getItem(RECENT_KEY)
        setRecent(raw ? JSON.parse(raw) : [])
      } catch {
        setRecent([])
      }
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results: SearchResult[] = allModules
    .filter(mod => {
      if (activeCategory !== 'all' && mod.meta.category !== activeCategory) return false
      if (!query.trim()) return false
      const q = query.toLowerCase()
      const name = t(mod.meta.nameKey).toLowerCase()
      const tags = mod.meta.tags.join(' ').toLowerCase()
      const complexity = [
        mod.meta.complexity.time.best,
        mod.meta.complexity.time.avg,
        mod.meta.complexity.time.worst,
      ].join(' ').toLowerCase()
      return name.includes(q) || tags.includes(q) || complexity.includes(q)
    })
    .slice(0, 8)
    .map(mod => ({
      slug: mod.meta.slug,
      category: mod.meta.category,
      name: t(mod.meta.nameKey),
      tags: mod.meta.tags,
      complexity: mod.meta.complexity.time.avg,
    }))

  const recentResults: SearchResult[] = !query.trim()
    ? recent
        .map(slug => allModules.find(m => m.meta.slug === slug))
        .filter(Boolean)
        .filter(mod => activeCategory === 'all' || mod!.meta.category === activeCategory)
        .map(mod => ({
          slug: mod!.meta.slug,
          category: mod!.meta.category,
          name: t(mod!.meta.nameKey),
          tags: mod!.meta.tags,
          complexity: mod!.meta.complexity.time.avg,
        }))
    : []

  const displayResults = query.trim() ? results : recentResults
  const showEmpty = !query.trim() && recentResults.length === 0

  const navigate = useCallback((slug: string, category: string) => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      const prev: string[] = raw ? JSON.parse(raw) : []
      const updated = [slug, ...prev.filter(s => s !== slug)].slice(0, MAX_RECENT)
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    } catch {}
    onClose()
    router.push(`/visualizer/${category}/${slug}`)
  }, [onClose, router])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted(h => Math.min(h + 1, displayResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
      } else if (e.key === 'Enter' && displayResults[highlighted]) {
        navigate(displayResults[highlighted].slug, displayResults[highlighted].category)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, displayResults, highlighted, navigate, onClose])

  useEffect(() => { setHighlighted(0) }, [query, activeCategory])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--overlay-bg)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          border: `1px solid var(--border)`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px var(--shadow-lg)',
          animation: 'slideDown 0.18s ease',
        }}
      >
        {/* ─ Input row ─ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 16px',
            borderBottom: `1px solid var(--border)`,
            height: '52px',
          }}
        >
          <Search size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search algorithms…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: `1px solid var(--border)`,
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Esc
          </button>
        </div>

        {/* ─ Category filter chips ─ */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '10px 16px',
            borderBottom: `1px solid var(--border)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {['all', ...categories.map(c => c.id)].map(cat => {
            const active = activeCategory === cat
            const color = cat !== 'all' ? CATEGORY_COLORS[cat] : undefined
            const { textColor } = cat !== 'all' ? getCategoryTheme(cat) : { textColor: '#5200FF' }
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1.5px solid',
                  borderColor: active ? (color ?? '#5200FF') : 'var(--border)',
                  background: active ? (color ? `${color}18` : 'rgba(82,0,255,0.06)') : 'transparent',
                  color: active ? (cat !== 'all' ? textColor : '#5200FF') : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.12s',
                }}
              >
                {cat === 'all' ? 'All' : cat === 'data-structures' ? 'Data Structures' : cat === 'dp' ? 'DP' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          })}
        </div>

        {/* ─ Results ─ */}
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {showEmpty ? (
            /* Empty state — quick access by category */
            <div style={{ padding: '16px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '10px',
                }}
              >
                Quick Access
              </p>
              {categories.map(cat => {
                const { color, textColor } = getCategoryTheme(cat.id)
                return (
                  <a
                    key={cat.id}
                    href={`/visualizer/${cat.id}`}
                    onClick={e => { e.preventDefault(); onClose(); router.push(`/visualizer/${cat.id}`) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      marginBottom: '4px',
                      textDecoration: 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-muted)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 600, flex: 1 }}>
                      {cat.id === 'data-structures' ? 'Data Structures' : cat.id === 'dp' ? 'Dynamic Programming' : cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
                    </span>
                    <ChevronRight size={13} style={{ color: 'var(--text-faint)' }} />
                  </a>
                )
              })}
            </div>
          ) : displayResults.length === 0 && query.trim() ? (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--text-faint)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              No algorithms found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {!query.trim() && recentResults.length > 0 && (
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 8px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Clock size={10} strokeWidth={2} />
                  Recent
                </p>
              )}
              {displayResults.map((result, i) => {
                const { color, textColor } = getCategoryTheme(result.category)
                const isHighlighted = i === highlighted
                return (
                  <button
                    key={result.slug}
                    onClick={() => navigate(result.slug, result.category)}
                    onMouseEnter={() => setHighlighted(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isHighlighted ? 'var(--bg-muted)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, color: 'var(--text)', fontSize: '14px', fontWeight: 600 }}>
                      {result.name}
                    </span>
                    <Badge accentColor={color} textColor={textColor}>{result.complexity}</Badge>
                    {result.tags.slice(0, 2).map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    <ChevronRight size={13} style={{ color: isHighlighted ? 'var(--text-muted)' : 'var(--text-faint)', flexShrink: 0 }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ─ Footer ─ */}
        <div
          style={{
            borderTop: `1px solid var(--border)`,
            padding: '8px 16px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
          }}
        >
          {[
            { key: '↑↓', label: 'Navigate' },
            { key: '↵',  label: 'Jump' },
            { key: 'Esc', label: 'Close' },
          ].map(item => (
            <span
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                color: 'var(--text-faint)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Kbd>{item.key}</Kbd>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
