import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'lis',
  category: 'dp',
  nameKey: 'algorithms.lis.name',
  descriptionKey: 'algorithms.lis.description',
  complexity: {
    time: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
    space: 'O(n)',
  },
  tags: ['subsequence', 'patience-sort', 'ordering'],
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/longest-increasing-subsequence/',                   title: '#300 Longest Increasing Subsequence',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/longest-increasing-subsequent/problem',     title: 'Longest Increasing Subsequence',       difficulty: 'Hard' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/longest-increasing-subsequence',                     title: 'Longest Increasing Subsequence',       difficulty: 'Medium' },
  ],
}

type LISState = { array: number[]; dp: number[] }

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const array = [...(input as number[])]
  const n = array.length

  // dp[i] = length of LIS ending at index i, initialized to 1
  const dp: number[] = Array(n).fill(1)

  yield {
    state: { array: [...array], dp: [...dp] } as LISState,
    highlights: [],
    message: 'algorithms.lis.steps.init',
    codeLine: 1,
    auxState: { n },
  }

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // Show comparison between j and i
      yield {
        state: { array: [...array], dp: [...dp] } as LISState,
        highlights: [
          { index: i, role: 'dp-current' },
          { index: j, role: 'compare' },
        ],
        message: 'algorithms.lis.steps.check',
        codeLine: 4,
        auxState: { i, j, arrI: array[i], arrJ: array[j] },
      }

      if (array[j] < array[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1
        yield {
          state: { array: [...array], dp: [...dp] } as LISState,
          highlights: [
            { index: i, role: 'dp-current' },
            { index: j, role: 'active' },
          ],
          message: 'algorithms.lis.steps.update',
          codeLine: 5,
          auxState: { i, v: dp[i], x: array[i] },
        }
      }
    }
  }

  const maxLen = Math.max(...dp)

  yield {
    state: { array: [...array], dp: [...dp] } as LISState,
    highlights: dp.map((val, idx) => ({
      index: idx,
      role: val === maxLen ? ('dp-fill' as const) : ('dp-current' as const),
    })),
    message: 'algorithms.lis.steps.done',
    codeLine: 8,
    auxState: { v: maxLen },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function lis(arr: number[]): number {' },
    { line: 2, code: '  const dp = Array(arr.length).fill(1)' },
    { line: 3, code: '  for (let i = 1; i < arr.length; i++) {' },
    { line: 4, code: '    for (let j = 0; j < i; j++) {' },
    { line: 5, code: '      if (arr[j] < arr[i])' },
    { line: 6, code: '        dp[i] = Math.max(dp[i], dp[j] + 1)' },
    { line: 7, code: '    }' },
    { line: 8, code: '  }' },
    { line: 9, code: '  return Math.max(...dp)' },
    { line: 10, code: '}' },
  ],
  python: [
    { line: 1, code: 'def lis(arr: list[int]) -> int:' },
    { line: 2, code: '    n = len(arr)' },
    { line: 3, code: '    dp = [1] * n' },
    { line: 4, code: '    for i in range(1, n):' },
    { line: 5, code: '        for j in range(i):' },
    { line: 6, code: '            if arr[j] < arr[i]:' },
    { line: 7, code: '                dp[i] = max(dp[i], dp[j] + 1)' },
    { line: 8, code: '    return max(dp)' },
  ],
  c: [
    { line: 1, code: 'int lis(int arr[], int n) {' },
    { line: 2, code: '    int dp[n];' },
    { line: 3, code: '    for (int k = 0; k < n; k++) dp[k] = 1;' },
    { line: 4, code: '    for (int i = 1; i < n; i++) {' },
    { line: 5, code: '        for (int j = 0; j < i; j++) {' },
    { line: 6, code: '            if (arr[j] < arr[i] && dp[j] + 1 > dp[i])' },
    { line: 7, code: '                dp[i] = dp[j] + 1;' },
    { line: 8, code: '        }' },
    { line: 9, code: '    }' },
    { line: 10, code: '    int max = 0;' },
    { line: 11, code: '    for (int k = 0; k < n; k++) if (dp[k] > max) max = dp[k];' },
    { line: 12, code: '    return max;' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1, code: 'int lis(int[] arr) {' },
    { line: 2, code: '    int n = arr.length;' },
    { line: 3, code: '    int[] dp = new int[n];' },
    { line: 4, code: '    Arrays.fill(dp, 1);' },
    { line: 5, code: '    for (int i = 1; i < n; i++) {' },
    { line: 6, code: '        for (int j = 0; j < i; j++) {' },
    { line: 7, code: '            if (arr[j] < arr[i])' },
    { line: 8, code: '                dp[i] = Math.max(dp[i], dp[j] + 1);' },
    { line: 9, code: '        }' },
    { line: 10, code: '    }' },
    { line: 11, code: '    return Arrays.stream(dp).max().getAsInt();' },
    { line: 12, code: '}' },
  ],
  go: [
    { line: 1, code: 'func lis(arr []int) int {' },
    { line: 2, code: '    n := len(arr)' },
    { line: 3, code: '    dp := make([]int, n)' },
    { line: 4, code: '    for i := range dp { dp[i] = 1 }' },
    { line: 5, code: '    for i := 1; i < n; i++ {' },
    { line: 6, code: '        for j := 0; j < i; j++ {' },
    { line: 7, code: '            if arr[j] < arr[i] && dp[j]+1 > dp[i] {' },
    { line: 8, code: '                dp[i] = dp[j] + 1' },
    { line: 9, code: '            }' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    best := 0' },
    { line: 13, code: '    for _, v := range dp { if v > best { best = v } }' },
    { line: 14, code: '    return best' },
    { line: 15, code: '}' },
  ],
}
