import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'
import type { BNode, BTreeState } from './b-tree'

export { BNode, BTreeState }

export const meta: AlgorithmMeta = {
  slug: 'b-star-tree',
  category: 'data-structures',
  nameKey: 'algorithms.bStarTree.name',
  descriptionKey: 'algorithms.bStarTree.description',
  complexity: {
    time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    operations: [
      { name: 'search', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
      { name: 'insert', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    ],
  },
  tags: ['tree', 'balanced', 'multiway', 'high-occupancy', 'disk'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', title: '#700 Search in a BST', difficulty: 'Easy' },
  ],
}

// Minimum degree t=2, BUT B* ensures 2/3 minimum fill (vs 1/2 for B-tree).
// When a node overflows we first try redistribution with a sibling.
// Only if BOTH sibling and current node are full do we do a 3-way split.
const T = 2
const MAX_KEYS = 2 * T - 1  // 3

function makeBase(): { nodes: BNode[]; root: number; nextId: number } {
  //     [10, 20]       id:0  (root)
  //    /    |    \
  // [5,7]  [15]  [25,28]
  //  id:1  id:2   id:3
  return {
    nodes: [
      { id: 0, keys: [10, 20], children: [1, 2, 3], isLeaf: false },
      { id: 1, keys: [5, 7],   children: [],        isLeaf: true  },
      { id: 2, keys: [15],     children: [],        isLeaf: true  },
      { id: 3, keys: [25, 28], children: [],        isLeaf: true  },
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

// ─── Search (identical to B-tree search) ─────────────────────────────────────

function* searchGenerator(value = 15, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BTreeState) : makeBase()
  const nodes = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  const root = base.root

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.search.start', codeLine: 1, auxState: { target: value } }

  let currId: number | null = root

  while (currId !== null) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bStarTree.search.visiting', codeLine: 3, auxState: { target: value } }

    let i = 0
    while (i < curr.keys.length && value > curr.keys[i]) {
      yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'compare', label: `k[${i}]` }], message: 'ds.bStarTree.search.comparing', codeLine: 4, auxState: { target: value, key: curr.keys[i] } }
      i++
    }

    if (i < curr.keys.length && curr.keys[i] === value) {
      yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'found', label: 'found' }], message: 'ds.bStarTree.search.found', codeLine: 5, auxState: { v: value } }
      return
    }

    if (curr.isLeaf) break

    yield { state: snap(nodes, root, currId, i), highlights: [{ index: currId, role: 'current', label: `→[${i}]` }], message: 'ds.bStarTree.search.goChild', codeLine: 6, auxState: { target: value, childIdx: i } }

    currId = curr.children[i] ?? null
  }

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.search.notFound', codeLine: 8, auxState: { target: value } }
}

// ─── Insert with redistribution-first policy ─────────────────────────────────

function* insertGenerator(value = 8, initialState?: unknown): Generator<AlgorithmFrame> {
  const base = initialState ? (initialState as BTreeState) : makeBase()
  const nodes: BNode[] = base.nodes.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }))
  let root = base.root
  let nextId = Math.max(...nodes.map(n => n.id)) + 1

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.insert.start', codeLine: 1, auxState: { v: value } }

  // Walk down keeping track of parent and childIdx
  let currId = root
  let parentId: number | null = null
  let childIdxInParent = 0

  while (!get(nodes, currId).isLeaf) {
    const curr = get(nodes, currId)

    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'current', label: 'curr' }], message: 'ds.bStarTree.insert.descend', codeLine: 5, auxState: { v: value } }

    let i = 0
    while (i < curr.keys.length && value >= curr.keys[i]) i++
    parentId = currId
    childIdxInParent = i
    currId = curr.children[i]
  }

  // Insert into leaf
  const leaf = get(nodes, currId)

  yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'active', label: 'leaf' }], message: 'ds.bStarTree.insert.atLeaf', codeLine: 8, auxState: { v: value } }

  let pos = leaf.keys.length
  while (pos > 0 && value < leaf.keys[pos - 1]) pos--
  leaf.keys.splice(pos, 0, value)

  yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'found', label: 'inserted' }], message: 'ds.bStarTree.insert.placed', codeLine: 9, auxState: { v: value } }

  // Check overflow
  if (leaf.keys.length <= MAX_KEYS) {
    yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.insert.done', codeLine: 16, auxState: { v: value } }
    return
  }

  // Overflow: try redistribution with a sibling first
  if (parentId !== null) {
    const parent = get(nodes, parentId)
    const leftSibIdx  = childIdxInParent > 0 ? childIdxInParent - 1 : -1
    const rightSibIdx = childIdxInParent < parent.children.length - 1 ? childIdxInParent + 1 : -1

    const leftSib  = leftSibIdx  >= 0 ? get(nodes, parent.children[leftSibIdx])  : null
    const rightSib = rightSibIdx >= 0 ? get(nodes, parent.children[rightSibIdx]) : null

    if (leftSib && leftSib.keys.length < MAX_KEYS) {
      // Redistribute left: move smallest key of leaf to left sibling via parent
      yield {
        state: snap(nodes, root, currId),
        highlights: [{ index: currId, role: 'swap', label: 'redistribute' }, { index: parent.children[leftSibIdx], role: 'active', label: 'left sib' }],
        message: 'ds.bStarTree.insert.redistLeft',
        codeLine: 11,
        auxState: { v: value },
      }

      leftSib.keys.push(parent.keys[leftSibIdx])
      parent.keys[leftSibIdx] = leaf.keys.shift()!

      yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.insert.done', codeLine: 16, auxState: { v: value } }
      return
    }

    if (rightSib && rightSib.keys.length < MAX_KEYS) {
      // Redistribute right: move largest key of leaf to right sibling via parent
      yield {
        state: snap(nodes, root, currId),
        highlights: [{ index: currId, role: 'swap', label: 'redistribute' }, { index: parent.children[rightSibIdx], role: 'active', label: 'right sib' }],
        message: 'ds.bStarTree.insert.redistRight',
        codeLine: 12,
        auxState: { v: value },
      }

      rightSib.keys.unshift(parent.keys[childIdxInParent])
      parent.keys[childIdxInParent] = leaf.keys.pop()!

      yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.insert.done', codeLine: 16, auxState: { v: value } }
      return
    }

    // Both siblings are full → 3-way split (B* distinctive operation)
    yield { state: snap(nodes, root, currId), highlights: [{ index: currId, role: 'swap', label: '3-way split' }], message: 'ds.bStarTree.insert.threeSplit', codeLine: 13, auxState: { v: value } }

    const sibId = rightSibIdx >= 0 ? parent.children[rightSibIdx] : parent.children[leftSibIdx]
    const sib   = get(nodes, sibId)
    const allKeys = leftSibIdx >= 0
      ? [...leftSib!.keys, parent.keys[leftSibIdx], ...leaf.keys, parent.keys[childIdxInParent], ...sib.keys]
      : [...leaf.keys, parent.keys[childIdxInParent], ...sib.keys]

    const third = Math.floor(allKeys.length / 3)
    const third2 = Math.floor((2 * allKeys.length) / 3)

    const newNode: BNode = { id: nextId++, keys: allKeys.slice(third2 + 1), children: [], isLeaf: true }
    nodes.push(newNode)

    if (leftSibIdx >= 0) {
      leftSib!.keys  = allKeys.slice(0, third)
      leaf.keys      = allKeys.slice(third + 1, third2)
      parent.keys[leftSibIdx]    = allKeys[third]
      parent.keys[childIdxInParent] = allKeys[third2]
      leaf.keys = allKeys.slice(third + 1, third2)
    } else {
      leaf.keys = allKeys.slice(0, third)
      sib.keys  = allKeys.slice(third + 1, third2)
      parent.keys[childIdxInParent] = allKeys[third]
    }

    const insertAt = leftSibIdx >= 0 ? childIdxInParent + 1 : childIdxInParent + 1
    parent.keys.splice(insertAt, 0, allKeys[third2])
    parent.children.splice(insertAt + 1, 0, newNode.id)

    yield { state: snap(nodes, root, null, null, newNode.id), highlights: [], message: 'ds.bStarTree.insert.splitDone', codeLine: 15, auxState: { v: value } }
  }

  yield { state: snap(nodes, root, null), highlights: [], message: 'ds.bStarTree.insert.done', codeLine: 16, auxState: { v: value } }
}

// ─── Code snippets ───────────────────────────────────────────────────────────

const searchSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'search(val: number, node = this.root): boolean {' },
    { line: 2, code: '  let i = 0' },
    { line: 3, code: '  while (i < node.keys.length && val > node.keys[i]) i++' },
    { line: 4, code: '  if (i < node.keys.length && node.keys[i] === val) return true' },
    { line: 5, code: '  if (node.isLeaf) return false' },
    { line: 6, code: '  return this.search(val, node.children[i])' },
    { line: 7, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'int bstar_search(BNode* node, int val) {' },
    { line: 2, code: '    int i = 0;' },
    { line: 3, code: '    while (i < node->n && val > node->keys[i]) i++;' },
    { line: 4, code: '    if (i < node->n && node->keys[i] == val) return 1;' },
    { line: 5, code: '    if (node->is_leaf) return 0;' },
    { line: 6, code: '    return bstar_search(node->children[i], val);' },
    { line: 7, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'bool search(int val, BNode node) {' },
    { line: 2, code: '    int i = 0;' },
    { line: 3, code: '    while (i < node.keys.size() && val > node.keys.get(i)) i++;' },
    { line: 4, code: '    if (i < node.keys.size() && node.keys.get(i) == val) return true;' },
    { line: 5, code: '    if (node.isLeaf) return false;' },
    { line: 6, code: '    return search(val, node.children.get(i));' },
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
    { line: 1, code: 'int bstar_search(BNode* node, int val) {' },
    { line: 2, code: '    int i = 0;' },
    { line: 3, code: '    while (i < node->n && val > node->keys[i]) i++;' },
    { line: 4, code: '    if (i < node->n && node->keys[i] == val) return 1;' },
    { line: 5, code: '    if (node->is_leaf) return 0;' },
    { line: 6, code: '    return bstar_search(node->children[i], val);' },
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
    { line: 1, code: 'func bstarSearch(node *BNode, val int) bool {' },
    { line: 2, code: '    i := 0' },
    { line: 3, code: '    for i < len(node.Keys) && val > node.Keys[i] { i++ }' },
    { line: 4, code: '    if i < len(node.Keys) && node.Keys[i] == val { return true }' },
    { line: 5, code: '    if node.IsLeaf { return false }' },
    { line: 6, code: '    return bstarSearch(node.Children[i], val)' },
    { line: 7, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'search(val, node = this.root) {' },
    { line: 2, code: '  let i = 0' },
    { line: 3, code: '  while (i < node.keys.length && val > node.keys[i]) i++' },
    { line: 4, code: '  if (i < node.keys.length && node.keys[i] === val) return true' },
    { line: 5, code: '  if (node.isLeaf) return false' },
    { line: 6, code: '  return this.search(val, node.children[i])' },
    { line: 7, code: '}' },
  ],
}

const insertSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'insert(val: number): void {' },
    { line: 2,  code: '  // Walk to leaf, track parent' },
    { line: 3,  code: '  const [leaf, parent, idx] = this.findLeaf(val)' },
    { line: 4,  code: '  leaf.insertSorted(val)' },
    { line: 5,  code: '  if (!leaf.isOverflow) return' },
    { line: 6,  code: '  const leftSib  = parent?.children[idx-1]' },
    { line: 7,  code: '  const rightSib = parent?.children[idx+1]' },
    { line: 8,  code: '  // Try redistribution first' },
    { line: 9,  code: '  if (leftSib && !leftSib.isFull)  return redistLeft(leaf, leftSib, parent!, idx)' },
    { line: 10, code: '  if (rightSib && !rightSib.isFull) return redistRight(leaf, rightSib, parent!, idx)' },
    { line: 11, code: '  // Both full → 3-way split' },
    { line: 12, code: '  this.threeWaySplit(leaf, rightSib ?? leftSib!, parent!, idx)' },
    { line: 13, code: '}' },
  ],

  cpp: [
    { line: 1, code: 'void bstar_insert(BStarTree* t, int val) {' },
    { line: 2, code: '    BNode *leaf, *parent; int idx;' },
    { line: 3, code: '    find_leaf(t->root, val, &leaf, &parent, &idx);' },
    { line: 4, code: '    insert_key(leaf, val);' },
    { line: 5, code: '    if (leaf->n <= MAX_KEYS) return;' },
    { line: 6, code: '    if (try_redist(leaf, parent, idx)) return;' },
    { line: 7, code: '    three_way_split(leaf, parent, idx, &t->next_id);' },
    { line: 8, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void insert(int val) {' },
    { line: 2, code: '    Object[] info = findLeaf(val);' },
    { line: 3, code: '    BNode leaf = (BNode)info[0];' },
    { line: 4, code: '    leaf.insertSorted(val);' },
    { line: 5, code: '    if (!leaf.isOverflow()) return;' },
    { line: 6, code: '    if (tryRedistribute(leaf, (BNode)info[1], (int)info[2])) return;' },
    { line: 7, code: '    threeWaySplit(leaf, (BNode)info[1], (int)info[2]);' },
    { line: 8, code: '}' },
  ],  python: [
    { line: 1,  code: 'def insert(self, val):' },
    { line: 2,  code: '    leaf, parent, idx = self.find_leaf(val)' },
    { line: 3,  code: '    leaf.insert_sorted(val)' },
    { line: 4,  code: '    if not leaf.is_overflow: return' },
    { line: 5,  code: '    left  = parent.children[idx-1] if idx > 0 else None' },
    { line: 6,  code: '    right = parent.children[idx+1] if idx < len(parent.children)-1 else None' },
    { line: 7,  code: '    if left and not left.is_full: return redist_left(leaf, left, parent, idx)' },
    { line: 8,  code: '    if right and not right.is_full: return redist_right(leaf, right, parent, idx)' },
    { line: 9,  code: '    self.three_way_split(leaf, right or left, parent, idx)' },
  ],
  c: [
    { line: 1,  code: 'void bstar_insert(BStarTree* t, int val) {' },
    { line: 2,  code: '    BNode *leaf, *parent; int idx;' },
    { line: 3,  code: '    find_leaf(t->root, val, &leaf, &parent, &idx);' },
    { line: 4,  code: '    insert_key(leaf, val);' },
    { line: 5,  code: '    if (leaf->n <= MAX_KEYS) return;' },
    { line: 6,  code: '    if (try_redist(leaf, parent, idx)) return;' },
    { line: 7,  code: '    three_way_split(leaf, parent, idx, &t->next_id);' },
    { line: 8,  code: '}' },
  ],
  java: [
    { line: 1,  code: 'void insert(int val) {' },
    { line: 2,  code: '    Object[] info = findLeaf(val);' },
    { line: 3,  code: '    BNode leaf = (BNode)info[0];' },
    { line: 4,  code: '    leaf.insertSorted(val);' },
    { line: 5,  code: '    if (!leaf.isOverflow()) return;' },
    { line: 6,  code: '    if (tryRedistribute(leaf, (BNode)info[1], (int)info[2])) return;' },
    { line: 7,  code: '    threeWaySplit(leaf, (BNode)info[1], (int)info[2]);' },
    { line: 8,  code: '}' },
  ],
  go: [
    { line: 1,  code: 'func (t *BStarTree) Insert(val int) {' },
    { line: 2,  code: '    leaf, parent, idx := t.FindLeaf(val)' },
    { line: 3,  code: '    leaf.InsertSorted(val)' },
    { line: 4,  code: '    if !leaf.IsOverflow() { return }' },
    { line: 5,  code: '    if t.TryRedistribute(leaf, parent, idx) { return }' },
    { line: 6,  code: '    t.ThreeWaySplit(leaf, parent, idx)' },
    { line: 7,  code: '}' },
  ],
  javascript: [
    { line: 1, code: 'search(val, node = this.root) {' },
    { line: 2, code: '  let i = 0' },
    { line: 3, code: '  while (i < node.keys.length && val > node.keys[i]) i++' },
    { line: 4, code: '  if (i < node.keys.length && node.keys[i] === val) return true' },
    { line: 5, code: '  if (node.isLeaf) return false' },
    { line: 6, code: '  return this.search(val, node.children[i])' },
    { line: 7, code: '}' },
  ],
}

// ─── dsOperations ────────────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value = 15, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 8, initialState?: unknown) => insertGenerator(value, initialState),
    codeSnippets: insertSnippets,
  },
]

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* searchGenerator(15)
}

export const codeSnippets: CodeSnippets = searchSnippets
