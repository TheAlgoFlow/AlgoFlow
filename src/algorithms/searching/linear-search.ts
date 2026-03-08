import type {
  AlgorithmFrame,
  AlgorithmMeta,
  CodeSnippets,
} from '@/engine/types';

export const meta: AlgorithmMeta = {
  slug: 'linear-search',
  category: 'searching',
  nameKey: 'algorithms.linearSearch.name',
  descriptionKey: 'algorithms.linearSearch.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  tags: ['simple', 'unsorted'],
  defaultInput: { array: [4, 2, 7, 1, 9, 3, 8, 5], target: 7 },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/binary-search/',                  title: '#704 Binary Search', difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/find-digits/problem',     title: 'Find Digits',        difficulty: 'Easy' },
  ],
};

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { array, target } = input as { array: number[]; target: number };
  const arr = [...array];

  for (let i = 0; i < arr.length; i++) {
    // Highlight current element being inspected
    yield {
      state: { array: arr, target },
      highlights: [{ index: i, role: 'current' }],
      message: 'algorithms.linearSearch.steps.check',
      codeLine: 2,
      auxState: { i, v: arr[i] },
    };

    if (arr[i] === target) {
      // Found it
      yield {
        state: { array: arr, target },
        highlights: [{ index: i, role: 'found' }],
        message: 'algorithms.linearSearch.steps.found',
        codeLine: 3,
        auxState: { i, target },
      };
      return;
    } else {
      // Not a match – mark as compare and move on
      yield {
        state: { array: arr, target },
        highlights: [{ index: i, role: 'compare' }],
        message: 'algorithms.linearSearch.steps.move',
        codeLine: 2,
        auxState: { i, v: arr[i] },
      };
    }
  }

  // Target not found
  yield {
    state: { array: arr, target },
    highlights: [],
    message: 'algorithms.linearSearch.steps.notFound',
    codeLine: 5,
    auxState: { target },
  };
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function linearSearch(arr: number[], target: number): number {' },
    { line: 2, code: '  for (let i = 0; i < arr.length; i++) {' },
    { line: 3, code: '    if (arr[i] === target) return i;' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1;' },
    { line: 6, code: '}' },
  ],
  python: [
    { line: 1, code: 'def linear_search(arr: list[int], target: int) -> int:' },
    { line: 2, code: '    for i, v in enumerate(arr):' },
    { line: 3, code: '        if v == target:' },
    { line: 4, code: '            return i' },
    { line: 5, code: '    return -1' },
  ],
  c: [
    { line: 1, code: 'int linearSearch(int arr[], int n, int target) {' },
    { line: 2, code: '    for (int i = 0; i < n; i++) {' },
    { line: 3, code: '        if (arr[i] == target) return i;' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1;' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'int linearSearch(int[] arr, int target) {' },
    { line: 2, code: '    for (int i = 0; i < arr.length; i++) {' },
    { line: 3, code: '        if (arr[i] == target) return i;' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1;' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func linearSearch(arr []int, target int) int {' },
    { line: 2, code: '    for i, v := range arr {' },
    { line: 3, code: '        if v == target { return i }' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1' },
    { line: 6, code: '}' },
  ],
};
