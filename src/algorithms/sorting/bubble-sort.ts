import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'bubble-sort',
  category: 'sorting',
  nameKey: 'algorithms.bubbleSort.name',
  descriptionKey: 'algorithms.bubbleSort.description',
  complexity: { time: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
  tags: ['comparison', 'in-place', 'stable'],
  defaultInput: [64, 34, 25, 12, 22, 11, 90],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/sort-an-array/',                        title: '#912 Sort an Array',    difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/ctci-bubble-sort/problem',      title: 'Bubble Sort',           difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/sort-an-array',                          title: 'Sort an Array',         difficulty: 'Medium' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  const sorted: number[] = []

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // yield frame: comparing
      yield {
        state: { array: [...arr] },
        highlights: [{ index: j, role: 'compare' }, { index: j + 1, role: 'compare' }],
        message: 'algorithms.bubbleSort.steps.comparing',
        codeLine: 3,
        auxState: { a: arr[j], b: arr[j + 1] },
      }
      if (arr[j] > arr[j + 1]) {
        // swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        yield {
          state: { array: [...arr] },
          highlights: [{ index: j, role: 'swap' }, { index: j + 1, role: 'swap' }],
          message: 'algorithms.bubbleSort.steps.swap',
          codeLine: 5,
          auxState: { a: arr[j], b: arr[j + 1] },
        }
      } else {
        yield {
          state: { array: [...arr] },
          highlights: [{ index: j, role: 'compare' }, { index: j + 1, role: 'compare' }],
          message: 'algorithms.bubbleSort.steps.noSwap',
          codeLine: 4,
          auxState: { a: arr[j], b: arr[j + 1] },
        }
      }
    }
    sorted.push(n - 1 - i)
    yield {
      state: { array: [...arr] },
      highlights: sorted.map(s => ({ index: s, role: 'sorted' as const })),
      message: 'algorithms.bubbleSort.steps.sorted',
      codeLine: 7,
      auxState: { v: arr[n - 1 - i] },
    }
  }
  sorted.push(0)
  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.bubbleSort.steps.done',
    codeLine: 8,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function bubbleSort(arr: number[]): number[] {' },
    { line: 2, code: '  for (let i = 0; i < arr.length - 1; i++) {' },
    { line: 3, code: '    for (let j = 0; j < arr.length - 1 - i; j++) {' },
    { line: 4, code: '      if (arr[j] > arr[j + 1]) {' },
    { line: 5, code: '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]]' },
    { line: 6, code: '      }' },
    { line: 7, code: '    }' },
    { line: 8, code: '  }' },
    { line: 9, code: '  return arr' },
    { line: 10, code: '}' },
  ],
  python: [
    { line: 1, code: 'def bubble_sort(arr):' },
    { line: 2, code: '    n = len(arr)' },
    { line: 3, code: '    for i in range(n - 1):' },
    { line: 4, code: '        for j in range(n - 1 - i):' },
    { line: 5, code: '            if arr[j] > arr[j + 1]:' },
    { line: 6, code: '                arr[j], arr[j+1] = arr[j+1], arr[j]' },
    { line: 7, code: '    return arr' },
  ],
  c: [
    { line: 1, code: 'void bubbleSort(int arr[], int n) {' },
    { line: 2, code: '    for (int i = 0; i < n - 1; i++) {' },
    { line: 3, code: '        for (int j = 0; j < n - 1 - i; j++) {' },
    { line: 4, code: '            if (arr[j] > arr[j + 1]) {' },
    { line: 5, code: '                int tmp = arr[j];' },
    { line: 6, code: '                arr[j] = arr[j + 1];' },
    { line: 7, code: '                arr[j + 1] = tmp;' },
    { line: 8, code: '            }' },
    { line: 9, code: '        }' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1, code: 'void bubbleSort(int[] arr) {' },
    { line: 2, code: '    for (int i = 0; i < arr.length - 1; i++) {' },
    { line: 3, code: '        for (int j = 0; j < arr.length - 1 - i; j++) {' },
    { line: 4, code: '            if (arr[j] > arr[j + 1]) {' },
    { line: 5, code: '                int tmp = arr[j];' },
    { line: 6, code: '                arr[j] = arr[j + 1];' },
    { line: 7, code: '                arr[j + 1] = tmp;' },
    { line: 8, code: '            }' },
    { line: 9, code: '        }' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
  ],
  go: [
    { line: 1, code: 'func bubbleSort(arr []int) {' },
    { line: 2, code: '    for i := 0; i < len(arr)-1; i++ {' },
    { line: 3, code: '        for j := 0; j < len(arr)-1-i; j++ {' },
    { line: 4, code: '            if arr[j] > arr[j+1] {' },
    { line: 5, code: '                arr[j], arr[j+1] = arr[j+1], arr[j]' },
    { line: 6, code: '            }' },
    { line: 7, code: '        }' },
    { line: 8, code: '    }' },
    { line: 9, code: '}' },
  ],
}
