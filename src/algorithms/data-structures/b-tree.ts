import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'b-tree',
  category: 'data-structures',
  nameKey: 'algorithms.bTree.name',
  descriptionKey: 'algorithms.bTree.description',
  complexity: {
    time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    operations: [
      { name: 'search', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'insert', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    ],
  },
  tags: ['tree', 'balanced', 'multiway', 'disk', 'database'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', title: '#700 Search in a BST', difficulty: 'Easy' },
    { platform: 'leetcode', url: 'https://leetcode.com/problems/range-sum-of-bst/', title: '#938 Range Sum of BST', difficulty: 'Easy' },
  ],
}

// Minimum degree t=2 → max 3 keys per node, max 4 children
const T = 2
const MAX_KEYS = 2 * T - 1

export type BNode = { id: number; keys: number[]; children: number[]; isLeaf: boolean }
export type BTreeState = {
  nodes: BNode[]
  root: number
  activeNode: number | null
  activeKeyIdx: number | null
  newNodeId: number | null
}

function makeBase(): { nodes: BNode[]; root: number; nextId: number } {
  //        [10, 20]      id:0
  //       /    |    \
  //    [5]   [15]   [25]
  //    id:1  id:2   id:3
  return {
    nodes: [
      { id: 0, keys: [10, 20], children: [1, 2, 3], isLeaf: false },
      { id: 1, keys: [5],      children: [],        isLeaf: true  },
      { id: 2, keys: [15],     children: [],        isLeaf: true  },
      { id: 3, keys: [25],     children: [],        isLeaf: true  },
    ],
    root: 0,
    nextId: 4,
  }
}

function cloneNodes(nodes: BNode[]): BNode[] {
  return nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
}

function snap(nodes: BNode[], root: number, active: number | null, keyIdx: number | null = null, newNodeId: number | null = null): BTreeState {
  return { nodes: cloneNodes(nodes), root, activeNode: active, activeKeyIdx: keyIdx, newNodeId }
}

function get(nodes: BNode[], id: number): BNode {
  return nodes.find(n => n.id === id)!
}

// ─── Insert ──────────────────────────────────────────────────────────────────

function* insertGenerator(value = 12, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BTreeState) : makeBase()
  const nodes: BNode[] = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  let root = base.root
  let nextId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bTree.insert.start', codeLine: 1, auxState: { v: value } }

  // If root is full, split it first
  const rootNode = get(nodes, root)
  if (rootNode.keys.length === MAX_KEYS) {
    const newRoot: BNode = { id: nextId++, keys: [], children: [root], isLeaf: false }
    nodes.push(newRoot)

    yield { state: snap(nodes, newRoot.id, root), highlights: [{ index: root, role: 'swap', label: 'full' }], message: 'ds.bTree.insert.splitRoot', codeLine: 3, auxState: { v: value } }

    splitChild(nodes, newRoot, 0, nextId - 1)
    nextId = Math.max(...nodes.map(n => n.id)) + 1

    yield { state: snap(nodes, newRoot.id, newRoot.id, null, nodes[nodes.length - 1].id), highlights: [], message: 'ds.bTree.insert.splitDone', codeLine: 5, auxState: { v: value } }

    root = newRoot.id
  }

  // Descend to the correct leaf, splitting full children along the way
  let currId = root

  while (true) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bTree.insert.visiting', codeLine: 7, auxState: { v: value } }

    if (curr.isLeaf) {
      // Insert key in sorted position
      let pos = curr.keys.length
      while (pos > 0 && value < curr.keys[pos - 1]) pos--

      yield { state: snap(nodes, root, currId, pos), highlights: [{ index: currId, role: 'active', label: 'insert' }], message: 'ds.bTree.insert.placing', codeLine: 9, auxState: { v: value } }

      curr.keys.splice(pos, 0, value)

      yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'found', label: 'done' }], message: 'ds.bTree.insert.placed', codeLine: 10, auxState: { v: value } }
      break
    }

    // Find child to descend into
    let childIdx = curr.keys.length
    for (let i = 0; i < curr.keys.length; i++) {
      if (value < curr.keys[i]) { childIdx = i; break }
    }

    yield { state: snap(nodes, root, currId, childIdx), highlights: [{ index: currId, role: 'compare', label: `→child[${childIdx}]` }], message: 'ds.bTree.insert.goChild', codeLine: 11, auxState: { v: value, childIdx } }

    const child = get(nodes, curr.children[childIdx])
    if (child.keys.length === MAX_KEYS) {
      yield { state: snap(nodes, root, curr.children[childIdx]), highlights: [{ index: curr.children[childIdx], role: 'swap', label: 'full' }], message: 'ds.bTree.insert.splitting', codeLine: 13, auxState: { v: value } }

      splitChild(nodes, curr, childIdx, nextId)
      nextId = Math.max(...nodes.map(n => n.id)) + 1

      yield { state: snap(nodes, root, currId, null, nodes[nodes.length - 1].id), highlights: [], message: 'ds.bTree.insert.splitDone', codeLine: 14, auxState: { v: value } }

      // Re-evaluate which child to go into after split
      if (value > curr.keys[childIdx]) childIdx++
    }

    currId = curr.children[childIdx]
  }

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bTree.insert.done', codeLine: 16, auxState: { v: value } }
}

function splitChild(nodes: BNode[], parent: BNode, childIdx: number, nextId: number) {
  const child = get(nodes, parent.children[childIdx])
  const mid = T - 1
  const midKey = child.keys[mid]

  const newNode: BNode = {
    id: nextId,
    keys: child.keys.slice(mid + 1),
    children: child.isLeaf ? [] : child.children.slice(mid + 1),
    isLeaf: child.isLeaf,
  }
  nodes.push(newNode)

  child.keys = child.keys.slice(0, mid)
  if (!child.isLeaf) child.children = child.children.slice(0, mid + 1)

  parent.keys.splice(childIdx, 0, midKey)
  parent.children.splice(childIdx + 1, 0, newNode.id)
}

// ─── Search ──────────────────────────────────────────────────────────────────

function* searchGenerator(value = 15, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BTreeState) : makeBase()
  const nodes: BNode[] = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  const root = base.root

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bTree.search.start', codeLine: 1, auxState: { target: value } }

  let currId: number | null = root

  while (currId !== null) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bTree.search.visiting', codeLine: 3, auxState: { target: value } }

    let i = 0
    while (i < curr.keys.length && value > curr.keys[i]) {
      yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'compare', label: `k[${i}]` }], message: 'ds.bTree.search.comparing', codeLine: 4, auxState: { target: value, key: curr.keys[i] } }
      i++
    }

    if (i < curr.keys.length && curr.keys[i] === value) {
      yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'found', label: 'found' }], message: 'ds.bTree.search.found', codeLine: 5, auxState: { v: value } }
      return
    }

    if (curr.isLeaf) break

    yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'current', label: `→[${i}]` }], message: 'ds.bTree.search.goChild', codeLine: 6, auxState: { target: value, childIdx: i } }

    currId = curr.children[i] ?? null
  }

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bTree.search.notFound', codeLine: 8, auxState: { target: value } }
}

// ─── Code snippets ───────────────────────────────────────────────────────────

const insertSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'insert(val: number): void {' },
    { line: 2,  code: '  if (this.root.keys.length === MAX_KEYS) {' },
    { line: 3,  code: '    const newRoot = new BNode()' },
    { line: 4,  code: '    newRoot.children.push(this.root)' },
    { line: 5,  code: '    newRoot.splitChild(0); this.root = newRoot' },
    { line: 6,  code: '  }' },
    { line: 7,  code: '  let curr = this.root' },
    { line: 8,  code: '  while (!curr.isLeaf) {' },
    { line: 9,  code: '    let i = curr.findIndex(val)' },
    { line: 10, code: '    if (curr.children[i].isFull) curr.splitChild(i)' },
    { line: 11, code: '    if (val > curr.keys[i]) i++' },
    { line: 12, code: '    curr = curr.children[i]' },
    { line: 13, code: '  }' },
    { line: 14, code: '  curr.insertKey(val)' },
    { line: 15, code: '}' },
  ],
  python: [
    { line: 1,  code: 'def insert(self, val):' },
    { line: 2,  code: '    if len(self.root.keys) == MAX_KEYS:' },
    { line: 3,  code: '        new_root = BNode()' },
    { line: 4,  code: '        new_root.children.append(self.root)' },
    { line: 5,  code: '        new_root.split_child(0); self.root = new_root' },
    { line: 6,  code: '    curr = self.root' },
    { line: 7,  code: '    while not curr.is_leaf:' },
    { line: 8,  code: '        i = curr.find_index(val)' },
    { line: 9,  code: '        if curr.children[i].is_full: curr.split_child(i)' },
    { line: 10, code: '        if val > curr.keys[i]: i += 1' },
    { line: 11, code: '        curr = curr.children[i]' },
    { line: 12, code: '    curr.insert_key(val)' },
  ],
  c: [
    { line: 1,  code: 'void btree_insert(BTree* t, int val) {' },
    { line: 2,  code: '    if (t->root->num_keys == MAX_KEYS) {' },
    { line: 3,  code: '        BNode* s = new_node();' },
    { line: 4,  code: '        s->children[0] = t->root;' },
    { line: 5,  code: '        split_child(s, 0); t->root = s;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '    BNode* curr = t->root;' },
    { line: 8,  code: '    while (!curr->is_leaf) {' },
    { line: 9,  code: '        int i = find_index(curr, val);' },
    { line: 10, code: '        if (curr->children[i]->num_keys == MAX_KEYS)' },
    { line: 11, code: '            { split_child(curr, i); if (val > curr->keys[i]) i++; }' },
    { line: 12, code: '        curr = curr->children[i];' },
    { line: 13, code: '    }' },
    { line: 14, code: '    insert_key(curr, val);' },
    { line: 15, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void insert(int val) {' },
    { line: 2,  code: '    if (root.keys.size() == MAX_KEYS) {' },
    { line: 3,  code: '        BNode newRoot = new BNode();' },
    { line: 4,  code: '        newRoot.children.add(root);' },
    { line: 5,  code: '        newRoot.splitChild(0); root = newRoot;' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '    BNode curr = root;' },
    { line: 8,  code: '    while (!curr.isLeaf) {' },
    { line: 9,  code: '        int i = curr.findIndex(val);' },
    { line: 10, code: '        if (curr.children.get(i).isFull()) curr.splitChild(i);' },
    { line: 11, code: '        if (val > curr.keys.get(i)) i++;' },
    { line: 12, code: '        curr = curr.children.get(i);' },
    { line: 13, code: '    }' },
    { line: 14, code: '    curr.insertKey(val);' },
    { line: 15, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func (t *BTree) Insert(val int) {' },
    { line: 2,  code: '    if len(t.Root.Keys) == MAX_KEYS {' },
    { line: 3,  code: '        newRoot := &BNode{}' },
    { line: 4,  code: '        newRoot.Children = []*BNode{t.Root}' },
    { line: 5,  code: '        newRoot.SplitChild(0); t.Root = newRoot' },
    { line: 6,  code: '    }' },
    { line: 7,  code: '    curr := t.Root' },
    { line: 8,  code: '    for !curr.IsLeaf {' },
    { line: 9,  code: '        i := curr.FindIndex(val)' },
    { line: 10, code: '        if len(curr.Children[i].Keys) == MAX_KEYS {' },
    { line: 11, code: '            curr.SplitChild(i); if val > curr.Keys[i] { i++ }' },
    { line: 12, code: '        }' },
    { line: 13, code: '        curr = curr.Children[i]' },
    { line: 14, code: '    }' },
    { line: 15, code: '    curr.InsertKey(val)' },
    { line: 16, code: '}' },
  ],
}

const searchSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'search(val: number, node = this.root): boolean {' },
    { line: 2, code: '  let i = 0' },
    { line: 3, code: '  while (i < node.keys.length && val > node.keys[i]) i++' },
    { line: 4, code: '  if (i < node.keys.length && node.keys[i] === val) return true' },
    { line: 5, code: '  if (node.isLeaf) return false' },
    { line: 6, code: '  return this.search(val, node.children[i])' },
    { line: 7, code: '}' },
  ],
  python: [
    { line: 1, code: 'def search(self, val, node=None):' },
    { line: 2, code: '    node = node or self.root' },
    { line: 3, code: '    i = 0' },
    { line: 4, code: '    while i < len(node.keys) and val > node.keys[i]: i += 1' },
    { line: 5, code: '    if i < len(node.keys) and node.keys[i] == val: return True' },
    { line: 6, code: '    if node.is_leaf: return False' },
    { line: 7, code: '    return self.search(val, node.children[i])' },
  ],
  c: [
    { line: 1, code: 'int btree_search(BNode* node, int val) {' },
    { line: 2, code: '    int i = 0;' },
    { line: 3, code: '    while (i < node->n && val > node->keys[i]) i++;' },
    { line: 4, code: '    if (i < node->n && node->keys[i] == val) return 1;' },
    { line: 5, code: '    if (node->is_leaf) return 0;' },
    { line: 6, code: '    return btree_search(node->children[i], val);' },
    { line: 7, code: '}' },
  ],
  java: [
    { line: 1, code: 'boolean search(int val, BNode node) {' },
    { line: 2, code: '    int i = 0;' },
    { line: 3, code: '    while (i < node.keys.size() && val > node.keys.get(i)) i++;' },
    { line: 4, code: '    if (i < node.keys.size() && node.keys.get(i) == val) return true;' },
    { line: 5, code: '    if (node.isLeaf) return false;' },
    { line: 6, code: '    return search(val, node.children.get(i));' },
    { line: 7, code: '}' },
  ],
  go: [
    { line: 1, code: 'func search(node *BNode, val int) bool {' },
    { line: 2, code: '    i := 0' },
    { line: 3, code: '    for i < len(node.Keys) && val > node.Keys[i] { i++ }' },
    { line: 4, code: '    if i < len(node.Keys) && node.Keys[i] == val { return true }' },
    { line: 5, code: '    if node.IsLeaf { return false }' },
    { line: 6, code: '    return search(node.Children[i], val)' },
    { line: 7, code: '}' },
  ],
}

// ─── dsOperations ────────────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 12, initialState?: unknown) => insertGenerator(value, initialState),
    codeSnippets: insertSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value = 15, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
]

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* searchGenerator(15)
}

export const codeSnippets: CodeSnippets = searchSnippets
