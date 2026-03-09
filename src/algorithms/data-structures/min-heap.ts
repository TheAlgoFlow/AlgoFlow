import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'min-heap',
  category: 'data-structures',
  nameKey: 'algorithms.minHeap.name',
  descriptionKey: 'algorithms.minHeap.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    operations: [
      { name: 'insert',      best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'extract min', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'get min',     best: 'O(1)',     avg: 'O(1)',     worst: 'O(1)'     },
      { name: 'heapify',     best: 'O(n)',     avg: 'O(n)',     worst: 'O(n)'     },
    ],
  },
  tags: ['heap', 'priority-queue', 'complete-tree'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', title: '#215 Kth Largest Element', difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/jesse-and-cookies/problem', title: 'Jesse and Cookies',        difficulty: 'Easy'   },
  ],
}

// ─── Heap helpers ────────────────────────────────────────────────────────────

function heapParent(i: number): number { return Math.floor((i - 1) / 2) }
function heapLeft(i: number): number   { return 2 * i + 1 }
function heapRight(i: number): number  { return 2 * i + 2 }

// ─── dsOperations generators ─────────────────────────────────────────────────

function* insertHeapGenerator(value: number = 5, initialState?: unknown): Generator<AlgorithmFrame> {
  const heap = initialState ? [...(initialState as { array: number[] }).array] : [1, 3, 8, 5, 9, 10]
  const val = value

  let swaps = 0

  // Step 1: show initial heap
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.insert.init',
    codeLine: 1,
    auxState: { swaps },
  }

  // Add at end
  heap.push(val)
  const n = heap.length - 1
  yield {
    state: { array: [...heap] },
    highlights: [{ index: n, role: 'active', label: 'new' }],
    message: 'ds.minHeap.insert.push',
    codeLine: 2,
    auxState: { swaps },
  }

  // Bubble up
  let i = heap.length - 1
  while (i > 0 && heap[i] < heap[heapParent(i)]) {
    const p = heapParent(i)
    yield {
      state: { array: [...heap] },
      highlights: [
        { index: i, role: 'swap',    label: 'i'   },
        { index: p, role: 'compare', label: 'par' },
      ],
      message: 'ds.minHeap.insert.bubbleUp',
      codeLine: 4,
      auxState: { swaps },
    }
    ;[heap[i], heap[p]] = [heap[p], heap[i]]
    swaps++
    i = p
  }

  // Done
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.insert.done',
    codeLine: 5,
    auxState: { swaps },
  }
}

function* extractMinGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const heap = initialState ? [...(initialState as { array: number[] }).array] : [1, 3, 8, 5, 9, 10]
  let swaps = 0

  // Step 1: show heap, highlight min
  yield {
    state: { array: [...heap] },
    highlights: [{ index: 0, role: 'selected', label: 'min' }],
    message: 'ds.minHeap.extractMin.init',
    codeLine: 1,
    auxState: { swaps },
  }

  const last = heap.length - 1

  // Step 2: swap min with last
  yield {
    state: { array: [...heap] },
    highlights: [
      { index: 0,    role: 'swap', label: 'i'    },
      { index: last, role: 'swap', label: 'last' },
    ],
    message: 'ds.minHeap.extractMin.swap',
    codeLine: 3,
    auxState: { swaps },
  }
  ;[heap[0], heap[last]] = [heap[last], heap[0]]
  swaps++

  // Remove last
  heap.pop()

  // Step 3: bubble down (sift down)
  let i = 0
  while (true) {
    const l = heapLeft(i)
    const r = heapRight(i)
    let smallest = i

    if (l < heap.length && heap[l] < heap[smallest]) smallest = l
    if (r < heap.length && heap[r] < heap[smallest]) smallest = r

    if (smallest === i) break

    yield {
      state: { array: [...heap] },
      highlights: [
        { index: i,        role: 'current', label: 'i'     },
        { index: smallest, role: 'compare', label: 'child' },
      ],
      message: 'ds.minHeap.extractMin.siftDown',
      codeLine: 5,
      auxState: { swaps },
    }
    ;[heap[i], heap[smallest]] = [heap[smallest], heap[i]]
    swaps++
    i = smallest
  }

  // Done
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.extractMin.done',
    codeLine: 7,
    auxState: { swaps },
  }
}

function* getMinGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const heap = initialState ? [...(initialState as { array: number[] }).array] : [1, 3, 8, 5, 9, 10]

  // Step 1: show heap
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.getMin.init',
    codeLine: 1,
  }

  // Step 2: highlight index 0
  yield {
    state: { array: [...heap] },
    highlights: [{ index: 0, role: 'found', label: 'min' }],
    message: 'ds.minHeap.getMin.done',
    codeLine: 2,
  }
}

function* heapifyGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const arr = initialState ? [...(initialState as { array: number[] }).array] : [9, 3, 8, 1, 5, 10]
  const heap = [...arr]

  // Step 1: show unsorted array
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.heapify.init',
    codeLine: 1,
  }

  // Sift down from Math.floor(n/2)-1 down to 0
  const startIdx = Math.floor(heap.length / 2) - 1

  for (let root = startIdx; root >= 0; root--) {
    // sift down `root`
    let i = root
    while (true) {
      const l = heapLeft(i)
      const r = heapRight(i)
      let smallest = i

      if (l < heap.length && heap[l] < heap[smallest]) smallest = l
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r

      if (smallest === i) break

      yield {
        state: { array: [...heap] },
        highlights: [
          { index: i,        role: 'current', label: 'i'     },
          { index: smallest, role: 'compare', label: 'child' },
        ],
        message: 'ds.minHeap.heapify.siftDown',
        codeLine: 4,
      }
      ;[heap[i], heap[smallest]] = [heap[smallest], heap[i]]
      i = smallest
    }
  }

  // Done — show final heap
  yield {
    state: { array: [...heap] },
    highlights: [],
    message: 'ds.minHeap.heapify.done',
    codeLine: 5,
  }
}

// ─── Per-operation code snippets ─────────────────────────────────────────────

const insertOpSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'insert(val: number): void {' },
    { line: 2, code: '  this.heap.push(val)' },
    { line: 3, code: '  let i = this.heap.length - 1' },
    { line: 4, code: '  while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {' },
    { line: 5, code: '    [this.heap[i], this.heap[this.parent(i)]] = [this.heap[this.parent(i)], this.heap[i]]' },
    { line: 6, code: '    i = this.parent(i)' },
    { line: 7, code: '  }' },
    { line: 8, code: '}' },
  ],
  python: [
    { line: 1, code: 'def insert(self, val: int) -> None:' },
    { line: 2, code: '    self.heap.append(val)' },
    { line: 3, code: '    i = len(self.heap) - 1' },
    { line: 4, code: '    while i > 0 and self.heap[i] < self.heap[(i - 1) // 2]:' },
    { line: 5, code: '        p = (i - 1) // 2' },
    { line: 6, code: '        self.heap[i], self.heap[p] = self.heap[p], self.heap[i]' },
    { line: 7, code: '        i = p' },
    { line: 8, code: '' },
  ],
  c: [
    { line: 1, code: 'void insert(int heap[], int *size, int val) {' },
    { line: 2, code: '    heap[(*size)++] = val;' },
    { line: 3, code: '    int i = *size - 1;' },
    { line: 4, code: '    while (i > 0 && heap[i] < heap[(i - 1) / 2]) {' },
    { line: 5, code: '        int t = heap[i]; heap[i] = heap[(i-1)/2]; heap[(i-1)/2] = t;' },
    { line: 6, code: '        i = (i - 1) / 2;' },
    { line: 7, code: '    }' },
    { line: 8, code: '}' },
  ],
  java: [
    { line: 1, code: 'void insert(int val) {' },
    { line: 2, code: '    heap.add(val);' },
    { line: 3, code: '    int i = heap.size() - 1;' },
    { line: 4, code: '    while (i > 0 && heap.get(i) < heap.get((i - 1) / 2)) {' },
    { line: 5, code: '        int p = (i - 1) / 2;' },
    { line: 6, code: '        Collections.swap(heap, i, p);' },
    { line: 7, code: '        i = p;' },
    { line: 8, code: '    }' },
  ],
  go: [
    { line: 1, code: 'func (h *MinHeap) Insert(val int) {' },
    { line: 2, code: '    *h = append(*h, val)' },
    { line: 3, code: '    i := len(*h) - 1' },
    { line: 4, code: '    for i > 0 && (*h)[i] < (*h)[(i-1)/2] {' },
    { line: 5, code: '        p := (i - 1) / 2' },
    { line: 6, code: '        (*h)[i], (*h)[p] = (*h)[p], (*h)[i]' },
    { line: 7, code: '        i = p' },
    { line: 8, code: '    }' },
  ],
}

const extractMinOpSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'extractMin(): number | undefined {' },
    { line: 2,  code: '  if (this.heap.length === 0) return undefined' },
    { line: 3,  code: '  const min = this.heap[0]' },
    { line: 4,  code: '  this.heap[0] = this.heap.pop()!' },
    { line: 5,  code: '  let i = 0' },
    { line: 6,  code: '  while (true) {' },
    { line: 7,  code: '    const l = 2*i+1, r = 2*i+2' },
    { line: 8,  code: '    let smallest = i' },
    { line: 9,  code: '    if (l < this.heap.length && this.heap[l] < this.heap[smallest]) smallest = l' },
    { line: 10, code: '    if (r < this.heap.length && this.heap[r] < this.heap[smallest]) smallest = r' },
    { line: 11, code: '    if (smallest === i) break' },
    { line: 12, code: '    [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]' },
    { line: 13, code: '    i = smallest' },
    { line: 14, code: '  }' },
    { line: 15, code: '  return min' },
    { line: 16, code: '}' },
  ],
  python: [
    { line: 1,  code: 'def extract_min(self):' },
    { line: 2,  code: '    if not self.heap: return None' },
    { line: 3,  code: '    min_val = self.heap[0]' },
    { line: 4,  code: '    self.heap[0] = self.heap.pop()' },
    { line: 5,  code: '    i = 0' },
    { line: 6,  code: '    while True:' },
    { line: 7,  code: '        l, r, smallest = 2*i+1, 2*i+2, i' },
    { line: 8,  code: '        if l < len(self.heap) and self.heap[l] < self.heap[smallest]: smallest = l' },
    { line: 9,  code: '        if r < len(self.heap) and self.heap[r] < self.heap[smallest]: smallest = r' },
    { line: 10, code: '        if smallest == i: break' },
    { line: 11, code: '        self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]' },
    { line: 12, code: '        i = smallest' },
    { line: 13, code: '    return min_val' },
    { line: 14, code: '' },
    { line: 15, code: '' },
    { line: 16, code: '' },
  ],
  c: [
    { line: 1,  code: 'int extractMin(int heap[], int *size) {' },
    { line: 2,  code: '    if (*size == 0) return -1;' },
    { line: 3,  code: '    int min = heap[0];' },
    { line: 4,  code: '    heap[0] = heap[--(*size)];' },
    { line: 5,  code: '    int i = 0;' },
    { line: 6,  code: '    while (1) {' },
    { line: 7,  code: '        int l = 2*i+1, r = 2*i+2, s = i;' },
    { line: 8,  code: '        if (l < *size && heap[l] < heap[s]) s = l;' },
    { line: 9,  code: '        if (r < *size && heap[r] < heap[s]) s = r;' },
    { line: 10, code: '        if (s == i) break;' },
    { line: 11, code: '        int t = heap[i]; heap[i] = heap[s]; heap[s] = t;' },
    { line: 12, code: '        i = s;' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return min;' },
    { line: 15, code: '}' },
    { line: 16, code: '' },
  ],
  java: [
    { line: 1,  code: 'int extractMin() {' },
    { line: 2,  code: '    if (heap.isEmpty()) return Integer.MIN_VALUE;' },
    { line: 3,  code: '    int min = heap.get(0);' },
    { line: 4,  code: '    heap.set(0, heap.remove(heap.size() - 1));' },
    { line: 5,  code: '    int i = 0;' },
    { line: 6,  code: '    while (true) {' },
    { line: 7,  code: '        int l = 2*i+1, r = 2*i+2, s = i;' },
    { line: 8,  code: '        if (l < heap.size() && heap.get(l) < heap.get(s)) s = l;' },
    { line: 9,  code: '        if (r < heap.size() && heap.get(r) < heap.get(s)) s = r;' },
    { line: 10, code: '        if (s == i) break;' },
    { line: 11, code: '        Collections.swap(heap, i, s);' },
    { line: 12, code: '        i = s;' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return min;' },
    { line: 15, code: '}' },
    { line: 16, code: '' },
  ],
  go: [
    { line: 1,  code: 'func (h *MinHeap) ExtractMin() int {' },
    { line: 2,  code: '    if len(*h) == 0 { return -1 }' },
    { line: 3,  code: '    min := (*h)[0]' },
    { line: 4,  code: '    last := len(*h) - 1' },
    { line: 5,  code: '    (*h)[0] = (*h)[last]; *h = (*h)[:last]' },
    { line: 6,  code: '    i := 0' },
    { line: 7,  code: '    for {' },
    { line: 8,  code: '        l, r, s := 2*i+1, 2*i+2, i' },
    { line: 9,  code: '        if l < len(*h) && (*h)[l] < (*h)[s] { s = l }' },
    { line: 10, code: '        if r < len(*h) && (*h)[r] < (*h)[s] { s = r }' },
    { line: 11, code: '        if s == i { break }' },
    { line: 12, code: '        (*h)[i], (*h)[s] = (*h)[s], (*h)[i]' },
    { line: 13, code: '        i = s' },
    { line: 14, code: '    }' },
    { line: 15, code: '    return min' },
    { line: 16, code: '}' },
  ],
}

const getMinOpSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'getMin(): number | undefined {' },
    { line: 2, code: '  return this.heap[0]' },
    { line: 3, code: '}' },
  ],
  python: [
    { line: 1, code: 'def get_min(self):' },
    { line: 2, code: '    return self.heap[0] if self.heap else None' },
    { line: 3, code: '' },
  ],
  c: [
    { line: 1, code: 'int getMin(int heap[], int size) {' },
    { line: 2, code: '    return size > 0 ? heap[0] : -1;' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'Integer getMin() {' },
    { line: 2, code: '    return heap.isEmpty() ? null : heap.get(0);' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (h MinHeap) GetMin() int {' },
    { line: 2, code: '    return h[0]' },
    { line: 3, code: '}' },
  ],
}

const heapifyOpSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'heapify(arr: number[]): void {' },
    { line: 2, code: '  this.heap = [...arr]' },
    { line: 3, code: '  for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {' },
    { line: 4, code: '    this.siftDown(i)' },
    { line: 5, code: '  }' },
    { line: 6, code: '}' },
  ],
  python: [
    { line: 1, code: 'def heapify(self, arr: list) -> None:' },
    { line: 2, code: '    self.heap = arr[:]' },
    { line: 3, code: '    for i in range(len(self.heap) // 2 - 1, -1, -1):' },
    { line: 4, code: '        self._sift_down(i)' },
    { line: 5, code: '    # O(n) build' },
    { line: 6, code: '' },
  ],
  c: [
    { line: 1, code: 'void heapify(int heap[], int n) {' },
    { line: 2, code: '    // copy array in-place' },
    { line: 3, code: '    for (int i = n / 2 - 1; i >= 0; i--) {' },
    { line: 4, code: '        siftDown(heap, n, i);' },
    { line: 5, code: '    }' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'void heapify(int[] arr) {' },
    { line: 2, code: '    heap = new ArrayList<>();' },
    { line: 3, code: '    for (int v : arr) heap.add(v);' },
    { line: 4, code: '    for (int i = heap.size() / 2 - 1; i >= 0; i--)' },
    { line: 5, code: '        siftDown(i);' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func Heapify(arr []int) MinHeap {' },
    { line: 2, code: '    h := MinHeap(append([]int{}, arr...))' },
    { line: 3, code: '    for i := len(h)/2 - 1; i >= 0; i-- {' },
    { line: 4, code: '        h.siftDown(i)' },
    { line: 5, code: '    }' },
    { line: 6, code: '    return h' },
  ],
}

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => insertHeapGenerator(value, initialState),
    codeSnippets: insertOpSnippets,
  },
  {
    type: 'remove',
    label: 'Extract Min',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => extractMinGenerator(value, initialState),
    codeSnippets: extractMinOpSnippets,
  },
  {
    type: 'search',
    label: 'Get Min',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => getMinGenerator(value, initialState),
    codeSnippets: getMinOpSnippets,
  },
  {
    type: 'traverse',
    label: 'Heapify',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => heapifyGenerator(value, initialState),
    codeSnippets: heapifyOpSnippets,
  },
]

// ─── Top-level generator (demo: insert 5 values, extract min twice) ──────────

type MinHeapState = {
  array: number[]
  size: number
  highlighted: number[]
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const heap: number[] = []
  const extracted: number[] = []

  function makeState(highlighted: number[]): MinHeapState {
    return { array: [...heap], size: heap.length, highlighted: [...highlighted] }
  }

  function parent(i: number): number { return Math.floor((i - 1) / 2) }
  function leftChild(i: number): number { return 2 * i + 1 }
  function rightChild(i: number): number { return 2 * i + 2 }

  // Insert with bubble-up
  function* insertValue(value: number): Generator<AlgorithmFrame> {
    heap.push(value)
    let idx = heap.length - 1

    yield {
      state: makeState([idx]),
      highlights: [{ index: idx, role: 'current' }],
      message: 'algorithms.minHeap.steps.insert',
      codeLine: 2,
      auxState: { v: value, i: idx },
    }

    // Bubble up
    while (idx > 0) {
      const p = parent(idx)

      yield {
        state: makeState([idx, p]),
        highlights: [
          { index: idx, role: 'compare' },
          { index: p, role: 'compare' },
        ],
        message: 'algorithms.minHeap.steps.bubbleUp',
        codeLine: 4,
        auxState: { child: heap[idx], parentVal: heap[p] },
      }

      if (heap[idx] < heap[p]) {
        ;[heap[idx], heap[p]] = [heap[p], heap[idx]]

        yield {
          state: makeState([idx, p]),
          highlights: [
            { index: idx, role: 'swap' },
            { index: p, role: 'swap' },
          ],
          message: 'algorithms.minHeap.steps.swap',
          codeLine: 5,
          auxState: { from: idx, to: p },
        }

        idx = p
      } else {
        break
      }
    }

    yield {
      state: makeState([idx]),
      highlights: [{ index: idx, role: 'current' }],
      message: 'algorithms.minHeap.steps.insert',
      codeLine: 6,
      auxState: { v: value, finalIdx: idx },
    }
  }

  // Insert 5, 3, 8, 1, 2
  const insertValues = [5, 3, 8, 1, 2]
  for (const v of insertValues) {
    yield* insertValue(v)
  }

  // Extract min (twice)
  function* extractMin(): Generator<AlgorithmFrame> {
    if (heap.length === 0) return

    const minVal = heap[0]

    yield {
      state: makeState([0]),
      highlights: [{ index: 0, role: 'current' }],
      message: 'algorithms.minHeap.steps.extractMin',
      codeLine: 9,
      auxState: { min: minVal },
    }

    // Move last element to root
    heap[0] = heap[heap.length - 1]
    heap.pop()
    extracted.push(minVal)

    if (heap.length === 0) {
      yield {
        state: makeState([]),
        highlights: [],
        message: 'algorithms.minHeap.steps.done',
        codeLine: 11,
        auxState: { extracted: minVal },
      }
      return
    }

    yield {
      state: makeState([0]),
      highlights: [{ index: 0, role: 'current' }],
      message: 'algorithms.minHeap.steps.heapify',
      codeLine: 10,
      auxState: { v: heap[0] },
    }

    // Heapify down (sift down)
    let idx = 0
    while (true) {
      let smallest = idx
      const l = leftChild(idx)
      const r = rightChild(idx)

      if (l < heap.length) {
        yield {
          state: makeState([idx, l]),
          highlights: [
            { index: idx, role: 'compare' },
            { index: l, role: 'compare' },
          ],
          message: 'algorithms.minHeap.steps.heapify',
          codeLine: 12,
          auxState: { parent: heap[idx], left: heap[l] },
        }
        if (heap[l] < heap[smallest]) smallest = l
      }

      if (r < heap.length) {
        yield {
          state: makeState([idx, r]),
          highlights: [
            { index: idx, role: 'compare' },
            { index: r, role: 'compare' },
          ],
          message: 'algorithms.minHeap.steps.heapify',
          codeLine: 13,
          auxState: { parent: heap[idx], right: heap[r] },
        }
        if (heap[r] < heap[smallest]) smallest = r
      }

      if (smallest !== idx) {
        ;[heap[idx], heap[smallest]] = [heap[smallest], heap[idx]]

        yield {
          state: makeState([idx, smallest]),
          highlights: [
            { index: idx, role: 'swap' },
            { index: smallest, role: 'swap' },
          ],
          message: 'algorithms.minHeap.steps.swap',
          codeLine: 14,
          auxState: { from: idx, to: smallest },
        }

        idx = smallest
      } else {
        break
      }
    }

    yield {
      state: makeState([]),
      highlights: [],
      message: 'algorithms.minHeap.steps.extractMin',
      codeLine: 15,
      auxState: { extracted: minVal },
    }
  }

  // Extract min twice
  yield* extractMin()
  yield* extractMin()

  yield {
    state: makeState([]),
    highlights: [],
    message: 'algorithms.minHeap.steps.done',
    codeLine: 16,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'class MinHeap {' },
    { line: 2,  code: '  private heap: number[] = []' },
    { line: 3,  code: '  insert(val: number): void {' },
    { line: 4,  code: '    this.heap.push(val)' },
    { line: 5,  code: '    this.bubbleUp(this.heap.length - 1)' },
    { line: 6,  code: '  }' },
    { line: 7,  code: '  private bubbleUp(i: number): void {' },
    { line: 8,  code: '    const p = Math.floor((i - 1) / 2)' },
    { line: 9,  code: '    if (i > 0 && this.heap[i] < this.heap[p]) {' },
    { line: 10, code: '      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]' },
    { line: 11, code: '      this.bubbleUp(p)' },
    { line: 12, code: '    }' },
    { line: 13, code: '  }' },
    { line: 14, code: '  extractMin(): number | undefined {' },
    { line: 15, code: '    if (!this.heap.length) return undefined' },
    { line: 16, code: '    const min = this.heap[0]' },
    { line: 17, code: '    this.heap[0] = this.heap.pop()!' },
    { line: 18, code: '    this.heapifyDown(0)' },
    { line: 19, code: '    return min' },
    { line: 20, code: '  }' },
    { line: 21, code: '}' },
  ],
  python: [
    { line: 1,  code: 'import heapq' },
    { line: 2,  code: 'heap = []' },
    { line: 3,  code: '# Insert' },
    { line: 4,  code: 'heapq.heappush(heap, 5)' },
    { line: 5,  code: 'heapq.heappush(heap, 3)' },
    { line: 6,  code: 'heapq.heappush(heap, 8)' },
    { line: 7,  code: 'heapq.heappush(heap, 1)' },
    { line: 8,  code: 'heapq.heappush(heap, 2)' },
    { line: 9,  code: '# Extract min' },
    { line: 10, code: 'heapq.heappop(heap)  # 1' },
    { line: 11, code: 'heapq.heappop(heap)  # 2' },
  ],
  c: [
    { line: 1,  code: 'int heap[100]; int size = 0;' },
    { line: 2,  code: 'void insert(int val) {' },
    { line: 3,  code: '    heap[size++] = val;' },
    { line: 4,  code: '    int i = size - 1;' },
    { line: 5,  code: '    while (i > 0 && heap[(i-1)/2] > heap[i]) {' },
    { line: 6,  code: '        int t = heap[i]; heap[i] = heap[(i-1)/2]; heap[(i-1)/2] = t;' },
    { line: 7,  code: '        i = (i - 1) / 2;' },
    { line: 8,  code: '    }' },
    { line: 9,  code: '}' },
    { line: 10, code: 'int extractMin() {' },
    { line: 11, code: '    int min = heap[0];' },
    { line: 12, code: '    heap[0] = heap[--size];' },
    { line: 13, code: '    heapifyDown(0);  // sift down' },
    { line: 14, code: '    return min;' },
    { line: 15, code: '}' },
  ],
  java: [
    { line: 1,  code: 'import java.util.PriorityQueue;' },
    { line: 2,  code: 'PriorityQueue<Integer> minHeap = new PriorityQueue<>();' },
    { line: 3,  code: 'minHeap.offer(5);' },
    { line: 4,  code: 'minHeap.offer(3);' },
    { line: 5,  code: 'minHeap.offer(8);' },
    { line: 6,  code: 'minHeap.offer(1);' },
    { line: 7,  code: 'minHeap.offer(2);' },
    { line: 8,  code: 'minHeap.peek();   // 1 (min)' },
    { line: 9,  code: 'minHeap.poll();   // extract 1' },
    { line: 10, code: 'minHeap.poll();   // extract 2' },
  ],
  go: [
    { line: 1,  code: 'import "container/heap"' },
    { line: 2,  code: 'type MinHeap []int' },
    { line: 3,  code: 'func (h MinHeap) Len() int           { return len(h) }' },
    { line: 4,  code: 'func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }' },
    { line: 5,  code: 'func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }' },
    { line: 6,  code: 'func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }' },
    { line: 7,  code: 'func (h *MinHeap) Pop() any          { old := *h; n := len(old); x := old[n-1]; *h = old[:n-1]; return x }' },
    { line: 8,  code: 'h := &MinHeap{}' },
    { line: 9,  code: 'heap.Push(h, 5); heap.Push(h, 3)' },
    { line: 10, code: 'heap.Pop(h)  // 3 (min)' },
  ],
}
