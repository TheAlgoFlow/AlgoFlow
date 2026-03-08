import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'insertion-sort',
  category: 'sorting',
  nameKey: 'algorithms.insertionSort.name',
  descriptionKey: 'algorithms.insertionSort.description',
  complexity: { time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
  tags: ['comparison', 'in-place', 'stable', 'adaptive'],
  defaultInput: [12, 11, 13, 5, 6],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/insertion-sort-list/', title: '#147 Insertion Sort List', difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/insertionsort1/problem', title: 'Insertion Sort - Part 1',  difficulty: 'Easy' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length

  for (let i = 1; i < n; i++) {
    const key = arr[i]

    // Yield: pick the element to insert
    yield {
      state: { array: [...arr] },
      highlights: [{ index: i, role: 'selected' }],
      message: 'algorithms.insertionSort.steps.pick',
      codeLine: 2,
      auxState: { key, i },
    }

    let j = i - 1

    while (j >= 0 && arr[j] > key) {
      // Yield: comparing arr[j] with key
      yield {
        state: { array: [...arr] },
        highlights: [{ index: j, role: 'compare' }, { index: j + 1, role: 'selected' }],
        message: 'algorithms.insertionSort.steps.compare',
        codeLine: 4,
        auxState: { key, compared: arr[j], j },
      }

      // Shift arr[j] right
      arr[j + 1] = arr[j]
      yield {
        state: { array: [...arr] },
        highlights: [{ index: j, role: 'compare' }, { index: j + 1, role: 'swap' }],
        message: 'algorithms.insertionSort.steps.compare',
        codeLine: 5,
        auxState: { key, shifted: arr[j + 1], j },
      }

      j--
    }

    // Place key at correct position
    arr[j + 1] = key
    yield {
      state: { array: [...arr] },
      highlights: [{ index: j + 1, role: 'selected' }],
      message: 'algorithms.insertionSort.steps.insert',
      codeLine: 7,
      auxState: { key, pos: j + 1 },
    }
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.insertionSort.steps.done',
    codeLine: 8,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function insertionSort(arr: number[]): number[] {' },
    { line: 2, code: '  for (let i = 1; i < arr.length; i++) {' },
    { line: 3, code: '    const key = arr[i]' },
    { line: 4, code: '    let j = i - 1' },
    { line: 5, code: '    while (j >= 0 && arr[j] > key) {' },
    { line: 6, code: '      arr[j + 1] = arr[j]' },
    { line: 7, code: '      j--' },
    { line: 8, code: '    }' },
    { line: 9, code: '    arr[j + 1] = key' },
    { line: 10, code: '  }' },
    { line: 11, code: '  return arr' },
    { line: 12, code: '}' },
  ],
  python: [
    { line: 1, code: 'def insertion_sort(arr):' },
    { line: 2, code: '    for i in range(1, len(arr)):' },
    { line: 3, code: '        key = arr[i]' },
    { line: 4, code: '        j = i - 1' },
    { line: 5, code: '        while j >= 0 and arr[j] > key:' },
    { line: 6, code: '            arr[j + 1] = arr[j]' },
    { line: 7, code: '            j -= 1' },
    { line: 8, code: '        arr[j + 1] = key' },
    { line: 9, code: '    return arr' },
  ],
  c: [
    { line: 1, code: 'void insertionSort(int arr[], int n) {' },
    { line: 2, code: '    for (int i = 1; i < n; i++) {' },
    { line: 3, code: '        int key = arr[i];' },
    { line: 4, code: '        int j = i - 1;' },
    { line: 5, code: '        while (j >= 0 && arr[j] > key) {' },
    { line: 6, code: '            arr[j + 1] = arr[j];' },
    { line: 7, code: '            j--;' },
    { line: 8, code: '        }' },
    { line: 9, code: '        arr[j + 1] = key;' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1, code: 'void insertionSort(int[] arr) {' },
    { line: 2, code: '    for (int i = 1; i < arr.length; i++) {' },
    { line: 3, code: '        int key = arr[i];' },
    { line: 4, code: '        int j = i - 1;' },
    { line: 5, code: '        while (j >= 0 && arr[j] > key) {' },
    { line: 6, code: '            arr[j + 1] = arr[j];' },
    { line: 7, code: '            j--;' },
    { line: 8, code: '        }' },
    { line: 9, code: '        arr[j + 1] = key;' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
  go: [
    { line: 1, code: 'func insertionSort(arr []int) {' },
    { line: 2, code: '    for i := 1; i < len(arr); i++ {' },
    { line: 3, code: '        key := arr[i]' },
    { line: 4, code: '        j := i - 1' },
    { line: 5, code: '        for j >= 0 && arr[j] > key {' },
    { line: 6, code: '            arr[j+1] = arr[j]' },
    { line: 7, code: '            j--' },
    { line: 8, code: '        }' },
    { line: 9, code: '        arr[j+1] = key' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
}
