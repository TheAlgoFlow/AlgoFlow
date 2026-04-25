'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Play, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, Terminal,
} from 'lucide-react'
import { useCodeExecution } from '@/hooks/useCodeExecution'
import { MemoryView } from '@/components/playground/MemoryView'
import { DEFAULT_CODE } from '@/components/playground/CodeEditor'
import type { Language } from '@/types/execution'

const CodeEditor = dynamic(
  () => import('@/components/playground/CodeEditor').then(m => ({ default: m.CodeEditor })),
  { ssr: false, loading: () => <div style={{ height: '100%', background: 'var(--bg-surface)' }} /> },
)

const LANGUAGES: { id: Language; label: string; color: string }[] = [
  { id: 'c',          label: 'C',          color: '#A8B9CC' },
  { id: 'cpp',        label: 'C++',        color: '#00599C' },
  { id: 'csharp',     label: 'C#',         color: '#239120' },
  { id: 'java',       label: 'Java',       color: '#ED8B00' },
  { id: 'python',     label: 'Python',     color: '#3776AB' },
  { id: 'go',         label: 'Go',         color: '#00ADD8' },
  { id: 'javascript', label: 'JavaScript', color: '#b89900' },
  { id: 'typescript', label: 'TypeScript', color: '#3178C6' },
]

const BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '26px', height: '26px', borderRadius: '6px',
  border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
  color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
}

export default function PlaygroundPage() {
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode]         = useState(DEFAULT_CODE['python'])

  const { run, reset, status, errorMsg, step, stepIndex, totalSteps, next, prev, goTo } = useCodeExecution()

  function handleLangChange(lang: Language) {
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang])
    reset()
  }

  const isRunning = status === 'running'
  const hasDone   = status === 'done' && totalSteps > 0

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 16px', height: '50px', flexShrink: 0,
        borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.02em', flexShrink: 0 }}>
          Playground
        </span>

        {/* language pills */}
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => handleLangChange(l.id)} style={{
              padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700,
              fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.1s',
              border: language === l.id ? `1.5px solid ${l.color}` : '1.5px solid var(--border)',
              background: language === l.id ? `${l.color}18` : 'transparent',
              color: language === l.id ? l.color : 'var(--text-muted)',
            }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* run */}
        <button onClick={() => run(code, language)} disabled={isRunning} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '8px', border: 'none', flexShrink: 0,
          background: isRunning ? 'var(--bg-muted)' : '#5200FF',
          color: isRunning ? 'var(--text-muted)' : '#fff',
          fontSize: '13px', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          {isRunning
            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Executando…</>
            : <><Play size={13} fill="currentColor" /> Run &amp; Trace</>
          }
        </button>
      </div>

      {/* ── body: editor | memory + output ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', overflow: 'hidden' }}>

        {/* ── LEFT: editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>

          {/* step controls */}
          {hasDone && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px', flexShrink: 0,
              borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
            }}>
              <button onClick={() => goTo(0)}             style={BTN} disabled={stepIndex === 0}><SkipBack     size={12} /></button>
              <button onClick={prev}                       style={BTN} disabled={stepIndex === 0}><ChevronLeft  size={12} /></button>
              <input type="range" min={0} max={totalSteps - 1} value={stepIndex}
                onChange={e => goTo(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#5200FF', cursor: 'pointer' }} />
              <button onClick={next}                       style={BTN} disabled={stepIndex >= totalSteps - 1}><ChevronRight size={12} /></button>
              <button onClick={() => goTo(totalSteps - 1)} style={BTN} disabled={stepIndex >= totalSteps - 1}><SkipForward  size={12} /></button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>
          )}

          {/* step banner */}
          {hasDone && step && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '4px 12px', flexShrink: 0,
              borderBottom: '1px solid var(--border)',
              background: step.event === 'exception' ? 'rgba(239,68,68,0.07)' : 'rgba(82,0,255,0.04)',
            }}>
              {step.event === 'exception'
                ? <AlertCircle size={12} color="#EF4444" />
                : <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5200FF', flexShrink: 0 }} />
              }
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {step.event === 'exception'
                  ? step.exception_msg
                  : `line ${step.line} — ${step.event} in ${step.func_name}()`
                }
              </span>
            </div>
          )}

          {/* network/server error */}
          {status === 'error' && errorMsg && (
            <div style={{
              display: 'flex', gap: '7px', alignItems: 'flex-start',
              padding: '7px 12px', flexShrink: 0,
              background: 'rgba(239,68,68,0.07)', borderBottom: '1px solid rgba(239,68,68,0.2)',
            }}>
              <AlertCircle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#EF4444' }}>{errorMsg}</span>
            </div>
          )}

          {/* monaco */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CodeEditor language={language} value={code} onChange={setCode} highlightLine={step?.line} />
          </div>
        </div>

        {/* ── RIGHT: memory + output ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* memory panel */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
            {!hasDone && !isRunning && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-faint)' }}>
                <Play size={26} strokeWidth={1.5} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textAlign: 'center', lineHeight: 1.6 }}>
                  Cole seu código,<br />clique em <strong>Run &amp; Trace</strong><br />e explore a memória passo a passo
                </p>
              </div>
            )}
            {isRunning && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            {hasDone && step && <MemoryView step={step} />}
          </div>

          {/* output strip — always visible when running/done */}
          {(hasDone || isRunning) && (
            <div style={{
              flexShrink: 0,
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-card)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px 4px',
                borderBottom: '1px solid var(--border)',
              }}>
                <Terminal size={11} color="var(--text-faint)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Output
                </span>
              </div>
              <div style={{
                padding: '7px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text)',
                maxHeight: '88px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.55,
              }}>
                {step?.stdout
                  ? step.stdout
                  : <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>(sem output ainda)</span>
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
