'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { getAlgorithm } from '@/algorithms/index'
import { useAlgorithmPlayer } from '@/hooks/useAlgorithmPlayer'
import { useI18n } from '@/i18n/context'
import { VisualizerPageTemplate } from '@/components/templates/VisualizerPageTemplate'

export default function VisualizerPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = use(params)
  const { t } = useI18n()
  const algo = getAlgorithm(slug)

  const [showCode, setShowCode] = useState(false)
  const [currentInput, setCurrentInput] = useState<unknown>(algo?.meta.defaultInput ?? null)

  const generator = useMemo(() => {
    if (!algo) return null
    const input = currentInput ?? algo.meta.defaultInput
    return () => algo.generator(input)
  }, [algo, currentInput])

  const player = useAlgorithmPlayer(generator)

  if (!algo) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: '#78716C', fontWeight: 500 }}>
        {t('viz.notFound')}{' '}
        <Link href="/" style={{ color: '#5200FF', fontWeight: 700 }}>{t('viz.goHome')}</Link>
      </div>
    )
  }

  return (
    <VisualizerPageTemplate
      algo={algo}
      category={category}
      slug={slug}
      player={player}
      showCode={showCode}
      onToggleCode={() => setShowCode(v => !v)}
      onInputChange={setCurrentInput}
    />
  )
}
