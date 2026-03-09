import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'selection-sort',
  category: 'sorting',
  nameKey: 'algorithms.selectionSort.name',
  descriptionKey: 'algorithms.selectionSort.description',
  complexity: { time: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
  tags: ['comparison', 'in-place', 'unstable'],
  defaultInput: [29, 10, 14, 37, 13],
  exercises: [
    { platform: 'leetcode',  url: 'https://leetcode.com/problems/sort-an-array/', title: '#912 Sort an Array',          difficulty: 'Medium' },
    { platform: 'beecrowd', url: 'https://www.beecrowd.com.br/judge/en/problems/view/1025', title: '#1025 Where is the Marble?', difficulty: 'Easy' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  const sortedIndices: number[] = []
  let comparisons = 0
  let swaps = 0

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    // Yield frame showing we start scanning for min from position i
    yield {
      state: { array: [...arr] },
      highlights: [
        { index: minIdx, role: 'current', label: 'i' },
        ...sortedIndices.map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.selectionSort.steps.findMin',
      codeLine: 3,
      auxState: { i, minIdx, minVal: arr[minIdx], comparisons, swaps },
    }

    for (let j = i + 1; j < n; j++) {
      comparisons++
      // Yield compare frame
      yield {
        state: { array: [...arr] },
        highlights: [
          { index: minIdx, role: 'current', label: 'min' },
          { index: j, role: 'compare', label: 'j' },
          ...sortedIndices.map(s => ({ index: s, role: 'sorted' as const })),
        ],
        message: 'algorithms.selectionSort.steps.findMin',
        codeLine: 5,
        auxState: { i, j, minIdx, minVal: arr[minIdx], curVal: arr[j], comparisons, swaps },
      }

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        yield {
          state: { array: [...arr] },
          highlights: [
            { index: minIdx, role: 'current', label: 'min' },
            ...sortedIndices.map(s => ({ index: s, role: 'sorted' as const })),
          ],
          message: 'algorithms.selectionSort.steps.newMin',
          codeLine: 6,
          auxState: { i, minIdx, minVal: arr[minIdx], comparisons, swaps },
        }
      }
    }

    if (minIdx !== i) {
      swaps++
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      yield {
        state: { array: [...arr] },
        highlights: [
          { index: i, role: 'swap', label: 'i' },
          { index: minIdx, role: 'swap', label: 'min' },
          ...sortedIndices.map(s => ({ index: s, role: 'sorted' as const })),
        ],
        message: 'algorithms.selectionSort.steps.swap',
        codeLine: 8,
        auxState: { i, minIdx, val: arr[i], comparisons, swaps },
      }
    }

    sortedIndices.push(i)
    yield {
      state: { array: [...arr] },
      highlights: sortedIndices.map(s => ({ index: s, role: 'sorted' as const })),
      message: 'algorithms.selectionSort.steps.sorted',
      codeLine: 9,
      auxState: { i, val: arr[i], comparisons, swaps },
    }
  }

  sortedIndices.push(n - 1)
  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.selectionSort.steps.done',
    codeLine: 10,
    auxState: { comparisons, swaps },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function selectionSort(arr: number[]): number[] {' },
    { line: 2, code: '  for (let i = 0; i < arr.length - 1; i++) {' },
    { line: 3, code: '    let minIdx = i' },
    { line: 4, code: '    for (let j = i + 1; j < arr.length; j++) {' },
    { line: 5, code: '      if (arr[j] < arr[minIdx]) {' },
    { line: 6, code: '        minIdx = j' },
    { line: 7, code: '      }' },
    { line: 8, code: '    }' },
    { line: 9, code: '    if (minIdx !== i)' },
    { line: 10, code: '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]' },
    { line: 11, code: '  }' },
    { line: 12, code: '  return arr' },
    { line: 13, code: '}' },
  ],
  python: [
    { line: 1, code: 'def selection_sort(arr):' },
    { line: 2, code: '    n = len(arr)' },
    { line: 3, code: '    for i in range(n - 1):' },
    { line: 4, code: '        min_idx = i' },
    { line: 5, code: '        for j in range(i + 1, n):' },
    { line: 6, code: '            if arr[j] < arr[min_idx]:' },
    { line: 7, code: '                min_idx = j' },
    { line: 8, code: '        if min_idx != i:' },
    { line: 9, code: '            arr[i], arr[min_idx] = arr[min_idx], arr[i]' },
    { line: 10, code: '    return arr' },
  ],
  c: [
    { line: 1,  code: 'void selectionSort(int* A, int n) {' },
    { line: 2,  code: '    int i, j, min, tmp;' },
    { line: 3,  code: '    for (i = 0; i < n-1; i++) {' },
    { line: 4,  code: '        min = i;' },
    { line: 5,  code: '        for (j = i+1; j < n; j++)' },
    { line: 6,  code: '            if (A[j] < A[min]) min = j;' },
    { line: 7,  code: '        tmp = A[min];' },
    { line: 8,  code: '        A[min] = A[i];' },
    { line: 9,  code: '        A[i] = tmp;' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void selectionSort(int[] A, int n) {' },
    { line: 2,  code: '    for (int i = 0; i < n-1; i++) {' },
    { line: 3,  code: '        int min = i;' },
    { line: 4,  code: '        for (int j = i+1; j < n; j++)' },
    { line: 5,  code: '            if (A[j] < A[min]) min = j;' },
    { line: 6,  code: '        int tmp = A[min];' },
    { line: 7,  code: '        A[min] = A[i];' },
    { line: 8,  code: '        A[i] = tmp;' },
    { line: 9,  code: '    }' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1, code: 'func selectionSort(arr []int) {' },
    { line: 2, code: '    n := len(arr)' },
    { line: 3, code: '    for i := 0; i < n-1; i++ {' },
    { line: 4, code: '        minIdx := i' },
    { line: 5, code: '        for j := i + 1; j < n; j++ {' },
    { line: 6, code: '            if arr[j] < arr[minIdx] {' },
    { line: 7, code: '                minIdx = j' },
    { line: 8, code: '            }' },
    { line: 9, code: '        }' },
    { line: 10, code: '        if minIdx != i {' },
    { line: 11, code: '            arr[i], arr[minIdx] = arr[minIdx], arr[i]' },
    { line: 12, code: '        }' },
    { line: 13, code: '    }' },
    { line: 14, code: '}' },
  ],
}
