'use client'

import { useState, useCallback } from 'react'
import type { Language, ExecutionResult, TraceStep } from '@/types/execution'

function resolveExecuteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  const base = raw && raw.length > 0 ? raw.replace(/\/+$/, '') : 'http://localhost:8000'
  return base.endsWith('/execute') ? base : `${base}/execute`
}

const EXECUTE_URL = resolveExecuteUrl()

type Status = 'idle' | 'running' | 'done' | 'error'

export function useCodeExecution() {
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const run = useCallback(async (code: string, language: Language) => {
    setStatus('running')
    setResult(null)
    setErrorMsg(null)
    setStepIndex(0)

    try {
      const res = await fetch(EXECUTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? `Server error ${res.status} at ${EXECUTE_URL}`)
      }

      const data: ExecutionResult = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setStatus('done')
      setStepIndex(0)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }, [])

  const step = result?.trace[stepIndex] ?? null
  const totalSteps = result?.trace.length ?? 0

  const goTo = useCallback((i: number) => {
    setStepIndex(Math.max(0, Math.min(i, (result?.trace.length ?? 1) - 1)))
  }, [result])

  const next = useCallback(() => goTo(stepIndex + 1), [stepIndex, goTo])
  const prev = useCallback(() => goTo(stepIndex - 1), [stepIndex, goTo])
  const reset = useCallback(() => { setResult(null); setStatus('idle'); setStepIndex(0); setErrorMsg(null) }, [])

  return { run, reset, status, errorMsg, result, step, stepIndex, totalSteps, goTo, next, prev }
}
