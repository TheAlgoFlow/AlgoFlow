import type {
  AlgorithmMeta,
  AlgorithmFrame,
  CodeSnippets,
  LinkedListState,
  DSOperationConfig,
} from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'doubly-linked-list',
  category: 'data-structures',
  nameKey: 'algorithms.doublyLinkedList.name',
  descriptionKey: 'algorithms.doublyLinkedList.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    operations: [
      { name: 'inserirInicio', best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'inserirFim',    best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'removerInicio', best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'removerFim',    best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
      { name: 'pesquisar',     best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    ],
  },
  tags: ['dynamic', 'sequential', 'pointer', 'doubly-linked'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/design-linked-list/',                   title: '#707 Design Linked List',      difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/insert-a-node-at-the-tail-of-a-linked-list/problem', title: 'Insert at Tail', difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/reverse-a-linked-list',                  title: 'Reverse a Linked List',        difficulty: 'Easy' },
  ],
}

// ---------------------------------------------------------------------------
// Helpers — reuse LinkedListState; 'prev' field on LinkedListNode is simulated
// via the state.prev pointer (the id of the node before current)
// ---------------------------------------------------------------------------

// Extended node type for doubly-linked behaviour tracked in state
type DLLState = LinkedListState & {
  tail: string | null
  // nodes[i].prev is tracked externally in a Map for visualization
  prevMap: Record<string, string | null>
}

function cloneState(s: DLLState): DLLState {
  return {
    nodes: s.nodes.map(n => ({ ...n })),
    head: s.head,
    tail: s.tail,
    current: s.current,
    prev: s.prev,
    highlighted: s.highlighted ? [...s.highlighted] : undefined,
    prevMap: { ...s.prevMap },
  }
}

function buildDLL(values: number[]): { state: DLLState; ids: string[] } {
  const state: DLLState = { nodes: [], head: null, tail: null, prevMap: {} }
  const ids: string[] = []
  values.forEach((val, i) => {
    const id = `n${i}`
    ids.push(id)
    const prevId = i > 0 ? ids[i - 1] : null
    state.nodes.push({ value: val, id, next: null })
    state.prevMap[id] = prevId
    if (prevId !== null) {
      const prevNode = state.nodes.find(n => n.id === prevId)!
      prevNode.next = id
    }
    if (i === 0) state.head = id
    state.tail = id
  })
  return { state, ids }
}

// ---------------------------------------------------------------------------
// Generators (matching AEDS2 ListaDupla.java operations)
// ---------------------------------------------------------------------------

let nodeCounter = 0
function nextId() { return `n${nodeCounter++}` }

/** inserirInicio — inserts at front (after sentinel head in AEDS2 terms) */
function* inserirInicioGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 42
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
    const ids = state.nodes.map(n => parseInt(n.id.replace('n', ''), 10)).filter(n => !isNaN(n))
    nodeCounter = ids.length > 0 ? Math.max(...ids) + 1 : 0
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [],
    message: 'ds.doublyLinkedList.inserirInicio.init',
    codeLine: 1,
  }

  const newId = nextId()
  const oldHead = state.head

  state.nodes.unshift({ value: val, id: newId, next: oldHead })
  state.prevMap[newId] = null
  if (oldHead !== null) state.prevMap[oldHead] = newId
  state.head = newId

  yield {
    state: cloneState(state) as unknown,
    highlights: [{ index: newId, role: 'head', label: 'new' }],
    message: 'ds.doublyLinkedList.inserirInicio.done',
    codeLine: 3,
    auxState: { val },
  }
}

/** inserirFim — inserts at back (ultimo.prox in AEDS2) */
function* inserirFimGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const val = value ?? 99
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
    const ids = state.nodes.map(n => parseInt(n.id.replace('n', ''), 10)).filter(n => !isNaN(n))
    nodeCounter = ids.length > 0 ? Math.max(...ids) + 1 : 0
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [],
    message: 'ds.doublyLinkedList.inserirFim.init',
    codeLine: 1,
  }

  const newId = nextId()
  const oldTail = state.tail

  state.nodes.push({ value: val, id: newId, next: null })
  state.prevMap[newId] = oldTail
  if (oldTail !== null) {
    const tailNode = state.nodes.find(n => n.id === oldTail)!
    tailNode.next = newId
  } else {
    state.head = newId
  }
  state.tail = newId

  yield {
    state: cloneState(state) as unknown,
    highlights: [
      { index: oldTail!, role: 'tail', label: 'old tail' },
      { index: newId,   role: 'head', label: 'new' },
    ],
    message: 'ds.doublyLinkedList.inserirFim.done',
    codeLine: 3,
    auxState: { val },
  }
}

/** removerInicio — removes first node */
function* removerInicioGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [{ index: state.head!, role: 'head', label: 'remove' }],
    message: 'ds.doublyLinkedList.removerInicio.init',
    codeLine: 1,
  }

  const removedId = state.head!
  const removedVal = state.nodes.find(n => n.id === removedId)!.value
  const newHead = state.nodes.find(n => n.id === removedId)!.next

  state.nodes = state.nodes.filter(n => n.id !== removedId)
  state.head = newHead
  if (newHead !== null) state.prevMap[newHead] = null
  delete state.prevMap[removedId]

  yield {
    state: cloneState(state) as unknown,
    highlights: state.head ? [{ index: state.head, role: 'head', label: 'head' }] : [],
    message: 'ds.doublyLinkedList.removerInicio.done',
    codeLine: 3,
    auxState: { removed: removedVal },
  }
}

/** removerFim — removes last node */
function* removerFimGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [{ index: state.tail!, role: 'tail', label: 'remove' }],
    message: 'ds.doublyLinkedList.removerFim.init',
    codeLine: 1,
  }

  const removedId = state.tail!
  const removedVal = state.nodes.find(n => n.id === removedId)!.value
  const newTail = state.prevMap[removedId]

  state.nodes = state.nodes.filter(n => n.id !== removedId)
  if (newTail !== null && newTail !== undefined) {
    const newTailNode = state.nodes.find(n => n.id === newTail)!
    newTailNode.next = null
  }
  state.tail = newTail ?? null
  delete state.prevMap[removedId]

  yield {
    state: cloneState(state) as unknown,
    highlights: state.tail ? [{ index: state.tail, role: 'tail', label: 'tail' }] : [],
    message: 'ds.doublyLinkedList.removerFim.done',
    codeLine: 3,
    auxState: { removed: removedVal },
  }
}

/** pesquisar — linear search forward */
function* pesquisarGenerator(value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const target = value ?? 20
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [],
    message: 'ds.doublyLinkedList.pesquisar.init',
    codeLine: 1,
    auxState: { target },
  }

  let currId: string | null = state.head
  let found = false
  let steps = 0
  while (currId !== null) {
    const node = state.nodes.find(n => n.id === currId)!
    if (node.value === target) {
      steps++
      yield {
        state: cloneState(state) as unknown,
        highlights: [{ index: currId, role: 'found', label: 'found' }],
        message: 'ds.doublyLinkedList.pesquisar.found',
        codeLine: 4,
        auxState: { target, val: node.value, steps },
      }
      found = true
      break
    }
    steps++
    yield {
      state: cloneState(state) as unknown,
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.doublyLinkedList.pesquisar.checking',
      codeLine: 3,
      auxState: { target, val: node.value, steps },
    }
    currId = node.next
  }

  if (!found) {
    yield {
      state: cloneState(state) as unknown,
      highlights: [],
      message: 'ds.doublyLinkedList.pesquisar.notFound',
      codeLine: 5,
      auxState: { target, steps },
    }
  }
}

/** mostrarInverso — traverse in reverse (tail → head) */
function* mostrarInversoGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  let state: DLLState
  if (initialState) {
    state = cloneState(initialState as DLLState)
  } else {
    nodeCounter = 0
    ;({ state } = buildDLL([10, 20, 30]))
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [],
    message: 'ds.doublyLinkedList.mostrarInverso.init',
    codeLine: 1,
  }

  // Walk backwards using prevMap
  let currId: string | null = state.tail
  let steps = 0
  while (currId !== null) {
    steps++
    yield {
      state: cloneState(state) as unknown,
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.doublyLinkedList.mostrarInverso.visiting',
      codeLine: 3,
      auxState: { val: state.nodes.find(n => n.id === currId)!.value, steps },
    }
    currId = state.prevMap[currId] ?? null
  }

  yield {
    state: cloneState(state) as unknown,
    highlights: [],
    message: 'ds.doublyLinkedList.mostrarInverso.done',
    codeLine: 5,
  }
}

// ---------------------------------------------------------------------------
// Per-operation code snippets
// ---------------------------------------------------------------------------

const inserirInicioSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function inserirInicio(val: number) {' },
    { line: 2, code: '  const n = new DLLNode(val)' },
    { line: 3, code: '  n.next = head; if (head) head.prev = n' },
    { line: 4, code: '  head = n; if (!tail) tail = n' },
    { line: 5, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void inserirInicio(Lista* l, int x) {' },
    { line: 2, code: '    Celula* tmp = (Celula*)malloc(sizeof(Celula));' },
    { line: 3, code: '    tmp->elemento = x;' },
    { line: 4, code: '    tmp->prox = l->primeiro->prox;' },
    { line: 5, code: '    tmp->ant  = l->primeiro;' },
    { line: 6, code: '    if (tmp->prox != NULL)' },
    { line: 7, code: '        tmp->prox->ant = tmp;' },
    { line: 8, code: '    else' },
    { line: 9, code: '        l->ultimo = tmp;' },
    { line: 10, code: '    l->primeiro->prox = tmp;' },
    { line: 11, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void inserirInicio(int x) {' },
    { line: 2, code: '    Celula tmp = new Celula(x);' },
    { line: 3, code: '    tmp.prox = primeiro.prox;' },
    { line: 4, code: '    tmp.ant  = primeiro;' },
    { line: 5, code: '    if (tmp.prox != null)' },
    { line: 6, code: '        tmp.prox.ant = tmp;' },
    { line: 7, code: '    else' },
    { line: 8, code: '        ultimo = tmp;' },
    { line: 9, code: '    primeiro.prox = tmp;' },
    { line: 10, code: '}' },
  ],

  python: [
    { line: 1, code: 'def inserir_inicio(val):' },
    { line: 2, code: '    n = DLLNode(val)' },
    { line: 3, code: '    n.next = head' },
    { line: 4, code: '    if head: head.prev = n' },
    { line: 5, code: '    head = n' },
  ],
  c: [
    { line: 1,  code: 'void inserirInicio(Lista* l, int x) {' },
    { line: 2,  code: '    Celula* tmp = (Celula*)malloc(sizeof(Celula));' },
    { line: 3,  code: '    tmp->elemento = x;' },
    { line: 4,  code: '    tmp->prox = l->primeiro->prox;' },
    { line: 5,  code: '    tmp->ant  = l->primeiro;' },
    { line: 6,  code: '    if (tmp->prox != NULL)' },
    { line: 7,  code: '        tmp->prox->ant = tmp;' },
    { line: 8,  code: '    else' },
    { line: 9,  code: '        l->ultimo = tmp;' },
    { line: 10, code: '    l->primeiro->prox = tmp;' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1,  code: 'public void inserirInicio(int x) {' },
    { line: 2,  code: '    Celula tmp = new Celula(x);' },
    { line: 3,  code: '    tmp.prox = primeiro.prox;' },
    { line: 4,  code: '    tmp.ant  = primeiro;' },
    { line: 5,  code: '    if (tmp.prox != null)' },
    { line: 6,  code: '        tmp.prox.ant = tmp;' },
    { line: 7,  code: '    else' },
    { line: 8,  code: '        ultimo = tmp;' },
    { line: 9,  code: '    primeiro.prox = tmp;' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) InserirInicio(val int) {' },
    { line: 2, code: '    n := &DLLNode{Val: val, Next: l.Head}' },
    { line: 3, code: '    if l.Head != nil { l.Head.Prev = n }' },
    { line: 4, code: '    l.Head = n' },
    { line: 5, code: '    if l.Tail == nil { l.Tail = n }' },
    { line: 6, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function inserirInicio(val) {' },
    { line: 2, code: '  const n = new DLLNode(val)' },
    { line: 3, code: '  n.next = head; if (head) head.prev = n' },
    { line: 4, code: '  head = n; if (!tail) tail = n' },
    { line: 5, code: '}' },
  ],
}

const inserirFimSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function inserirFim(val: number) {' },
    { line: 2, code: '  const n = new DLLNode(val)' },
    { line: 3, code: '  n.prev = tail; if (tail) tail.next = n' },
    { line: 4, code: '  tail = n; if (!head) head = n' },
    { line: 5, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void inserirFim(Lista* l, int x) {' },
    { line: 2, code: '    Celula* tmp = (Celula*)malloc(sizeof(Celula));' },
    { line: 3, code: '    tmp->elemento = x;' },
    { line: 4, code: '    tmp->prox = NULL;' },
    { line: 5, code: '    tmp->ant  = l->ultimo;' },
    { line: 6, code: '    l->ultimo->prox = tmp;' },
    { line: 7, code: '    l->ultimo = tmp;' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void inserirFim(int x) {' },
    { line: 2, code: '    Celula tmp = new Celula(x);' },
    { line: 3, code: '    tmp.prox = null;' },
    { line: 4, code: '    tmp.ant  = ultimo;' },
    { line: 5, code: '    ultimo.prox = tmp;' },
    { line: 6, code: '    ultimo = tmp;' },
    { line: 7, code: '}' },
  ],  python: [
    { line: 1, code: 'def inserir_fim(val):' },
    { line: 2, code: '    n = DLLNode(val)' },
    { line: 3, code: '    n.prev = tail' },
    { line: 4, code: '    if tail: tail.next = n' },
    { line: 5, code: '    tail = n' },
  ],
  c: [
    { line: 1,  code: 'void inserirFim(Lista* l, int x) {' },
    { line: 2,  code: '    Celula* tmp = (Celula*)malloc(sizeof(Celula));' },
    { line: 3,  code: '    tmp->elemento = x;' },
    { line: 4,  code: '    tmp->prox = NULL;' },
    { line: 5,  code: '    tmp->ant  = l->ultimo;' },
    { line: 6,  code: '    l->ultimo->prox = tmp;' },
    { line: 7,  code: '    l->ultimo = tmp;' },
    { line: 8,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'public void inserirFim(int x) {' },
    { line: 2,  code: '    Celula tmp = new Celula(x);' },
    { line: 3,  code: '    tmp.prox = null;' },
    { line: 4,  code: '    tmp.ant  = ultimo;' },
    { line: 5,  code: '    ultimo.prox = tmp;' },
    { line: 6,  code: '    ultimo = tmp;' },
    { line: 7,  code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) InserirFim(val int) {' },
    { line: 2, code: '    n := &DLLNode{Val: val, Prev: l.Tail}' },
    { line: 3, code: '    if l.Tail != nil { l.Tail.Next = n }' },
    { line: 4, code: '    l.Tail = n' },
    { line: 5, code: '    if l.Head == nil { l.Head = n }' },
    { line: 6, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function inserirFim(val) {' },
    { line: 2, code: '  const n = new DLLNode(val)' },
    { line: 3, code: '  n.prev = tail; if (tail) tail.next = n' },
    { line: 4, code: '  tail = n; if (!head) head = n' },
    { line: 5, code: '}' },
  ],
}

const removerInicioSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function removerInicio(): number {' },
    { line: 2, code: '  const val = head!.val' },
    { line: 3, code: '  head = head!.next' },
    { line: 4, code: '  if (head) head.prev = null' },
    { line: 5, code: '  else tail = null' },
    { line: 6, code: '  return val' },
    { line: 7, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int removerInicio(Lista* l) {' },
    { line: 2, code: '    Celula* tmp = l->primeiro->prox;' },
    { line: 3, code: '    int x = tmp->elemento;' },
    { line: 4, code: '    l->primeiro->prox = tmp->prox;' },
    { line: 5, code: '    if (tmp->prox != NULL)' },
    { line: 6, code: '        tmp->prox->ant = l->primeiro;' },
    { line: 7, code: '    else' },
    { line: 8, code: '        l->ultimo = l->primeiro;' },
    { line: 9, code: '    free(tmp);' },
    { line: 10, code: '    return x;' },
    { line: 11, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'int removerInicio() {' },
    { line: 2, code: '    Celula tmp = primeiro.prox;' },
    { line: 3, code: '    int x = tmp.elemento;' },
    { line: 4, code: '    primeiro.prox = tmp.prox;' },
    { line: 5, code: '    if (tmp.prox != null)' },
    { line: 6, code: '        tmp.prox.ant = primeiro;' },
    { line: 7, code: '    else' },
    { line: 8, code: '        ultimo = primeiro;' },
    { line: 9, code: '    return x;' },
    { line: 10, code: '}' },
  ],  python: [
    { line: 1, code: 'def remover_inicio():' },
    { line: 2, code: '    val = head.val' },
    { line: 3, code: '    head = head.next' },
    { line: 4, code: '    if head: head.prev = None' },
    { line: 5, code: '    else: tail = None' },
    { line: 6, code: '    return val' },
  ],
  c: [
    { line: 1,  code: 'int removerInicio(Lista* l) {' },
    { line: 2,  code: '    Celula* tmp = l->primeiro->prox;' },
    { line: 3,  code: '    int x = tmp->elemento;' },
    { line: 4,  code: '    l->primeiro->prox = tmp->prox;' },
    { line: 5,  code: '    if (tmp->prox != NULL)' },
    { line: 6,  code: '        tmp->prox->ant = l->primeiro;' },
    { line: 7,  code: '    else' },
    { line: 8,  code: '        l->ultimo = l->primeiro;' },
    { line: 9,  code: '    free(tmp);' },
    { line: 10, code: '    return x;' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1,  code: 'public int removerInicio() {' },
    { line: 2,  code: '    Celula tmp = primeiro.prox;' },
    { line: 3,  code: '    int x = tmp.elemento;' },
    { line: 4,  code: '    primeiro.prox = tmp.prox;' },
    { line: 5,  code: '    if (tmp.prox != null)' },
    { line: 6,  code: '        tmp.prox.ant = primeiro;' },
    { line: 7,  code: '    else' },
    { line: 8,  code: '        ultimo = primeiro;' },
    { line: 9,  code: '    return x;' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) RemoverInicio() int {' },
    { line: 2, code: '    val := l.Head.Val' },
    { line: 3, code: '    l.Head = l.Head.Next' },
    { line: 4, code: '    if l.Head != nil { l.Head.Prev = nil }' },
    { line: 5, code: '    else { l.Tail = nil }' },
    { line: 6, code: '    return val' },
    { line: 7, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function removerInicio() {' },
    { line: 2, code: '  const val = head!.val' },
    { line: 3, code: '  head = head!.next' },
    { line: 4, code: '  if (head) head.prev = null' },
    { line: 5, code: '  else tail = null' },
    { line: 6, code: '  return val' },
    { line: 7, code: '}' },
  ],
}

const removerFimSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function removerFim(): number {' },
    { line: 2, code: '  const val = tail!.val' },
    { line: 3, code: '  tail = tail!.prev' },
    { line: 4, code: '  if (tail) tail.next = null' },
    { line: 5, code: '  else head = null' },
    { line: 6, code: '  return val' },
    { line: 7, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int removerFim(Lista* l) {' },
    { line: 2, code: '    Celula* tmp = l->ultimo;' },
    { line: 3, code: '    int x = tmp->elemento;' },
    { line: 4, code: '    l->ultimo = tmp->ant;' },
    { line: 5, code: '    l->ultimo->prox = NULL;' },
    { line: 6, code: '    free(tmp);' },
    { line: 7, code: '    return x;' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'int removerFim() {' },
    { line: 2, code: '    Celula tmp = ultimo;' },
    { line: 3, code: '    int x = tmp.elemento;' },
    { line: 4, code: '    ultimo = tmp.ant;' },
    { line: 5, code: '    ultimo.prox = null;' },
    { line: 6, code: '    return x;' },
    { line: 7, code: '}' },
  ],  python: [
    { line: 1, code: 'def remover_fim():' },
    { line: 2, code: '    val = tail.val' },
    { line: 3, code: '    tail = tail.prev' },
    { line: 4, code: '    if tail: tail.next = None' },
    { line: 5, code: '    else: head = None' },
    { line: 6, code: '    return val' },
  ],
  c: [
    { line: 1,  code: 'int removerFim(Lista* l) {' },
    { line: 2,  code: '    Celula* tmp = l->ultimo;' },
    { line: 3,  code: '    int x = tmp->elemento;' },
    { line: 4,  code: '    l->ultimo = tmp->ant;' },
    { line: 5,  code: '    l->ultimo->prox = NULL;' },
    { line: 6,  code: '    free(tmp);' },
    { line: 7,  code: '    return x;' },
    { line: 8,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'public int removerFim() {' },
    { line: 2,  code: '    Celula tmp = ultimo;' },
    { line: 3,  code: '    int x = tmp.elemento;' },
    { line: 4,  code: '    ultimo = tmp.ant;' },
    { line: 5,  code: '    ultimo.prox = null;' },
    { line: 6,  code: '    return x;' },
    { line: 7,  code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) RemoverFim() int {' },
    { line: 2, code: '    val := l.Tail.Val' },
    { line: 3, code: '    l.Tail = l.Tail.Prev' },
    { line: 4, code: '    if l.Tail != nil { l.Tail.Next = nil }' },
    { line: 5, code: '    else { l.Head = nil }' },
    { line: 6, code: '    return val' },
    { line: 7, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function removerFim() {' },
    { line: 2, code: '  const val = tail!.val' },
    { line: 3, code: '  tail = tail!.prev' },
    { line: 4, code: '  if (tail) tail.next = null' },
    { line: 5, code: '  else head = null' },
    { line: 6, code: '  return val' },
    { line: 7, code: '}' },
  ],
}

const pesquisarSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function pesquisar(val: number): boolean {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return false' },
    { line: 8, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'int pesquisar(Lista* l, int x) {' },
    { line: 2, code: '    Celula* p = l->primeiro->prox;' },
    { line: 3, code: '    while (p != NULL) {' },
    { line: 4, code: '        if (p->elemento == x) return 1;' },
    { line: 5, code: '        p = p->prox;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return 0;' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'bool pesquisar(int x) {' },
    { line: 2, code: '    Celula p = primeiro.prox;' },
    { line: 3, code: '    while (p != null) {' },
    { line: 4, code: '        if (p.elemento == x) return true;' },
    { line: 5, code: '        p = p.prox;' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return false;' },
    { line: 8, code: '}' },
  ],  python: [
    { line: 1, code: 'def pesquisar(val) -> bool:' },
    { line: 2, code: '    curr = head' },
    { line: 3, code: '    while curr:' },
    { line: 4, code: '        if curr.val == val: return True' },
    { line: 5, code: '        curr = curr.next' },
    { line: 6, code: '    return False' },
  ],
  c: [
    { line: 1,  code: 'int pesquisar(Lista* l, int x) {' },
    { line: 2,  code: '    Celula* p = l->primeiro->prox;' },
    { line: 3,  code: '    while (p != NULL) {' },
    { line: 4,  code: '        if (p->elemento == x) return 1;' },
    { line: 5,  code: '        p = p->prox;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '    return 0;' },
    { line: 8,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'public boolean pesquisar(int x) {' },
    { line: 2,  code: '    Celula p = primeiro.prox;' },
    { line: 3,  code: '    while (p != null) {' },
    { line: 4,  code: '        if (p.elemento == x) return true;' },
    { line: 5,  code: '        p = p.prox;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '    return false;' },
    { line: 8,  code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) Pesquisar(val int) bool {' },
    { line: 2, code: '    curr := l.Head' },
    { line: 3, code: '    for curr != nil {' },
    { line: 4, code: '        if curr.Val == val { return true }' },
    { line: 5, code: '        curr = curr.Next' },
    { line: 6, code: '    }' },
    { line: 7, code: '    return false' },
    { line: 8, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function pesquisar(val) {' },
    { line: 2, code: '  let curr = head' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    curr = curr.next' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return false' },
    { line: 8, code: '}' },
  ],
}

const mostrarInversoSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'function mostrarInverso() {' },
    { line: 2, code: '  let curr = tail' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    console.log(curr.val)' },
    { line: 5, code: '    curr = curr.prev' },
    { line: 6, code: '  }' },
    { line: 7, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void mostrarInverso(Lista* l) {' },
    { line: 2, code: '    Celula* p = l->ultimo;' },
    { line: 3, code: '    while (p != l->primeiro) {' },
    { line: 4, code: '        printf("%d ", p->elemento);' },
    { line: 5, code: '        p = p->ant;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void mostrarInverso() {' },
    { line: 2, code: '    Celula p = ultimo;' },
    { line: 3, code: '    while (p != primeiro) {' },
    { line: 4, code: '        System.out.print(p.elemento + " ");' },
    { line: 5, code: '        p = p.ant;' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],  python: [
    { line: 1, code: 'def mostrar_inverso():' },
    { line: 2, code: '    curr = tail' },
    { line: 3, code: '    while curr:' },
    { line: 4, code: '        print(curr.val)' },
    { line: 5, code: '        curr = curr.prev' },
  ],
  c: [
    { line: 1,  code: 'void mostrarInverso(Lista* l) {' },
    { line: 2,  code: '    Celula* p = l->ultimo;' },
    { line: 3,  code: '    while (p != l->primeiro) {' },
    { line: 4,  code: '        printf("%d ", p->elemento);' },
    { line: 5,  code: '        p = p->ant;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'public void mostrarInverso() {' },
    { line: 2,  code: '    Celula p = ultimo;' },
    { line: 3,  code: '    while (p != primeiro) {' },
    { line: 4,  code: '        System.out.print(p.elemento + " ");' },
    { line: 5,  code: '        p = p.ant;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '}' },
  ],
  go: [
    { line: 1, code: 'func (l *DLL) MostrarInverso() {' },
    { line: 2, code: '    curr := l.Tail' },
    { line: 3, code: '    for curr != nil {' },
    { line: 4, code: '        fmt.Print(curr.Val, " ")' },
    { line: 5, code: '        curr = curr.Prev' },
    { line: 6, code: '    }' },
    { line: 7, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function mostrarInverso() {' },
    { line: 2, code: '  let curr = tail' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    console.log(curr.val)' },
    { line: 5, code: '    curr = curr.prev' },
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
    label: 'Insert Front',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => inserirInicioGenerator(value, initialState),
    codeSnippets: inserirInicioSnippets,
  },
  {
    type: 'insert',
    label: 'Insert Back',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => inserirFimGenerator(value, initialState),
    codeSnippets: inserirFimSnippets,
  },
  {
    type: 'remove',
    label: 'Remove Front',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => removerInicioGenerator(value, initialState),
    codeSnippets: removerInicioSnippets,
  },
  {
    type: 'remove',
    label: 'Remove Back',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => removerFimGenerator(value, initialState),
    codeSnippets: removerFimSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value?: number, initialState?: unknown) => pesquisarGenerator(value, initialState),
    codeSnippets: pesquisarSnippets,
  },
  {
    type: 'traverse',
    label: 'Traverse Reverse',
    takesValue: false,
    generator: (value?: number, initialState?: unknown) => mostrarInversoGenerator(value, initialState),
    codeSnippets: mostrarInversoSnippets,
  },
]

// ---------------------------------------------------------------------------
// Top-level generator + codeSnippets (backwards compat)
// ---------------------------------------------------------------------------

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* inserirInicioGenerator(42)
}

export const codeSnippets: CodeSnippets = inserirInicioSnippets
