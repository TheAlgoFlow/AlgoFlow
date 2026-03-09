import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'fibonacci',
  category: 'dp',
  nameKey: 'algorithms.fibonacci.name',
  descriptionKey: 'algorithms.fibonacci.description',
  complexity: {
    time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  tags: ['memoization', 'tabulation', 'overlapping-subproblems'],
  defaultInput: { n: 8 },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/fibonacci-number/',                              title: '#509 Fibonacci Number',   difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/ctci-fibonacci-numbers/problem',        title: 'Fibonacci Numbers',       difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/climbing-stairs',                                 title: 'Climbing Stairs',         difficulty: 'Easy' },
  ],
}

type FibInput = { n: number }
type FibState = { dp: (number | null)[]; n: number }

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { n } = input as FibInput

  const dp: (number | null)[] = Array(n + 1).fill(null)

  // Base cases
  let fills = 0
  dp[0] = 0
  fills++
  yield {
    state: { dp: [...dp], n } as FibState,
    highlights: [{ index: 0, role: 'dp-current' }],
    message: 'algorithms.fibonacci.steps.fill',
    codeLine: 2,
    auxState: { n: 0, v: 0, fills, formula: 'dp[0] = 0' },
  }

  if (n >= 1) {
    dp[1] = 1
    fills++
    yield {
      state: { dp: [...dp], n } as FibState,
      highlights: [{ index: 1, role: 'dp-current' }],
      message: 'algorithms.fibonacci.steps.fill',
      codeLine: 3,
      auxState: { n: 1, v: 1, fills, formula: 'dp[1] = 1' },
    }
  }

  // Fill dp[i] = dp[i-1] + dp[i-2]
  for (let i = 2; i <= n; i++) {
    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number)
    fills++
    yield {
      state: { dp: [...dp], n } as FibState,
      highlights: [
        { index: i, role: 'dp-current' },
        { index: i - 1, role: 'active' },
        { index: i - 2, role: 'active' },
      ],
      message: 'algorithms.fibonacci.steps.fill',
      codeLine: 5,
      auxState: { n: i, a: i - 1, b: i - 2, v: dp[i], fills, formula: `dp[${i}] = dp[${i-1}] + dp[${i-2}]` },
    }
  }

  yield {
    state: { dp: [...dp], n } as FibState,
    highlights: Array.from({ length: n + 1 }, (_, idx) => ({ index: idx, role: 'dp-fill' as const })),
    message: 'algorithms.fibonacci.steps.done',
    codeLine: 7,
    auxState: { n: input === null ? n : (input as FibInput).n, v: dp[n], fills },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function fibonacci(n: number): number {' },
    { line: 2, code: '  const dp: number[] = [0, 1]' },
    { line: 3, code: '  for (let i = 2; i <= n; i++) {' },
    { line: 4, code: '    dp[i] = dp[i - 1] + dp[i - 2]' },
    { line: 5, code: '  }' },
    { line: 6, code: '  return dp[n]' },
    { line: 7, code: '}' },
  ],
  python: [
    { line: 1, code: 'def fibonacci(n: int) -> int:' },
    { line: 2, code: '    dp = [0, 1]' },
    { line: 3, code: '    for i in range(2, n + 1):' },
    { line: 4, code: '        dp.append(dp[i - 1] + dp[i - 2])' },
    { line: 5, code: '    return dp[n]' },
  ],
  c: [
    { line: 1, code: 'int fibonacci(int n) {' },
    { line: 2, code: '    int dp[n + 1];' },
    { line: 3, code: '    dp[0] = 0; dp[1] = 1;' },
    { line: 4, code: '    for (int i = 2; i <= n; i++) {' },
    { line: 5, code: '        dp[i] = dp[i - 1] + dp[i - 2];' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return dp[n];' },
    { line: 8, code: '}' },
  ],
  java: [
    { line: 1, code: 'int fibonacci(int n) {' },
    { line: 2, code: '    int[] dp = new int[n + 1];' },
    { line: 3, code: '    dp[0] = 0; dp[1] = 1;' },
    { line: 4, code: '    for (int i = 2; i <= n; i++) {' },
    { line: 5, code: '        dp[i] = dp[i - 1] + dp[i - 2];' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return dp[n];' },
    { line: 8, code: '}' },
  ],
  go: [
    { line: 1, code: 'func fibonacci(n int) int {' },
    { line: 2, code: '    dp := make([]int, n+1)' },
    { line: 3, code: '    dp[0], dp[1] = 0, 1' },
    { line: 4, code: '    for i := 2; i <= n; i++ {' },
    { line: 5, code: '        dp[i] = dp[i-1] + dp[i-2]' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return dp[n]' },
    { line: 8, code: '}' },
  ],
}
