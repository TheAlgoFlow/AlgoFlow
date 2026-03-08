import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'counting-sort',
  category: 'sorting',
  nameKey: 'algorithms.countingSort.name',
  descriptionKey: 'algorithms.countingSort.description',
  complexity: { time: { best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)' }, space: 'O(k)' },
  tags: ['non-comparison', 'stable', 'integer-sort'],
  defaultInput: [4, 2, 2, 8, 3, 3, 1],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/sort-an-array/',                 title: '#912 Sort an Array',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/countingsort1/problem',   title: 'Counting Sort 1',     difficulty: 'Easy' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length

  const max = Math.max(...arr)
  const countArray = new Array(max + 1).fill(0)
  const output = new Array(n).fill(0)

  // Phase 1: Count occurrences
  for (let i = 0; i < n; i++) {
    countArray[arr[i]]++

    yield {
      state: { array: [...arr], countArray: [...countArray] },
      highlights: [{ index: i, role: 'current' }],
      message: 'algorithms.countingSort.steps.count',
      codeLine: 3,
      auxState: { val: arr[i], count: countArray[arr[i]], i },
    }
  }

  // Phase 2: Accumulate counts (prefix sum)
  for (let i = 1; i <= max; i++) {
    countArray[i] += countArray[i - 1]

    yield {
      state: { array: [...arr], countArray: [...countArray] },
      highlights: [{ index: i, role: 'active' }],
      message: 'algorithms.countingSort.steps.accumulate',
      codeLine: 6,
      auxState: { i, cumCount: countArray[i] },
    }
  }

  // Phase 3: Build output array (right to left for stability)
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i]
    const pos = countArray[val] - 1
    output[pos] = val
    countArray[val]--

    yield {
      state: { array: [...output], countArray: [...countArray] },
      highlights: [
        { index: i, role: 'current' },
        { index: pos, role: 'active' },
      ],
      message: 'algorithms.countingSort.steps.place',
      codeLine: 9,
      auxState: { val, pos, i },
    }
  }

  yield {
    state: { array: [...output], countArray: [...countArray] },
    highlights: output.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.countingSort.steps.done',
    codeLine: 11,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function countingSort(arr: number[]): number[] {' },
    { line: 2, code: '  const max = Math.max(...arr)' },
    { line: 3, code: '  const count = new Array(max + 1).fill(0)' },
    { line: 4, code: '  for (const v of arr) count[v]++' },
    { line: 5, code: '  for (let i = 1; i <= max; i++) count[i] += count[i - 1]' },
    { line: 6, code: '  const output = new Array(arr.length)' },
    { line: 7, code: '  for (let i = arr.length - 1; i >= 0; i--) {' },
    { line: 8, code: '    output[--count[arr[i]]] = arr[i]' },
    { line: 9, code: '  }' },
    { line: 10, code: '  return output' },
    { line: 11, code: '}' },
  ],
  python: [
    { line: 1, code: 'def counting_sort(arr):' },
    { line: 2, code: '    max_val = max(arr)' },
    { line: 3, code: '    count = [0] * (max_val + 1)' },
    { line: 4, code: '    for v in arr: count[v] += 1' },
    { line: 5, code: '    for i in range(1, max_val + 1):' },
    { line: 6, code: '        count[i] += count[i - 1]' },
    { line: 7, code: '    output = [0] * len(arr)' },
    { line: 8, code: '    for i in range(len(arr) - 1, -1, -1):' },
    { line: 9, code: '        count[arr[i]] -= 1' },
    { line: 10, code: '        output[count[arr[i]]] = arr[i]' },
    { line: 11, code: '    return output' },
  ],
  c: [
    { line: 1, code: 'void countingSort(int arr[], int n) {' },
    { line: 2, code: '    int max = arr[0];' },
    { line: 3, code: '    for(int i=1;i<n;i++) if(arr[i]>max) max=arr[i];' },
    { line: 4, code: '    int count[max+1]; memset(count,0,sizeof(count));' },
    { line: 5, code: '    for(int i=0;i<n;i++) count[arr[i]]++;' },
    { line: 6, code: '    for(int i=1;i<=max;i++) count[i]+=count[i-1];' },
    { line: 7, code: '    int output[n];' },
    { line: 8, code: '    for(int i=n-1;i>=0;i--) output[--count[arr[i]]]=arr[i];' },
    { line: 9, code: '    for(int i=0;i<n;i++) arr[i]=output[i];' },
    { line: 10, code: '}' },
  ],
  java: [
    { line: 1, code: 'int[] countingSort(int[] arr) {' },
    { line: 2, code: '    int max = Arrays.stream(arr).max().getAsInt();' },
    { line: 3, code: '    int[] count = new int[max + 1];' },
    { line: 4, code: '    for (int v : arr) count[v]++;' },
    { line: 5, code: '    for (int i=1;i<=max;i++) count[i]+=count[i-1];' },
    { line: 6, code: '    int[] output = new int[arr.length];' },
    { line: 7, code: '    for (int i=arr.length-1;i>=0;i--)' },
    { line: 8, code: '        output[--count[arr[i]]] = arr[i];' },
    { line: 9, code: '    return output;' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1, code: 'func countingSort(arr []int) []int {' },
    { line: 2, code: '    max := arr[0]' },
    { line: 3, code: '    for _, v := range arr { if v > max { max = v } }' },
    { line: 4, code: '    count := make([]int, max+1)' },
    { line: 5, code: '    for _, v := range arr { count[v]++ }' },
    { line: 6, code: '    for i := 1; i <= max; i++ { count[i] += count[i-1] }' },
    { line: 7, code: '    output := make([]int, len(arr))' },
    { line: 8, code: '    for i := len(arr) - 1; i >= 0; i-- {' },
    { line: 9, code: '        count[arr[i]]--' },
    { line: 10, code: '        output[count[arr[i]]] = arr[i]' },
    { line: 11, code: '    }' },
    { line: 12, code: '    return output' },
    { line: 13, code: '}' },
  ],
}
