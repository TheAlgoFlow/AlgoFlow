import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'merge-sort',
  category: 'sorting',
  nameKey: 'algorithms.mergeSort.name',
  descriptionKey: 'algorithms.mergeSort.description',
  complexity: { time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' },
  tags: ['divide-and-conquer', 'stable', 'not-in-place'],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
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
        i++
        k++
      }

      while (j < right.length) {
        arr[k] = right[j]
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
    { line: 1, code: 'void merge(int arr[], int l, int m, int r) {' },
    { line: 2, code: '    int n1 = m-l+1, n2 = r-m;' },
    { line: 3, code: '    int L[n1], R[n2];' },
    { line: 4, code: '    for (int i=0;i<n1;i++) L[i]=arr[l+i];' },
    { line: 5, code: '    for (int j=0;j<n2;j++) R[j]=arr[m+1+j];' },
    { line: 6, code: '    int i=0,j=0,k=l;' },
    { line: 7, code: '    while(i<n1&&j<n2)' },
    { line: 8, code: '        arr[k++]=(L[i]<=R[j])?L[i++]:R[j++];' },
    { line: 9, code: '    while(i<n1) arr[k++]=L[i++];' },
    { line: 10, code: '    while(j<n2) arr[k++]=R[j++];' },
    { line: 11, code: '}' },
    { line: 12, code: 'void mergeSort(int arr[], int l, int r) {' },
    { line: 13, code: '    if (l < r) {' },
    { line: 14, code: '        int m = l+(r-l)/2;' },
    { line: 15, code: '        mergeSort(arr,l,m);' },
    { line: 16, code: '        mergeSort(arr,m+1,r);' },
    { line: 17, code: '        merge(arr,l,m,r);' },
    { line: 18, code: '    }' },
    { line: 19, code: '}' },
  ],
  java: [
    { line: 1, code: 'void mergeSort(int[] arr, int l, int r) {' },
    { line: 2, code: '    if (l < r) {' },
    { line: 3, code: '        int m = l + (r - l) / 2;' },
    { line: 4, code: '        mergeSort(arr, l, m);' },
    { line: 5, code: '        mergeSort(arr, m + 1, r);' },
    { line: 6, code: '        merge(arr, l, m, r);' },
    { line: 7, code: '    }' },
    { line: 8, code: '}' },
    { line: 9, code: 'void merge(int[] arr, int l, int m, int r) {' },
    { line: 10, code: '    int[] L = Arrays.copyOfRange(arr, l, m+1);' },
    { line: 11, code: '    int[] R = Arrays.copyOfRange(arr, m+1, r+1);' },
    { line: 12, code: '    int i=0,j=0,k=l;' },
    { line: 13, code: '    while(i<L.length&&j<R.length)' },
    { line: 14, code: '        arr[k++]=(L[i]<=R[j])?L[i++]:R[j++];' },
    { line: 15, code: '    while(i<L.length) arr[k++]=L[i++];' },
    { line: 16, code: '    while(j<R.length) arr[k++]=R[j++];' },
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
