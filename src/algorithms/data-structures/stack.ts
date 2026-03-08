import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, StackQueueState } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'stack',
  category: 'data-structures',
  nameKey: 'algorithms.stack.name',
  descriptionKey: 'algorithms.stack.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
  },
  tags: ['LIFO', 'sequential', 'recursive'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/valid-parentheses/',                    title: '#20 Valid Parentheses',    difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/maximum-element/problem',       title: 'Maximum Element',          difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/validate-parentheses',                   title: 'Valid Parentheses',        difficulty: 'Easy' },
  ],
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const items: number[] = []

  function snapshot(op?: StackQueueState['operation'], highlighted?: number): StackQueueState {
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
    state: snapshot('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 10 },
  }

  // push(20)
  items.push(20)
  yield {
    state: snapshot('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 20 },
  }

  // push(30)
  items.push(30)
  yield {
    state: snapshot('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 30 },
  }

  // push(40)
  items.push(40)
  yield {
    state: snapshot('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 40 },
  }

  // peek()
  yield {
    state: snapshot('peek', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'selected' }],
    message: 'algorithms.stack.steps.peek',
    codeLine: 5,
    auxState: { v: items[items.length - 1] },
  }

  // pop() — removes 40
  const popped1 = items[items.length - 1]
  yield {
    state: snapshot('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped1 },
  }
  items.pop()
  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.pop',
    codeLine: 8,
    auxState: { v: popped1 },
  }

  // push(50)
  items.push(50)
  yield {
    state: snapshot('push', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'current' }],
    message: 'algorithms.stack.steps.push',
    codeLine: 2,
    auxState: { v: 50 },
  }

  // pop() — removes 50
  const popped2 = items[items.length - 1]
  yield {
    state: snapshot('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped2 },
  }
  items.pop()
  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.pop',
    codeLine: 8,
    auxState: { v: popped2 },
  }

  // pop() — removes 30
  const popped3 = items[items.length - 1]
  yield {
    state: snapshot('pop', items.length - 1),
    highlights: [{ index: items.length - 1, role: 'swap' }],
    message: 'algorithms.stack.steps.pop',
    codeLine: 7,
    auxState: { v: popped3 },
  }
  items.pop()
  yield {
    state: snapshot(undefined),
    highlights: [],
    message: 'algorithms.stack.steps.done',
    codeLine: 9,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'class Stack<T> {' },
    { line: 2, code: '  private items: T[] = []' },
    { line: 3, code: '  push(item: T): void { this.items.push(item) }' },
    { line: 4, code: '  pop(): T | undefined { return this.items.pop() }' },
    { line: 5, code: '  peek(): T | undefined { return this.items[this.items.length - 1] }' },
    { line: 6, code: '  isEmpty(): boolean { return this.items.length === 0 }' },
    { line: 7, code: '  size(): number { return this.items.length }' },
    { line: 8, code: '}' },
    { line: 9, code: 'const stack = new Stack<number>()' },
    { line: 10, code: 'stack.push(10); stack.push(20); stack.push(30)' },
    { line: 11, code: 'stack.peek()  // 30' },
    { line: 12, code: 'stack.pop()   // 30' },
  ],
  python: [
    { line: 1, code: 'class Stack:' },
    { line: 2, code: '    def __init__(self): self.items = []' },
    { line: 3, code: '    def push(self, item): self.items.append(item)' },
    { line: 4, code: '    def pop(self): return self.items.pop()' },
    { line: 5, code: '    def peek(self): return self.items[-1]' },
    { line: 6, code: '    def is_empty(self): return len(self.items) == 0' },
    { line: 7, code: 'stack = Stack()' },
    { line: 8, code: 'stack.push(10); stack.push(20); stack.push(30)' },
    { line: 9, code: 'stack.peek()  # 30' },
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
    { line: 1, code: 'type Stack struct { items []int }' },
    { line: 2, code: 'func (s *Stack) Push(v int) { s.items = append(s.items, v) }' },
    { line: 3, code: 'func (s *Stack) Pop() int {' },
    { line: 4, code: '    n := len(s.items) - 1' },
    { line: 5, code: '    v := s.items[n]' },
    { line: 6, code: '    s.items = s.items[:n]; return v' },
    { line: 7, code: '}' },
    { line: 8, code: 'func (s *Stack) Peek() int { return s.items[len(s.items)-1] }' },
    { line: 9, code: 's := &Stack{}' },
    { line: 10, code: 's.Push(10); s.Push(20); s.Push(30)' },
    { line: 11, code: 's.Peek()  // 30' },
    { line: 12, code: 's.Pop()   // 30' },
  ],
}
