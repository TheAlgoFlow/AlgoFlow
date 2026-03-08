import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'min-heap',
  category: 'data-structures',
  nameKey: 'algorithms.minHeap.name',
  descriptionKey: 'algorithms.minHeap.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
  },
  tags: ['heap', 'priority-queue', 'complete-tree'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',          title: '#215 Kth Largest Element',  difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/jesse-and-cookies/problem',         title: 'Jesse and Cookies',         difficulty: 'Easy' },
  ],
}

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
        // Swap
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
    { line: 1, code: 'class MinHeap {' },
    { line: 2, code: '  private heap: number[] = []' },
    { line: 3, code: '  insert(val: number): void {' },
    { line: 4, code: '    this.heap.push(val)' },
    { line: 5, code: '    this.bubbleUp(this.heap.length - 1)' },
    { line: 6, code: '  }' },
    { line: 7, code: '  private bubbleUp(i: number): void {' },
    { line: 8, code: '    const p = Math.floor((i - 1) / 2)' },
    { line: 9, code: '    if (i > 0 && this.heap[i] < this.heap[p]) {' },
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
    { line: 1, code: 'import heapq' },
    { line: 2, code: 'heap = []' },
    { line: 3, code: '# Insert' },
    { line: 4, code: 'heapq.heappush(heap, 5)' },
    { line: 5, code: 'heapq.heappush(heap, 3)' },
    { line: 6, code: 'heapq.heappush(heap, 8)' },
    { line: 7, code: 'heapq.heappush(heap, 1)' },
    { line: 8, code: 'heapq.heappush(heap, 2)' },
    { line: 9, code: '# Extract min' },
    { line: 10, code: 'heapq.heappop(heap)  # 1' },
    { line: 11, code: 'heapq.heappop(heap)  # 2' },
  ],
  c: [
    { line: 1, code: 'int heap[100]; int size = 0;' },
    { line: 2, code: 'void insert(int val) {' },
    { line: 3, code: '    heap[size++] = val;' },
    { line: 4, code: '    int i = size - 1;' },
    { line: 5, code: '    while (i > 0 && heap[(i-1)/2] > heap[i]) {' },
    { line: 6, code: '        int t = heap[i]; heap[i] = heap[(i-1)/2]; heap[(i-1)/2] = t;' },
    { line: 7, code: '        i = (i - 1) / 2;' },
    { line: 8, code: '    }' },
    { line: 9, code: '}' },
    { line: 10, code: 'int extractMin() {' },
    { line: 11, code: '    int min = heap[0];' },
    { line: 12, code: '    heap[0] = heap[--size];' },
    { line: 13, code: '    heapifyDown(0);  // sift down' },
    { line: 14, code: '    return min;' },
    { line: 15, code: '}' },
  ],
  java: [
    { line: 1, code: 'import java.util.PriorityQueue;' },
    { line: 2, code: 'PriorityQueue<Integer> minHeap = new PriorityQueue<>();' },
    { line: 3, code: 'minHeap.offer(5);' },
    { line: 4, code: 'minHeap.offer(3);' },
    { line: 5, code: 'minHeap.offer(8);' },
    { line: 6, code: 'minHeap.offer(1);' },
    { line: 7, code: 'minHeap.offer(2);' },
    { line: 8, code: 'minHeap.peek();   // 1 (min)' },
    { line: 9, code: 'minHeap.poll();   // extract 1' },
    { line: 10, code: 'minHeap.poll();   // extract 2' },
  ],
  go: [
    { line: 1, code: 'import "container/heap"' },
    { line: 2, code: 'type MinHeap []int' },
    { line: 3, code: 'func (h MinHeap) Len() int           { return len(h) }' },
    { line: 4, code: 'func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }' },
    { line: 5, code: 'func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }' },
    { line: 6, code: 'func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }' },
    { line: 7, code: 'func (h *MinHeap) Pop() any          { old := *h; n := len(old); x := old[n-1]; *h = old[:n-1]; return x }' },
    { line: 8, code: 'h := &MinHeap{}' },
    { line: 9, code: 'heap.Push(h, 5); heap.Push(h, 3)' },
    { line: 10, code: 'heap.Pop(h)  // 3 (min)' },
  ],
}
