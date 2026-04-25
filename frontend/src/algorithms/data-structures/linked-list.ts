import type {
  AlgorithmMeta,
  AlgorithmFrame,
  CodeSnippets,
  LinkedListState,
  DSOperationConfig,
} from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'linked-list',
  category: 'data-structures',
  nameKey: 'algorithms.linkedList.name',
  descriptionKey: 'algorithms.linkedList.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    operations: [
      { name: 'insert head', best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'insert tail', best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
      { name: 'remove',      best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
      { name: 'search',      best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    ],
  },
  tags: ['dynamic', 'sequential', 'pointer'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/reverse-linked-list/',                               title: '#206 Reverse Linked List',        difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/print-the-elements-of-a-linked-list/problem', title: 'Print Elements of a Linked List', difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/reverse-a-linked-list',                               title: 'Reverse a Linked List',           difficulty: 'Easy' },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cloneState(state: LinkedListState): LinkedListState {
  return {
    nodes: state.nodes.map(n => ({ ...n })),
    head: state.head,
    current: state.current,
    prev: state.prev,
    highlighted: state.highlighted ? [...state.highlighted] : undefined,
  }
}

/** Build a fresh LinkedListState with values inserted at head in order.
 *  insertValues = [10, 20, 30] => list order 30->20->10 (head=n2) */
function buildList(insertValues: number[]): { state: LinkedListState; nodeIds: string[] } {
  const state: LinkedListState = { nodes: [], head: null }
  const nodeIds: string[] = []
  insertValues.forEach((val, i) => {
    const id = `n${i}`
    nodeIds.push(id)
    state.nodes.unshift({ value: val, id, next: state.head })
    state.head = id
  })
  return { state, nodeIds }
}

// ---------------------------------------------------------------------------
// dsOperations generators
// ---------------------------------------------------------------------------

function* insertHeadGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const state: LinkedListState = initialState
    ? { nodes: (initialState as LinkedListState).nodes.map(n => ({ ...n })), head: (initialState as LinkedListState).head }
    : { nodes: [], head: null }

  // Step 1: Show current list
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'ds.linkedList.insertHead.init',
    codeLine: 1,
  }

  // Step 2: Create node and set as head
  const existingIds = state.nodes.map(n => parseInt(n.id.replace('n', ''), 10)).filter(n => !isNaN(n))
  const nextCounter = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0
  const newId = `n${nextCounter}`
  state.nodes.unshift({ value: val, id: newId, next: null })
  state.head = newId

  yield {
    state: cloneState(state),
    highlights: [{ index: newId, role: 'head', label: 'new' }],
    message: 'ds.linkedList.insertHead.done',
    codeLine: 2,
  }
}

function* insertTailGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 42

  // Build initial list or use persistent state
  let state: LinkedListState
  if (initialState) {
    state = { nodes: (initialState as LinkedListState).nodes.map(n => ({ ...n })), head: (initialState as LinkedListState).head }
  } else {
    const built = buildList([10, 20, 30])
    state = built.state
  }
  // Derive next node ID counter from existing nodes
  const existingIds = state.nodes.map(n => parseInt(n.id.replace('n', ''), 10)).filter(n => !isNaN(n))
  const nextCounter = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0

  // Step 1: show initial list
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'ds.linkedList.insertTail.init',
    codeLine: 1,
  }

  // Step 2: traverse to find tail, highlighting each node as curr
  // Walk order: n2(30) -> n1(20) -> n0(10) -> null
  let currId: string | null = state.head
  let tailId: string | null = null
  while (currId !== null) {
    const node = state.nodes.find(n => n.id === currId)!
    tailId = currId
    yield {
      state: cloneState(state),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.linkedList.insertTail.traversing',
      codeLine: 3,
    }
    currId = node.next
  }

  // Step 3: insert new node at tail
  const newId = `n${nextCounter}`
  state.nodes.push({ value: val, id: newId, next: null })
  if (tailId !== null) {
    // Update tail's next pointer
    const tailNode = state.nodes.find(n => n.id === tailId)!
    tailNode.next = newId
  } else {
    // List was empty — new node is also head
    state.head = newId
  }

  yield {
    state: cloneState(state),
    highlights: [
      ...(tailId !== null ? [{ index: tailId, role: 'tail' as const, label: 'curr' }] : []),
      { index: newId, role: 'head' as const, label: 'new' },
    ],
    message: 'ds.linkedList.insertTail.done',
    codeLine: 4,
  }
}

function* searchGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const target = value ?? 20

  // Build list [10, 20, 30] or use persistent state
  const { state } = initialState
    ? { state: { nodes: (initialState as LinkedListState).nodes.map(n => ({ ...n })), head: (initialState as LinkedListState).head } as LinkedListState }
    : buildList([10, 20, 30])

  // Step 1: init
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'ds.linkedList.search.init',
    codeLine: 1,
  }

  // Step 2: traverse searching for target
  let currId: string | null = state.head
  let found = false
  let steps = 0
  while (currId !== null) {
    const node = state.nodes.find(n => n.id === currId)!
    if (node.value === target) {
      // Step 3: found
      steps++
      yield {
        state: cloneState(state),
        highlights: [{ index: currId, role: 'found', label: 'found' }],
        message: 'ds.linkedList.search.found',
        codeLine: 4,
        auxState: { steps },
      }
      found = true
      break
    } else {
      steps++
      yield {
        state: cloneState(state),
        highlights: [{ index: currId, role: 'current', label: 'curr' }],
        message: 'ds.linkedList.search.checking',
        codeLine: 3,
        auxState: { steps },
      }
    }
    currId = node.next
  }

  // Step 4: not found
  if (!found) {
    yield {
      state: cloneState(state),
      highlights: [],
      message: 'ds.linkedList.search.notFound',
      codeLine: 5,
      auxState: { steps },
    }
  }
}

function* traverseGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  // Build list [10, 20, 30] or use persistent state
  const { state } = initialState
    ? { state: { nodes: (initialState as LinkedListState).nodes.map(n => ({ ...n })), head: (initialState as LinkedListState).head } as LinkedListState }
    : buildList([10, 20, 30])

  // Step 1: show full list
  yield {
    state: cloneState(state),
    highlights: [],
    message: 'ds.linkedList.traverse.init',
    codeLine: 1,
  }

  // Step 2: traverse each node
  let currId: string | null = state.head
  let steps = 0
  while (currId !== null) {
    const node = state.nodes.find(n => n.id === currId)!
    steps++
    yield {
      state: cloneState(state),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.linkedList.traverse.visiting',
      codeLine: 3,
      auxState: { steps },
    }
    currId = node.next
  }
}

// ---------------------------------------------------------------------------
// Per-operation code snippets
// ---------------------------------------------------------------------------

const insertHeadSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function insertAtHead(val: number) {' },
    { line: 2, code: '  head = new ListNode(val, head)' },
    { line: 3, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void insertAtHead(int val) {' },
    { line: 2, code: '    Node* n = malloc(sizeof(Node)); n->val = val; n->next = head; head = n;' },
    { line: 3, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void insertAtHead(int val) {' },
    { line: 2, code: '    ListNode n = new ListNode(val); n.next = head; head = n;' },
    { line: 3, code: '}' },
  ],

  python: [
    { line: 1, code: 'def insert_at_head(val):' },
    { line: 2, code: '    head = ListNode(val, head)' },
    { line: 3, code: '' },
  ],
  c: [
    { line: 1, code: 'void insertAtHead(int val) {' },
    { line: 2, code: '    Node* n = malloc(sizeof(Node)); n->val = val; n->next = head; head = n;' },
    { line: 3, code: '}' },
  ],
  java: [
    { line: 1, code: 'void insertAtHead(int val) {' },
    { line: 2, code: '    ListNode n = new ListNode(val); n.next = head; head = n;' },
    { line: 3, code: '}' },
  ],
  go: [
    { line: 1, code: 'func insertAtHead(val int) {' },
    { line: 2, code: '    head = &ListNode{Val: val, Next: head}' },
    { line: 3, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function insertAtHead(val) {' },
    { line: 2, code: '  head = new ListNode(val, head)' },
    { line: 3, code: '}' },
  ],
}

const insertTailSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function insertAtTail(val: number) {' },
    { line: 2, code: '  if (!head) { head = new ListNode(val); return }' },
    { line: 3, code: '  let curr = head' },
    { line: 4, code: '  while (curr.next) curr = curr.next' },
    { line: 5, code: '  curr.next = new ListNode(val)' },
    { line: 6, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void insertAtTail(int val) {' },
    { line: 2, code: '    if (!head) { head = newNode(val); return; }' },
    { line: 3, code: '    Node* curr = head;' },
    { line: 4, code: '    while (curr->next) curr = curr->next;' },
    { line: 5, code: '    curr->next = newNode(val);' },
    { line: 6, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void insertAtTail(int val) {' },
    { line: 2, code: '    if (head == null) { head = new ListNode(val); return; }' },
    { line: 3, code: '    ListNode curr = head;' },
    { line: 4, code: '    while (curr.next != null) curr = curr.next;' },
    { line: 5, code: '    curr.next = new ListNode(val);' },
    { line: 6, code: '}' },
  ],  python: [
    { line: 1, code: 'def insert_at_tail(val):' },
    { line: 2, code: '    if not head: head = ListNode(val); return' },
    { line: 3, code: '    curr = head' },
    { line: 4, code: '    while curr.next: curr = curr.next' },
    { line: 5, code: '    curr.next = ListNode(val)' },
    { line: 6, code: '' },
  ],
  c: [
    { line: 1, code: 'void insertAtTail(int val) {' },
    { line: 2, code: '    if (!head) { head = newNode(val); return; }' },
    { line: 3, code: '    Node* curr = head;' },
    { line: 4, code: '    while (curr->next) curr = curr->next;' },
    { line: 5, code: '    curr->next = newNode(val);' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'void insertAtTail(int val) {' },
    { line: 2, code: '    if (head == null) { head = new ListNode(val); return; }' },
    { line: 3, code: '    ListNode curr = head;' },
    { line: 4, code: '    while (curr.next != null) curr = curr.next;' },
    { line: 5, code: '    curr.next = new ListNode(val);' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func insertAtTail(val int) {' },
    { line: 2, code: '    if head == nil { head = &ListNode{Val: val}; return }' },
    { line: 3, code: '    curr := head' },
    { line: 4, code: '    for curr.Next != nil { curr = curr.Next }' },
    { line: 5, code: '    curr.Next = &ListNode{Val: val}' },
    { line: 6, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function insertAtTail(val) {' },
    { line: 2, code: '  if (!head) { head = new ListNode(val); return }' },
    { line: 3, code: '  let curr = head' },
    { line: 4, code: '  while (curr.next) curr = curr.next' },
    { line: 5, code: '  curr.next = new ListNode(val)' },
    { line: 6, code: '}' },
  ],
}

const searchSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function search(val: number): boolean {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return false' },
    { line: 8, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '    Node* curr = head;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        if (curr->val == val) return 1;' },
    { line: 5, code: '        curr = curr->next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return 0;' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'bool search(int val) {' },
    { line: 2, code: '    ListNode curr = head;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        if (curr.val == val) return true;' },
    { line: 5, code: '        curr = curr.next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return false;' },
    { line: 8, code: '}' },
  ],  python: [
    { line: 1, code: 'def search(val) -> bool:' },
    { line: 2, code: '    curr = head' },
    { line: 3, code: '    while curr:' },
    { line: 4, code: '        if curr.val == val: return True' },
    { line: 5, code: '        curr = curr.next' },
    { line: 6, code: '    return False' },
    { line: 7, code: '' },
    { line: 8, code: '' },
  ],
  c: [
    { line: 1, code: 'int search(int val) {' },
    { line: 2, code: '    Node* curr = head;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        if (curr->val == val) return 1;' },
    { line: 5, code: '        curr = curr->next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return 0;' },
    { line: 8, code: '}' },
  ],
  java: [
    { line: 1, code: 'boolean search(int val) {' },
    { line: 2, code: '    ListNode curr = head;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        if (curr.val == val) return true;' },
    { line: 5, code: '        curr = curr.next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return false;' },
    { line: 8, code: '}' },
  ],
  go: [
    { line: 1, code: 'func search(val int) bool {' },
    { line: 2, code: '    curr := head' },
    { line: 3, code: '    for curr != nil {' },
    { line: 4, code: '        if curr.Val == val { return true }' },
    { line: 5, code: '        curr = curr.Next' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return false' },
    { line: 8, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function search(val) {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return false' },
    { line: 8, code: '}' },
  ],
}

const traverseSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function traverse() {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    console.log(curr.val)' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void traverse() {' },
    { line: 2, code: '    Node* curr = head;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        printf("%d ", curr->val);' },
    { line: 5, code: '        curr = curr->next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void traverse() {' },
    { line: 2, code: '    ListNode curr = head;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        System.out.println(curr.val);' },
    { line: 5, code: '        curr = curr.next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],  python: [
    { line: 1, code: 'def traverse():' },
    { line: 2, code: '    curr = head' },
    { line: 3, code: '    while curr:' },
    { line: 4, code: '        print(curr.val)' },
    { line: 5, code: '        curr = curr.next' },
    { line: 6, code: '' },
    { line: 7, code: '' },
  ],
  c: [
    { line: 1, code: 'void traverse() {' },
    { line: 2, code: '    Node* curr = head;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        printf("%d ", curr->val);' },
    { line: 5, code: '        curr = curr->next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  java: [
    { line: 1, code: 'void traverse() {' },
    { line: 2, code: '    ListNode curr = head;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        System.out.println(curr.val);' },
    { line: 5, code: '        curr = curr.next;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  go: [
    { line: 1, code: 'func traverse() {' },
    { line: 2, code: '    curr := head' },
    { line: 3, code: '    for curr != nil {' },
    { line: 4, code: '        fmt.Println(curr.Val)' },
    { line: 5, code: '        curr = curr.Next' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function traverse() {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    console.log(curr.val)' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '}' },
  ],
}

// ---------------------------------------------------------------------------
// dsOperations export
// ---------------------------------------------------------------------------

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert Head',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => insertHeadGenerator(value, initialState),
    codeSnippets: insertHeadSnippets,
  },
  {
    type: 'insert',
    label: 'Insert Tail',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => insertTailGenerator(value, initialState),
    codeSnippets: insertTailSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
  {
    type: 'traverse',
    label: 'Traverse',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => traverseGenerator(value, initialState),
    codeSnippets: traverseSnippets,
  },
]

// ---------------------------------------------------------------------------
// Backwards-compat generator (traverse demo)
// ---------------------------------------------------------------------------

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const state: LinkedListState = { nodes: [], head: null }

  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.init',
    codeLine: 1,
  }

  let nodeCounter = 0

  function insertAtHead(value: number): string {
    const id = `n${nodeCounter++}`
    const newNode = { value, id, next: state.head }
    state.nodes.unshift(newNode)
    state.head = id
    return id
  }

  const id10 = insertAtHead(10)
  state.current = id10
  yield {
    state: cloneState(state),
    highlights: [{ index: id10, role: 'head' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 10 },
  }

  const id20 = insertAtHead(20)
  state.current = id20
  yield {
    state: cloneState(state),
    highlights: [{ index: id20, role: 'head' }, { index: id10, role: 'current' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 20 },
  }

  const id30 = insertAtHead(30)
  state.current = id30
  yield {
    state: cloneState(state),
    highlights: [{ index: id30, role: 'head' }, { index: id20, role: 'current' }, { index: id10, role: 'current' }],
    message: 'algorithms.linkedList.steps.insert',
    codeLine: 3,
    auxState: { v: 30 },
  }

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

  let prevId: string | null = null
  let currId: string | null = state.head

  yield {
    state: cloneState(state),
    highlights: [],
    message: 'algorithms.linkedList.steps.delete',
    codeLine: 10,
    auxState: { target: 20 },
  }

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
      if (prevId === null) {
        state.head = node.next
      } else {
        const prevNode = state.nodes.find(n => n.id === prevId)!
        prevNode.next = node.next
      }
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

// ---------------------------------------------------------------------------
// Top-level codeSnippets (backwards compat — full class view)
// ---------------------------------------------------------------------------

export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'class ListNode { constructor(public val: number, public next: ListNode | null = null) {} }' },
    { line: 2,  code: 'let head: ListNode | null = null' },
    { line: 3,  code: 'function insertAtHead(val: number) {' },
    { line: 4,  code: '  head = new ListNode(val, head)' },
    { line: 5,  code: '}' },
    { line: 6,  code: 'function traverse() {' },
    { line: 7,  code: '  let cur = head' },
    { line: 8,  code: '  while (cur) { console.log(cur.val); cur = cur.next }' },
    { line: 9,  code: '}' },
    { line: 10, code: 'function deleteVal(val: number) {' },
    { line: 11, code: '  if (!head) return' },
    { line: 12, code: '  if (head.val === val) { head = head.next; return }' },
    { line: 13, code: '  let cur = head' },
    { line: 14, code: '  while (cur.next && cur.next.val !== val) cur = cur.next' },
    { line: 15, code: '  if (cur.next) cur.next = cur.next.next' },
    { line: 16, code: '}' },
  ],

  cpp: [
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
  csharp: [
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
  ],  python: [
    { line: 1,  code: 'class ListNode:' },
    { line: 2,  code: '    def __init__(self, val, next=None):' },
    { line: 3,  code: '        self.val = val; self.next = next' },
    { line: 4,  code: 'head = None' },
    { line: 5,  code: 'def insert_at_head(val):' },
    { line: 6,  code: '    global head' },
    { line: 7,  code: '    head = ListNode(val, head)' },
    { line: 8,  code: 'def traverse():' },
    { line: 9,  code: '    cur = head' },
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
    { line: 1,  code: 'typedef struct Node { int val; struct Node* next; } Node;' },
    { line: 2,  code: 'Node* head = NULL;' },
    { line: 3,  code: 'void insertAtHead(int val) {' },
    { line: 4,  code: '    Node* n = malloc(sizeof(Node));' },
    { line: 5,  code: '    n->val = val; n->next = head; head = n;' },
    { line: 6,  code: '}' },
    { line: 7,  code: 'void traverse() {' },
    { line: 8,  code: '    Node* cur = head;' },
    { line: 9,  code: '    while (cur) { printf("%d ", cur->val); cur = cur->next; }' },
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
    { line: 1,  code: 'class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }' },
    { line: 2,  code: 'ListNode head = null;' },
    { line: 3,  code: 'void insertAtHead(int val) {' },
    { line: 4,  code: '    ListNode n = new ListNode(val);' },
    { line: 5,  code: '    n.next = head; head = n;' },
    { line: 6,  code: '}' },
    { line: 7,  code: 'void traverse() {' },
    { line: 8,  code: '    ListNode cur = head;' },
    { line: 9,  code: '    while (cur != null) { System.out.print(cur.val); cur = cur.next; }' },
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
    { line: 1,  code: 'type ListNode struct { Val int; Next *ListNode }' },
    { line: 2,  code: 'var head *ListNode' },
    { line: 3,  code: 'func insertAtHead(val int) {' },
    { line: 4,  code: '    head = &ListNode{Val: val, Next: head}' },
    { line: 5,  code: '}' },
    { line: 6,  code: 'func traverse() {' },
    { line: 7,  code: '    cur := head' },
    { line: 8,  code: '    for cur != nil { fmt.Print(cur.Val); cur = cur.Next }' },
    { line: 9,  code: '}' },
    { line: 10, code: 'func deleteVal(val int) {' },
    { line: 11, code: '    if head == nil { return }' },
    { line: 12, code: '    if head.Val == val { head = head.Next; return }' },
    { line: 13, code: '    cur := head' },
    { line: 14, code: '    for cur.Next != nil && cur.Next.Val != val { cur = cur.Next }' },
    { line: 15, code: '    if cur.Next != nil { cur.Next = cur.Next.Next }' },
    { line: 16, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'class ListNode { constructor(public val, public next: ListNode | null = null) {} }' },
    { line: 2, code: 'let head: ListNode | null = null' },
    { line: 3, code: 'function insertAtHead(val) {' },
    { line: 4, code: '  head = new ListNode(val, head)' },
    { line: 5, code: '}' },
    { line: 6, code: 'function traverse() {' },
    { line: 7, code: '  let cur = head' },
    { line: 8, code: '  while (cur) { console.log(cur.val); cur = cur.next }' },
    { line: 9, code: '}' },
    { line: 10, code: 'function deleteVal(val) {' },
    { line: 11, code: '  if (!head) return' },
    { line: 12, code: '  if (head.val === val) { head = head.next; return }' },
    { line: 13, code: '  let cur = head' },
    { line: 14, code: '  while (cur.next && cur.next.val !== val) cur = cur.next' },
    { line: 15, code: '  if (cur.next) cur.next = cur.next.next' },
    { line: 16, code: '}' },
  ],
}
