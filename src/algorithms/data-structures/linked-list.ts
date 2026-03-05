import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, LinkedListState } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'linked-list',
  category: 'data-structures',
  nameKey: 'algorithms.linkedList.name',
  descriptionKey: 'algorithms.linkedList.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  tags: ['dynamic', 'sequential', 'pointer'],
  defaultInput: null,
}

function cloneState(state: LinkedListState): LinkedListState {
  return {
    nodes: state.nodes.map(n => ({ ...n })),
    head: state.head,
    current: state.current,
    prev: state.prev,
    highlighted: state.highlighted ? [...state.highlighted] : undefined,
  }
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const state: LinkedListState = {
    nodes: [],
    head: null,
  }

  // Step 1: Start empty list
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.init',
    codeLine: 1,
  }

  // Insert helper: insert at head
  let nodeCounter = 0

  function insertAtHead(value: number): string {
    const id = `n${nodeCounter++}`
    const newNode = { value, id, next: state.head }
    state.nodes.unshift(newNode)
    state.head = id
    return id
  }

  // Step 2: Insert 10 at head
  const id10 = insertAtHead(10)
  state.current = id10
  yield {
    state: cloneState(state),
    highlights: [{ index: id10, role: 'head' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 10 },
  }

  // Step 3: Insert 20 at head
  const id20 = insertAtHead(20)
  state.current = id20
  yield {
    state: cloneState(state),
    highlights: [{ index: id20, role: 'head' }, { index: id10, role: 'current' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 20 },
  }

  // Step 4: Insert 30 at head
  const id30 = insertAtHead(30)
  state.current = id30
  yield {
    state: cloneState(state),
    highlights: [{ index: id30, role: 'head' }, { index: id20, role: 'current' }, { index: id10, role: 'current' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 30 },
  }

  // Step 5: Traverse: move current pointer through all nodes
  // List is: 30 -> 20 -> 10 -> null (head = id30)
  state.current = undefined
  state.prev = undefined

  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.traverse',
    codeLine: 6,
  }

  let cursor: string | null = state.head
  while (cursor !== null) {
    state.current = cursor
    const node = state.nodes.find(n => n.id === cursor)!
    yield {
      state: cloneState(state),
      highlights: [{ index: cursor, role: 'current' }],
      message: 'algorithms.linkedList.steps.traverse',
      codeLine: 7,
      auxState: { v: node.value },
    }
    cursor = node.next
  }

  // Step 6: Delete node with value 20
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.delete',
    codeLine: 10,
    auxState: { target: 20 },
  }

  let prevId: string | null = null
  let currId: string | null = state.head
  while (currId !== null) {
    const node = state.nodes.find(n => n.id === currId)!
    state.current = currId
    if (prevId !== null) state.prev = prevId

    yield {
      state: cloneState(state),
      highlights: [
        { index: currId, role: 'current' },
        ...(prevId ? [{ index: prevId, role: 'pointer' as const }] : []),
      ],
      message: 'algorithms.linkedList.steps.delete',
      codeLine: 11,
      auxState: { v: node.value, target: 20 },
    }

    if (node.value === 20) {
      // Found: update pointers
      if (prevId === null) {
        state.head = node.next
      } else {
        const prevNode = state.nodes.find(n => n.id === prevId)!
        prevNode.next = node.next
      }
      // Remove from nodes array
      state.nodes = state.nodes.filter(n => n.id !== currId)
      state.current = undefined
      state.prev = undefined

      yield {
        state: cloneState(state),
        highlights: prevId ? [{ index: prevId, role: 'pointer' }] : [],
        message: 'algorithms.linkedList.steps.done',
        codeLine: 13,
        auxState: { deleted: 20 },
      }
      break
    }

    prevId = currId
    currId = node.next
  }

  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.done',
    codeLine: 14,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'class ListNode { constructor(public val: number, public next: ListNode | null = null) {} }' },
    { line: 2, code: 'let head: ListNode | null = null' },
    { line: 3, code: 'function insertAtHead(val: number) {' },
    { line: 4, code: '  head = new ListNode(val, head)' },
    { line: 5, code: '}' },
    { line: 6, code: 'function traverse() {' },
    { line: 7, code: '  let cur = head' },
    { line: 8, code: '  while (cur) { console.log(cur.val); cur = cur.next }' },
    { line: 9, code: '}' },
    { line: 10, code: 'function deleteVal(val: number) {' },
    { line: 11, code: '  if (!head) return' },
    { line: 12, code: '  if (head.val === val) { head = head.next; return }' },
    { line: 13, code: '  let cur = head' },
    { line: 14, code: '  while (cur.next && cur.next.val !== val) cur = cur.next' },
    { line: 15, code: '  if (cur.next) cur.next = cur.next.next' },
    { line: 16, code: '}' },
  ],
  python: [
    { line: 1, code: 'class ListNode:' },
    { line: 2, code: '    def __init__(self, val, next=None):' },
    { line: 3, code: '        self.val = val; self.next = next' },
    { line: 4, code: 'head = None' },
    { line: 5, code: 'def insert_at_head(val):' },
    { line: 6, code: '    global head' },
    { line: 7, code: '    head = ListNode(val, head)' },
    { line: 8, code: 'def traverse():' },
    { line: 9, code: '    cur = head' },
    { line: 10, code: '    while cur: print(cur.val); cur = cur.next' },
    { line: 11, code: 'def delete_val(val):' },
    { line: 12, code: '    global head' },
    { line: 13, code: '    if head and head.val == val: head = head.next; return' },
    { line: 14, code: '    cur = head' },
    { line: 15, code: '    while cur and cur.next:' },
    { line: 16, code: '        if cur.next.val == val: cur.next = cur.next.next; return' },
    { line: 17, code: '        cur = cur.next' },
  ],
  c: [
    { line: 1, code: 'typedef struct Node { int val; struct Node* next; } Node;' },
    { line: 2, code: 'Node* head = NULL;' },
    { line: 3, code: 'void insertAtHead(int val) {' },
    { line: 4, code: '    Node* n = malloc(sizeof(Node));' },
    { line: 5, code: '    n->val = val; n->next = head; head = n;' },
    { line: 6, code: '}' },
    { line: 7, code: 'void traverse() {' },
    { line: 8, code: '    Node* cur = head;' },
    { line: 9, code: '    while (cur) { printf("%d ", cur->val); cur = cur->next; }' },
    { line: 10, code: '}' },
    { line: 11, code: 'void deleteVal(int val) {' },
    { line: 12, code: '    if (!head) return;' },
    { line: 13, code: '    if (head->val == val) { head = head->next; return; }' },
    { line: 14, code: '    Node* cur = head;' },
    { line: 15, code: '    while (cur->next && cur->next->val != val) cur = cur->next;' },
    { line: 16, code: '    if (cur->next) cur->next = cur->next->next;' },
    { line: 17, code: '}' },
  ],
  java: [
    { line: 1, code: 'class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }' },
    { line: 2, code: 'ListNode head = null;' },
    { line: 3, code: 'void insertAtHead(int val) {' },
    { line: 4, code: '    ListNode n = new ListNode(val);' },
    { line: 5, code: '    n.next = head; head = n;' },
    { line: 6, code: '}' },
    { line: 7, code: 'void traverse() {' },
    { line: 8, code: '    ListNode cur = head;' },
    { line: 9, code: '    while (cur != null) { System.out.print(cur.val); cur = cur.next; }' },
    { line: 10, code: '}' },
    { line: 11, code: 'void deleteVal(int val) {' },
    { line: 12, code: '    if (head == null) return;' },
    { line: 13, code: '    if (head.val == val) { head = head.next; return; }' },
    { line: 14, code: '    ListNode cur = head;' },
    { line: 15, code: '    while (cur.next != null && cur.next.val != val) cur = cur.next;' },
    { line: 16, code: '    if (cur.next != null) cur.next = cur.next.next;' },
    { line: 17, code: '}' },
  ],
  go: [
    { line: 1, code: 'type ListNode struct { Val int; Next *ListNode }' },
    { line: 2, code: 'var head *ListNode' },
    { line: 3, code: 'func insertAtHead(val int) {' },
    { line: 4, code: '    head = &ListNode{Val: val, Next: head}' },
    { line: 5, code: '}' },
    { line: 6, code: 'func traverse() {' },
    { line: 7, code: '    cur := head' },
    { line: 8, code: '    for cur != nil { fmt.Print(cur.Val); cur = cur.Next }' },
    { line: 9, code: '}' },
    { line: 10, code: 'func deleteVal(val int) {' },
    { line: 11, code: '    if head == nil { return }' },
    { line: 12, code: '    if head.Val == val { head = head.Next; return }' },
    { line: 13, code: '    cur := head' },
    { line: 14, code: '    for cur.Next != nil && cur.Next.Val != val { cur = cur.Next }' },
    { line: 15, code: '    if cur.Next != nil { cur.Next = cur.Next.Next }' },
    { line: 16, code: '}' },
  ],
}
