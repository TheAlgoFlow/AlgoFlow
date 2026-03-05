import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'quick-sort',
  category: 'sorting',
  nameKey: 'algorithms.quickSort.name',
  descriptionKey: 'algorithms.quickSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' }, space: 'O(log n)' },
  tags: ['divide-and-conquer', 'in-place', 'unstable'],
  defaultInput: [10, 7, 8, 9, 1, 5],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  const sortedIndices = new Set<number>()

  // Iterative quick sort using an explicit stack of [lo, hi] pairs
  const stack: Array<[number, number]> = [[0, n - 1]]

  while (stack.length > 0) {
    const [lo, hi] = stack.pop()!

    if (lo >= hi) {
      if (lo === hi) sortedIndices.add(lo)
      continue
    }

    // Choose last element as pivot
    const pivotVal = arr[hi]

    yield {
      state: { array: [...arr] },
      highlights: [
        { index: hi, role: 'pivot' },
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.quickSort.steps.pivot',
      codeLine: 3,
      auxState: { pivotVal, lo, hi },
    }

    // Partition
    let i = lo - 1

    for (let j = lo; j < hi; j++) {
      yield {
        state: { array: [...arr] },
        highlights: [
          { index: hi, role: 'pivot' },
          { index: j, role: 'compare' },
          ...(i >= lo ? [{ index: i, role: 'current' as const }] : []),
          ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
        ],
        message: 'algorithms.quickSort.steps.compare',
        codeLine: 5,
        auxState: { j, val: arr[j], pivotVal, i },
      }

      if (arr[j] <= pivotVal) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          yield {
            state: { array: [...arr] },
            highlights: [
              { index: hi, role: 'pivot' },
              { index: i, role: 'swap' },
              { index: j, role: 'swap' },
              ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
            ],
            message: 'algorithms.quickSort.steps.swap',
            codeLine: 7,
            auxState: { i, j, a: arr[i], b: arr[j] },
          }
        }
      }
    }

    // Place pivot in its correct position
    const pivotIdx = i + 1
    ;[arr[pivotIdx], arr[hi]] = [arr[hi], arr[pivotIdx]]
    sortedIndices.add(pivotIdx)

    yield {
      state: { array: [...arr] },
      highlights: [
        { index: pivotIdx, role: 'sorted' },
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.quickSort.steps.place',
      codeLine: 9,
      auxState: { pivotIdx, pivotVal: arr[pivotIdx] },
    }

    // Push sub-problems
    if (pivotIdx - 1 > lo) stack.push([lo, pivotIdx - 1])
    else if (pivotIdx - 1 === lo) sortedIndices.add(lo)

    if (pivotIdx + 1 < hi) stack.push([pivotIdx + 1, hi])
    else if (pivotIdx + 1 === hi) sortedIndices.add(hi)
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.quickSort.steps.done',
    codeLine: 11,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function quickSort(arr: number[], lo = 0, hi = arr.length - 1): number[] {' },
    { line: 2, code: '  if (lo < hi) {' },
    { line: 3, code: '    const p = partition(arr, lo, hi)' },
    { line: 4, code: '    quickSort(arr, lo, p - 1)' },
    { line: 5, code: '    quickSort(arr, p + 1, hi)' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return arr' },
    { line: 8, code: '}' },
    { line: 9, code: 'function partition(arr: number[], lo: number, hi: number): number {' },
    { line: 10, code: '  const pivot = arr[hi]' },
    { line: 11, code: '  let i = lo - 1' },
    { line: 12, code: '  for (let j = lo; j < hi; j++) {' },
    { line: 13, code: '    if (arr[j] <= pivot) {' },
    { line: 14, code: '      [arr[++i], arr[j]] = [arr[j], arr[i + 1]]' },
    { line: 15, code: '    }' },
    { line: 16, code: '  }' },
    { line: 17, code: '  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]' },
    { line: 18, code: '  return i + 1' },
    { line: 19, code: '}' },
  ],
  python: [
    { line: 1, code: 'def quick_sort(arr, lo=0, hi=None):' },
    { line: 2, code: '    if hi is None: hi = len(arr) - 1' },
    { line: 3, code: '    if lo < hi:' },
    { line: 4, code: '        p = partition(arr, lo, hi)' },
    { line: 5, code: '        quick_sort(arr, lo, p - 1)' },
    { line: 6, code: '        quick_sort(arr, p + 1, hi)' },
    { line: 7, code: 'def partition(arr, lo, hi):' },
    { line: 8, code: '    pivot = arr[hi]' },
    { line: 9, code: '    i = lo - 1' },
    { line: 10, code: '    for j in range(lo, hi):' },
    { line: 11, code: '        if arr[j] <= pivot:' },
    { line: 12, code: '            i += 1' },
    { line: 13, code: '            arr[i], arr[j] = arr[j], arr[i]' },
    { line: 14, code: '    arr[i+1], arr[hi] = arr[hi], arr[i+1]' },
    { line: 15, code: '    return i + 1' },
  ],
  c: [
    { line: 1, code: 'int partition(int arr[], int lo, int hi) {' },
    { line: 2, code: '    int pivot = arr[hi], i = lo - 1;' },
    { line: 3, code: '    for (int j = lo; j < hi; j++) {' },
    { line: 4, code: '        if (arr[j] <= pivot) {' },
    { line: 5, code: '            int tmp = arr[++i]; arr[i] = arr[j]; arr[j] = tmp;' },
    { line: 6, code: '        }' },
    { line: 7, code: '    }' },
    { line: 8, code: '    int tmp = arr[i+1]; arr[i+1] = arr[hi]; arr[hi] = tmp;' },
    { line: 9, code: '    return i + 1;' },
    { line: 10, code: '}' },
    { line: 11, code: 'void quickSort(int arr[], int lo, int hi) {' },
    { line: 12, code: '    if (lo < hi) {' },
    { line: 13, code: '        int p = partition(arr, lo, hi);' },
    { line: 14, code: '        quickSort(arr, lo, p - 1);' },
    { line: 15, code: '        quickSort(arr, p + 1, hi);' },
    { line: 16, code: '    }' },
    { line: 17, code: '}' },
  ],
  java: [
    { line: 1, code: 'void quickSort(int[] arr, int lo, int hi) {' },
    { line: 2, code: '    if (lo < hi) {' },
    { line: 3, code: '        int p = partition(arr, lo, hi);' },
    { line: 4, code: '        quickSort(arr, lo, p - 1);' },
    { line: 5, code: '        quickSort(arr, p + 1, hi);' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
    { line: 8, code: 'int partition(int[] arr, int lo, int hi) {' },
    { line: 9, code: '    int pivot = arr[hi], i = lo - 1;' },
    { line: 10, code: '    for (int j = lo; j < hi; j++) {' },
    { line: 11, code: '        if (arr[j] <= pivot) {' },
    { line: 12, code: '            int tmp = arr[++i]; arr[i] = arr[j]; arr[j] = tmp;' },
    { line: 13, code: '        }' },
    { line: 14, code: '    }' },
    { line: 15, code: '    int tmp = arr[i+1]; arr[i+1] = arr[hi]; arr[hi] = tmp;' },
    { line: 16, code: '    return i + 1;' },
    { line: 17, code: '}' },
  ],
  go: [
    { line: 1, code: 'func quickSort(arr []int, lo, hi int) {' },
    { line: 2, code: '    if lo < hi {' },
    { line: 3, code: '        p := partition(arr, lo, hi)' },
    { line: 4, code: '        quickSort(arr, lo, p-1)' },
    { line: 5, code: '        quickSort(arr, p+1, hi)' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
    { line: 8, code: 'func partition(arr []int, lo, hi int) int {' },
    { line: 9, code: '    pivot := arr[hi]' },
    { line: 10, code: '    i := lo - 1' },
    { line: 11, code: '    for j := lo; j < hi; j++ {' },
    { line: 12, code: '        if arr[j] <= pivot {' },
    { line: 13, code: '            i++' },
    { line: 14, code: '            arr[i], arr[j] = arr[j], arr[i]' },
    { line: 15, code: '        }' },
    { line: 16, code: '    }' },
    { line: 17, code: '    arr[i+1], arr[hi] = arr[hi], arr[i+1]' },
    { line: 18, code: '    return i + 1' },
    { line: 19, code: '}' },
  ],
}
