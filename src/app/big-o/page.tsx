'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import Link from 'next/link'

/* ─── Data ──────────────────────────────────────────────────────────── */

const COMPLEXITY_GUIDE = [
  {
    notation: 'O(1)',
    label: 'Constant',
    color: '#0f7142',
    desc: 'Fixed time regardless of input size. The gold standard — as close to instant as algorithms get.',
    examples: [
      { name: 'Array Access', slug: 'array-ops', category: 'data-structures' },
      { name: 'Hash Table Lookup', slug: 'hash-table', category: 'data-structures' },
      { name: 'Stack Push / Pop', slug: 'stack', category: 'data-structures' },
    ],
  },
  {
    notation: 'O(log n)',
    label: 'Logarithmic',
    color: '#2563eb',
    desc: 'Halves the search space each step. Blazingly fast even on inputs with millions of elements.',
    examples: [
      { name: 'Binary Search', slug: 'binary-search', category: 'searching' },
      { name: 'BST Operations', slug: 'bst', category: 'data-structures' },
    ],
  },
  {
    notation: 'O(n)',
    label: 'Linear',
    color: '#78716C',
    desc: 'Grows directly with input size. Acceptable for most real-world workloads.',
    examples: [
      { name: 'Linear Search', slug: 'linear-search', category: 'searching' },
      { name: 'BFS', slug: 'bfs', category: 'searching' },
      { name: 'DFS', slug: 'dfs', category: 'searching' },
    ],
  },
  {
    notation: 'O(n log n)',
    label: 'Linearithmic',
    color: '#b45309',
    desc: 'The theoretical lower bound for comparison sorts. Most efficient general-purpose sorts land here.',
    examples: [
      { name: 'Merge Sort', slug: 'merge-sort', category: 'sorting' },
      { name: 'Heap Sort', slug: 'heap-sort', category: 'sorting' },
      { name: 'Quick Sort (avg)', slug: 'quick-sort', category: 'sorting' },
    ],
  },
  {
    notation: 'O(n²)',
    label: 'Quadratic',
    color: '#dc2626',
    desc: 'Nested iteration. Fine for small datasets — painfully slow beyond ~1,000 elements.',
    examples: [
      { name: 'Bubble Sort', slug: 'bubble-sort', category: 'sorting' },
      { name: 'Selection Sort', slug: 'selection-sort', category: 'sorting' },
      { name: 'Insertion Sort', slug: 'insertion-sort', category: 'sorting' },
    ],
  },
  {
    notation: 'O(2ⁿ)',
    label: 'Exponential',
    color: '#9333ea',
    desc: 'Doubles with each additional element. Only practical for tiny inputs — think n < 20.',
    examples: [
      { name: 'Fibonacci (naïve)', slug: 'fibonacci', category: 'dp' },
      { name: 'Knapsack (brute)', slug: 'knapsack', category: 'dp' },
    ],
  },
]

type CurveKey = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(2ⁿ)'
const CURVE_KEYS: CurveKey[] = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)']
const CURVE_COLORS: Record<CurveKey, string> = {
  'O(1)': '#0f7142',
  'O(log n)': '#2563eb',
  'O(n)': '#78716C',
  'O(n log n)': '#b45309',
  'O(n²)': '#dc2626',
  'O(2ⁿ)': '#9333ea',
}

function cap(v: number, max = 30) {
  return Math.min(v, max)
}

const N = Array.from({ length: 20 }, (_, i) => i + 1)


function buildSparkData(notation: string) {
  return N.map(n => {
    let v: number
    if (notation === 'O(1)') v = 1
    else if (notation === 'O(log n)') v = Math.log2(n)
    else if (notation === 'O(n)') v = n
    else if (notation === 'O(n log n)') v = n * Math.log2(n)
    else if (notation === 'O(n²)') v = n * n
    else v = Math.pow(2, n)
    return { n, v: cap(v) }
  })
}

/* ─── Custom Tooltip ─────────────────────────────────────────────────── */

function CustomTooltip({
  active,
  payload,
  label,
  yMax = 30,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: number
  yMax?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#FDFCFA',
        border: '1.5px solid #E5DDD0',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(28,25,23,0.12)',
        fontFamily: 'var(--font-mono)',
        minWidth: '170px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#C8BDB0',
          marginBottom: '10px',
        }}
      >
        n = {label}
      </div>
      {payload.map(entry => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: entry.color }}>
            {entry.dataKey}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: entry.value >= yMax ? '#C8BDB0' : entry.color,
              fontStyle: entry.value >= yMax ? 'italic' : 'normal',
            }}
          >
            {entry.value >= yMax ? '≥ ' + yMax : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function BigOPage() {
  const [yMax, setYMax] = useState(30)
  const [inputVal, setInputVal] = useState('30')

  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = Math.max(1, Number(inputVal))
      if (!isNaN(parsed)) setYMax(parsed)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputVal])

  const chartData = N.map(n => ({
    n,
    'O(1)': cap(1, yMax),
    'O(log n)': parseFloat(cap(Math.log2(n), yMax).toFixed(2)),
    'O(n)': cap(n, yMax),
    'O(n log n)': parseFloat(cap(n * Math.log2(n), yMax).toFixed(2)),
    'O(n²)': cap(n * n, yMax),
    'O(2ⁿ)': cap(Math.pow(2, n), yMax),
  }))

  return (
    <div style={{ background: '#F5F1EB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '52px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '3px', height: '16px', background: '#5200FF', borderRadius: '2px' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#78716C',
              }}
            >
              Complexity Theory
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px,6vw,64px)',
              fontWeight: 900,
              color: '#1C1917',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: '14px',
            }}
          >
            Big-O Notation
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#78716C',
              fontSize: '14px',
              maxWidth: '500px',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
            }}
          >
            How algorithms scale with input size <em>n</em> — the lens every engineer needs.
          </p>
        </div>

        {/* ── Hero Chart ── */}
        <div
          style={{
            background: '#FDFCFA',
            border: '1.5px solid #E5DDD0',
            borderRadius: '20px',
            padding: '32px 28px 28px',
            marginBottom: '56px',
            boxShadow: '0 2px 20px rgba(28,25,23,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#1C1917',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                }}
              >
                Growth Curves
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#C8BDB0',
                  letterSpacing: '0.04em',
                }}
              >
                Operations vs. input size n = 1..20 — y-axis capped at {yMax} for readability
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
              <label
                htmlFor="ymax-input"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#C8BDB0',
                }}
              >
                y max
              </label>
              <input
                id="ymax-input"
                type="number"
                min="1"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                style={{
                  width: '80px',
                  height: '32px',
                  padding: '0 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1C1917',
                  background: '#FDFCFA',
                  border: '1.5px solid #E5DDD0',
                  borderRadius: '6px',
                  outline: 'none',
                  textAlign: 'right',
                }}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E5DDD0" />
              <XAxis
                dataKey="n"
                tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#78716C' }}
                axisLine={{ stroke: '#E5DDD0' }}
                tickLine={false}
                label={{
                  value: 'Input size (n)',
                  position: 'insideBottom',
                  offset: -12,
                  style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#C8BDB0' },
                }}
              />
              <YAxis
                tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#78716C' }}
                axisLine={{ stroke: '#E5DDD0' }}
                tickLine={false}
                domain={[0, yMax]}
                width={34}
              />
              <Tooltip content={<CustomTooltip yMax={yMax} />} />
              {CURVE_KEYS.map(key => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CURVE_COLORS[key]}
                  strokeWidth={2.5}
                  dot={false}
                  strokeDasharray={key === 'O(2ⁿ)' ? '7 3' : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #F0EDE8',
            }}
          >
            {COMPLEXITY_GUIDE.map(item => (
              <div
                key={item.notation}
                style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
              >
                <div
                  style={{
                    width: 22,
                    height: 0,
                    borderTop: item.notation === 'O(2ⁿ)'
                      ? `2.5px dashed ${item.color}`
                      : `2.5px solid ${item.color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.notation}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cards grid ── */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px,4vw,36px)',
            fontWeight: 900,
            color: '#1C1917',
            letterSpacing: '-0.025em',
            marginBottom: '20px',
          }}
        >
          The Six Classes
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '56px',
          }}
        >
          {COMPLEXITY_GUIDE.map((item, index) => (
            <motion.div
              key={item.notation}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
              style={{
                background: '#FDFCFA',
                border: '1.5px solid #E5DDD0',
                borderTop: `3px solid ${item.color}`,
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 6px rgba(28,25,23,0.04)',
              }}
            >
              {/* Top row: notation + sparkline */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: item.color,
                      lineHeight: 1,
                      marginBottom: '5px',
                    }}
                  >
                    {item.notation}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#1C1917',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                  </div>
                </div>

                {/* Mini sparkline */}
                <div style={{ width: 84, height: 52, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={buildSparkData(item.notation)}
                      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    >
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={item.color}
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray={item.notation === 'O(2ⁿ)' ? '5 2' : undefined}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  color: '#78716C',
                  fontSize: '13px',
                  lineHeight: 1.65,
                  margin: '0 0 16px 0',
                }}
              >
                {item.desc}
              </p>

              {/* Examples */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#C8BDB0',
                    marginBottom: '8px',
                  }}
                >
                  Examples in AlgoFlow
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {item.examples.map(ex => (
                    <Link
                      key={ex.slug}
                      href={`/visualizer/${ex.category}/${ex.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#78716C',
                        textDecoration: 'none',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color = item.color
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color = '#78716C'
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: item.color,
                          flexShrink: 0,
                          display: 'inline-block',
                        }}
                      />
                      {ex.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: '1px solid #E5DDD0',
            paddingTop: '24px',
            color: '#C8BDB0',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
          }}
        >
          Click any algorithm name to open its interactive visualizer.{' '}
          <Link
            href="/reference"
            style={{ color: '#5200FF', textDecoration: 'none', fontWeight: 700 }}
          >
            → Full Cheat Sheet
          </Link>
        </div>
      </div>
    </div>
  )
}
