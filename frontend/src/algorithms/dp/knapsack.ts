import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'knapsack',
  category: 'dp',
  nameKey: 'algorithms.knapsack.name',
  descriptionKey: 'algorithms.knapsack.description',
  complexity: {
    time: { best: 'O(n·W)', avg: 'O(n·W)', worst: 'O(n·W)' },
    space: 'O(n·W)',
  },
  tags: ['optimization', 'subset-selection', 'classic'],
  defaultInput: {
    capacity: 6,
    items: [
      { name: 'A', weight: 2, value: 6 },
      { name: 'B', weight: 2, value: 10 },
      { name: 'C', weight: 3, value: 12 },
    ],
  },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/partition-equal-subset-sum/',                       title: '#416 Partition Equal Subset Sum',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/unbounded-knapsack/problem',               title: 'Unbounded Knapsack',               difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/partition-equal-subset-sum',                        title: 'Partition Equal Subset Sum',       difficulty: 'Medium' },
  ],
}

type KnapsackItem = { name: string; weight: number; value: number }
type KnapsackInput = { capacity: number; items: KnapsackItem[] }
type KnapsackState = {
  dp: number[][]
  items: KnapsackItem[]
  capacity: number
  current: [number, number] | null
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { capacity, items } = input as KnapsackInput
  const n = items.length

  // Initialize (n+1) x (capacity+1) table with zeros
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))

  // Yield initial state
  yield {
    state: { dp: dp.map(row => [...row]), items, capacity, current: null } as KnapsackState,
    highlights: [],
    message: 'algorithms.knapsack.steps.init',
    codeLine: 1,
    auxState: { n, capacity, fills: 0 },
  }

  let fills = 0
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]
    for (let w = 0; w <= capacity; w++) {
      // Highlight the current cell being computed
      yield {
        state: { dp: dp.map(row => [...row]), items, capacity, current: [i, w] } as KnapsackState,
        highlights: [{ index: `${i},${w}`, role: 'dp-current' }],
        message: 'algorithms.knapsack.steps.fill',
        codeLine: 4,
        auxState: { i, w, name: item.name, wt: item.weight, val: item.value, fills },
      }

      if (item.weight <= w) {
        // Can potentially include this item
        const withItem = dp[i - 1][w - item.weight] + item.value
        const withoutItem = dp[i - 1][w]

        fills++
        yield {
          state: { dp: dp.map(row => [...row]), items, capacity, current: [i, w] } as KnapsackState,
          highlights: [
            { index: `${i},${w}`, role: 'dp-current' },
            { index: `${i - 1},${w - item.weight}`, role: 'active' },
            { index: `${i - 1},${w}`, role: 'active' },
          ],
          message: 'algorithms.knapsack.steps.include',
          codeLine: 6,
          auxState: { i, w, name: item.name, wt: item.weight, val: item.value, withItem, withoutItem, fills, formula: `max(dp[${i-1}][${w}], dp[${i-1}][${w-item.weight}]+${item.value})` },
        }

        dp[i][w] = Math.max(withItem, withoutItem)
      } else {
        // Cannot include this item, carry forward without-item value
        dp[i][w] = dp[i - 1][w]

        fills++
        yield {
          state: { dp: dp.map(row => [...row]), items, capacity, current: [i, w] } as KnapsackState,
          highlights: [
            { index: `${i},${w}`, role: 'dp-current' },
            { index: `${i - 1},${w}`, role: 'active' },
          ],
          message: 'algorithms.knapsack.steps.exclude',
          codeLine: 8,
          auxState: { i, w, name: item.name, wt: item.weight, val: item.value, fills, formula: `dp[${i}][${w}]=dp[${i-1}][${w}]` },
        }
      }
    }
  }

  yield {
    state: { dp: dp.map(row => [...row]), items, capacity, current: null } as KnapsackState,
    highlights: [{ index: `${n},${capacity}`, role: 'dp-fill' }],
    message: 'algorithms.knapsack.steps.done',
    codeLine: 10,
    auxState: { result: dp[n][capacity], fills },
  }
}

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function knapsack(capacity: number, weights: number[], values: number[]): number {' },
    { line: 2, code: '  const n = weights.length' },
    { line: 3, code: '  const dp = Array.from({ length: n+1 }, () => Array(capacity+1).fill(0))' },
    { line: 4, code: '  for (let i = 1; i <= n; i++) {' },
    { line: 5, code: '    for (let w = 0; w <= capacity; w++) {' },
    { line: 6, code: '      if (weights[i-1] <= w) {' },
    { line: 7, code: '        dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])' },
    { line: 8, code: '      } else {' },
    { line: 9, code: '        dp[i][w] = dp[i-1][w]' },
    { line: 10, code: '      }' },
    { line: 11, code: '    }' },
    { line: 12, code: '  }' },
    { line: 13, code: '  return dp[n][capacity]' },
    { line: 14, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'int knapsack(int capacity, int weights[], int values[], int n) {' },
    { line: 2, code: '    int dp[n+1][capacity+1];' },
    { line: 3, code: '    for (int i = 0; i <= n; i++) {' },
    { line: 4, code: '        for (int w = 0; w <= capacity; w++) {' },
    { line: 5, code: '            if (i == 0 || w == 0) { dp[i][w] = 0; continue; }' },
    { line: 6, code: '            if (weights[i-1] <= w)' },
    { line: 7, code: '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);' },
    { line: 8, code: '            else' },
    { line: 9, code: '                dp[i][w] = dp[i-1][w];' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[n][capacity];' },
    { line: 13, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'int knapsack(int capacity, int[] weights, int[] values) {' },
    { line: 2, code: '    int n = weights.Length;' },
    { line: 3, code: '    int[][] dp = new int[n + 1][capacity + 1];' },
    { line: 4, code: '    for (int i = 1; i <= n; i++) {' },
    { line: 5, code: '        for (int w = 0; w <= capacity; w++) {' },
    { line: 6, code: '            if (weights[i-1] <= w)' },
    { line: 7, code: '                dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);' },
    { line: 8, code: '            else' },
    { line: 9, code: '                dp[i][w] = dp[i-1][w];' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[n][capacity];' },
    { line: 13, code: '}' },
  ],

  python: [
    { line: 1, code: 'def knapsack(capacity, weights, values):' },
    { line: 2, code: '    n = len(weights)' },
    { line: 3, code: '    dp = [[0] * (capacity + 1) for _ in range(n + 1)]' },
    { line: 4, code: '    for i in range(1, n + 1):' },
    { line: 5, code: '        for w in range(capacity + 1):' },
    { line: 6, code: '            if weights[i-1] <= w:' },
    { line: 7, code: '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])' },
    { line: 8, code: '            else:' },
    { line: 9, code: '                dp[i][w] = dp[i-1][w]' },
    { line: 10, code: '    return dp[n][capacity]' },
  ],
  c: [
    { line: 1, code: 'int knapsack(int capacity, int weights[], int values[], int n) {' },
    { line: 2, code: '    int dp[n+1][capacity+1];' },
    { line: 3, code: '    for (int i = 0; i <= n; i++) {' },
    { line: 4, code: '        for (int w = 0; w <= capacity; w++) {' },
    { line: 5, code: '            if (i == 0 || w == 0) { dp[i][w] = 0; continue; }' },
    { line: 6, code: '            if (weights[i-1] <= w)' },
    { line: 7, code: '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);' },
    { line: 8, code: '            else' },
    { line: 9, code: '                dp[i][w] = dp[i-1][w];' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[n][capacity];' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1, code: 'int knapsack(int capacity, int[] weights, int[] values) {' },
    { line: 2, code: '    int n = weights.length;' },
    { line: 3, code: '    int[][] dp = new int[n + 1][capacity + 1];' },
    { line: 4, code: '    for (int i = 1; i <= n; i++) {' },
    { line: 5, code: '        for (int w = 0; w <= capacity; w++) {' },
    { line: 6, code: '            if (weights[i-1] <= w)' },
    { line: 7, code: '                dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);' },
    { line: 8, code: '            else' },
    { line: 9, code: '                dp[i][w] = dp[i-1][w];' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[n][capacity];' },
    { line: 13, code: '}' },
  ],
  go: [
    { line: 1, code: 'func knapsack(capacity int, weights, values []int) int {' },
    { line: 2, code: '    n := len(weights)' },
    { line: 3, code: '    dp := make([][]int, n+1)' },
    { line: 4, code: '    for i := range dp { dp[i] = make([]int, capacity+1) }' },
    { line: 5, code: '    for i := 1; i <= n; i++ {' },
    { line: 6, code: '        for w := 0; w <= capacity; w++ {' },
    { line: 7, code: '            if weights[i-1] <= w {' },
    { line: 8, code: '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]]+values[i-1])' },
    { line: 9, code: '            } else {' },
    { line: 10, code: '                dp[i][w] = dp[i-1][w]' },
    { line: 11, code: '            }' },
    { line: 12, code: '        }' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return dp[n][capacity]' },
    { line: 15, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function knapsack(capacity, weights, values) {' },
    { line: 2, code: '  const n = weights.length' },
    { line: 3, code: '  const dp = Array.from({ length: n+1 }, () => Array(capacity+1).fill(0))' },
    { line: 4, code: '  for (let i = 1; i <= n; i++) {' },
    { line: 5, code: '    for (let w = 0; w <= capacity; w++) {' },
    { line: 6, code: '      if (weights[i-1] <= w) {' },
    { line: 7, code: '        dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])' },
    { line: 8, code: '      } else {' },
    { line: 9, code: '        dp[i][w] = dp[i-1][w]' },
    { line: 10, code: '      }' },
    { line: 11, code: '    }' },
    { line: 12, code: '  }' },
    { line: 13, code: '  return dp[n][capacity]' },
    { line: 14, code: '}' },
  ],
}
