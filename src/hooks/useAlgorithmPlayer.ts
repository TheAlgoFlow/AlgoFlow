'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { AlgorithmFrame } from '@/engine/types'

export type PlayerState = {
  frames: AlgorithmFrame[]
  currentFrame: AlgorithmFrame | null
  frameIndex: number
  totalFrames: number
  isPlaying: boolean
  speed: number
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  reset: () => void
  setSpeed: (speed: number) => void
  seekTo: (index: number) => void
}

const SPEED_INTERVALS: Record<number, number> = {
  0.25: 2000,
  0.5: 1000,
  1: 500,
  2: 250,
  4: 125,
}

export function useAlgorithmPlayer(
  generator: (() => Generator<AlgorithmFrame>) | null
): PlayerState {
  const [frames, setFrames] = useState<AlgorithmFrame[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeedState] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Eagerly collect all frames when generator changes
  useEffect(() => {
    if (!generator) {
      setFrames([])
      setFrameIndex(0)
      setIsPlaying(false)
      return
    }

    const collected: AlgorithmFrame[] = []
    const gen = generator()
    let result = gen.next()
    while (!result.done) {
      collected.push(result.value)
      result = gen.next()
    }
    setFrames(collected)
    setFrameIndex(0)
    setIsPlaying(false)
  }, [generator])

  // Auto-play interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isPlaying || frames.length === 0) return

    const interval = SPEED_INTERVALS[speed] ?? 500

    intervalRef.current = setInterval(() => {
      setFrameIndex(prev => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, interval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, frames.length])

  const play = useCallback(() => {
    if (frames.length === 0) return
    if (frameIndex >= frames.length - 1) {
      setFrameIndex(0)
    }
    setIsPlaying(true)
  }, [frames.length, frameIndex])

  const pause = useCallback(() => setIsPlaying(false), [])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(prev => Math.min(prev + 1, frames.length - 1))
  }, [frames.length])

  const stepBack = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(0)
  }, [])

  const setSpeed = useCallback((s: number) => setSpeedState(s), [])

  const seekTo = useCallback(
    (index: number) => {
      setIsPlaying(false)
      setFrameIndex(Math.max(0, Math.min(index, frames.length - 1)))
    },
    [frames.length]
  )

  const currentFrame = frames[frameIndex] ?? null

  return {
    frames,
    currentFrame,
    frameIndex,
    totalFrames: frames.length,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    seekTo,
  }
}
