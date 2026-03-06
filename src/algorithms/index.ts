import type { AlgorithmModule, AlgorithmCategory } from '@/engine/types'

// Sorting
import * as bubbleSort from './sorting/bubble-sort'
import * as selectionSort from './sorting/selection-sort'
import * as insertionSort from './sorting/insertion-sort'
import * as mergeSort from './sorting/merge-sort'
import * as quickSort from './sorting/quick-sort'
import * as heapSort from './sorting/heap-sort'
import * as countingSort from './sorting/counting-sort'
import * as radixSort from './sorting/radix-sort'

// Searching
import * as linearSearch from './searching/linear-search'
import * as binarySearch from './searching/binary-search'
import * as bfs from './searching/bfs'
import * as dfs from './searching/dfs'

// Data Structures
import * as arrayOps from './data-structures/array-ops'
import * as linkedList from './data-structures/linked-list'
import * as stack from './data-structures/stack'
import * as queue from './data-structures/queue'
import * as binaryTree from './data-structures/binary-tree'
import * as bst from './data-structures/bst'
import * as hashTable from './data-structures/hash-table'
import * as minHeap from './data-structures/min-heap'

// Dynamic Programming
import * as fibonacci from './dp/fibonacci'
import * as knapsack from './dp/knapsack'
import * as lcs from './dp/lcs'
import * as lis from './dp/lis'
import * as coinChange from './dp/coin-change'

export const allModules: AlgorithmModule[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  linearSearch,
  binarySearch,
  bfs,
  dfs,
  arrayOps,
  linkedList,
  stack,
  queue,
  binaryTree,
  bst,
  hashTable,
  minHeap,
  fibonacci,
  knapsack,
  lcs,
  lis,
  coinChange,
]

export const algorithmRegistry = new Map<string, AlgorithmModule>(
  allModules.map(m => [m.meta.slug, m])
)

export const categorizedAlgorithms = new Map<AlgorithmCategory, AlgorithmModule[]>()

for (const mod of allModules) {
  const cat = mod.meta.category
  if (!categorizedAlgorithms.has(cat)) categorizedAlgorithms.set(cat, [])
  categorizedAlgorithms.get(cat)!.push(mod)
}

export const categories: { id: AlgorithmCategory; color: string }[] = [
  { id: 'sorting',          color: '#CCFF00' },
  { id: 'searching',        color: '#FF6B00' },
  { id: 'data-structures',  color: '#F900FF' },
  { id: 'dp',               color: '#5200FF' },
]

export function getAlgorithm(slug: string): AlgorithmModule | undefined {
  return algorithmRegistry.get(slug)
}

export function getCategory(id: AlgorithmCategory): AlgorithmModule[] {
  return categorizedAlgorithms.get(id) ?? []
}
