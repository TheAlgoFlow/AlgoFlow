import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'coin-change',
  category: 'dp',
  nameKey: 'algorithms.coinChange.name',
  descriptionKey: 'algorithms.coinChange.description',
  complexity: {
    time: { best: 'O(amount·n)', avg: 'O(amount·n)', worst: 'O(amount·n)' },
    space: 'O(amount)',
  },
  tags: ['optimization', 'minimum-coins', 'unbounded'],
  defaultInput: { coins: [1, 5, 6, 9], amount: 11 },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/coin-change/',                             title: '#322 Coin Change',   difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/coin-change/problem',              title: 'The Coin Change Problem', difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/coin-change',                               title: 'Coin Change',        difficulty: 'Medium' },
  ],
}

type CoinChangeInput = { coins: number[]; amount: number }
type CoinChangeState = {
  dp: (number | null)[]
  coins: number[]
  amount: number
  current: number | null
}

const INF = Infinity

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { coins, amount } = input as CoinChangeInput

  // dp[0] = 0, dp[i] = Infinity means not reachable yet
  const dp: number[] = Array(amount + 1).fill(INF)
  dp[0] = 0

  // Yield initial state - show dp[0] = 0 base case
  yield {
    state: { dp: dp.map(v => (v === INF ? null : v)), coins, amount, current: null } as CoinChangeState,
    highlights: [{ index: 0, role: 'dp-fill' }],
    message: 'algorithms.coinChange.steps.init',
    codeLine: 1,
    auxState: { amount, fills: 0 },
  }

  let fills = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c > a) {
        // Coin value exceeds current amount — skip
        yield {
          state: { dp: dp.map(v => (v === INF ? null : v)), coins, amount, current: a } as CoinChangeState,
          highlights: [{ index: a, role: 'dp-current' }],
          message: 'algorithms.coinChange.steps.skip',
          codeLine: 4,
          auxState: { c, a, fills },
        }
        continue
      }

      // Coin is usable
      yield {
        state: { dp: dp.map(v => (v === INF ? null : v)), coins, amount, current: a } as CoinChangeState,
        highlights: [
          { index: a, role: 'dp-current' },
          { index: a - c, role: 'active' },
        ],
        message: 'algorithms.coinChange.steps.coin',
        codeLine: 5,
        auxState: { c, a, fills },
      }

      const remainder = a - c
      if (dp[remainder] !== INF && dp[remainder] + 1 < dp[a]) {
        const prev = dp[a]
        dp[a] = dp[remainder] + 1
        fills++
        yield {
          state: { dp: dp.map(v => (v === INF ? null : v)), coins, amount, current: a } as CoinChangeState,
          highlights: [
            { index: a, role: 'dp-current' },
            { index: remainder, role: 'active' },
          ],
          message: 'algorithms.coinChange.steps.update',
          codeLine: 6,
          auxState: {
            a,
            prev: prev === INF ? null : prev,
            rem: remainder,
            v: dp[a],
            fills,
            formula: `dp[${a}] = dp[${remainder}]+1`,
          },
        }
      }
    }
  }

  yield {
    state: {
      dp: dp.map(v => (v === INF ? null : v)),
      coins,
      amount,
      current: null,
    } as CoinChangeState,
    highlights: [{ index: amount, role: 'dp-fill' }],
    message: 'algorithms.coinChange.steps.done',
    codeLine: 9,
    auxState: {
      amount: (input as CoinChangeInput).amount,
      v: dp[amount] === INF ? -1 : dp[amount],
      fills,
    },
  }
}

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function coinChange(coins: number[], amount: number): number {' },
    { line: 2, code: '  const dp = Array(amount + 1).fill(Infinity)' },
    { line: 3, code: '  dp[0] = 0' },
    { line: 4, code: '  for (let a = 1; a <= amount; a++) {' },
    { line: 5, code: '    for (const c of coins) {' },
    { line: 6, code: '      if (c <= a && dp[a - c] + 1 < dp[a])' },
    { line: 7, code: '        dp[a] = dp[a - c] + 1' },
    { line: 8, code: '    }' },
    { line: 9, code: '  }' },
    { line: 10, code: '  return dp[amount] === Infinity ? -1 : dp[amount]' },
    { line: 11, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'int coinChange(vector<int>& coins, int n, int amount) {' },
    { line: 2, code: '    int dp[amount + 1];' },
    { line: 3, code: '    for (int i = 0; i <= amount; i++) dp[i] = INT_MAX;' },
    { line: 4, code: '    dp[0] = 0;' },
    { line: 5, code: '    for (int a = 1; a <= amount; a++) {' },
    { line: 6, code: '        for (int k = 0; k < n; k++) {' },
    { line: 7, code: '            if (coins[k] <= a && dp[a - coins[k]] != INT_MAX)' },
    { line: 8, code: '                if (dp[a - coins[k]] + 1 < dp[a])' },
    { line: 9, code: '                    dp[a] = dp[a - coins[k]] + 1;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[amount] == INT_MAX ? -1 : dp[amount];' },
    { line: 13, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'int coinChange(int[] coins, int amount) {' },
    { line: 2, code: '    int[] dp = new int[amount + 1];' },
    { line: 3, code: '    Arrays.fill(dp, Integer.MAX_VALUE);' },
    { line: 4, code: '    dp[0] = 0;' },
    { line: 5, code: '    for (int a = 1; a <= amount; a++) {' },
    { line: 6, code: '        for (int c : coins) {' },
    { line: 7, code: '            if (c <= a && dp[a - c] != Integer.MAX_VALUE)' },
    { line: 8, code: '                dp[a] = Math.min(dp[a], dp[a - c] + 1);' },
    { line: 9, code: '        }' },
    { line: 10, code: '    }' },
    { line: 11, code: '    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];' },
    { line: 12, code: '}' },
  ],

  python: [
    { line: 1, code: 'def coin_change(coins: list[int], amount: int) -> int:' },
    { line: 2, code: '    dp = [float("inf")] * (amount + 1)' },
    { line: 3, code: '    dp[0] = 0' },
    { line: 4, code: '    for a in range(1, amount + 1):' },
    { line: 5, code: '        for c in coins:' },
    { line: 6, code: '            if c <= a and dp[a - c] + 1 < dp[a]:' },
    { line: 7, code: '                dp[a] = dp[a - c] + 1' },
    { line: 8, code: '    return -1 if dp[amount] == float("inf") else dp[amount]' },
  ],
  c: [
    { line: 1, code: 'int coinChange(int* coins, int n, int amount) {' },
    { line: 2, code: '    int dp[amount + 1];' },
    { line: 3, code: '    for (int i = 0; i <= amount; i++) dp[i] = INT_MAX;' },
    { line: 4, code: '    dp[0] = 0;' },
    { line: 5, code: '    for (int a = 1; a <= amount; a++) {' },
    { line: 6, code: '        for (int k = 0; k < n; k++) {' },
    { line: 7, code: '            if (coins[k] <= a && dp[a - coins[k]] != INT_MAX)' },
    { line: 8, code: '                if (dp[a - coins[k]] + 1 < dp[a])' },
    { line: 9, code: '                    dp[a] = dp[a - coins[k]] + 1;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return dp[amount] == INT_MAX ? -1 : dp[amount];' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1, code: 'int coinChange(int[] coins, int amount) {' },
    { line: 2, code: '    int[] dp = new int[amount + 1];' },
    { line: 3, code: '    Arrays.fill(dp, Integer.MAX_VALUE);' },
    { line: 4, code: '    dp[0] = 0;' },
    { line: 5, code: '    for (int a = 1; a <= amount; a++) {' },
    { line: 6, code: '        for (int c : coins) {' },
    { line: 7, code: '            if (c <= a && dp[a - c] != Integer.MAX_VALUE)' },
    { line: 8, code: '                dp[a] = Math.min(dp[a], dp[a - c] + 1);' },
    { line: 9, code: '        }' },
    { line: 10, code: '    }' },
    { line: 11, code: '    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];' },
    { line: 12, code: '}' },
  ],
  go: [
    { line: 1, code: 'func coinChange(coins []int, amount int) int {' },
    { line: 2, code: '    dp := make([]int, amount+1)' },
    { line: 3, code: '    for i := range dp { dp[i] = math.MaxInt32 }' },
    { line: 4, code: '    dp[0] = 0' },
    { line: 5, code: '    for a := 1; a <= amount; a++ {' },
    { line: 6, code: '        for _, c := range coins {' },
    { line: 7, code: '            if c <= a && dp[a-c] != math.MaxInt32 {' },
    { line: 8, code: '                if dp[a-c]+1 < dp[a] { dp[a] = dp[a-c] + 1 }' },
    { line: 9, code: '            }' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if dp[amount] == math.MaxInt32 { return -1 }' },
    { line: 13, code: '    return dp[amount]' },
    { line: 14, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function coinChange(coins, amount) {' },
    { line: 2, code: '  const dp = Array(amount + 1).fill(Infinity)' },
    { line: 3, code: '  dp[0] = 0' },
    { line: 4, code: '  for (let a = 1; a <= amount; a++) {' },
    { line: 5, code: '    for (const c of coins) {' },
    { line: 6, code: '      if (c <= a && dp[a - c] + 1 < dp[a])' },
    { line: 7, code: '        dp[a] = dp[a - c] + 1' },
    { line: 8, code: '    }' },
    { line: 9, code: '  }' },
    { line: 10, code: '  return dp[amount] === Infinity ? -1 : dp[amount]' },
    { line: 11, code: '}' },
  ],
}
