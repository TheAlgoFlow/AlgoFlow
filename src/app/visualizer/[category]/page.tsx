'use client'

import { use } from 'react'
import { getCategory } from '@/algorithms/index'
import { CategoryPageTemplate } from '@/components/templates/CategoryPageTemplate'
import type { AlgorithmCategory } from '@/engine/types'

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)
  const algorithms = getCategory(category as AlgorithmCategory)

  return <CategoryPageTemplate category={category} algorithms={algorithms} />
}
