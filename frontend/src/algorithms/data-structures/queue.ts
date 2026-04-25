import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig, StackQueueState } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'queue',
  category: 'data-structures',
  nameKey: 'algorithms.queue.name',
  descriptionKey: 'algorithms.queue.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
    operations: [
      { name: 'enqueue', best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'dequeue', best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'peek',    best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'search',  best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    ],
  },
  tags: ['FIFO', 'sequential', 'scheduling'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/implement-queue-using-stacks/',              title: '#232 Implement Queue Using Stacks', difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/queue-using-two-stacks/problem',     title: 'Queue Using Two Stacks',            difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/implement-queue-using-stacks',                title: 'Implement Queue Using Stacks',      difficulty: 'Easy' },
  ],
}

// ── Top-level demo generator (kept from original) ────────────────────────────

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const items: number[] = []

  function snapshot(op?: StackQueueState['operation'], highlighted?: number): StackQueueState {
    return { items: [...items], highlighted, operation: op }
  }

  // enqueue(10)
  items.push(10)
  yield {
    state: snapshot('enqueue', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.queue.steps.enqueue',
    codeLine: 3,
    auxState: { v: 10 },
  }

  // enqueue(20)
  items.push(20)
  yield {
    state: snapshot('enqueue', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.queue.steps.enqueue',
    codeLine: 3,
    auxState: { v: 20 },
  }

  // enqueue(30)
  items.push(30)
  yield {
    state: snapshot('enqueue', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.queue.steps.enqueue',
    codeLine: 3,
    auxState: { v: 30 },
  }

  // peek — front of queue (index 0)
  yield {
    state: snapshot('peek', 0),
    highlights: [{ index: 0, role: 'selected' }],
    message: 'algorithms.queue.steps.peek',
    codeLine: 6,
    auxState: { v: items[0] },
  }

  // dequeue — removes 10 (front)
  const dequeued1 = items[0]
  yield {
    state: snapshot('dequeue', 0),
    highlights: [{ index: 0, role: 'swap' }],
    message: 'algorithms.queue.steps.dequeue',
    codeLine: 8,
    auxState: { v: dequeued1 },
  }
  items.shift()
  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.queue.steps.dequeue',
    codeLine: 9,
    auxState: { v: dequeued1 },
  }

  // enqueue(40)
  items.push(40)
  yield {
    state: snapshot('enqueue', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.queue.steps.enqueue',
    codeLine: 3,
    auxState: { v: 40 },
  }

  // dequeue — removes 20 (now front)
  const dequeued2 = items[0]
  yield {
    state: snapshot('dequeue', 0),
    highlights: [{ index: 0, role: 'swap' }],
    message: 'algorithms.queue.steps.dequeue',
    codeLine: 8,
    auxState: { v: dequeued2 },
  }
  items.shift()
  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.queue.steps.done',
    codeLine: 10,
    auxState: { v: dequeued2 },
  }

  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.queue.steps.done',
    codeLine: 11,
  }
}

// ── Top-level codeSnippets (kept from original) ──────────────────────────────

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'class Queue<T> {' },
    { line: 2, code: '  private items: T[] = []' },
    { line: 3, code: '  enqueue(item: T): void { this.items.push(item) }' },
    { line: 4, code: '  dequeue(): T | undefined { return this.items.shift() }' },
    { line: 5, code: '  peek(): T | undefined { return this.items[0] }' },
    { line: 6, code: '  isEmpty(): boolean { return this.items.length === 0 }' },
    { line: 7, code: '  size(): number { return this.items.length }' },
    { line: 8, code: '}' },
    { line: 9, code: 'const q = new Queue<number>()' },
    { line: 10, code: 'q.enqueue(10); q.enqueue(20); q.enqueue(30)' },
    { line: 11, code: 'q.peek()     // 10  (front)' },
    { line: 12, code: 'q.dequeue()  // 10' },
  ],
  cpp: [
    { line: 1, code: '#define MAX 100' },
    { line: 2, code: 'int queue[MAX]; int front = 0, rear = 0;' },
    { line: 3, code: 'void enqueue(int val) { queue[rear++] = val; }' },
    { line: 4, code: 'int dequeue() { return queue[front++]; }' },
    { line: 5, code: 'int peek() { return queue[front]; }' },
    { line: 6, code: 'int isEmpty() { return front == rear; }' },
    { line: 7, code: 'enqueue(10); enqueue(20); enqueue(30);' },
    { line: 8, code: 'peek();     // 10' },
    { line: 9, code: 'dequeue();  // 10' },
  ],
  csharp: [
    { line: 1, code: 'import java.util.LinkedList;' },
    { line: 2, code: 'import java.util.Queue;' },
    { line: 3, code: 'Queue<Integer> q = new LinkedList<>();' },
    { line: 4, code: 'q.offer(10);  // enqueue' },
    { line: 5, code: 'q.offer(20);' },
    { line: 6, code: 'q.offer(30);' },
    { line: 7, code: 'q.peek();     // 10' },
    { line: 8, code: 'q.poll();     // dequeue → 10' },
    { line: 9, code: 'q.offer(40);' },
    { line: 10, code: 'q.poll();     // dequeue → 20' },
  ],

  python: [
    { line: 1, code: 'from collections import deque' },
    { line: 2, code: 'q = deque()' },
    { line: 3, code: 'q.append(10)   # enqueue' },
    { line: 4, code: 'q.append(20)' },
    { line: 5, code: 'q.append(30)' },
    { line: 6, code: 'q[0]           # peek → 10' },
    { line: 7, code: 'q.popleft()    # dequeue → 10' },
    { line: 8, code: 'q.append(40)   # enqueue 40' },
    { line: 9, code: 'q.popleft()    # dequeue → 20' },
  ],
  c: [
    { line: 1, code: '#define MAX 100' },
    { line: 2, code: 'int queue[MAX]; int front = 0, rear = 0;' },
    { line: 3, code: 'void enqueue(int val) { queue[rear++] = val; }' },
    { line: 4, code: 'int dequeue() { return queue[front++]; }' },
    { line: 5, code: 'int peek() { return queue[front]; }' },
    { line: 6, code: 'int isEmpty() { return front == rear; }' },
    { line: 7, code: 'enqueue(10); enqueue(20); enqueue(30);' },
    { line: 8, code: 'peek();     // 10' },
    { line: 9, code: 'dequeue();  // 10' },
  ],
  java: [
    { line: 1, code: 'import java.util.LinkedList;' },
    { line: 2, code: 'import java.util.Queue;' },
    { line: 3, code: 'Queue<Integer> q = new LinkedList<>();' },
    { line: 4, code: 'q.offer(10);  // enqueue' },
    { line: 5, code: 'q.offer(20);' },
    { line: 6, code: 'q.offer(30);' },
    { line: 7, code: 'q.peek();     // 10' },
    { line: 8, code: 'q.poll();     // dequeue → 10' },
    { line: 9, code: 'q.offer(40);' },
    { line: 10, code: 'q.poll();     // dequeue → 20' },
  ],
  go: [
    { line: 1, code: 'type Queue struct { items []int }' },
    { line: 2, code: 'func (q *Queue) Enqueue(v int) { q.items = append(q.items, v) }' },
    { line: 3, code: 'func (q *Queue) Dequeue() int {' },
    { line: 4, code: '    v := q.items[0]' },
    { line: 5, code: '    q.items = q.items[1:]; return v' },
    { line: 6, code: '}' },
    { line: 7, code: 'func (q *Queue) Peek() int { return q.items[0] }' },
    { line: 8, code: 'q := &Queue{}' },
    { line: 9, code: 'q.Enqueue(10); q.Enqueue(20); q.Enqueue(30)' },
    { line: 10, code: 'q.Peek()     // 10' },
    { line: 11, code: 'q.Dequeue()  // 10' },
  ],
  javascript: [
    { line: 1, code: 'class Queue {' },
    { line: 2, code: '  private items = []' },
    { line: 3, code: '  enqueue(item: T) { this.items.push(item) }' },
    { line: 4, code: '  dequeue(): T | undefined { return this.items.shift() }' },
    { line: 5, code: '  peek(): T | undefined { return this.items[0] }' },
    { line: 6, code: '  isEmpty() { return this.items.length === 0 }' },
    { line: 7, code: '  size() { return this.items.length }' },
    { line: 8, code: '}' },
    { line: 9, code: 'const q = new Queue()' },
    { line: 10, code: 'q.enqueue(10); q.enqueue(20); q.enqueue(30)' },
    { line: 11, code: 'q.peek()     // 10  (front)' },
    { line: 12, code: 'q.dequeue()  // 10' },
  ],
}

// ── Per-operation generators ──────────────────────────────────────────────────

function* enqueueGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Frame 1: show current queue
  yield {
    state: { items: [...items], operation: 'enqueue' } as StackQueueState,
    highlights: [],
    message: 'ds.queue.enqueue.step1',
    codeLine: 1,
    auxState: { val },
  }

  // Frame 2: push value, highlight rear with label
  items.push(val)
  yield {
    state: { items: [...items], highlighted: items.length - 1, operation: 'enqueue' } as StackQueueState,
    highlights: [{ index: items.length - 1, role: 'current', label: 'rear' }],
    message: 'ds.queue.enqueue.step2',
    codeLine: 2,
    auxState: { val, operation: 'enqueue' },
  }
}

function* dequeueGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Frame 1: show queue
  yield {
    state: { items: [...items], operation: 'dequeue' } as StackQueueState,
    highlights: [],
    message: 'ds.queue.dequeue.step1',
    codeLine: 1,
  }

  // Frame 2: highlight front
  yield {
    state: { items: [...items], highlighted: 0, operation: 'dequeue' } as StackQueueState,
    highlights: [{ index: 0, role: 'selected', label: 'front' }],
    message: 'ds.queue.dequeue.step2',
    codeLine: 2,
    auxState: { v: items[0] },
  }

  // Frame 3: remove front, show updated queue
  const dequeued = items[0]
  items.shift()
  yield {
    state: { items: [...items], operation: 'dequeue' } as StackQueueState,
    highlights: [],
    message: 'ds.queue.dequeue.step3',
    codeLine: 3,
    auxState: { v: dequeued, operation: 'dequeue' },
  }
}

function* peekGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Frame 1: show queue
  yield {
    state: { items: [...items] } as StackQueueState,
    highlights: [],
    message: 'ds.queue.peek.step1',
    codeLine: 1,
  }

  // Frame 2: highlight front with label
  yield {
    state: { items: [...items], highlighted: 0, operation: 'peek' } as StackQueueState,
    highlights: [{ index: 0, role: 'selected', label: 'front' }],
    message: 'ds.queue.peek.step2',
    codeLine: 2,
    auxState: { v: items[0], operation: 'peek' },
  }
}

function* searchGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 20
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Frame 1: show queue
  yield {
    state: { items: [...items] } as StackQueueState,
    highlights: [],
    message: 'ds.queue.search.step1',
    codeLine: 1,
    auxState: { val },
  }

  // Iterate from front
  for (let i = 0; i < items.length; i++) {
    // Frame: checking index i
    yield {
      state: { items: [...items], highlighted: i } as StackQueueState,
      highlights: [{ index: i, role: 'current', label: 'i' }],
      message: 'ds.queue.search.step2',
      codeLine: 3,
      auxState: { val, i },
    }

    if (items[i] === val) {
      // Frame: found
      yield {
        state: { items: [...items], highlighted: i } as StackQueueState,
        highlights: [{ index: i, role: 'found', label: 'found' }],
        message: 'ds.queue.search.found',
        codeLine: 4,
        auxState: { val, i, operation: 'search' },
      }
      return
    }
  }

  // Frame: not found
  yield {
    state: { items: [...items] } as StackQueueState,
    highlights: [],
    message: 'ds.queue.search.notFound',
    codeLine: 5,
    auxState: { val, operation: 'search' },
  }
}

// ── Per-operation codeSnippets ────────────────────────────────────────────────

const enqueueSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'enqueue(val: T): void {' },
    { line: 2, code: '  this.items.push(val)' },
    { line: 3, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void enqueue(int val) {' },
    { line: 2, code: '  queue[rear++] = val;' },
    { line: 3, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void enqueue(int val) {' },
    { line: 2, code: '  items.add(val);' },
    { line: 3, code: '}' },
  ],  python: [
    { line: 1, code: 'def enqueue(self, val):' },
    { line: 2, code: '    self.items.append(val)' },
  ],
  c: [
    { line: 1, code: 'void enqueue(int val) {' },
    { line: 2, code: '  queue[rear++] = val;' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'void enqueue(int val) {' },
    { line: 2, code: '  items.add(val);' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (q *Queue) Enqueue(val int) {' },
    { line: 2, code: '  q.items = append(q.items, val)' },
    { line: 3, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'class Queue {' },
    { line: 2, code: '  private items = []' },
    { line: 3, code: '  enqueue(item: T) { this.items.push(item) }' },
    { line: 4, code: '  dequeue(): T | undefined { return this.items.shift() }' },
    { line: 5, code: '  peek(): T | undefined { return this.items[0] }' },
    { line: 6, code: '  isEmpty() { return this.items.length === 0 }' },
    { line: 7, code: '  size() { return this.items.length }' },
    { line: 8, code: '}' },
    { line: 9, code: 'const q = new Queue()' },
    { line: 10, code: 'q.enqueue(10); q.enqueue(20); q.enqueue(30)' },
    { line: 11, code: 'q.peek()     // 10  (front)' },
    { line: 12, code: 'q.dequeue()  // 10' },
  ],
}

const dequeueSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'dequeue(): T | undefined {' },
    { line: 2, code: '  if (this.isEmpty()) return undefined' },
    { line: 3, code: '  return this.items.shift()' },
    { line: 4, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int dequeue() {' },
    { line: 2, code: '  if (front == rear) return -1;' },
    { line: 3, code: '  return queue[front++];' },
    { line: 4, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'Integer dequeue() {' },
    { line: 2, code: '  if (items.isEmpty()) return null;' },
    { line: 3, code: '  return items.remove(0);' },
    { line: 4, code: '}' },
  ],  python: [
    { line: 1, code: 'def dequeue(self):' },
    { line: 2, code: '  if not self.items: return None' },
    { line: 3, code: '  return self.items.popleft()' },
  ],
  c: [
    { line: 1, code: 'int dequeue() {' },
    { line: 2, code: '  if (front == rear) return -1;' },
    { line: 3, code: '  return queue[front++];' },
    { line: 4, code: '}' },
  ],
  java: [
    { line: 1, code: 'Integer dequeue() {' },
    { line: 2, code: '  if (items.isEmpty()) return null;' },
    { line: 3, code: '  return items.remove(0);' },
    { line: 4, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (q *Queue) Dequeue() (int, bool) {' },
    { line: 2, code: '  if len(q.items) == 0 { return 0, false }' },
    { line: 3, code: '  v := q.items[0]; q.items = q.items[1:]' },
    { line: 4, code: '  return v, true' },
    { line: 5, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'dequeue(): T | undefined {' },
    { line: 2, code: '  if (this.isEmpty()) return undefined' },
    { line: 3, code: '  return this.items.shift()' },
    { line: 4, code: '}' },
  ],
}

const peekSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'peek(): T | undefined {' },
    { line: 2, code: '  return this.items[0]' },
    { line: 3, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int peek() {' },
    { line: 2, code: '  return queue[front];' },
    { line: 3, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'Integer peek() {' },
    { line: 2, code: '  return items.isEmpty() ? null : items.get(0);' },
    { line: 3, code: '}' },
  ],  python: [
    { line: 1, code: 'def peek(self):' },
    { line: 2, code: '  return self.items[0] if self.items else None' },
  ],
  c: [
    { line: 1, code: 'int peek() {' },
    { line: 2, code: '  return queue[front];' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'Integer peek() {' },
    { line: 2, code: '  return items.isEmpty() ? null : items.get(0);' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (q *Queue) Peek() (int, bool) {' },
    { line: 2, code: '  if len(q.items) == 0 { return 0, false }' },
    { line: 3, code: '  return q.items[0], true' },
    { line: 4, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'peek(): T | undefined {' },
    { line: 2, code: '  return this.items[0]' },
    { line: 3, code: '}' },
  ],
}

const searchQueueSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'search(val: T): number {' },
    { line: 2, code: '  for (let i = 0; i < this.items.length; i++) {' },
    { line: 3, code: '    if (this.items[i] === val) return i' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1' },
    { line: 6, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '  for (int i = front; i < rear; i++) {' },
    { line: 3, code: '    if (queue[i] == val) return i - front;' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1;' },
    { line: 6, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '  for (int i = 0; i < items.size(); i++) {' },
    { line: 3, code: '    if (items.get(i) == val) return i;' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1;' },
    { line: 6, code: '}' },
  ],  python: [
    { line: 1, code: 'def search(self, val):' },
    { line: 2, code: '  for i, item in enumerate(self.items):' },
    { line: 3, code: '    if item == val: return i' },
    { line: 4, code: '  return -1' },
  ],
  c: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '  for (int i = front; i < rear; i++) {' },
    { line: 3, code: '    if (queue[i] == val) return i - front;' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1;' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '  for (int i = 0; i < items.size(); i++) {' },
    { line: 3, code: '    if (items.get(i) == val) return i;' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1;' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (q *Queue) Search(val int) int {' },
    { line: 2, code: '  for i, v := range q.items {' },
    { line: 3, code: '    if v == val { return i }' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1' },
    { line: 6, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'search(val: T) {' },
    { line: 2, code: '  for (let i = 0; i < this.items.length; i++) {' },
    { line: 3, code: '    if (this.items[i] === val) return i' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1' },
    { line: 6, code: '}' },
  ],
}

// ── dsOperations export ───────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Enqueue',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => enqueueGenerator(value, initialState),
    codeSnippets: enqueueSnippets,
  },
  {
    type: 'remove',
    label: 'Dequeue',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => dequeueGenerator(value, initialState),
    codeSnippets: dequeueSnippets,
  },
  {
    type: 'traverse',
    label: 'Peek',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => peekGenerator(value, initialState),
    codeSnippets: peekSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchQueueSnippets,
  },
]
