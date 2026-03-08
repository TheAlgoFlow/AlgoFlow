import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'radix-sort',
  category: 'sorting',
  nameKey: 'algorithms.radixSort.name',
  descriptionKey: 'algorithms.radixSort.description',
  complexity: { time: { best: 'O(d·n)', avg: 'O(d·n)', worst: 'O(d·n)' }, space: 'O(n+k)' },
  tags: ['non-comparison', 'stable', 'integer-sort'],
  defaultInput: [170, 45, 75, 90, 802, 24, 2, 66],
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/maximum-gap/',               title: '#164 Maximum Gap', difficulty: 'Hard' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/radix-sort/problem', title: 'Radix Sort',       difficulty: 'Medium' },
  ],
}

export function* generator(input: unknown): Generator<AlgorithmFrame> {
  const arr = [...(input as number[])]
  const n = arr.length

  const max = Math.max(...arr)
  const maxDigits = Math.floor(Math.log10(max)) + 1

  for (let digit = 0; digit < maxDigits; digit++) {
    const exp = Math.pow(10, digit)

    // Announce the current pass
    yield {
      state: { array: [...arr] },
      highlights: [],
      message: 'algorithms.radixSort.steps.pass',
      codeLine: 2,
      auxState: { digit, place: exp, pass: digit + 1, totalPasses: maxDigits },
    }

    const buckets: number[][] = Array.from({ length: 10 }, () => [])

    // Distribute elements into buckets
    for (let i = 0; i < n; i++) {
      const bucketIdx = Math.floor(arr[i] / exp) % 10

      yield {
        state: { array: [...arr], buckets: buckets.map(b => [...b]) },
        highlights: [{ index: i, role: 'current' }],
        message: 'algorithms.radixSort.steps.bucket',
        codeLine: 4,
        auxState: { val: arr[i], bucketIdx, digit, place: exp },
      }

      buckets[bucketIdx].push(arr[i])

      yield {
        state: { array: [...arr], buckets: buckets.map(b => [...b]) },
        highlights: [{ index: i, role: 'active' }],
        message: 'algorithms.radixSort.steps.bucket',
        codeLine: 5,
        auxState: { val: arr[i], bucketIdx, digit, place: exp },
      }
    }

    // Collect elements back from buckets
    let k = 0
    for (let b = 0; b < 10; b++) {
      for (const val of buckets[b]) {
        arr[k] = val
        k++
      }
    }

    yield {
      state: { array: [...arr], buckets: buckets.map(b => [...b]) },
      highlights: arr.map((_, idx) => ({ index: idx, role: 'active' as const })),
      message: 'algorithms.radixSort.steps.collect',
      codeLine: 7,
      auxState: { digit, place: exp },
    }
  }

  yield {
    state: { array: [...arr] },
    highlights: arr.map((_, idx) => ({ index: idx, role: 'sorted' as const })),
    message: 'algorithms.radixSort.steps.done',
    codeLine: 9,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function radixSort(arr: number[]): number[] {' },
    { line: 2, code: '  const max = Math.max(...arr)' },
    { line: 3, code: '  for (let exp = 1; Math.floor(max/exp) > 0; exp *= 10) {' },
    { line: 4, code: '    const buckets: number[][] = Array.from({length:10},()=>[])' },
    { line: 5, code: '    for (const v of arr) buckets[Math.floor(v/exp)%10].push(v)' },
    { line: 6, code: '    arr = ([] as number[]).concat(...buckets)' },
    { line: 7, code: '  }' },
    { line: 8, code: '  return arr' },
    { line: 9, code: '}' },
  ],
  python: [
    { line: 1, code: 'def radix_sort(arr):' },
    { line: 2, code: '    max_val = max(arr)' },
    { line: 3, code: '    exp = 1' },
    { line: 4, code: '    while max_val // exp > 0:' },
    { line: 5, code: '        buckets = [[] for _ in range(10)]' },
    { line: 6, code: '        for v in arr: buckets[(v // exp) % 10].append(v)' },
    { line: 7, code: '        arr = [v for b in buckets for v in b]' },
    { line: 8, code: '        exp *= 10' },
    { line: 9, code: '    return arr' },
  ],
  c: [
    { line: 1, code: 'void countSort(int arr[], int n, int exp) {' },
    { line: 2, code: '    int output[n], count[10]={0};' },
    { line: 3, code: '    for(int i=0;i<n;i++) count[(arr[i]/exp)%10]++;' },
    { line: 4, code: '    for(int i=1;i<10;i++) count[i]+=count[i-1];' },
    { line: 5, code: '    for(int i=n-1;i>=0;i--) output[--count[(arr[i]/exp)%10]]=arr[i];' },
    { line: 6, code: '    for(int i=0;i<n;i++) arr[i]=output[i];' },
    { line: 7, code: '}' },
    { line: 8, code: 'void radixSort(int arr[], int n) {' },
    { line: 9, code: '    int max=arr[0];' },
    { line: 10, code: '    for(int i=1;i<n;i++) if(arr[i]>max) max=arr[i];' },
    { line: 11, code: '    for(int exp=1;max/exp>0;exp*=10) countSort(arr,n,exp);' },
    { line: 12, code: '}' },
  ],
  java: [
    { line: 1, code: 'void radixSort(int[] arr) {' },
    { line: 2, code: '    int max = Arrays.stream(arr).max().getAsInt();' },
    { line: 3, code: '    for (int exp=1; max/exp>0; exp*=10) {' },
    { line: 4, code: '        int[] output = new int[arr.length];' },
    { line: 5, code: '        int[] count = new int[10];' },
    { line: 6, code: '        for (int v : arr) count[(v/exp)%10]++;' },
    { line: 7, code: '        for (int i=1;i<10;i++) count[i]+=count[i-1];' },
    { line: 8, code: '        for (int i=arr.length-1;i>=0;i--)' },
    { line: 9, code: '            output[--count[(arr[i]/exp)%10]]=arr[i];' },
    { line: 10, code: '        System.arraycopy(output,0,arr,0,arr.length);' },
    { line: 11, code: '    }' },
    { line: 12, code: '}' },
  ],
  go: [
    { line: 1, code: 'func radixSort(arr []int) []int {' },
    { line: 2, code: '    max := arr[0]' },
    { line: 3, code: '    for _, v := range arr { if v > max { max = v } }' },
    { line: 4, code: '    for exp := 1; max/exp > 0; exp *= 10 {' },
    { line: 5, code: '        buckets := make([][]int, 10)' },
    { line: 6, code: '        for _, v := range arr { d := (v/exp)%10; buckets[d]=append(buckets[d],v) }' },
    { line: 7, code: '        arr = arr[:0]' },
    { line: 8, code: '        for _, b := range buckets { arr = append(arr, b...) }' },
    { line: 9, code: '    }' },
    { line: 10, code: '    return arr' },
    { line: 11, code: '}' },
  ],
}
