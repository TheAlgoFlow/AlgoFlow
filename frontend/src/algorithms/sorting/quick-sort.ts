import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'quick-sort',
  category: 'sorting',
  nameKey: 'algorithms.quickSort.name',
  descriptionKey: 'algorithms.quickSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' }, space: 'O(log n)' },
  tags: ['divide-and-conquer', 'in-place', 'unstable'],
  defaultInput: [10, 7, 8, 9, 1, 5],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/sort-an-array/',              title: '#912 Sort an Array',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/quicksort1/problem',  title: 'Quicksort 1 - Partition', difficulty: 'Easy' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  const sortedIndices = new Set<number>()
  let comparisons = 0
  let swaps = 0

  // AEDS2: iterative quick sort with middle pivot + Hoare-like two-pointer partition
  const stack: Array<[number, number]> = [[0, n - 1]]

  while (stack.length > 0) {
    const [lo, hi] = stack.pop()!

    if (lo >= hi) {
      if (lo === hi) sortedIndices.add(lo)
      continue
    }

    // AEDS2: pivot = A[(esq + dir) / 2]
    const midIdx = Math.floor((lo + hi) / 2)
    const pivotVal = arr[midIdx]

    yield {
      state: { array: [...arr] },
      highlights: [
        { index: midIdx, role: 'pivot', label: 'pivot' },
        { index: lo, role: 'pointer', label: 'lo' },
        { index: hi, role: 'pointer', label: 'hi' },
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.quickSort.steps.pivot',
      codeLine: 3,
      auxState: { pivotVal, lo, hi, comparisons, swaps },
    }

    // Hoare-like partition: two pointers scanning inward
    let i = lo
    let j = hi

    while (i <= j) {
      while (arr[i] < pivotVal) i++
      while (arr[j] > pivotVal) j--

      if (i <= j) {
        comparisons++
        yield {
          state: { array: [...arr] },
          highlights: [
            { index: i, role: 'compare', label: 'i' },
            { index: j, role: 'compare', label: 'j' },
            ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
          ],
          message: 'algorithms.quickSort.steps.compare',
          codeLine: 7,
          auxState: { i, j, a: arr[i], b: arr[j], pivotVal, comparisons, swaps },
        }

        ;[arr[i], arr[j]] = [arr[j], arr[i]]

        if (i !== j) {
          swaps++
          yield {
            state: { array: [...arr] },
            highlights: [
              { index: i, role: 'swap', label: 'i' },
              { index: j, role: 'swap', label: 'j' },
              ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
            ],
            message: 'algorithms.quickSort.steps.swap',
            codeLine: 8,
            auxState: { i, j, a: arr[i], b: arr[j], comparisons, swaps },
          }
        }

        i++
        j--
      }
    }

    // After partition: [lo..j] ≤ pivotVal, [i..hi] ≥ pivotVal
    // Elements between j+1..i-1 equal pivotVal and are in final position
    for (let k = j + 1; k < i; k++) sortedIndices.add(k)

    yield {
      state: { array: [...arr] },
      highlights: [
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.quickSort.steps.place',
      codeLine: 12,
      auxState: { lo, hi, leftEnd: j, rightStart: i, comparisons, swaps },
    }

    if (lo < j) stack.push([lo, j])
    else if (lo === j) sortedIndices.add(lo)

    if (i < hi) stack.push([i, hi])
    else if (i === hi) sortedIndices.add(hi)
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.quickSort.steps.done',
    codeLine: 14,
    auxState: { comparisons, swaps },
  }
}

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'function quickSort(arr: number[], lo = 0, hi = arr.length - 1): void {' },
    { line: 2,  code: '  let i = lo, j = hi' },
    { line: 3,  code: '  const pivot = arr[Math.floor((lo + hi) / 2)]' },
    { line: 4,  code: '  while (i <= j) {' },
    { line: 5,  code: '    while (arr[i] < pivot) i++' },
    { line: 6,  code: '    while (arr[j] > pivot) j--' },
    { line: 7,  code: '    if (i <= j) {' },
    { line: 8,  code: '      ;[arr[i], arr[j]] = [arr[j], arr[i]]' },
    { line: 9,  code: '      i++; j--' },
    { line: 10, code: '    }' },
    { line: 11, code: '  }' },
    { line: 12, code: '  if (lo < j) quickSort(arr, lo, j)' },
    { line: 13, code: '  if (i < hi) quickSort(arr, i, hi)' },
    { line: 14, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void quickSort(vector<int>& A, int esq, int dir) {' },
    { line: 2, code: '    int i = esq, j = dir, tmp;' },
    { line: 3, code: '    int pivo = A[(esq + dir) / 2];' },
    { line: 4, code: '    while (i <= j) {' },
    { line: 5, code: '        while (A[i] < pivo) i++;' },
    { line: 6, code: '        while (A[j] > pivo) j--;' },
    { line: 7, code: '        if (i <= j) {' },
    { line: 8, code: '            tmp = A[i]; A[i] = A[j]; A[j] = tmp;' },
    { line: 9, code: '            i++; j--;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if (esq < j) quickSort(A, esq, j);' },
    { line: 13, code: '    if (i < dir) quickSort(A, i, dir);' },
    { line: 14, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void quickSort(int[] A, int esq, int dir) {' },
    { line: 2, code: '    int i = esq, j = dir;' },
    { line: 3, code: '    int pivo = A[(esq + dir) / 2];' },
    { line: 4, code: '    while (i <= j) {' },
    { line: 5, code: '        while (A[i] < pivo) i++;' },
    { line: 6, code: '        while (A[j] > pivo) j--;' },
    { line: 7, code: '        if (i <= j) {' },
    { line: 8, code: '            int tmp = A[i]; A[i] = A[j]; A[j] = tmp;' },
    { line: 9, code: '            i++; j--;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if (esq < j) quickSort(A, esq, j);' },
    { line: 13, code: '    if (i < dir) quickSort(A, i, dir);' },
    { line: 14, code: '}' },
  ],

  python: [
    { line: 1,  code: 'def quick_sort(arr, lo=0, hi=None):' },
    { line: 2,  code: '    if hi is None: hi = len(arr) - 1' },
    { line: 3,  code: '    pivot = arr[(lo + hi) // 2]' },
    { line: 4,  code: '    i, j = lo, hi' },
    { line: 5,  code: '    while i <= j:' },
    { line: 6,  code: '        while arr[i] < pivot: i += 1' },
    { line: 7,  code: '        while arr[j] > pivot: j -= 1' },
    { line: 8,  code: '        if i <= j:' },
    { line: 9,  code: '            arr[i], arr[j] = arr[j], arr[i]' },
    { line: 10, code: '            i += 1; j -= 1' },
    { line: 11, code: '    if lo < j: quick_sort(arr, lo, j)' },
    { line: 12, code: '    if i < hi: quick_sort(arr, i, hi)' },
  ],
  c: [
    { line: 1,  code: 'void quickSort(int* A, int esq, int dir) {' },
    { line: 2,  code: '    int i = esq, j = dir, tmp;' },
    { line: 3,  code: '    int pivo = A[(esq + dir) / 2];' },
    { line: 4,  code: '    while (i <= j) {' },
    { line: 5,  code: '        while (A[i] < pivo) i++;' },
    { line: 6,  code: '        while (A[j] > pivo) j--;' },
    { line: 7,  code: '        if (i <= j) {' },
    { line: 8,  code: '            tmp = A[i]; A[i] = A[j]; A[j] = tmp;' },
    { line: 9,  code: '            i++; j--;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if (esq < j) quickSort(A, esq, j);' },
    { line: 13, code: '    if (i < dir) quickSort(A, i, dir);' },
    { line: 14, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void quickSort(int[] A, int esq, int dir) {' },
    { line: 2,  code: '    int i = esq, j = dir;' },
    { line: 3,  code: '    int pivo = A[(esq + dir) / 2];' },
    { line: 4,  code: '    while (i <= j) {' },
    { line: 5,  code: '        while (A[i] < pivo) i++;' },
    { line: 6,  code: '        while (A[j] > pivo) j--;' },
    { line: 7,  code: '        if (i <= j) {' },
    { line: 8,  code: '            int tmp = A[i]; A[i] = A[j]; A[j] = tmp;' },
    { line: 9,  code: '            i++; j--;' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if (esq < j) quickSort(A, esq, j);' },
    { line: 13, code: '    if (i < dir) quickSort(A, i, dir);' },
    { line: 14, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func quickSort(arr []int, lo, hi int) {' },
    { line: 2,  code: '    i, j := lo, hi' },
    { line: 3,  code: '    pivot := arr[(lo+hi)/2]' },
    { line: 4,  code: '    for i <= j {' },
    { line: 5,  code: '        for arr[i] < pivot { i++ }' },
    { line: 6,  code: '        for arr[j] > pivot { j-- }' },
    { line: 7,  code: '        if i <= j {' },
    { line: 8,  code: '            arr[i], arr[j] = arr[j], arr[i]' },
    { line: 9,  code: '            i++; j--' },
    { line: 10, code: '        }' },
    { line: 11, code: '    }' },
    { line: 12, code: '    if lo < j { quickSort(arr, lo, j) }' },
    { line: 13, code: '    if i < hi { quickSort(arr, i, hi) }' },
    { line: 14, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function quickSort(arr, lo = 0, hi = arr.length - 1) {' },
    { line: 2, code: '  let i = lo, j = hi' },
    { line: 3, code: '  const pivot = arr[Math.floor((lo + hi) / 2)]' },
    { line: 4, code: '  while (i <= j) {' },
    { line: 5, code: '    while (arr[i] < pivot) i++' },
    { line: 6, code: '    while (arr[j] > pivot) j--' },
    { line: 7, code: '    if (i <= j) {' },
    { line: 8, code: '      ;[arr[i], arr[j]] = [arr[j], arr[i]]' },
    { line: 9, code: '      i++; j--' },
    { line: 10, code: '    }' },
    { line: 11, code: '  }' },
    { line: 12, code: '  if (lo < j) quickSort(arr, lo, j)' },
    { line: 13, code: '  if (i < hi) quickSort(arr, i, hi)' },
    { line: 14, code: '}' },
  ],
}
