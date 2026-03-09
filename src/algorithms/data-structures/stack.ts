import type {
  AlgorithmMeta,
  AlgorithmFrame,
  CodeSnippets,
  StackQueueState,
  DSOperationConfig,
} from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'stack',
  category: 'data-structures',
  nameKey: 'algorithms.stack.name',
  descriptionKey: 'algorithms.stack.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
    operations: [
      { name: 'push',   best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'pop',    best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'peek',   best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    ],
  },
  tags: ['LIFO', 'sequential', 'recursive'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/valid-parentheses/',              title: '#20 Valid Parentheses', difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/maximum-element/problem', title: 'Maximum Element',       difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/validate-parentheses',             title: 'Valid Parentheses',     difficulty: 'Easy' },
  ],
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function snapshot(items: number[], op?: StackQueueState['operation'], highlighted?: number): StackQueueState {
  return {
    items: [...items],
    top: items.length > 0 ? items.length - 1 : undefined,
    highlighted,
    operation: op,
  }
}

// ---------------------------------------------------------------------------
// dsOperations generators
// ---------------------------------------------------------------------------

function* pushGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Step 1: show current stack
  yield {
    state: snapshot(items),
    highlights: [],
    message: 'ds.stack.push.init',
    codeLine: 1,
  }

  // Step 2: push value
  items.push(val)
  yield {
    state: snapshot(items, 'push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current', label: 'top' }],
    message: 'ds.stack.push.done',
    codeLine: 2,
    auxState: { operation: 'push' },
  }
}

function* popGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Step 1: show stack
  yield {
    state: snapshot(items),
    highlights: [],
    message: 'ds.stack.pop.init',
    codeLine: 1,
  }

  // Step 2: highlight top
  const top = items.length - 1
  yield {
    state: snapshot(items, 'pop', top),
    highlights: [{ index: top, role: 'selected', label: 'top' }],
    message: 'ds.stack.pop.highlight',
    codeLine: 2,
  }

  // Step 3: after pop
  items.pop()
  yield {
    state: snapshot(items),
    highlights: [],
    message: 'ds.stack.pop.done',
    codeLine: 3,
    auxState: { operation: 'pop' },
  }
}

function* peekGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Step 1: show stack
  yield {
    state: snapshot(items),
    highlights: [],
    message: 'ds.stack.peek.init',
    codeLine: 1,
  }

  // Step 2: highlight top
  const top = items.length - 1
  yield {
    state: snapshot(items, 'peek', top),
    highlights: [{ index: top, role: 'selected', label: 'top' }],
    message: 'ds.stack.peek.done',
    codeLine: 2,
    auxState: { operation: 'peek' },
  }
}

function* searchStackGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const target = value ?? 20
  const items: number[] = initialState ? [...(initialState as StackQueueState).items] : [10, 20, 30]

  // Step 1: show stack
  yield {
    state: snapshot(items),
    highlights: [],
    message: 'ds.stack.search.init',
    codeLine: 1,
  }

  // Step 2: iterate from top
  let found = false
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i] === target) {
      yield {
        state: snapshot(items, undefined, i),
        highlights: [{ index: i, role: 'found', label: 'found' }],
        message: 'ds.stack.search.found',
        codeLine: 4,
        auxState: { operation: 'search' },
      }
      found = true
      break
    } else {
      yield {
        state: snapshot(items, undefined, i),
        highlights: [{ index: i, role: 'current', label: 'i' }],
        message: 'ds.stack.search.checking',
        codeLine: 3,
      }
    }
  }

  if (!found) {
    yield {
      state: snapshot(items),
      highlights: [],
      message: 'ds.stack.search.notFound',
      codeLine: 5,
      auxState: { operation: 'search' },
    }
  }
}

// ---------------------------------------------------------------------------
// Per-operation code snippets
// ---------------------------------------------------------------------------

const pushSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'push(val: T): void {' },
    { line: 2, code: '  this.items.push(val)' },
    { line: 3, code: '}' },
  ],
  python: [
    { line: 1, code: 'def push(self, val):' },
    { line: 2, code: '    self.items.append(val)' },
    { line: 3, code: '' },
  ],
  c: [
    { line: 1, code: 'void push(int val) {' },
    { line: 2, code: '    stack[++top] = val;' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'void push(T val) {' },
    { line: 2, code: '    items.add(val);' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (s *Stack) Push(val int) {' },
    { line: 2, code: '    s.items = append(s.items, val)' },
    { line: 3, code: '}' },
  ],
}

const popSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'pop(): T | undefined {' },
    { line: 2, code: '  if (this.isEmpty()) return undefined' },
    { line: 3, code: '  return this.items.pop()' },
    { line: 4, code: '}' },
  ],
  python: [
    { line: 1, code: 'def pop(self):' },
    { line: 2, code: '    if self.is_empty(): return None' },
    { line: 3, code: '    return self.items.pop()' },
    { line: 4, code: '' },
  ],
  c: [
    { line: 1, code: 'int pop() {' },
    { line: 2, code: '    if (top == -1) return -1;' },
    { line: 3, code: '    return stack[top--];' },
    { line: 4, code: '}' },
  ],
  java: [
    { line: 1, code: 'T pop() {' },
    { line: 2, code: '    if (isEmpty()) return null;' },
    { line: 3, code: '    return items.remove(items.size() - 1);' },
    { line: 4, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (s *Stack) Pop() (int, bool) {' },
    { line: 2, code: '    if len(s.items) == 0 { return 0, false }' },
    { line: 3, code: '    n := len(s.items) - 1; v := s.items[n]; s.items = s.items[:n]; return v, true' },
    { line: 4, code: '}' },
  ],
}

const peekSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'peek(): T | undefined {' },
    { line: 2, code: '  return this.items[this.items.length - 1]' },
    { line: 3, code: '}' },
  ],
  python: [
    { line: 1, code: 'def peek(self):' },
    { line: 2, code: '    return self.items[-1] if self.items else None' },
    { line: 3, code: '' },
  ],
  c: [
    { line: 1, code: 'int peek() {' },
    { line: 2, code: '    return stack[top];' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'T peek() {' },
    { line: 2, code: '    return items.isEmpty() ? null : items.get(items.size() - 1);' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (s *Stack) Peek() (int, bool) {' },
    { line: 2, code: '    if len(s.items) == 0 { return 0, false }; return s.items[len(s.items)-1], true' },
    { line: 3, code: '}' },
  ],
}

const searchSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'search(val: T): number {' },
    { line: 2, code: '  for (let i = this.items.length - 1; i >= 0; i--) {' },
    { line: 3, code: '    if (this.items[i] === val) return i' },
    { line: 4, code: '  }' },
    { line: 5, code: '  return -1' },
    { line: 6, code: '}' },
  ],
  python: [
    { line: 1, code: 'def search(self, val):' },
    { line: 2, code: '    for i in range(len(self.items) - 1, -1, -1):' },
    { line: 3, code: '        if self.items[i] == val: return i' },
    { line: 4, code: '    return -1' },
    { line: 5, code: '' },
    { line: 6, code: '' },
  ],
  c: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '    for (int i = top; i >= 0; i--) {' },
    { line: 3, code: '        if (stack[i] == val) return i;' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1;' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'int search(T val) {' },
    { line: 2, code: '    for (int i = items.size() - 1; i >= 0; i--) {' },
    { line: 3, code: '        if (items.get(i).equals(val)) return i;' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1;' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (s *Stack) Search(val int) int {' },
    { line: 2, code: '    for i := len(s.items) - 1; i >= 0; i-- {' },
    { line: 3, code: '        if s.items[i] == val { return i }' },
    { line: 4, code: '    }' },
    { line: 5, code: '    return -1' },
    { line: 6, code: '}' },
  ],
}

// ---------------------------------------------------------------------------
// dsOperations export
// ---------------------------------------------------------------------------

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Push',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => pushGenerator(value, initialState),
    codeSnippets: pushSnippets,
  },
  {
    type: 'remove',
    label: 'Pop',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => popGenerator(value, initialState),
    codeSnippets: popSnippets,
  },
  {
    type: 'search',
    label: 'Peek',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => peekGenerator(value, initialState),
    codeSnippets: peekSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => searchStackGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
]

// ---------------------------------------------------------------------------
// Backwards-compat generator
// ---------------------------------------------------------------------------

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const items: number[] = []

  function snap(op?: StackQueueState['operation'], highlighted?: number): StackQueueState {
    return {
      items: [...items],
      top: items.length > 0 ? items.length - 1 : undefined,
      highlighted,
      operation: op,
    }
  }

  // push(10)
  items.push(10)
  yield {
    state: snap('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 10 },
  }

  // push(20)
  items.push(20)
  yield {
    state: snap('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 20 },
  }

  // push(30)
  items.push(30)
  yield {
    state: snap('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 30 },
  }

  // push(40)
  items.push(40)
  yield {
    state: snap('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 40 },
  }

  // peek()
  yield {
    state: snap('peek', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'selected' }],
    message: 'algorithms.stack.steps.peek',
    codeLine: 5,
    auxState: { v: items[items.length - 1] },
  }

  // pop() — removes 40
  const popped1 = items[items.length - 1]
  yield {
    state: snap('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped1 },
  }
  items.pop()
  yield {
    state: snap(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.pop',
    codeLine: 8,
    auxState: { v: popped1 },
  }

  // push(50)
  items.push(50)
  yield {
    state: snap('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 50 },
  }

  // pop() — removes 50
  const popped2 = items[items.length - 1]
  yield {
    state: snap('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped2 },
  }
  items.pop()
  yield {
    state: snap(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.pop',
    codeLine: 8,
    auxState: { v: popped2 },
  }

  // pop() — removes 30
  const popped3 = items[items.length - 1]
  yield {
    state: snap('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped3 },
  }
  items.pop()
  yield {
    state: snap(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.done',
    codeLine: 9,
  }
}

// ---------------------------------------------------------------------------
// Top-level codeSnippets (backwards compat — full class view)
// ---------------------------------------------------------------------------

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'class Stack<T> {' },
    { line: 2,  code: '  private items: T[] = []' },
    { line: 3,  code: '  push(item: T): void { this.items.push(item) }' },
    { line: 4,  code: '  pop(): T | undefined { return this.items.pop() }' },
    { line: 5,  code: '  peek(): T | undefined { return this.items[this.items.length - 1] }' },
    { line: 6,  code: '  isEmpty(): boolean { return this.items.length === 0 }' },
    { line: 7,  code: '  size(): number { return this.items.length }' },
    { line: 8,  code: '}' },
    { line: 9,  code: 'const stack = new Stack<number>()' },
    { line: 10, code: 'stack.push(10); stack.push(20); stack.push(30)' },
    { line: 11, code: 'stack.peek()  // 30' },
    { line: 12, code: 'stack.pop()   // 30' },
  ],
  python: [
    { line: 1,  code: 'class Stack:' },
    { line: 2,  code: '    def __init__(self): self.items = []' },
    { line: 3,  code: '    def push(self, item): self.items.append(item)' },
    { line: 4,  code: '    def pop(self): return self.items.pop()' },
    { line: 5,  code: '    def peek(self): return self.items[-1]' },
    { line: 6,  code: '    def is_empty(self): return len(self.items) == 0' },
    { line: 7,  code: 'stack = Stack()' },
    { line: 8,  code: 'stack.push(10); stack.push(20); stack.push(30)' },
    { line: 9,  code: 'stack.peek()  # 30' },
    { line: 10, code: 'stack.pop()   # 30' },
  ],
  c: [
    { line: 1, code: '#define MAX 100' },
    { line: 2, code: 'int stack[MAX], top = -1;' },
    { line: 3, code: 'void push(int val) { stack[++top] = val; }' },
    { line: 4, code: 'int pop() { return stack[top--]; }' },
    { line: 5, code: 'int peek() { return stack[top]; }' },
    { line: 6, code: 'int isEmpty() { return top == -1; }' },
    { line: 7, code: 'push(10); push(20); push(30);' },
    { line: 8, code: 'peek();  // 30' },
    { line: 9, code: 'pop();   // 30' },
  ],
  java: [
    { line: 1, code: 'import java.util.Stack;' },
    { line: 2, code: 'Stack<Integer> stack = new Stack<>();' },
    { line: 3, code: 'stack.push(10);' },
    { line: 4, code: 'stack.push(20);' },
    { line: 5, code: 'stack.push(30);' },
    { line: 6, code: 'stack.peek();  // 30' },
    { line: 7, code: 'stack.pop();   // 30' },
    { line: 8, code: 'stack.isEmpty(); // false' },
  ],
  go: [
    { line: 1,  code: 'type Stack struct { items []int }' },
    { line: 2,  code: 'func (s *Stack) Push(v int) { s.items = append(s.items, v) }' },
    { line: 3,  code: 'func (s *Stack) Pop() int {' },
    { line: 4,  code: '    n := len(s.items) - 1' },
    { line: 5,  code: '    v := s.items[n]' },
    { line: 6,  code: '    s.items = s.items[:n]; return v' },
    { line: 7,  code: '}' },
    { line: 8,  code: 'func (s *Stack) Peek() int { return s.items[len(s.items)-1] }' },
    { line: 9,  code: 's := &Stack{}' },
    { line: 10, code: 's.Push(10); s.Push(20); s.Push(30)' },
    { line: 11, code: 's.Peek()  // 30' },
    { line: 12, code: 's.Pop()   // 30' },
  ],
}
