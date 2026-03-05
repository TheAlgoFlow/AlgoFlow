import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'queue',
  category: 'data-structures',
  nameKey: 'algorithms.queue.name',
  descriptionKey: 'algorithms.queue.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
  },
  tags: ['FIFO', 'sequential', 'scheduling'],
  defaultInput: null,
}

type QueueState = {
  items: number[]
  highlighted?: number
  operation?: 'enqueue' | 'dequeue' | 'peek'
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const items: number[] = []

  function snapshot(op?: QueueState['operation'], highlighted?: number): QueueState {
    return {
      items: [...items],
      highlighted,
      operation: op,
    }
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

export const codeSnippets: CodeSnippets = {
  ts: [
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
}
