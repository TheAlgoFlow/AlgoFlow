import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'merge-sort',
  category: 'sorting',
  nameKey: 'algorithms.mergeSort.name',
  descriptionKey: 'algorithms.mergeSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' },
  tags: ['divide-and-conquer', 'stable', 'not-in-place'],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/sort-list/',                       title: '#148 Sort List',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/ctci-merge-sort/problem',  title: 'Merge Sort: Counting Inversions', difficulty: 'Hard' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length

  // Iterative bottom-up merge sort
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width - 1, n - 1)
      const hi = Math.min(lo + 2 * width - 1, n - 1)

      if (mid >= hi) continue

      // Yield: show the two sub-arrays being merged
      const leftHighlights = []
      const rightHighlights = []
      for (let k = lo; k <= mid; k++) leftHighlights.push({ index: k, role: 'left' as const })
      for (let k = mid + 1; k <= hi; k++) rightHighlights.push({ index: k, role: 'right' as const })

      yield {
        state: { array: [...arr] },
        highlights: [...leftHighlights, ...rightHighlights],
        message: 'algorithms.mergeSort.steps.merge',
        codeLine: 5,
        auxState: { lo, mid, hi, width },
      }

      // Merge the two halves
      const left = arr.slice(lo, mid + 1)
      const right = arr.slice(mid + 1, hi + 1)
      let i = 0
      let j = 0
      let k = lo

      while (i < left.length && j < right.length) {
        // Yield: picking the smaller element
        yield {
          state: { array: [...arr] },
          highlights: [
            { index: lo + i, role: 'left' },
            { index: mid + 1 + j, role: 'right' },
            { index: k, role: 'current' },
          ],
          message: 'algorithms.mergeSort.steps.pick',
          codeLine: 7,
          auxState: { leftVal: left[i], rightVal: right[j] },
        }

        if (left[i] <= right[j]) {
          arr[k] = left[i]
          i++
        } else {
          arr[k] = right[j]
          j++
        }
        k++

        yield {
          state: { array: [...arr] },
          highlights: [{ index: k - 1, role: 'current' }],
          message: 'algorithms.mergeSort.steps.pick',
          codeLine: 8,
          auxState: { placed: arr[k - 1], pos: k - 1 },
        }
      }

      while (i < left.length) {
        arr[k] = left[i]
        yield {
          state: { array: [...arr] },
          highlights: [{ index: k, role: 'current' as const }],
          message: 'algorithms.mergeSort.steps.pick',
          codeLine: 9,
          auxState: { placed: left[i], pos: k },
        }
        i++
        k++
      }

      while (j < right.length) {
        arr[k] = right[j]
        yield {
          state: { array: [...arr] },
          highlights: [{ index: k, role: 'current' as const }],
          message: 'algorithms.mergeSort.steps.pick',
          codeLine: 9,
          auxState: { placed: right[j], pos: k },
        }
        j++
        k++
      }

      // Yield: merged segment
      const mergedHighlights = []
      for (let m = lo; m <= hi; m++) mergedHighlights.push({ index: m, role: 'active' as const })

      yield {
        state: { array: [...arr] },
        highlights: mergedHighlights,
        message: 'algorithms.mergeSort.steps.merge',
        codeLine: 10,
        auxState: { lo, hi },
      }
    }
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.mergeSort.steps.done',
    codeLine: 12,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function mergeSort(arr: number[]): number[] {' },
    { line: 2, code: '  if (arr.length <= 1) return arr' },
    { line: 3, code: '  const mid = Math.floor(arr.length / 2)' },
    { line: 4, code: '  const left = mergeSort(arr.slice(0, mid))' },
    { line: 5, code: '  const right = mergeSort(arr.slice(mid))' },
    { line: 6, code: '  return merge(left, right)' },
    { line: 7, code: '}' },
    { line: 8, code: 'function merge(left: number[], right: number[]): number[] {' },
    { line: 9, code: '  const result: number[] = []' },
    { line: 10, code: '  let i = 0, j = 0' },
    { line: 11, code: '  while (i < left.length && j < right.length)' },
    { line: 12, code: '    result.push(left[i] <= right[j] ? left[i++] : right[j++])' },
    { line: 13, code: '  return result.concat(left.slice(i), right.slice(j))' },
    { line: 14, code: '}' },
  ],
  python: [
    { line: 1, code: 'def merge_sort(arr):' },
    { line: 2, code: '    if len(arr) <= 1:' },
    { line: 3, code: '        return arr' },
    { line: 4, code: '    mid = len(arr) // 2' },
    { line: 5, code: '    left = merge_sort(arr[:mid])' },
    { line: 6, code: '    right = merge_sort(arr[mid:])' },
    { line: 7, code: '    return merge(left, right)' },
    { line: 8, code: 'def merge(left, right):' },
    { line: 9, code: '    result, i, j = [], 0, 0' },
    { line: 10, code: '    while i < len(left) and j < len(right):' },
    { line: 11, code: '        if left[i] <= right[j]:' },
    { line: 12, code: '            result.append(left[i]); i += 1' },
    { line: 13, code: '        else:' },
    { line: 14, code: '            result.append(right[j]); j += 1' },
    { line: 15, code: '    return result + left[i:] + right[j:]' },
  ],
  c: [
    { line: 1,  code: 'void intercala(int* A, int esq, int meio, int dir) {' },
    { line: 2,  code: '    int nEsq = meio-esq, nDir = dir-meio;' },
    { line: 3,  code: '    int AEsq[nEsq], ADir[nDir];' },
    { line: 4,  code: '    for (int i=0;i<nEsq;i++) AEsq[i]=A[esq+i];' },
    { line: 5,  code: '    for (int j=0;j<nDir;j++) ADir[j]=A[meio+j];' },
    { line: 6,  code: '    int i=0,j=0,k=esq;' },
    { line: 7,  code: '    while(i<nEsq&&j<nDir)' },
    { line: 8,  code: '        A[k++]=(AEsq[i]<=ADir[j])?AEsq[i++]:ADir[j++];' },
    { line: 9,  code: '    while(i<nEsq) A[k++]=AEsq[i++];' },
    { line: 10, code: '    while(j<nDir) A[k++]=ADir[j++];' },
    { line: 11, code: '}' },
    { line: 12, code: 'void mergeSort(int* A, int esq, int dir) {' },
    { line: 13, code: '    if (esq < dir-1) {' },
    { line: 14, code: '        int meio = (esq+dir)/2;' },
    { line: 15, code: '        mergeSort(A,esq,meio);' },
    { line: 16, code: '        mergeSort(A,meio,dir);' },
    { line: 17, code: '        intercala(A,esq,meio,dir);' },
    { line: 18, code: '    }' },
    { line: 19, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void mergeSort(int[] A, int esq, int dir) {' },
    { line: 2,  code: '    if (esq < dir - 1) {' },
    { line: 3,  code: '        int meio = (esq + dir) / 2;' },
    { line: 4,  code: '        mergeSort(A, esq, meio);' },
    { line: 5,  code: '        mergeSort(A, meio, dir);' },
    { line: 6,  code: '        intercala(A, esq, meio, dir);' },
    { line: 7,  code: '    }' },
    { line: 8,  code: '}' },
    { line: 9,  code: 'void intercala(int[] A, int esq, int meio, int dir) {' },
    { line: 10, code: '    int[] AEsq = Arrays.copyOfRange(A, esq, meio);' },
    { line: 11, code: '    int[] ADir = Arrays.copyOfRange(A, meio, dir);' },
    { line: 12, code: '    int i=0,j=0,k=esq;' },
    { line: 13, code: '    while(i<AEsq.length&&j<ADir.length)' },
    { line: 14, code: '        A[k++]=(AEsq[i]<=ADir[j])?AEsq[i++]:ADir[j++];' },
    { line: 15, code: '    while(i<AEsq.length) A[k++]=AEsq[i++];' },
    { line: 16, code: '    while(j<ADir.length) A[k++]=ADir[j++];' },
    { line: 17, code: '}' },
  ],
  go: [
    { line: 1, code: 'func mergeSort(arr []int) []int {' },
    { line: 2, code: '    if len(arr) <= 1 { return arr }' },
    { line: 3, code: '    mid := len(arr) / 2' },
    { line: 4, code: '    left := mergeSort(arr[:mid])' },
    { line: 5, code: '    right := mergeSort(arr[mid:])' },
    { line: 6, code: '    return merge(left, right)' },
    { line: 7, code: '}' },
    { line: 8, code: 'func merge(l, r []int) []int {' },
    { line: 9, code: '    result := []int{}' },
    { line: 10, code: '    i, j := 0, 0' },
    { line: 11, code: '    for i < len(l) && j < len(r) {' },
    { line: 12, code: '        if l[i] <= r[j] { result = append(result, l[i]); i++' },
    { line: 13, code: '        } else { result = append(result, r[j]); j++ }' },
    { line: 14, code: '    }' },
    { line: 15, code: '    return append(append(result, l[i:]...), r[j:]...)' },
    { line: 16, code: '}' },
  ],
}
