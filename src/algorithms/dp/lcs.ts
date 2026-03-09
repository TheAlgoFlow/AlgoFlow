import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'lcs',
  category: 'dp',
  nameKey: 'algorithms.lcs.name',
  descriptionKey: 'algorithms.lcs.description',
  complexity: {
    time: { best: 'O(m·n)', avg: 'O(m·n)', worst: 'O(m·n)' },
    space: 'O(m·n)',
  },
  tags: ['string', 'subsequence', 'diff'],
  defaultInput: { s1: 'ABCBDAB', s2: 'BDCAB' },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/longest-common-subsequence/',                                                             title: '#1143 Longest Common Subsequence', difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/dynamic-programming-classics-the-longest-common-subsequence/problem',             title: 'Longest Common Subsequence',       difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/longest-common-subsequence',                                                               title: 'Longest Common Subsequence',       difficulty: 'Medium' },
  ],
}

type LCSInput = { s1: string; s2: string }
type LCSState = {
  dp: number[][]
  s1: string
  s2: string
  current: [number, number] | null
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { s1, s2 } = input as LCSInput
  const m = s1.length
  const n = s2.length

  // Initialize (m+1) x (n+1) table with zeros
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  // Yield initial state
  yield {
    state: { dp: dp.map(row => [...row]), s1, s2, current: null } as LCSState,
    highlights: [],
    message: 'algorithms.lcs.steps.init',
    codeLine: 1,
    auxState: { m, n, fills: 0, matches: 0 },
  }

  let fills = 0
  let matches = 0
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        // Characters match: extend LCS from diagonal
        dp[i][j] = dp[i - 1][j - 1] + 1
        fills++
        matches++
        yield {
          state: { dp: dp.map(row => [...row]), s1, s2, current: [i, j] } as LCSState,
          highlights: [
            { index: `${i},${j}`, role: 'dp-current' },
            { index: `${i - 1},${j - 1}`, role: 'active' },
          ],
          message: 'algorithms.lcs.steps.match',
          codeLine: 5,
          auxState: { c: s1[i - 1], i, j, v: dp[i][j], fills, matches, formula: `dp[${i}][${j}]=dp[${i-1}][${j-1}]+1` },
        }
      } else {
        // Characters differ: take max of top or left
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        fills++
        yield {
          state: { dp: dp.map(row => [...row]), s1, s2, current: [i, j] } as LCSState,
          highlights: [
            { index: `${i},${j}`, role: 'dp-current' },
            { index: `${i - 1},${j}`, role: 'active' },
            { index: `${i},${j - 1}`, role: 'active' },
          ],
          message: 'algorithms.lcs.steps.noMatch',
          codeLine: 8,
          auxState: { i, j, a: dp[i - 1][j], b: dp[i][j - 1], v: dp[i][j], fills, matches, formula: `dp[${i}][${j}]=max(${dp[i-1][j]},${dp[i][j-1]})` },
        }
      }
    }
  }

  yield {
    state: { dp: dp.map(row => [...row]), s1, s2, current: null } as LCSState,
    highlights: [{ index: `${m},${n}`, role: 'dp-fill' }],
    message: 'algorithms.lcs.steps.done',
    codeLine: 10,
    auxState: { v: dp[m][n], fills, matches },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function lcs(s1: string, s2: string): number {' },
    { line: 2, code: '  const m = s1.length, n = s2.length' },
    { line: 3, code: '  const dp = Array.from({ length: m+1 }, () => Array(n+1).fill(0))' },
    { line: 4, code: '  for (let i = 1; i <= m; i++) {' },
    { line: 5, code: '    for (let j = 1; j <= n; j++) {' },
    { line: 6, code: '      if (s1[i-1] === s2[j-1])' },
    { line: 7, code: '        dp[i][j] = dp[i-1][j-1] + 1' },
    { line: 8, code: '      else' },
    { line: 9, code: '        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])' },
    { line: 10, code: '    }' },
    { line: 11, code: '  }' },
    { line: 12, code: '  return dp[m][n]' },
    { line: 13, code: '}' },
  ],
  python: [
    { line: 1, code: 'def lcs(s1: str, s2: str) -> int:' },
    { line: 2, code: '    m, n = len(s1), len(s2)' },
    { line: 3, code: '    dp = [[0] * (n + 1) for _ in range(m + 1)]' },
    { line: 4, code: '    for i in range(1, m + 1):' },
    { line: 5, code: '        for j in range(1, n + 1):' },
    { line: 6, code: '            if s1[i-1] == s2[j-1]:' },
    { line: 7, code: '                dp[i][j] = dp[i-1][j-1] + 1' },
    { line: 8, code: '            else:' },
    { line: 9, code: '                dp[i][j] = max(dp[i-1][j], dp[i][j-1])' },
    { line: 10, code: '    return dp[m][n]' },
  ],
  c: [
    { line: 1, code: 'int lcs(char *s1, char *s2, int m, int n) {' },
    { line: 2, code: '    int dp[m+1][n+1];' },
    { line: 3, code: '    for (int i = 0; i <= m; i++)' },
    { line: 4, code: '        for (int j = 0; j <= n; j++) dp[i][j] = 0;' },
    { line: 5, code: '    for (int i = 1; i <= m; i++) {' },
    { line: 6, code: '        for (int j = 1; j <= n; j++) {' },
    { line: 7, code: '            if (s1[i-1] == s2[j-1])' },
    { line: 8, code: '                dp[i][j] = dp[i-1][j-1] + 1;' },
    { line: 9, code: '            else' },
    { line: 10, code: '                dp[i][j] = dp[i-1][j] > dp[i][j-1] ? dp[i-1][j] : dp[i][j-1];' },
    { line: 11, code: '        }' },
    { line: 12, code: '    }' },
    { line: 13, code: '    return dp[m][n];' },
    { line: 14, code: '}' },
  ],
  java: [
    { line: 1, code: 'int lcs(String s1, String s2) {' },
    { line: 2, code: '    int m = s1.length(), n = s2.length();' },
    { line: 3, code: '    int[][] dp = new int[m + 1][n + 1];' },
    { line: 4, code: '    for (int i = 1; i <= m; i++) {' },
    { line: 5, code: '        for (int j = 1; j <= n; j++) {' },
    { line: 6, code: '            if (s1.charAt(i-1) == s2.charAt(j-1))' },
    { line: 7, code: '                dp[i][j] = dp[i-1][j-1] + 1;' },
    { line: 8, code: '            else' },
    { line: 9, code: '                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[m][n];' },
    { line: 13, code: '}' },
  ],
  go: [
    { line: 1, code: 'func lcs(s1, s2 string) int {' },
    { line: 2, code: '    m, n := len(s1), len(s2)' },
    { line: 3, code: '    dp := make([][]int, m+1)' },
    { line: 4, code: '    for i := range dp { dp[i] = make([]int, n+1) }' },
    { line: 5, code: '    for i := 1; i <= m; i++ {' },
    { line: 6, code: '        for j := 1; j <= n; j++ {' },
    { line: 7, code: '            if s1[i-1] == s2[j-1] {' },
    { line: 8, code: '                dp[i][j] = dp[i-1][j-1] + 1' },
    { line: 9, code: '            } else if dp[i-1][j] > dp[i][j-1] {' },
    { line: 10, code: '                dp[i][j] = dp[i-1][j]' },
    { line: 11, code: '            } else {' },
    { line: 12, code: '                dp[i][j] = dp[i][j-1]' },
    { line: 13, code: '            }' },
    { line: 14, code: '        }' },
    { line: 15, code: '    }' },
    { line: 16, code: '    return dp[m][n]' },
    { line: 17, code: '}' },
  ],
}
