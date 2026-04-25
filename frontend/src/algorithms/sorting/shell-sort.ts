import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'shell-sort',
  category: 'sorting',
  nameKey: 'algorithms.shellSort.name',
  descriptionKey: 'algorithms.shellSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n^1.5)', worst: 'O(n²)' }, space: 'O(1)' },
  tags: ['comparison', 'in-place', 'unstable', 'gap-sequence'],
  defaultInput: [13, 5, 8, 3, 1, 9, 7, 4, 6, 2],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/sort-an-array/', title: '#912 Sort an Array',     difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/ctci-bubble-sort/problem', title: 'Bubble Sort',  difficulty: 'Medium' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length
  let comparisons = 0
  let swaps = 0

  // AEDS2 gap sequence: h = h*3+1 until h >= n, then shrink h /= 3
  let h = 1
  while (h < n) h = h * 3 + 1
  h = Math.floor(h / 3)

  while (h >= 1) {
    yield {
      state: { array: [...arr] },
      highlights: [],
      message: 'algorithms.shellSort.steps.gap',
      codeLine: 4,
      auxState: { h, comparisons, swaps },
    }

    // For each "color" (offset 0..h-1), run insertion sort with stride h
    for (let cor = 0; cor < h; cor++) {
      // Insertion sort on the sub-sequence: cor, cor+h, cor+2h, ...
      for (let i = cor + h; i < n; i += h) {
        const tmp = arr[i]
        let j = i - h

        yield {
          state: { array: [...arr] },
          highlights: [{ index: i, role: 'selected', label: 'key' }],
          message: 'algorithms.shellSort.steps.pick',
          codeLine: 7,
          auxState: { tmp, i, h, cor, comparisons, swaps },
        }

        while (j >= cor && arr[j] > tmp) {
          comparisons++
          yield {
            state: { array: [...arr] },
            highlights: [
              { index: j,   role: 'compare', label: 'j' },
              { index: j + h, role: 'selected' },
            ],
            message: 'algorithms.shellSort.steps.compare',
            codeLine: 9,
            auxState: { val: arr[j], tmp, j, h, comparisons, swaps },
          }

          arr[j + h] = arr[j]
          swaps++

          yield {
            state: { array: [...arr] },
            highlights: [
              { index: j,     role: 'compare', label: 'j' },
              { index: j + h, role: 'swap' },
            ],
            message: 'algorithms.shellSort.steps.shift',
            codeLine: 10,
            auxState: { val: arr[j], pos: j + h, h, comparisons, swaps },
          }

          j -= h
        }

        arr[j + h] = tmp

        yield {
          state: { array: [...arr] },
          highlights: [{ index: j + h, role: 'active', label: 'placed' }],
          message: 'algorithms.shellSort.steps.insert',
          codeLine: 11,
          auxState: { tmp, pos: j + h, comparisons, swaps },
        }
      }
    }

    h = Math.floor(h / 3)
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.shellSort.steps.done',
    codeLine: 14,
    auxState: { comparisons, swaps },
  }
}

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'function shellSort(arr: number[]): number[] {' },
    { line: 2,  code: '  const n = arr.length' },
    { line: 3,  code: '  let h = 1' },
    { line: 4,  code: '  while (h < n) h = h * 3 + 1' },
    { line: 5,  code: '  for (h = Math.floor(h/3); h >= 1; h = Math.floor(h/3)) {' },
    { line: 6,  code: '    for (let cor = 0; cor < h; cor++) {' },
    { line: 7,  code: '      for (let i = cor+h; i < n; i += h) {' },
    { line: 8,  code: '        const tmp = arr[i]' },
    { line: 9,  code: '        let j = i - h' },
    { line: 10, code: '        while (j >= cor && arr[j] > tmp) {' },
    { line: 11, code: '          arr[j+h] = arr[j]; j -= h' },
    { line: 12, code: '        }' },
    { line: 13, code: '        arr[j+h] = tmp' },
    { line: 14, code: '      }' },
    { line: 15, code: '    }' },
    { line: 16, code: '  }' },
    { line: 17, code: '  return arr' },
    { line: 18, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void insercaoPorCor(vector<int>& A, int cor, int h, int n) {' },
    { line: 2, code: '    int i, j, tmp;' },
    { line: 3, code: '    for (i = cor+h; i < n; i += h) {' },
    { line: 4, code: '        tmp = A[i];' },
    { line: 5, code: '        j = i - h;' },
    { line: 6, code: '        while (j >= cor && A[j] > tmp) {' },
    { line: 7, code: '            A[j+h] = A[j];' },
    { line: 8, code: '            j -= h;' },
    { line: 9, code: '        }' },
    { line: 10, code: '        A[j+h] = tmp;' },
    { line: 11, code: '    }' },
    { line: 12, code: '}' },
    { line: 13, code: 'void shellSort(int* A, int n) {' },
    { line: 14, code: '    int h = 1;' },
    { line: 15, code: '    while (h < n) h = h*3+1;' },
    { line: 16, code: '    for (h /= 3; h >= 1; h /= 3)' },
    { line: 17, code: '        for (int cor=0; cor<h; cor++)' },
    { line: 18, code: '            insercaoPorCor(A, cor, h, n);' },
    { line: 19, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void insercaoPorCor(int[] A, int cor, int h) {' },
    { line: 2, code: '    for (int i = cor+h; i < A.Length; i += h) {' },
    { line: 3, code: '        int tmp = A[i];' },
    { line: 4, code: '        int j = i - h;' },
    { line: 5, code: '        while (j >= cor && A[j] > tmp) {' },
    { line: 6, code: '            A[j+h] = A[j];' },
    { line: 7, code: '            j -= h;' },
    { line: 8, code: '        }' },
    { line: 9, code: '        A[j+h] = tmp;' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
    { line: 12, code: 'void shellSort(int[] A) {' },
    { line: 13, code: '    int h = 1;' },
    { line: 14, code: '    while (h < A.Length) h = h*3+1;' },
    { line: 15, code: '    for (h /= 3; h >= 1; h /= 3)' },
    { line: 16, code: '        for (int cor = 0; cor < h; cor++)' },
    { line: 17, code: '            insercaoPorCor(A, cor, h);' },
    { line: 18, code: '}' },
  ],

  python: [
    { line: 1,  code: 'def shell_sort(arr):' },
    { line: 2,  code: '    n = len(arr)' },
    { line: 3,  code: '    h = 1' },
    { line: 4,  code: '    while h < n: h = h * 3 + 1' },
    { line: 5,  code: '    h //= 3' },
    { line: 6,  code: '    while h >= 1:' },
    { line: 7,  code: '        for cor in range(h):' },
    { line: 8,  code: '            for i in range(cor+h, n, h):' },
    { line: 9,  code: '                tmp, j = arr[i], i - h' },
    { line: 10, code: '                while j >= cor and arr[j] > tmp:' },
    { line: 11, code: '                    arr[j+h] = arr[j]; j -= h' },
    { line: 12, code: '                arr[j+h] = tmp' },
    { line: 13, code: '        h //= 3' },
    { line: 14, code: '    return arr' },
  ],
  c: [
    { line: 1,  code: 'void insercaoPorCor(int* A, int cor, int h, int n) {' },
    { line: 2,  code: '    int i, j, tmp;' },
    { line: 3,  code: '    for (i = cor+h; i < n; i += h) {' },
    { line: 4,  code: '        tmp = A[i];' },
    { line: 5,  code: '        j = i - h;' },
    { line: 6,  code: '        while (j >= cor && A[j] > tmp) {' },
    { line: 7,  code: '            A[j+h] = A[j];' },
    { line: 8,  code: '            j -= h;' },
    { line: 9,  code: '        }' },
    { line: 10, code: '        A[j+h] = tmp;' },
    { line: 11, code: '    }' },
    { line: 12, code: '}' },
    { line: 13, code: 'void shellSort(int* A, int n) {' },
    { line: 14, code: '    int h = 1;' },
    { line: 15, code: '    while (h < n) h = h*3+1;' },
    { line: 16, code: '    for (h /= 3; h >= 1; h /= 3)' },
    { line: 17, code: '        for (int cor=0; cor<h; cor++)' },
    { line: 18, code: '            insercaoPorCor(A, cor, h, n);' },
    { line: 19, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void insercaoPorCor(int[] A, int cor, int h) {' },
    { line: 2,  code: '    for (int i = cor+h; i < A.length; i += h) {' },
    { line: 3,  code: '        int tmp = A[i];' },
    { line: 4,  code: '        int j = i - h;' },
    { line: 5,  code: '        while (j >= cor && A[j] > tmp) {' },
    { line: 6,  code: '            A[j+h] = A[j];' },
    { line: 7,  code: '            j -= h;' },
    { line: 8,  code: '        }' },
    { line: 9,  code: '        A[j+h] = tmp;' },
    { line: 10, code: '    }' },
    { line: 11, code: '}' },
    { line: 12, code: 'void shellSort(int[] A) {' },
    { line: 13, code: '    int h = 1;' },
    { line: 14, code: '    while (h < A.length) h = h*3+1;' },
    { line: 15, code: '    for (h /= 3; h >= 1; h /= 3)' },
    { line: 16, code: '        for (int cor = 0; cor < h; cor++)' },
    { line: 17, code: '            insercaoPorCor(A, cor, h);' },
    { line: 18, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func shellSort(arr []int) {' },
    { line: 2,  code: '    n := len(arr)' },
    { line: 3,  code: '    h := 1' },
    { line: 4,  code: '    for h < n { h = h*3 + 1 }' },
    { line: 5,  code: '    for h /= 3; h >= 1; h /= 3 {' },
    { line: 6,  code: '        for cor := 0; cor < h; cor++ {' },
    { line: 7,  code: '            for i := cor + h; i < n; i += h {' },
    { line: 8,  code: '                tmp, j := arr[i], i-h' },
    { line: 9,  code: '                for j >= cor && arr[j] > tmp {' },
    { line: 10, code: '                    arr[j+h] = arr[j]; j -= h' },
    { line: 11, code: '                }' },
    { line: 12, code: '                arr[j+h] = tmp' },
    { line: 13, code: '            }' },
    { line: 14, code: '        }' },
    { line: 15, code: '    }' },
    { line: 16, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function shellSort(arr) {' },
    { line: 2, code: '  const n = arr.length' },
    { line: 3, code: '  let h = 1' },
    { line: 4, code: '  while (h < n) h = h * 3 + 1' },
    { line: 5, code: '  for (h = Math.floor(h/3); h >= 1; h = Math.floor(h/3)) {' },
    { line: 6, code: '    for (let cor = 0; cor < h; cor++) {' },
    { line: 7, code: '      for (let i = cor+h; i < n; i += h) {' },
    { line: 8, code: '        const tmp = arr[i]' },
    { line: 9, code: '        let j = i - h' },
    { line: 10, code: '        while (j >= cor && arr[j] > tmp) {' },
    { line: 11, code: '          arr[j+h] = arr[j]; j -= h' },
    { line: 12, code: '        }' },
    { line: 13, code: '        arr[j+h] = tmp' },
    { line: 14, code: '      }' },
    { line: 15, code: '    }' },
    { line: 16, code: '  }' },
    { line: 17, code: '  return arr' },
    { line: 18, code: '}' },
  ],
}
