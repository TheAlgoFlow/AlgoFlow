import type {
  AlgorithmFrame,
  AlgorithmMeta,
  CodeSnippets,
} from '@/engine/types';

export const meta: AlgorithmMeta = {
  slug: 'binary-search',
  category: 'searching',
  nameKey: 'algorithms.binarySearch.name',
  descriptionKey: 'algorithms.binarySearch.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(1)',
  },
  tags: ['sorted', 'divide-and-conquer', 'efficient'],
  defaultInput: { array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 13 },
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/binary-search/',                          title: '#704 Binary Search',  difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/binary-search-fp/problem',        title: 'Binary Search (FP)',  difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/binary-search',                            title: 'Binary Search',       difficulty: 'Easy' },
  ],
};

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const { array, target } = input as { array: number[]; target: number };
  const arr = [...array];

  let low = 0;
  let high = arr.length - 1;

  // Initial frame – show full range before any iteration
  yield {
    state: { array: arr, target, low, high },
    highlights: [
      { index: low, role: 'left' },
      { index: high, role: 'right' },
    ],
    message: 'algorithms.binarySearch.steps.init',
    codeLine: 1,
    auxState: { low, high },
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Show mid pointer alongside the current low / high boundaries
    yield {
      state: { array: arr, target, low, high, mid },
      highlights: [
        { index: low, role: 'left' },
        { index: high, role: 'right' },
        { index: mid, role: 'mid' },
      ],
      message: 'algorithms.binarySearch.steps.mid',
      codeLine: 3,
      auxState: { i: mid, v: arr[mid] },
    };

    if (arr[mid] === target) {
      yield {
        state: { array: arr, target, low, high, mid },
        highlights: [{ index: mid, role: 'found' }],
        message: 'algorithms.binarySearch.steps.found',
        codeLine: 4,
        auxState: { i: mid, target },
      };
      return;
    } else if (arr[mid] < target) {
      // Target is in the right half
      yield {
        state: { array: arr, target, low, high, mid },
        highlights: [
          { index: mid, role: 'compare' },
          { index: high, role: 'right' },
        ],
        message: 'algorithms.binarySearch.steps.goRight',
        codeLine: 6,
        auxState: { mid, low: mid + 1, high },
      };
      low = mid + 1;
    } else {
      // Target is in the left half
      yield {
        state: { array: arr, target, low, high, mid },
        highlights: [
          { index: mid, role: 'compare' },
          { index: low, role: 'left' },
        ],
        message: 'algorithms.binarySearch.steps.goLeft',
        codeLine: 5,
        auxState: { mid, low, high: mid - 1 },
      };
      high = mid - 1;
    }
  }

  // Not found
  yield {
    state: { array: arr, target, low, high },
    highlights: [],
    message: 'algorithms.binarySearch.steps.notFound',
    codeLine: 8,
    auxState: { target },
  };
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function binarySearch(arr: number[], target: number): number {' },
    { line: 2, code: '  let low = 0, high = arr.length - 1;' },
    { line: 3, code: '  while (low <= high) {' },
    { line: 4, code: '    const mid = Math.floor((low + high) / 2);' },
    { line: 5, code: '    if (arr[mid] === target) return mid;' },
    { line: 6, code: '    else if (arr[mid] < target) low = mid + 1;' },
    { line: 7, code: '    else high = mid - 1;' },
    { line: 8, code: '  }' },
    { line: 9, code: '  return -1;' },
    { line: 10, code: '}' },
  ],
  python: [
    { line: 1, code: 'def binary_search(arr: list[int], target: int) -> int:' },
    { line: 2, code: '    low, high = 0, len(arr) - 1' },
    { line: 3, code: '    while low <= high:' },
    { line: 4, code: '        mid = (low + high) // 2' },
    { line: 5, code: '        if arr[mid] == target: return mid' },
    { line: 6, code: '        elif arr[mid] < target: low = mid + 1' },
    { line: 7, code: '        else: high = mid - 1' },
    { line: 8, code: '    return -1' },
  ],
  c: [
    { line: 1, code: 'int binarySearch(int arr[], int n, int target) {' },
    { line: 2, code: '    int low = 0, high = n - 1;' },
    { line: 3, code: '    while (low <= high) {' },
    { line: 4, code: '        int mid = (low + high) / 2;' },
    { line: 5, code: '        if (arr[mid] == target) return mid;' },
    { line: 6, code: '        else if (arr[mid] < target) low = mid + 1;' },
    { line: 7, code: '        else high = mid - 1;' },
    { line: 8, code: '    }' },
    { line: 9, code: '    return -1;' },
    { line: 10, code: '}' },
  ],
  java: [
    { line: 1, code: 'int binarySearch(int[] arr, int target) {' },
    { line: 2, code: '    int low = 0, high = arr.length - 1;' },
    { line: 3, code: '    while (low <= high) {' },
    { line: 4, code: '        int mid = (low + high) / 2;' },
    { line: 5, code: '        if (arr[mid] == target) return mid;' },
    { line: 6, code: '        else if (arr[mid] < target) low = mid + 1;' },
    { line: 7, code: '        else high = mid - 1;' },
    { line: 8, code: '    }' },
    { line: 9, code: '    return -1;' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1, code: 'func binarySearch(arr []int, target int) int {' },
    { line: 2, code: '    low, high := 0, len(arr)-1' },
    { line: 3, code: '    for low <= high {' },
    { line: 4, code: '        mid := (low + high) / 2' },
    { line: 5, code: '        if arr[mid] == target { return mid }' },
    { line: 6, code: '        else if arr[mid] < target { low = mid + 1 }' },
    { line: 7, code: '        else { high = mid - 1 }' },
    { line: 8, code: '    }' },
    { line: 9, code: '    return -1' },
    { line: 10, code: '}' },
  ],
};
