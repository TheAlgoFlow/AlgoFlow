import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'b-plus-tree',
  category: 'data-structures',
  nameKey: 'algorithms.bPlusTree.name',
  descriptionKey: 'algorithms.bPlusTree.description',
  complexity: {
    time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    operations: [
      { name: 'search',   best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'insert',   best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'scan',     best: 'O(log n + k)', avg: 'O(log n + k)', worst: 'O(log n + k)' },
    ],
  },
  tags: ['tree', 'balanced', 'multiway', 'database', 'range-query'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode', url: 'https://leetcode.com/problems/range-sum-of-bst/', title: '#938 Range Sum of BST', difficulty: 'Easy' },
  ],
}

// Order = 3 (max 2 keys per leaf, max 3 children for internal nodes)
const ORDER = 3
const MAX_LEAF_KEYS = ORDER - 1   // 2
const MAX_INT_KEYS  = ORDER - 1   // 2

export type BPNode = {
  id: number
  keys: number[]
  children: number[]  // internal: child ids | leaf: empty
  isLeaf: boolean
  nextLeaf: number | null  // leaf-chain pointer
}

export type BPlusTreeState = {
  nodes: BPNode[]
  root: number
  activeNode: number | null
  activeKeyIdx: number | null
  scanChain: number[]  // leaf ids being scanned
}

function makeBase(): { nodes: BPNode[]; root: number; nextId: number } {
  //         [15]        id:0
  //        /     \
  // [10,14]     [15,20]
  //  id:1  →→→   id:2
  return {
    nodes: [
      { id: 0, keys: [15],    children: [1, 2], isLeaf: false, nextLeaf: null },
      { id: 1, keys: [10,14], children: [],     isLeaf: true,  nextLeaf: 2    },
      { id: 2, keys: [15,20], children: [],     isLeaf: true,  nextLeaf: null },
    ],
    root: 0,
    nextId: 3,
  }
}

function cloneNodes(nodes: BPNode[]): BPNode[] {
  return nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
}

function snap(nodes: BPNode[], root: number, active: number | null, keyIdx: number | null = null, scanChain: number[] = []): BPlusTreeState {
  return { nodes: cloneNodes(nodes), root, activeNode: active, activeKeyIdx: keyIdx, scanChain }
}

function get(nodes: BPNode[], id: number): BPNode {
  return nodes.find(n => n.id === id)!
}

// ─── Search ──────────────────────────────────────────────────────────────────

function* searchGenerator(value = 14, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BPlusTreeState) : makeBase()
  const nodes = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  const root = base.root

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bPlusTree.search.start', codeLine: 1, auxState: { target: value } }

  let currId: number | null = root

  // Walk down internal nodes
  while (currId !== null) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bPlusTree.search.visiting', codeLine: 3, auxState: { target: value } }

    if (curr.isLeaf) {
      const idx = curr.keys.indexOf(value)
      if (idx !== -1) {
        yield { state: snap(nodes, root, currId, idx), highlights: [{ index: currId, role: 'found', label: 'found' }], message: 'ds.bPlusTree.search.found', codeLine: 6, auxState: { v: value } }
      } else {
        yield { state: snap(nodes, root, currId), highlights: [], message: 'ds.bPlusTree.search.notFound', codeLine: 7, auxState: { target: value } }
      }
      return
    }

    let i = 0
    while (i < curr.keys.length && value >= curr.keys[i]) {
      yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'compare', label: `k[${i}]` }], message: 'ds.bPlusTree.search.comparing', codeLine: 4, auxState: { target: value, key: curr.keys[i] } }
      i++
    }

    yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'current', label: `→[${i}]` }], message: 'ds.bPlusTree.search.goChild', codeLine: 5, auxState: { target: value, childIdx: i } }
    currId = curr.children[i] ?? null
  }
}

// ─── Insert ──────────────────────────────────────────────────────────────────

function* insertGenerator(value = 25, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BPlusTreeState) : makeBase()
  const nodes: BPNode[] = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  let root = base.root
  let nextId = Math.max(...nodes.map(n => n.id)) + 1

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bPlusTree.insert.start', codeLine: 1, auxState: { v: value } }

  // Walk path to leaf
  const path: number[] = []
  let currId = root

  while (!get(nodes, currId).isLeaf) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bPlusTree.insert.descend', codeLine: 4, auxState: { v: value } }

    let i = 0
    while (i < curr.keys.length && value >= curr.keys[i]) i++
    path.push(currId)
    currId = curr.children[i]
  }

  // Insert into leaf
  const leaf = get(nodes, currId)

  yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'active', label: 'leaf' }], message: 'ds.bPlusTree.insert.atLeaf', codeLine: 6, auxState: { v: value } }

  let pos = leaf.keys.length
  while (pos > 0 && value < leaf.keys[pos - 1]) pos--
  leaf.keys.splice(pos, 0, value)

  yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'found', label: 'inserted' }], message: 'ds.bPlusTree.insert.placed', codeLine: 7, auxState: { v: value } }

  // Propagate splits if leaf overflows
  let splitId: number | null = null
  let pushUpKey: number | null = null
  let childId = currId

  if (leaf.keys.length > MAX_LEAF_KEYS) {
    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'swap', label: 'overflow' }], message: 'ds.bPlusTree.insert.leafOverflow', codeLine: 9, auxState: { v: value } }

    const mid = Math.ceil(leaf.keys.length / 2)
    const newLeaf: BPNode = { id: nextId++, keys: leaf.keys.slice(mid), children: [], isLeaf: true, nextLeaf: leaf.nextLeaf }
    nodes.push(newLeaf)
    leaf.keys = leaf.keys.slice(0, mid)
    leaf.nextLeaf = newLeaf.id

    pushUpKey = newLeaf.keys[0]
    splitId = newLeaf.id

    yield { state: snap(nodes, root, newLeaf.id), highlights: [{ index: newLeaf.id, role: 'active', label: 'new' }], message: 'ds.bPlusTree.insert.leafSplit', codeLine: 10, auxState: { v: value, pushUp: pushUpKey } }
  }

  // Propagate split up the path
  while (path.length > 0 && splitId !== null) {
    const parentId = path.pop()!
    const parent = get(nodes, parentId)

    let insertIdx = parent.keys.length
    while (insertIdx > 0 && pushUpKey! < parent.keys[insertIdx - 1]) insertIdx--
    parent.keys.splice(insertIdx, 0, pushUpKey!)
    parent.children.splice(insertIdx + 1, 0, splitId)

    splitId = null
    pushUpKey = null

    yield { state: snap(nodes, root, parentId), highlights: [{ index: parentId, role: 'active', label: 'updated' }], message: 'ds.bPlusTree.insert.pushUp', codeLine: 12, auxState: { v: value } }

    if (parent.keys.length > MAX_INT_KEYS) {
      yield { state: snap(nodes, root, parentId), highlights: [{ index: parentId, role: 'swap', label: 'overflow' }], message: 'ds.bPlusTree.insert.intOverflow', codeLine: 14, auxState: { v: value } }

      const mid = Math.floor(parent.keys.length / 2)
      pushUpKey = parent.keys[mid]
      const newInt: BPNode = { id: nextId++, keys: parent.keys.slice(mid + 1), children: parent.children.slice(mid + 1), isLeaf: false, nextLeaf: null }
      nodes.push(newInt)
      parent.keys = parent.keys.slice(0, mid)
      parent.children = parent.children.slice(0, mid + 1)
      splitId = newInt.id

      yield { state: snap(nodes, root, newInt.id), highlights: [{ index: newInt.id, role: 'active', label: 'new' }], message: 'ds.bPlusTree.insert.intSplit', codeLine: 15, auxState: { pushUp: pushUpKey } }
    }

    childId = parentId
  }

  // New root needed
  if (splitId !== null) {
    const newRoot: BPNode = { id: nextId++, keys: [pushUpKey!], children: [childId, splitId], isLeaf: false, nextLeaf: null }
    nodes.push(newRoot)
    root = newRoot.id

    yield { state: snap(nodes, root, root), highlights: [{ index: root, role: 'active', label: 'new root' }], message: 'ds.bPlusTree.insert.newRoot', codeLine: 17, auxState: { v: value } }
  }

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bPlusTree.insert.done', codeLine: 19, auxState: { v: value } }
}

// ─── Traverse (scan leaves) ──────────────────────────────────────────────────

function* traverseGenerator(_value?: number, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BPlusTreeState) : makeBase()
  const nodes = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  const root = base.root

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bPlusTree.traverse.start', codeLine: 1 }

  // Descend to leftmost leaf
  let currId = root
  while (!get(nodes, currId).isLeaf) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'down' }], message: 'ds.bPlusTree.traverse.descend', codeLine: 2 }

    currId = curr.children[0]
  }

  // Scan all leaves via nextLeaf chain
  const visited: number[] = []

  while (currId !== null) {
    visited.push(currId)

    yield { state: snap(nodes, root, currId, null, [...visited]), highlights: [{ index: currId, role: 'active', label: 'scan' }], message: 'ds.bPlusTree.traverse.scan', codeLine: 4, auxState: { keys: get(nodes, currId).keys.join(', ') } }

    const next = get(nodes, currId).nextLeaf
    if (next === null) break
    currId = next
  }

  yield { state: snap(nodes, root, null, null, visited), highlights: [], message: 'ds.bPlusTree.traverse.done', codeLine: 6 }
}

// ─── Code snippets ───────────────────────────────────────────────────────────

const searchSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'search(val: number): boolean {' },
    { line: 2, code: '  let curr = this.root' },
    { line: 3, code: '  while (!curr.isLeaf) {' },
    { line: 4, code: '    let i = curr.keys.findIndex(k => val < k)' },
    { line: 5, code: '    curr = curr.children[i === -1 ? curr.keys.length : i]' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return curr.keys.includes(val)' },
    { line: 8, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'int bplus_search(BNode* root, int val) {' },
    { line: 2, code: '    BNode* curr = root;' },
    { line: 3, code: '    while (!curr->is_leaf) {' },
    { line: 4, code: '        int i = 0;' },
    { line: 5, code: '        while (i < curr->n && val >= curr->keys[i]) i++;' },
    { line: 6, code: '        curr = curr->children[i];' },
    { line: 7, code: '    }' },
    { line: 8, code: '    for (int i = 0; i < curr->n; i++)' },
    { line: 9, code: '        if (curr->keys[i] == val) return 1;' },
    { line: 10, code: '    return 0;' },
    { line: 11, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'bool search(int val) {' },
    { line: 2, code: '    BNode curr = root;' },
    { line: 3, code: '    while (!curr.isLeaf) {' },
    { line: 4, code: '        int i = 0;' },
    { line: 5, code: '        while (i < curr.keys.size() && val >= curr.keys.get(i)) i++;' },
    { line: 6, code: '        curr = curr.children.get(i);' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return curr.keys.contains(val);' },
    { line: 9, code: '}' },
  ],

  python: [
    { line: 1, code: 'def search(self, val):' },
    { line: 2, code: '    curr = self.root' },
    { line: 3, code: '    while not curr.is_leaf:' },
    { line: 4, code: '        i = next((j for j,k in enumerate(curr.keys) if val < k), len(curr.keys))' },
    { line: 5, code: '        curr = curr.children[i]' },
    { line: 6, code: '    return val in curr.keys' },
  ],
  c: [
    { line: 1, code: 'int bplus_search(BNode* root, int val) {' },
    { line: 2, code: '    BNode* curr = root;' },
    { line: 3, code: '    while (!curr->is_leaf) {' },
    { line: 4, code: '        int i = 0;' },
    { line: 5, code: '        while (i < curr->n && val >= curr->keys[i]) i++;' },
    { line: 6, code: '        curr = curr->children[i];' },
    { line: 7, code: '    }' },
    { line: 8, code: '    for (int i = 0; i < curr->n; i++)' },
    { line: 9, code: '        if (curr->keys[i] == val) return 1;' },
    { line: 10, code: '    return 0;' },
    { line: 11, code: '}' },
  ],
  java: [
    { line: 1, code: 'boolean search(int val) {' },
    { line: 2, code: '    BNode curr = root;' },
    { line: 3, code: '    while (!curr.isLeaf) {' },
    { line: 4, code: '        int i = 0;' },
    { line: 5, code: '        while (i < curr.keys.size() && val >= curr.keys.get(i)) i++;' },
    { line: 6, code: '        curr = curr.children.get(i);' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return curr.keys.contains(val);' },
    { line: 9, code: '}' },
  ],
  go: [
    { line: 1, code: 'func search(node *BNode, val int) bool {' },
    { line: 2, code: '    curr := node' },
    { line: 3, code: '    for !curr.IsLeaf {' },
    { line: 4, code: '        i := 0' },
    { line: 5, code: '        for i < len(curr.Keys) && val >= curr.Keys[i] { i++ }' },
    { line: 6, code: '        curr = curr.Children[i]' },
    { line: 7, code: '    }' },
    { line: 8, code: '    for _, k := range curr.Keys { if k == val { return true } }' },
    { line: 9, code: '    return false' },
    { line: 10, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'search(val) {' },
    { line: 2, code: '  let curr = this.root' },
    { line: 3, code: '  while (!curr.isLeaf) {' },
    { line: 4, code: '    let i = curr.keys.findIndex(k => val < k)' },
    { line: 5, code: '    curr = curr.children[i === -1 ? curr.keys.length : i]' },
    { line: 6, code: '  }' },
    { line: 7, code: '  return curr.keys.includes(val)' },
    { line: 8, code: '}' },
  ],
}

const insertSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'insert(val: number): void {' },
    { line: 2,  code: '  const path = this.findPath(val)' },
    { line: 3,  code: '  const leaf = path.pop()!' },
    { line: 4,  code: '  leaf.insertSorted(val)' },
    { line: 5,  code: '  if (!leaf.isOverflow) return' },
    { line: 6,  code: '  let [pushKey, newNode] = leaf.split()' },
    { line: 7,  code: '  while (path.length) {' },
    { line: 8,  code: '    const parent = path.pop()!' },
    { line: 9,  code: '    parent.insertChild(pushKey, newNode)' },
    { line: 10, code: '    if (!parent.isOverflow) return' },
    { line: 11, code: '    ;[pushKey, newNode] = parent.split()' },
    { line: 12, code: '  }' },
    { line: 13, code: '  this.root = new InternalNode(pushKey, this.root, newNode)' },
    { line: 14, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void bplus_insert(BPlusTree* t, int val) {' },
    { line: 2, code: '    /* find path to leaf */' },
    { line: 3, code: '    BNode* leaf = find_leaf(t->root, val, path);' },
    { line: 4, code: '    insert_in_leaf(leaf, val);' },
    { line: 5, code: '    if (leaf->n <= MAX_KEYS) return;' },
    { line: 6, code: '    int mid = leaf->n / 2;' },
    { line: 7, code: '    BNode* right = split_leaf(leaf, mid);' },
    { line: 8, code: '    propagate_up(t, path, right->keys[0], right);' },
    { line: 9, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void insert(int val) {' },
    { line: 2, code: '    Deque<BNode> path = findPath(val);' },
    { line: 3, code: '    BNode leaf = path.pop();' },
    { line: 4, code: '    leaf.insertSorted(val);' },
    { line: 5, code: '    if (!leaf.isOverflow()) return;' },
    { line: 6, code: '    int pushKey = leaf.split();  // returns median' },
    { line: 7, code: '    BNode newNode = leaf.rightHalf;' },
    { line: 8, code: '    propagateUp(path, pushKey, newNode);' },
    { line: 9, code: '}' },
  ],  python: [
    { line: 1,  code: 'def insert(self, val):' },
    { line: 2,  code: '    path = self.find_path(val)' },
    { line: 3,  code: '    leaf = path.pop()' },
    { line: 4,  code: '    leaf.insert_sorted(val)' },
    { line: 5,  code: '    if not leaf.is_overflow: return' },
    { line: 6,  code: '    push_key, new_node = leaf.split()' },
    { line: 7,  code: '    while path:' },
    { line: 8,  code: '        parent = path.pop()' },
    { line: 9,  code: '        parent.insert_child(push_key, new_node)' },
    { line: 10, code: '        if not parent.is_overflow: return' },
    { line: 11, code: '        push_key, new_node = parent.split()' },
    { line: 12, code: '    self.root = InternalNode(push_key, self.root, new_node)' },
  ],
  c: [
    { line: 1,  code: 'void bplus_insert(BPlusTree* t, int val) {' },
    { line: 2,  code: '    /* find path to leaf */' },
    { line: 3,  code: '    BNode* leaf = find_leaf(t->root, val, path);' },
    { line: 4,  code: '    insert_in_leaf(leaf, val);' },
    { line: 5,  code: '    if (leaf->n <= MAX_KEYS) return;' },
    { line: 6,  code: '    int mid = leaf->n / 2;' },
    { line: 7,  code: '    BNode* right = split_leaf(leaf, mid);' },
    { line: 8,  code: '    propagate_up(t, path, right->keys[0], right);' },
    { line: 9,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'void insert(int val) {' },
    { line: 2,  code: '    Deque<BNode> path = findPath(val);' },
    { line: 3,  code: '    BNode leaf = path.pop();' },
    { line: 4,  code: '    leaf.insertSorted(val);' },
    { line: 5,  code: '    if (!leaf.isOverflow()) return;' },
    { line: 6,  code: '    int pushKey = leaf.split();  // returns median' },
    { line: 7,  code: '    BNode newNode = leaf.rightHalf;' },
    { line: 8,  code: '    propagateUp(path, pushKey, newNode);' },
    { line: 9,  code: '}' },
  ],
  go: [
    { line: 1,  code: 'func (t *BPlusTree) Insert(val int) {' },
    { line: 2,  code: '    path := t.FindPath(val)' },
    { line: 3,  code: '    leaf := path[len(path)-1]' },
    { line: 4,  code: '    leaf.InsertSorted(val)' },
    { line: 5,  code: '    if !leaf.IsOverflow() { return }' },
    { line: 6,  code: '    pushKey, newNode := leaf.Split()' },
    { line: 7,  code: '    t.PropagateUp(path[:len(path)-1], pushKey, newNode)' },
    { line: 8,  code: '}' },
  ],
  javascript: [
    { line: 1, code: 'insert(val) {' },
    { line: 2, code: '  const path = this.findPath(val)' },
    { line: 3, code: '  const leaf = path.pop()!' },
    { line: 4, code: '  leaf.insertSorted(val)' },
    { line: 5, code: '  if (!leaf.isOverflow) return' },
    { line: 6, code: '  let [pushKey, newNode] = leaf.split()' },
    { line: 7, code: '  while (path.length) {' },
    { line: 8, code: '    const parent = path.pop()!' },
    { line: 9, code: '    parent.insertChild(pushKey, newNode)' },
    { line: 10, code: '    if (!parent.isOverflow) return' },
    { line: 11, code: '    ;[pushKey, newNode] = parent.split()' },
    { line: 12, code: '  }' },
    { line: 13, code: '  this.root = new InternalNode(pushKey, this.root, newNode)' },
    { line: 14, code: '}' },
  ],
}

const traverseSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'scan(): number[] {' },
    { line: 2, code: '  let curr = this.leftmostLeaf()' },
    { line: 3, code: '  const result: number[] = []' },
    { line: 4, code: '  while (curr) {' },
    { line: 5, code: '    result.push(...curr.keys)' },
    { line: 6, code: '    curr = curr.next' },
    { line: 7, code: '  }' },
    { line: 8, code: '  return result' },
    { line: 9, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void scan(BNode* root) {' },
    { line: 2, code: '    BNode* curr = leftmost_leaf(root);' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        for (int i = 0; i < curr->n; i++)' },
    { line: 5, code: '            printf("%d ", curr->keys[i]);' },
    { line: 6, code: '        curr = curr->next;' },
    { line: 7, code: '    }' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'List<Integer> scan() {' },
    { line: 2, code: '    BNode curr = leftmostLeaf();' },
    { line: 3, code: '    List<Integer> result = new ArrayList<>();' },
    { line: 4, code: '    while (curr != null) {' },
    { line: 5, code: '        result.addAll(curr.keys);' },
    { line: 6, code: '        curr = curr.next;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return result;' },
    { line: 9, code: '}' },
  ],  python: [
    { line: 1, code: 'def scan(self):' },
    { line: 2, code: '    curr = self.leftmost_leaf()' },
    { line: 3, code: '    result = []' },
    { line: 4, code: '    while curr:' },
    { line: 5, code: '        result.extend(curr.keys)' },
    { line: 6, code: '        curr = curr.next' },
    { line: 7, code: '    return result' },
  ],
  c: [
    { line: 1, code: 'void scan(BNode* root) {' },
    { line: 2, code: '    BNode* curr = leftmost_leaf(root);' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        for (int i = 0; i < curr->n; i++)' },
    { line: 5, code: '            printf("%d ", curr->keys[i]);' },
    { line: 6, code: '        curr = curr->next;' },
    { line: 7, code: '    }' },
    { line: 8, code: '}' },
  ],
  java: [
    { line: 1, code: 'List<Integer> scan() {' },
    { line: 2, code: '    BNode curr = leftmostLeaf();' },
    { line: 3, code: '    List<Integer> result = new ArrayList<>();' },
    { line: 4, code: '    while (curr != null) {' },
    { line: 5, code: '        result.addAll(curr.keys);' },
    { line: 6, code: '        curr = curr.next;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return result;' },
    { line: 9, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (t *BPlusTree) Scan() []int {' },
    { line: 2, code: '    curr := t.LeftmostLeaf()' },
    { line: 3, code: '    var result []int' },
    { line: 4, code: '    for curr != nil {' },
    { line: 5, code: '        result = append(result, curr.Keys...)' },
    { line: 6, code: '        curr = curr.Next' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return result' },
    { line: 9, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'scan() {' },
    { line: 2, code: '  let curr = this.leftmostLeaf()' },
    { line: 3, code: '  const result = []' },
    { line: 4, code: '  while (curr) {' },
    { line: 5, code: '    result.push(...curr.keys)' },
    { line: 6, code: '    curr = curr.next' },
    { line: 7, code: '  }' },
    { line: 8, code: '  return result' },
    { line: 9, code: '}' },
  ],
}

// ─── dsOperations ────────────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value = 14, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 25, initialState?: unknown) => insertGenerator(value, initialState),
    codeSnippets: insertSnippets,
  },
  {
    type: 'traverse',
    label: 'Scan Leaves',
    takesValue: false,
    generator: (_value?: number, initialState?: unknown) => traverseGenerator(undefined, initialState),
    codeSnippets: traverseSnippets,
  },
]

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* searchGenerator(14)
}

export const codeSnippets: CodeSnippets = searchSnippets
