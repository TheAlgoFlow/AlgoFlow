import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'bst',
  category: 'data-structures',
  nameKey: 'algorithms.bst.name',
  descriptionKey: 'algorithms.bst.description',
  complexity: {
    time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
    space: 'O(n)',
    operations: [
      { name: 'insert', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
      { name: 'remove', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
      { name: 'search', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
    ],
  },
  tags: ['tree', 'hierarchical', 'ordered', 'search'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',              title: '#700 Search in a BST',              difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/is-binary-search-tree/problem',        title: 'Is This a Binary Search Tree?',     difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/search-in-a-binary-search-tree',                title: 'Search in a Binary Search Tree',    difficulty: 'Easy' },
  ],
}

// ─── Flat-node tree type used by TreeVisualizer ───────────────────────────────
type TreeNodeData = {
  id: number
  value: number
  left: number | null
  right: number | null
}

type State = {
  nodes: TreeNodeData[]
  current: number | null
  visited?: number[]
  comparing?: number | null
}

// ─── Initial BST built from [50, 30, 70, 20, 40] ─────────────────────────────
//
//         50 (id:0)
//        /         \
//     30 (id:1)   70 (id:2)
//     /    \
//  20(id:3) 40(id:4)
//
function makeBaseNodes(): TreeNodeData[] {
  return [
    { id: 0, value: 50, left: 1, right: 2 },
    { id: 1, value: 30, left: 3, right: 4 },
    { id: 2, value: 70, left: null, right: null },
    { id: 3, value: 20, left: null, right: null },
    { id: 4, value: 40, left: null, right: null },
  ]
}

function cloneNodes(nodes: TreeNodeData[]): TreeNodeData[] {
  return nodes.map(n => ({ ...n }))
}

// ─── dsOperation 1: Insert ───────────────────────────────────────────────────
function* insertGenerator(value = 45, initialState?: unknown): Generator<AlgorithmFrame> {
  const nodes = initialState ? [...(initialState as State).nodes] : makeBaseNodes()
  const existingMaxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : -1
  let nextId = initialState ? existingMaxId + 1 : 5
  let comparisons = 0

  function snap(current: number | null): State {
    return { nodes: cloneNodes(nodes), current }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.insert.start',
    codeLine: 1,
    auxState: { v: value, comparisons },
  }

  let currId: number = nodes[0].id

  while (true) {
    const curr = nodes.find(n => n.id === currId)!

    comparisons++
    yield {
      state: snap(currId),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.bst.insert.compare',
      codeLine: 5,
      auxState: { v: value, nodeV: curr.value, comparisons },
    }

    if (value < curr.value) {
      if (curr.left === null) {
        const newId = nextId++
        curr.left = newId
        nodes.push({ id: newId, value, left: null, right: null })
        yield {
          state: snap(newId),
          highlights: [{ index: newId, role: 'found', label: 'curr' }],
          message: 'ds.bst.insert.placed',
          codeLine: 6,
          auxState: { v: value, comparisons },
        }
        break
      }
      currId = curr.left
    } else {
      if (curr.right === null) {
        const newId = nextId++
        curr.right = newId
        nodes.push({ id: newId, value, left: null, right: null })
        yield {
          state: snap(newId),
          highlights: [{ index: newId, role: 'found', label: 'curr' }],
          message: 'ds.bst.insert.placed',
          codeLine: 9,
          auxState: { v: value, comparisons },
        }
        break
      }
      currId = curr.right
    }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.insert.done',
    codeLine: 13,
    auxState: { v: value, comparisons },
  }
}

// ─── dsOperation 2: Search ───────────────────────────────────────────────────
function* searchGenerator(value = 30, initialState?: unknown): Generator<AlgorithmFrame> {
  const nodes = initialState ? [...(initialState as State).nodes] : makeBaseNodes()
  let comparisons = 0

  function snap(current: number | null): State {
    return { nodes: cloneNodes(nodes), current }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.search.start',
    codeLine: 1,
    auxState: { target: value, comparisons },
  }

  let currId: number | null = nodes[0].id

  while (currId !== null) {
    const curr = nodes.find(n => n.id === currId)!

    comparisons++
    yield {
      state: snap(currId),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.bst.search.visiting',
      codeLine: 3,
      auxState: { target: value, nodeV: curr.value, comparisons },
    }

    if (curr.value === value) {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'found', label: 'found' }],
        message: 'ds.bst.search.found',
        codeLine: 4,
        auxState: { v: curr.value, comparisons },
      }
      return
    }

    if (value < curr.value) {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'current', label: 'curr' }],
        message: 'ds.bst.search.goLeft',
        codeLine: 5,
        auxState: { target: value, nodeV: curr.value, comparisons },
      }
      currId = curr.left
    } else {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'current', label: 'curr' }],
        message: 'ds.bst.search.goRight',
        codeLine: 6,
        auxState: { target: value, nodeV: curr.value, comparisons },
      }
      currId = curr.right
    }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.search.notFound',
    codeLine: 8,
    auxState: { target: value, comparisons },
  }
}

// ─── dsOperation 3: Remove ───────────────────────────────────────────────────
function* removeGenerator(value = 30, initialState?: unknown): Generator<AlgorithmFrame> {
  const nodes = initialState ? [...(initialState as State).nodes] : makeBaseNodes()
  let comparisons = 0

  function snap(current: number | null): State {
    return { nodes: cloneNodes(nodes), current }
  }

  function findNode(id: number | null): TreeNodeData | null {
    if (id === null) return null
    return nodes.find(n => n.id === id) ?? null
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.remove.start',
    codeLine: 1,
    auxState: { v: value, comparisons },
  }

  // Phase 1: Find the node to remove
  let currId: number | null = nodes[0].id
  let parentId: number | null = null
  let foundId: number | null = null

  while (currId !== null) {
    const curr = nodes.find(n => n.id === currId)!

    comparisons++
    yield {
      state: snap(currId),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.bst.remove.searching',
      codeLine: 5,
      auxState: { v: value, nodeV: curr.value, comparisons },
    }

    if (curr.value === value) {
      foundId = currId
      break
    } else if (value < curr.value) {
      parentId = currId
      currId = curr.left
    } else {
      parentId = currId
      currId = curr.right
    }
  }

  if (foundId === null) {
    yield {
      state: snap(null),
      highlights: [],
      message: 'ds.bst.remove.notFound',
      codeLine: 5,
      auxState: { v: value, comparisons },
    }
    return
  }

  // Phase 2: Highlight node to remove
  yield {
    state: snap(foundId),
    highlights: [{ index: foundId, role: 'swap', label: 'del' }],
    message: 'ds.bst.remove.found',
    codeLine: 8,
    auxState: { v: value, comparisons },
  }

  // Phase 3: Perform removal
  const nodeToRemove = nodes.find(n => n.id === foundId)!

  if (nodeToRemove.left === null && nodeToRemove.right === null) {
    // Leaf node: simply remove
    const idx = nodes.findIndex(n => n.id === foundId)
    nodes.splice(idx, 1)

    // Update parent pointer
    if (parentId !== null) {
      const parent = nodes.find(n => n.id === parentId)!
      if (parent.left === foundId) parent.left = null
      else parent.right = null
    }
  } else if (nodeToRemove.left === null || nodeToRemove.right === null) {
    // One child: replace with child
    const childId = nodeToRemove.left !== null ? nodeToRemove.left : nodeToRemove.right

    if (parentId !== null) {
      const parent = nodes.find(n => n.id === parentId)!
      if (parent.left === foundId) parent.left = childId
      else parent.right = childId
    }

    const idx = nodes.findIndex(n => n.id === foundId)
    nodes.splice(idx, 1)
  } else {
    // Two children: replace with in-order successor (leftmost in right subtree)
    let successorParentId: number = foundId
    let successorId: number = nodeToRemove.right

    let successorNode = findNode(successorId)!
    while (successorNode.left !== null) {
      successorParentId = successorId
      successorId = successorNode.left
      successorNode = findNode(successorId)!
    }

    // Copy successor value into current node
    nodeToRemove.value = successorNode.value

    // Remove successor (it has at most one right child)
    const successorParent = nodes.find(n => n.id === successorParentId)!
    if (successorParent.left === successorId) {
      successorParent.left = successorNode.right
    } else {
      successorParent.right = successorNode.right
    }

    const idx = nodes.findIndex(n => n.id === successorId)
    nodes.splice(idx, 1)
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.bst.remove.done',
    codeLine: 16,
    auxState: { v: value, comparisons },
  }
}

// ─── dsOperations export ─────────────────────────────────────────────────────
export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 45, initialState?: unknown) => insertGenerator(value, initialState),
    codeSnippets: {
      typescript: [
        { line: 1,  code: 'insert(val: number): void {' },
        { line: 2,  code: '  if (!this.root) { this.root = new Node(val); return }' },
        { line: 3,  code: '  let curr = this.root' },
        { line: 4,  code: '  while (curr) {' },
        { line: 5,  code: '    if (val < curr.val) {' },
        { line: 6,  code: '      if (!curr.left) { curr.left = new Node(val); return }' },
        { line: 7,  code: '      curr = curr.left' },
        { line: 8,  code: '    } else {' },
        { line: 9,  code: '      if (!curr.right) { curr.right = new Node(val); return }' },
        { line: 10, code: '      curr = curr.right' },
        { line: 11, code: '    }' },
        { line: 12, code: '  }' },
        { line: 13, code: '}' },
      ],
      cpp: [
        { line: 1, code: 'void insert(Node** root, int val) {' },
        { line: 2, code: '    if (!*root) { *root = newNode(val); return; }' },
        { line: 3, code: '    Node* curr = *root;' },
        { line: 4, code: '    while (curr) {' },
        { line: 5, code: '        if (val < curr->val) {' },
        { line: 6, code: '            if (!curr->left) { curr->left = newNode(val); return; }' },
        { line: 7, code: '            curr = curr->left;' },
        { line: 8, code: '        } else {' },
        { line: 9, code: '            if (!curr->right) { curr->right = newNode(val); return; }' },
        { line: 10, code: '            curr = curr->right;' },
        { line: 11, code: '        }' },
        { line: 12, code: '    }' },
        { line: 13, code: '}' },
      ],
      csharp: [
        { line: 1, code: 'void insert(int val) {' },
        { line: 2, code: '    if (root == null) { root = new Node(val); return; }' },
        { line: 3, code: '    Node curr = root;' },
        { line: 4, code: '    while (curr != null) {' },
        { line: 5, code: '        if (val < curr.val) {' },
        { line: 6, code: '            if (curr.left == null) { curr.left = new Node(val); return; }' },
        { line: 7, code: '            curr = curr.left;' },
        { line: 8, code: '        } else {' },
        { line: 9, code: '            if (curr.right == null) { curr.right = new Node(val); return; }' },
        { line: 10, code: '            curr = curr.right;' },
        { line: 11, code: '        }' },
        { line: 12, code: '    }' },
        { line: 13, code: '}' },
      ],
      python: [
        { line: 1,  code: 'def insert(self, val):' },
        { line: 2,  code: '    if not self.root:' },
        { line: 3,  code: '        self.root = Node(val); return' },
        { line: 4,  code: '    curr = self.root' },
        { line: 5,  code: '    while curr:' },
        { line: 6,  code: '        if val < curr.val:' },
        { line: 7,  code: '            if not curr.left:' },
        { line: 8,  code: '                curr.left = Node(val); return' },
        { line: 9,  code: '            curr = curr.left' },
        { line: 10, code: '        else:' },
        { line: 11, code: '            if not curr.right:' },
        { line: 12, code: '                curr.right = Node(val); return' },
        { line: 13, code: '            curr = curr.right' },
      ],
      c: [
        { line: 1,  code: 'void insert(Node** root, int val) {' },
        { line: 2,  code: '    if (!*root) { *root = newNode(val); return; }' },
        { line: 3,  code: '    Node* curr = *root;' },
        { line: 4,  code: '    while (curr) {' },
        { line: 5,  code: '        if (val < curr->val) {' },
        { line: 6,  code: '            if (!curr->left) { curr->left = newNode(val); return; }' },
        { line: 7,  code: '            curr = curr->left;' },
        { line: 8,  code: '        } else {' },
        { line: 9,  code: '            if (!curr->right) { curr->right = newNode(val); return; }' },
        { line: 10, code: '            curr = curr->right;' },
        { line: 11, code: '        }' },
        { line: 12, code: '    }' },
        { line: 13, code: '}' },
      ],
      java: [
        { line: 1,  code: 'void insert(int val) {' },
        { line: 2,  code: '    if (root == null) { root = new Node(val); return; }' },
        { line: 3,  code: '    Node curr = root;' },
        { line: 4,  code: '    while (curr != null) {' },
        { line: 5,  code: '        if (val < curr.val) {' },
        { line: 6,  code: '            if (curr.left == null) { curr.left = new Node(val); return; }' },
        { line: 7,  code: '            curr = curr.left;' },
        { line: 8,  code: '        } else {' },
        { line: 9,  code: '            if (curr.right == null) { curr.right = new Node(val); return; }' },
        { line: 10, code: '            curr = curr.right;' },
        { line: 11, code: '        }' },
        { line: 12, code: '    }' },
        { line: 13, code: '}' },
      ],
      go: [
        { line: 1,  code: 'func (t *BST) Insert(val int) {' },
        { line: 2,  code: '    if t.root == nil { t.root = &Node{Val: val}; return }' },
        { line: 3,  code: '    curr := t.root' },
        { line: 4,  code: '    for curr != nil {' },
        { line: 5,  code: '        if val < curr.Val {' },
        { line: 6,  code: '            if curr.Left == nil { curr.Left = &Node{Val: val}; return }' },
        { line: 7,  code: '            curr = curr.Left' },
        { line: 8,  code: '        } else {' },
        { line: 9,  code: '            if curr.Right == nil { curr.Right = &Node{Val: val}; return }' },
        { line: 10, code: '            curr = curr.Right' },
        { line: 11, code: '        }' },
        { line: 12, code: '    }' },
        { line: 13, code: '}' },
      ],
      javascript: [
        { line: 1, code: 'insert(val) {' },
        { line: 2, code: '  if (!this.root) { this.root = new Node(val); return }' },
        { line: 3, code: '  let curr = this.root' },
        { line: 4, code: '  while (curr) {' },
        { line: 5, code: '    if (val < curr.val) {' },
        { line: 6, code: '      if (!curr.left) { curr.left = new Node(val); return }' },
        { line: 7, code: '      curr = curr.left' },
        { line: 8, code: '    } else {' },
        { line: 9, code: '      if (!curr.right) { curr.right = new Node(val); return }' },
        { line: 10, code: '      curr = curr.right' },
        { line: 11, code: '    }' },
        { line: 12, code: '  }' },
        { line: 13, code: '}' },
      ],
    },
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value = 30, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: {
      typescript: [
        { line: 1, code: 'search(val: number): boolean {' },
        { line: 2, code: '  let curr = this.root' },
        { line: 3, code: '  while (curr) {' },
        { line: 4, code: '    if (curr.val === val) return true' },
        { line: 5, code: '    if (val < curr.val) curr = curr.left' },
        { line: 6, code: '    else curr = curr.right' },
        { line: 7, code: '  }' },
        { line: 8, code: '  return false' },
        { line: 9, code: '}' },
      ],
      cpp: [
        { line: 1, code: 'int search(Node* root, int val) {' },
        { line: 2, code: '    Node* curr = root;' },
        { line: 3, code: '    while (curr) {' },
        { line: 4, code: '        if (curr->val == val) return 1;' },
        { line: 5, code: '        if (val < curr->val) curr = curr->left;' },
        { line: 6, code: '        else curr = curr->right;' },
        { line: 7, code: '    }' },
        { line: 8, code: '    return 0;' },
        { line: 9, code: '}' },
      ],
      csharp: [
        { line: 1, code: 'bool search(int val) {' },
        { line: 2, code: '    Node curr = root;' },
        { line: 3, code: '    while (curr != null) {' },
        { line: 4, code: '        if (curr.val == val) return true;' },
        { line: 5, code: '        if (val < curr.val) curr = curr.left;' },
        { line: 6, code: '        else curr = curr.right;' },
        { line: 7, code: '    }' },
        { line: 8, code: '    return false;' },
        { line: 9, code: '}' },
      ],
      python: [
        { line: 1, code: 'def search(self, val):' },
        { line: 2, code: '    curr = self.root' },
        { line: 3, code: '    while curr:' },
        { line: 4, code: '        if curr.val == val: return True' },
        { line: 5, code: '        if val < curr.val: curr = curr.left' },
        { line: 6, code: '        else: curr = curr.right' },
        { line: 7, code: '    return False' },
      ],
      c: [
        { line: 1, code: 'int search(Node* root, int val) {' },
        { line: 2, code: '    Node* curr = root;' },
        { line: 3, code: '    while (curr) {' },
        { line: 4, code: '        if (curr->val == val) return 1;' },
        { line: 5, code: '        if (val < curr->val) curr = curr->left;' },
        { line: 6, code: '        else curr = curr->right;' },
        { line: 7, code: '    }' },
        { line: 8, code: '    return 0;' },
        { line: 9, code: '}' },
      ],
      java: [
        { line: 1, code: 'boolean search(int val) {' },
        { line: 2, code: '    Node curr = root;' },
        { line: 3, code: '    while (curr != null) {' },
        { line: 4, code: '        if (curr.val == val) return true;' },
        { line: 5, code: '        if (val < curr.val) curr = curr.left;' },
        { line: 6, code: '        else curr = curr.right;' },
        { line: 7, code: '    }' },
        { line: 8, code: '    return false;' },
        { line: 9, code: '}' },
      ],
      go: [
        { line: 1, code: 'func (t *BST) Search(val int) bool {' },
        { line: 2, code: '    curr := t.root' },
        { line: 3, code: '    for curr != nil {' },
        { line: 4, code: '        if curr.Val == val { return true }' },
        { line: 5, code: '        if val < curr.Val { curr = curr.Left }' },
        { line: 6, code: '        else { curr = curr.Right }' },
        { line: 7, code: '    }' },
        { line: 8, code: '    return false' },
        { line: 9, code: '}' },
      ],
      javascript: [
        { line: 1, code: 'search(val) {' },
        { line: 2, code: '  let curr = this.root' },
        { line: 3, code: '  while (curr) {' },
        { line: 4, code: '    if (curr.val === val) return true' },
        { line: 5, code: '    if (val < curr.val) curr = curr.left' },
        { line: 6, code: '    else curr = curr.right' },
        { line: 7, code: '  }' },
        { line: 8, code: '  return false' },
        { line: 9, code: '}' },
      ],
    },
  },
  {
    type: 'remove',
    label: 'Remove',
    takesValue: true,
    generator: (value = 30, initialState?: unknown) => removeGenerator(value, initialState),
    codeSnippets: {
      typescript: [
        { line: 1,  code: 'remove(val: number): void {' },
        { line: 2,  code: '  this.root = this._remove(this.root, val)' },
        { line: 3,  code: '}' },
        { line: 4,  code: '_remove(node: Node | null, val: number): Node | null {' },
        { line: 5,  code: '  if (!node) return null' },
        { line: 6,  code: '  if (val < node.val) node.left = this._remove(node.left, val)' },
        { line: 7,  code: '  else if (val > node.val) node.right = this._remove(node.right, val)' },
        { line: 8,  code: '  else {' },
        { line: 9,  code: '    if (!node.left) return node.right' },
        { line: 10, code: '    if (!node.right) return node.left' },
        { line: 11, code: '    let min = node.right' },
        { line: 12, code: '    while (min.left) min = min.left' },
        { line: 13, code: '    node.val = min.val' },
        { line: 14, code: '    node.right = this._remove(node.right, min.val)' },
        { line: 15, code: '  }' },
        { line: 16, code: '  return node' },
        { line: 17, code: '}' },
      ],
      cpp: [
        { line: 1, code: 'Node* remove(Node* node, int val) {' },
        { line: 2, code: '    if (!node) return NULL;' },
        { line: 3, code: '    if (val < node->val)' },
        { line: 4, code: '        node->left = remove(node->left, val);' },
        { line: 5, code: '    else if (val > node->val)' },
        { line: 6, code: '        node->right = remove(node->right, val);' },
        { line: 7, code: '    else {' },
        { line: 8, code: '        if (!node->left) return node->right;' },
        { line: 9, code: '        if (!node->right) return node->left;' },
        { line: 10, code: '        Node* m = node->right;' },
        { line: 11, code: '        while (m->left) m = m->left;' },
        { line: 12, code: '        node->val = m->val;' },
        { line: 13, code: '        node->right = remove(node->right, m->val);' },
        { line: 14, code: '    }' },
        { line: 15, code: '    return node;' },
        { line: 16, code: '}' },
      ],
      csharp: [
        { line: 1, code: 'Node remove(Node node, int val) {' },
        { line: 2, code: '    if (node == null) return null;' },
        { line: 3, code: '    if (val < node.val)' },
        { line: 4, code: '        node.left = remove(node.left, val);' },
        { line: 5, code: '    else if (val > node.val)' },
        { line: 6, code: '        node.right = remove(node.right, val);' },
        { line: 7, code: '    else {' },
        { line: 8, code: '        if (node.left == null) return node.right;' },
        { line: 9, code: '        if (node.right == null) return node.left;' },
        { line: 10, code: '        Node m = node.right;' },
        { line: 11, code: '        while (m.left != null) m = m.left;' },
        { line: 12, code: '        node.val = m.val;' },
        { line: 13, code: '        node.right = remove(node.right, m.val);' },
        { line: 14, code: '    }' },
        { line: 15, code: '    return node;' },
        { line: 16, code: '}' },
      ],
      python: [
        { line: 1,  code: 'def remove(self, val):' },
        { line: 2,  code: '    self.root = self._remove(self.root, val)' },
        { line: 3,  code: 'def _remove(self, node, val):' },
        { line: 4,  code: '    if node is None: return None' },
        { line: 5,  code: '    if val < node.val: node.left = self._remove(node.left, val)' },
        { line: 6,  code: '    elif val > node.val: node.right = self._remove(node.right, val)' },
        { line: 7,  code: '    else:' },
        { line: 8,  code: '        if not node.left: return node.right' },
        { line: 9,  code: '        if not node.right: return node.left' },
        { line: 10, code: '        m = node.right' },
        { line: 11, code: '        while m.left: m = m.left' },
        { line: 12, code: '        node.val = m.val' },
        { line: 13, code: '        node.right = self._remove(node.right, m.val)' },
        { line: 14, code: '    return node' },
      ],
      c: [
        { line: 1,  code: 'Node* remove(Node* node, int val) {' },
        { line: 2,  code: '    if (!node) return NULL;' },
        { line: 3,  code: '    if (val < node->val)' },
        { line: 4,  code: '        node->left = remove(node->left, val);' },
        { line: 5,  code: '    else if (val > node->val)' },
        { line: 6,  code: '        node->right = remove(node->right, val);' },
        { line: 7,  code: '    else {' },
        { line: 8,  code: '        if (!node->left) return node->right;' },
        { line: 9,  code: '        if (!node->right) return node->left;' },
        { line: 10, code: '        Node* m = node->right;' },
        { line: 11, code: '        while (m->left) m = m->left;' },
        { line: 12, code: '        node->val = m->val;' },
        { line: 13, code: '        node->right = remove(node->right, m->val);' },
        { line: 14, code: '    }' },
        { line: 15, code: '    return node;' },
        { line: 16, code: '}' },
      ],
      java: [
        { line: 1,  code: 'Node remove(Node node, int val) {' },
        { line: 2,  code: '    if (node == null) return null;' },
        { line: 3,  code: '    if (val < node.val)' },
        { line: 4,  code: '        node.left = remove(node.left, val);' },
        { line: 5,  code: '    else if (val > node.val)' },
        { line: 6,  code: '        node.right = remove(node.right, val);' },
        { line: 7,  code: '    else {' },
        { line: 8,  code: '        if (node.left == null) return node.right;' },
        { line: 9,  code: '        if (node.right == null) return node.left;' },
        { line: 10, code: '        Node m = node.right;' },
        { line: 11, code: '        while (m.left != null) m = m.left;' },
        { line: 12, code: '        node.val = m.val;' },
        { line: 13, code: '        node.right = remove(node.right, m.val);' },
        { line: 14, code: '    }' },
        { line: 15, code: '    return node;' },
        { line: 16, code: '}' },
      ],
      go: [
        { line: 1,  code: 'func remove(node *Node, val int) *Node {' },
        { line: 2,  code: '    if node == nil { return nil }' },
        { line: 3,  code: '    if val < node.Val {' },
        { line: 4,  code: '        node.Left = remove(node.Left, val)' },
        { line: 5,  code: '    } else if val > node.Val {' },
        { line: 6,  code: '        node.Right = remove(node.Right, val)' },
        { line: 7,  code: '    } else {' },
        { line: 8,  code: '        if node.Left == nil { return node.Right }' },
        { line: 9,  code: '        if node.Right == nil { return node.Left }' },
        { line: 10, code: '        m := node.Right' },
        { line: 11, code: '        for m.Left != nil { m = m.Left }' },
        { line: 12, code: '        node.Val = m.Val' },
        { line: 13, code: '        node.Right = remove(node.Right, m.Val)' },
        { line: 14, code: '    }' },
        { line: 15, code: '    return node' },
        { line: 16, code: '}' },
      ],
      javascript: [
        { line: 1, code: 'remove(val) {' },
        { line: 2, code: '  this.root = this._remove(this.root, val)' },
        { line: 3, code: '}' },
        { line: 4, code: '_remove(node: Node | null, val): Node | null {' },
        { line: 5, code: '  if (!node) return null' },
        { line: 6, code: '  if (val < node.val) node.left = this._remove(node.left, val)' },
        { line: 7, code: '  else if (val > node.val) node.right = this._remove(node.right, val)' },
        { line: 8, code: '  else {' },
        { line: 9, code: '    if (!node.left) return node.right' },
        { line: 10, code: '    if (!node.right) return node.left' },
        { line: 11, code: '    let min = node.right' },
        { line: 12, code: '    while (min.left) min = min.left' },
        { line: 13, code: '    node.val = min.val' },
        { line: 14, code: '    node.right = this._remove(node.right, min.val)' },
        { line: 15, code: '  }' },
        { line: 16, code: '  return node' },
        { line: 17, code: '}' },
      ],
    },
  },
]

// ─── Top-level generator (search demo: find 30) ──────────────────────────────
export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* searchGenerator(30)
}

// ─── Top-level codeSnippets (search) ─────────────────────────────────────────
export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'search(val: number): boolean {' },
    { line: 2, code: '  let curr = this.root' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    if (val < curr.val) curr = curr.left' },
    { line: 6, code: '    else curr = curr.right' },
    { line: 7, code: '  }' },
    { line: 8, code: '  return false' },
    { line: 9, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'int search(Node* root, int val) {' },
    { line: 2, code: '    Node* curr = root;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        if (curr->val == val) return 1;' },
    { line: 5, code: '        if (val < curr->val) curr = curr->left;' },
    { line: 6, code: '        else curr = curr->right;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return 0;' },
    { line: 9, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'bool search(int val) {' },
    { line: 2, code: '    Node curr = root;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        if (curr.val == val) return true;' },
    { line: 5, code: '        if (val < curr.val) curr = curr.left;' },
    { line: 6, code: '        else curr = curr.right;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return false;' },
    { line: 9, code: '}' },
  ],

  python: [
    { line: 1, code: 'def search(self, val):' },
    { line: 2, code: '    curr = self.root' },
    { line: 3, code: '    while curr:' },
    { line: 4, code: '        if curr.val == val: return True' },
    { line: 5, code: '        if val < curr.val: curr = curr.left' },
    { line: 6, code: '        else: curr = curr.right' },
    { line: 7, code: '    return False' },
  ],
  c: [
    { line: 1, code: 'int search(Node* root, int val) {' },
    { line: 2, code: '    Node* curr = root;' },
    { line: 3, code: '    while (curr) {' },
    { line: 4, code: '        if (curr->val == val) return 1;' },
    { line: 5, code: '        if (val < curr->val) curr = curr->left;' },
    { line: 6, code: '        else curr = curr->right;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return 0;' },
    { line: 9, code: '}' },
  ],
  java: [
    { line: 1, code: 'boolean search(int val) {' },
    { line: 2, code: '    Node curr = root;' },
    { line: 3, code: '    while (curr != null) {' },
    { line: 4, code: '        if (curr.val == val) return true;' },
    { line: 5, code: '        if (val < curr.val) curr = curr.left;' },
    { line: 6, code: '        else curr = curr.right;' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return false;' },
    { line: 9, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (t *BST) Search(val int) bool {' },
    { line: 2, code: '    curr := t.root' },
    { line: 3, code: '    for curr != nil {' },
    { line: 4, code: '        if curr.Val == val { return true }' },
    { line: 5, code: '        if val < curr.Val { curr = curr.Left }' },
    { line: 6, code: '        else { curr = curr.Right }' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return false' },
    { line: 9, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'search(val) {' },
    { line: 2, code: '  let curr = this.root' },
    { line: 3, code: '  while (curr) {' },
    { line: 4, code: '    if (curr.val === val) return true' },
    { line: 5, code: '    if (val < curr.val) curr = curr.left' },
    { line: 6, code: '    else curr = curr.right' },
    { line: 7, code: '  }' },
    { line: 8, code: '  return false' },
    { line: 9, code: '}' },
  ],
}
