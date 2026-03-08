import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'array-ops',
  category: 'data-structures',
  nameKey: 'algorithms.arrayOps.name',
  descriptionKey: 'algorithms.arrayOps.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  tags: ['fundamental', 'random-access'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/running-sum-of-1d-array/',    title: '#1480 Running Sum of 1d Array', difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/arrays-ds/problem',    title: 'Arrays - DS',                  difficulty: 'Easy' },
    { platform: 'beecrowd',   url: 'https://www.beecrowd.com.br/judge/en/problems/view/1001',   title: '#1001 Extremely Basic',         difficulty: 'Easy' },
  ],
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  // Step 1: Start with array [10, 20, 30, 40, 50]
  let arr = [10, 20, 30, 40, 50]

  yield {
    state: { array: [...arr], operation: 'init' },
    highlights: [],
    message: 'algorithms.arrayOps.steps.init',
    codeLine: 1,
  }

  // Step 2: Access index 2
  yield {
    state: { array: [...arr], operation: 'access' },
    highlights: [{ index: 2, role: 'current' }],
    message: 'algorithms.arrayOps.steps.access',
    codeLine: 2,
    auxState: { i: 2, v: 30 },
  }

  // Step 3: Insert 25 at index 2 — shift elements right first
  // arr = [10, 20, 30, 40, 50] → insert 25 at index 2
  // shift: index 4←3←2, place 25 at 2 → [10, 20, 25, 30, 40, 50]
  const insertIndex = 2
  const insertValue = 25
  arr.push(0) // make room

  for (let k = arr.length - 1; k > insertIndex; k--) {
    arr[k] = arr[k - 1]
    yield {
      state: { array: [...arr], operation: 'insert' },
      highlights: [
        { index: k, role: 'swap' },
        { index: k - 1, role: 'swap' },
      ],
      message: 'algorithms.arrayOps.steps.shift',
      codeLine: 4,
      auxState: { from: k - 1, to: k },
    }
  }
  arr[insertIndex] = insertValue
  yield {
    state: { array: [...arr], operation: 'insert' },
    highlights: [{ index: insertIndex, role: 'current' }],
    message: 'algorithms.arrayOps.steps.insert',
    codeLine: 5,
    auxState: { i: insertIndex, v: insertValue },
  }

  // Step 4: Delete element at index 1 (value 20)
  // arr = [10, 20, 25, 30, 40, 50] → delete index 1 → [10, 25, 30, 40, 50]
  const deleteIndex = 1
  yield {
    state: { array: [...arr], operation: 'delete' },
    highlights: [{ index: deleteIndex, role: 'compare' }],
    message: 'algorithms.arrayOps.steps.delete',
    codeLine: 7,
    auxState: { i: deleteIndex, v: arr[deleteIndex] },
  }

  for (let k = deleteIndex; k < arr.length - 1; k++) {
    arr[k] = arr[k + 1]
    yield {
      state: { array: [...arr], operation: 'delete' },
      highlights: [
        { index: k, role: 'compare' },
        { index: k + 1, role: 'compare' },
      ],
      message: 'algorithms.arrayOps.steps.shiftLeft',
      codeLine: 8,
      auxState: { from: k + 1, to: k },
    }
  }
  arr.pop()
  yield {
    state: { array: [...arr], operation: 'delete' },
    highlights: [],
    message: 'algorithms.arrayOps.steps.deleted',
    codeLine: 9,
  }

  // Step 5: Linear search for 40
  const target = 40
  yield {
    state: { array: [...arr], operation: 'search' },
    highlights: [],
    message: 'algorithms.arrayOps.steps.searchStart',
    codeLine: 11,
    auxState: { target },
  }

  for (let k = 0; k < arr.length; k++) {
    if (arr[k] === target) {
      yield {
        state: { array: [...arr], operation: 'search' },
        highlights: [{ index: k, role: 'found' }],
        message: 'algorithms.arrayOps.steps.found',
        codeLine: 13,
        auxState: { i: k, v: arr[k] },
      }
      break
    } else {
      yield {
        state: { array: [...arr], operation: 'search' },
        highlights: [{ index: k, role: 'current' }],
        message: 'algorithms.arrayOps.steps.searching',
        codeLine: 12,
        auxState: { i: k, v: arr[k], target },
      }
    }
  }

  yield {
    state: { array: [...arr], operation: 'done' },
    highlights: [],
    message: 'algorithms.arrayOps.steps.done',
    codeLine: 14,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'const arr: number[] = [10, 20, 30, 40, 50]' },
    { line: 2, code: '// Access: O(1)' },
    { line: 3, code: 'const val = arr[2]  // 30' },
    { line: 4, code: '// Insert at index i: O(n)' },
    { line: 5, code: 'arr.splice(2, 0, 25)  // [10,20,25,30,40,50]' },
    { line: 6, code: '// Delete at index i: O(n)' },
    { line: 7, code: 'arr.splice(1, 1)  // [10,25,30,40,50]' },
    { line: 8, code: '// Linear search: O(n)' },
    { line: 9, code: 'function linearSearch(arr: number[], t: number): number {' },
    { line: 10, code: '  for (let i = 0; i < arr.length; i++) {' },
    { line: 11, code: '    if (arr[i] === t) return i' },
    { line: 12, code: '  }' },
    { line: 13, code: '  return -1' },
    { line: 14, code: '}' },
  ],
  python: [
    { line: 1, code: 'arr = [10, 20, 30, 40, 50]' },
    { line: 2, code: '# Access: O(1)' },
    { line: 3, code: 'val = arr[2]  # 30' },
    { line: 4, code: '# Insert at index i: O(n)' },
    { line: 5, code: 'arr.insert(2, 25)  # [10,20,25,30,40,50]' },
    { line: 6, code: '# Delete at index i: O(n)' },
    { line: 7, code: 'arr.pop(1)  # [10,25,30,40,50]' },
    { line: 8, code: '# Linear search: O(n)' },
    { line: 9, code: 'def linear_search(arr, t):' },
    { line: 10, code: '    for i, v in enumerate(arr):' },
    { line: 11, code: '        if v == t: return i' },
    { line: 12, code: '    return -1' },
  ],
  c: [
    { line: 1, code: 'int arr[] = {10, 20, 30, 40, 50};' },
    { line: 2, code: 'int n = 5;' },
    { line: 3, code: '// Access: O(1)' },
    { line: 4, code: 'int val = arr[2];  // 30' },
    { line: 5, code: '// Insert 25 at index 2: O(n)' },
    { line: 6, code: 'for (int k = n; k > 2; k--) arr[k] = arr[k-1];' },
    { line: 7, code: 'arr[2] = 25; n++;' },
    { line: 8, code: '// Delete index 1: O(n)' },
    { line: 9, code: 'for (int k = 1; k < n-1; k++) arr[k] = arr[k+1];' },
    { line: 10, code: 'n--;' },
    { line: 11, code: '// Linear search: O(n)' },
    { line: 12, code: 'int linearSearch(int arr[], int n, int t) {' },
    { line: 13, code: '    for (int i = 0; i < n; i++)' },
    { line: 14, code: '        if (arr[i] == t) return i;' },
    { line: 15, code: '    return -1;' },
    { line: 16, code: '}' },
  ],
  java: [
    { line: 1, code: 'int[] arr = {10, 20, 30, 40, 50};' },
    { line: 2, code: '// Access: O(1)' },
    { line: 3, code: 'int val = arr[2];  // 30' },
    { line: 4, code: '// Use ArrayList for dynamic insert/delete' },
    { line: 5, code: 'List<Integer> list = new ArrayList<>(Arrays.asList(arr));' },
    { line: 6, code: 'list.add(2, 25);  // insert at index 2' },
    { line: 7, code: 'list.remove(1);   // delete at index 1' },
    { line: 8, code: '// Linear search: O(n)' },
    { line: 9, code: 'int linearSearch(int[] arr, int t) {' },
    { line: 10, code: '    for (int i = 0; i < arr.length; i++)' },
    { line: 11, code: '        if (arr[i] == t) return i;' },
    { line: 12, code: '    return -1;' },
    { line: 13, code: '}' },
  ],
  go: [
    { line: 1, code: 'arr := []int{10, 20, 30, 40, 50}' },
    { line: 2, code: '// Access: O(1)' },
    { line: 3, code: 'val := arr[2]  // 30' },
    { line: 4, code: '// Insert 25 at index 2: O(n)' },
    { line: 5, code: 'arr = append(arr[:2+1], arr[2:]...)' },
    { line: 6, code: 'arr[2] = 25' },
    { line: 7, code: '// Delete at index 1: O(n)' },
    { line: 8, code: 'arr = append(arr[:1], arr[2:]...)' },
    { line: 9, code: '// Linear search: O(n)' },
    { line: 10, code: 'func linearSearch(arr []int, t int) int {' },
    { line: 11, code: '    for i, v := range arr {' },
    { line: 12, code: '        if v == t { return i }' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return -1' },
    { line: 15, code: '}' },
  ],
}
