import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'heap-sort',
  category: 'sorting',
  nameKey: 'algorithms.heapSort.name',
  descriptionKey: 'algorithms.heapSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(1)' },
  tags: ['comparison', 'in-place', 'unstable'],
  defaultInput: [12, 11, 13, 5, 6, 7],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',          title: '#215 Kth Largest Element', difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/find-the-running-median/problem',   title: 'Find the Running Median',  difficulty: 'Hard' },
  ],
}

function* heapify(
  arr: number[],
  n: number,
  root: number,
  sortedIndices: Set<number>,
  phase: string,
  counters: { comparisons: number; swaps: number },
): Generator<AlgorithmFrame> {
  let largest = root
  const left = 2 * root + 1
  const right = 2 * root + 2

  counters.comparisons += 2
  yield {
    state: { array: [...arr] },
    highlights: [
      { index: root, role: 'current', label: 'root' },
      ...(left < n ? [{ index: left, role: 'compare' as const, label: 'L' }] : []),
      ...(right < n ? [{ index: right, role: 'compare' as const, label: 'R' }] : []),
      ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
    ],
    message: 'algorithms.heapSort.steps.heapify',
    codeLine: 4,
    auxState: { root, left: left < n ? arr[left] : null, right: right < n ? arr[right] : null, phase, comparisons: counters.comparisons, swaps: counters.swaps },
  }

  if (left < n && arr[left] > arr[largest]) largest = left
  if (right < n && arr[right] > arr[largest]) largest = right

  if (largest !== root) {
    ;[arr[root], arr[largest]] = [arr[largest], arr[root]]
    counters.swaps++

    yield {
      state: { array: [...arr] },
      highlights: [
        { index: root, role: 'swap', label: 'root' },
        { index: largest, role: 'swap', label: largest === left ? 'L' : 'R' },
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.heapSort.steps.heapify',
      codeLine: 6,
      auxState: { root, largest, phase, comparisons: counters.comparisons, swaps: counters.swaps },
    }

    yield* heapify(arr, n, largest, sortedIndices, phase, counters)
  }
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  const sortedIndices = new Set<number>()
  const counters = { comparisons: 0, swaps: 0 }

  // Phase 1: Build max heap
  yield {
    state: { array: [...arr] },
    highlights: [],
    message: 'algorithms.heapSort.steps.buildHeap',
    codeLine: 1,
    auxState: { phase: 'build', comparisons: counters.comparisons, swaps: counters.swaps },
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i, sortedIndices, 'build', counters)
  }

  // Phase 2: Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root (maximum) to end
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    counters.swaps++
    sortedIndices.add(i)

    yield {
      state: { array: [...arr] },
      highlights: [
        { index: 0, role: 'swap' },
        { index: i, role: 'sorted' },
        ...Array.from(sortedIndices).map(s => ({ index: s, role: 'sorted' as const })),
      ],
      message: 'algorithms.heapSort.steps.extract',
      codeLine: 9,
      auxState: { extracted: arr[i], pos: i, comparisons: counters.comparisons, swaps: counters.swaps },
    }

    // Heapify the reduced heap
    yield* heapify(arr, i, 0, sortedIndices, 'extract', counters)
  }

  sortedIndices.add(0)
  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.heapSort.steps.done',
    codeLine: 11,
    auxState: { comparisons: counters.comparisons, swaps: counters.swaps },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function heapSort(arr: number[]): number[] {' },
    { line: 2, code: '  const n = arr.length' },
    { line: 3, code: '  for (let i = Math.floor(n/2)-1; i >= 0; i--)' },
    { line: 4, code: '    heapify(arr, n, i)' },
    { line: 5, code: '  for (let i = n-1; i > 0; i--) {' },
    { line: 6, code: '    [arr[0], arr[i]] = [arr[i], arr[0]]' },
    { line: 7, code: '    heapify(arr, i, 0)' },
    { line: 8, code: '  }' },
    { line: 9, code: '  return arr' },
    { line: 10, code: '}' },
    { line: 11, code: 'function heapify(arr: number[], n: number, i: number) {' },
    { line: 12, code: '  let largest = i' },
    { line: 13, code: '  const l = 2*i+1, r = 2*i+2' },
    { line: 14, code: '  if (l < n && arr[l] > arr[largest]) largest = l' },
    { line: 15, code: '  if (r < n && arr[r] > arr[largest]) largest = r' },
    { line: 16, code: '  if (largest !== i) {' },
    { line: 17, code: '    [arr[i], arr[largest]] = [arr[largest], arr[i]]' },
    { line: 18, code: '    heapify(arr, n, largest)' },
    { line: 19, code: '  }' },
    { line: 20, code: '}' },
  ],
  python: [
    { line: 1, code: 'def heap_sort(arr):' },
    { line: 2, code: '    n = len(arr)' },
    { line: 3, code: '    for i in range(n // 2 - 1, -1, -1):' },
    { line: 4, code: '        heapify(arr, n, i)' },
    { line: 5, code: '    for i in range(n - 1, 0, -1):' },
    { line: 6, code: '        arr[0], arr[i] = arr[i], arr[0]' },
    { line: 7, code: '        heapify(arr, i, 0)' },
    { line: 8, code: 'def heapify(arr, n, i):' },
    { line: 9, code: '    largest = i' },
    { line: 10, code: '    l, r = 2*i+1, 2*i+2' },
    { line: 11, code: '    if l < n and arr[l] > arr[largest]: largest = l' },
    { line: 12, code: '    if r < n and arr[r] > arr[largest]: largest = r' },
    { line: 13, code: '    if largest != i:' },
    { line: 14, code: '        arr[i], arr[largest] = arr[largest], arr[i]' },
    { line: 15, code: '        heapify(arr, n, largest)' },
  ],
  c: [
    { line: 1,  code: 'void heapify(int* A, int n, int i) {' },
    { line: 2,  code: '    int maior=i, esq=2*i+1, dir=2*i+2, tmp;' },
    { line: 3,  code: '    if(esq<n && A[esq]>A[maior]) maior=esq;' },
    { line: 4,  code: '    if(dir<n && A[dir]>A[maior]) maior=dir;' },
    { line: 5,  code: '    if(maior!=i){' },
    { line: 6,  code: '        tmp=A[i]; A[i]=A[maior]; A[maior]=tmp;' },
    { line: 7,  code: '        heapify(A,n,maior);' },
    { line: 8,  code: '    }' },
    { line: 9,  code: '}' },
    { line: 10, code: 'void heapSort(int* A, int n) {' },
    { line: 11, code: '    for(int i=n/2-1;i>=0;i--) heapify(A,n,i);' },
    { line: 12, code: '    for(int i=n-1;i>0;i--){' },
    { line: 13, code: '        int tmp=A[0]; A[0]=A[i]; A[i]=tmp;' },
    { line: 14, code: '        heapify(A,i,0);' },
    { line: 15, code: '    }' },
    { line: 16, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void heapSort(int[] A, int n) {' },
    { line: 2,  code: '    for (int i=n/2-1;i>=0;i--) heapify(A,n,i);' },
    { line: 3,  code: '    for (int i=n-1;i>0;i--) {' },
    { line: 4,  code: '        int tmp=A[0]; A[0]=A[i]; A[i]=tmp;' },
    { line: 5,  code: '        heapify(A,i,0);' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '}' },
    { line: 8,  code: 'void heapify(int[] A, int n, int i) {' },
    { line: 9,  code: '    int maior=i, esq=2*i+1, dir=2*i+2;' },
    { line: 10, code: '    if(esq<n && A[esq]>A[maior]) maior=esq;' },
    { line: 11, code: '    if(dir<n && A[dir]>A[maior]) maior=dir;' },
    { line: 12, code: '    if(maior!=i){' },
    { line: 13, code: '        int tmp=A[i]; A[i]=A[maior]; A[maior]=tmp;' },
    { line: 14, code: '        heapify(A,n,maior);' },
    { line: 15, code: '    }' },
    { line: 16, code: '}' },
  ],
  go: [
    { line: 1, code: 'func heapSort(arr []int) {' },
    { line: 2, code: '    n := len(arr)' },
    { line: 3, code: '    for i := n/2 - 1; i >= 0; i-- { heapify(arr, n, i) }' },
    { line: 4, code: '    for i := n - 1; i > 0; i-- {' },
    { line: 5, code: '        arr[0], arr[i] = arr[i], arr[0]' },
    { line: 6, code: '        heapify(arr, i, 0)' },
    { line: 7, code: '    }' },
    { line: 8, code: '}' },
    { line: 9, code: 'func heapify(arr []int, n, i int) {' },
    { line: 10, code: '    largest, l, r := i, 2*i+1, 2*i+2' },
    { line: 11, code: '    if l < n && arr[l] > arr[largest] { largest = l }' },
    { line: 12, code: '    if r < n && arr[r] > arr[largest] { largest = r }' },
    { line: 13, code: '    if largest != i {' },
    { line: 14, code: '        arr[i], arr[largest] = arr[largest], arr[i]' },
    { line: 15, code: '        heapify(arr, n, largest)' },
    { line: 16, code: '    }' },
    { line: 17, code: '}' },
  ],
}
