import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'binary-tree',
  category: 'data-structures',
  nameKey: 'algorithms.binaryTree.name',
  descriptionKey: 'algorithms.binaryTree.description',
  complexity: {
    time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    operations: [
      { name: 'insert',   best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
      { name: 'search',   best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
      { name: 'traverse', best: 'O(n)',     avg: 'O(n)',     worst: 'O(n)' },
    ],
  },
  tags: ['tree', 'hierarchical', 'traversal'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',            title: '#94 Binary Tree Inorder Traversal', difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/tree-inorder-traversal/problem',    title: 'Tree: Inorder Traversal',           difficulty: 'Easy' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/binary-tree-inorder-traversal',              title: 'Binary Tree Inorder Traversal',     difficulty: 'Easy' },
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

// ─── Initial BST built from [50, 30, 70, 20, 40] ────────────────────────────
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
function* insertGenerator(value = 42): Generator<AlgorithmFrame> {
  const nodes = makeBaseNodes()
  let nextId = 5   // ids 0-4 already used

  function snap(current: number | null, visited?: number[]): State {
    return { nodes: cloneNodes(nodes), current, visited: visited ? [...visited] : [] }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.binaryTree.insert.start',
    codeLine: 1,
    auxState: { v: value },
  }

  // Walk the tree BST-style to find the insertion point
  let currId: number = nodes[0].id

  while (true) {
    const curr = nodes.find(n => n.id === currId)!

    yield {
      state: snap(currId),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.binaryTree.insert.compare',
      codeLine: 5,
      auxState: { v: value, nodeV: curr.value },
    }

    if (value < curr.value) {
      if (curr.left === null) {
        // Insert left
        const newId = nextId++
        curr.left = newId
        nodes.push({ id: newId, value, left: null, right: null })
        yield {
          state: snap(newId),
          highlights: [{ index: newId, role: 'found', label: 'new' }],
          message: 'ds.binaryTree.insert.placed',
          codeLine: 6,
          auxState: { v: value },
        }
        break
      }
      currId = curr.left
    } else {
      if (curr.right === null) {
        // Insert right
        const newId = nextId++
        curr.right = newId
        nodes.push({ id: newId, value, left: null, right: null })
        yield {
          state: snap(newId),
          highlights: [{ index: newId, role: 'found', label: 'new' }],
          message: 'ds.binaryTree.insert.placed',
          codeLine: 9,
          auxState: { v: value },
        }
        break
      }
      currId = curr.right
    }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.binaryTree.insert.done',
    codeLine: 13,
    auxState: { v: value },
  }
}

// ─── dsOperation 2: Search ───────────────────────────────────────────────────
function* searchGenerator(value = 40): Generator<AlgorithmFrame> {
  const nodes = makeBaseNodes()

  function snap(current: number | null, visited?: number[]): State {
    return { nodes: cloneNodes(nodes), current, visited: visited ? [...visited] : [] }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.binaryTree.search.start',
    codeLine: 1,
    auxState: { target: value },
  }

  let currId: number | null = nodes[0].id

  while (currId !== null) {
    const curr = nodes.find(n => n.id === currId)!

    yield {
      state: snap(currId),
      highlights: [{ index: currId, role: 'current', label: 'curr' }],
      message: 'ds.binaryTree.search.visiting',
      codeLine: 3,
      auxState: { target: value, nodeV: curr.value },
    }

    if (curr.value === value) {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'found', label: 'found' }],
        message: 'ds.binaryTree.search.found',
        codeLine: 4,
        auxState: { v: curr.value },
      }
      return
    }

    if (value < curr.value) {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'current', label: 'curr' }],
        message: 'ds.binaryTree.search.goLeft',
        codeLine: 5,
        auxState: { target: value, nodeV: curr.value },
      }
      currId = curr.left
    } else {
      yield {
        state: snap(currId),
        highlights: [{ index: currId, role: 'current', label: 'curr' }],
        message: 'ds.binaryTree.search.goRight',
        codeLine: 6,
        auxState: { target: value, nodeV: curr.value },
      }
      currId = curr.right
    }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.binaryTree.search.notFound',
    codeLine: 8,
    auxState: { target: value },
  }
}

// ─── dsOperation 3: Traverse (In-order, iterative) ──────────────────────────
function* traverseGenerator(_value?: number): Generator<AlgorithmFrame> {
  const nodes = makeBaseNodes()
  const visited: number[] = []

  function nodeById(id: number): TreeNodeData {
    return nodes.find(n => n.id === id)!
  }

  function snap(current: number | null): State {
    return { nodes: cloneNodes(nodes), current, visited: [...visited] }
  }

  yield {
    state: snap(null),
    highlights: [],
    message: 'ds.binaryTree.traverse.start',
    codeLine: 1,
  }

  // Iterative in-order using explicit call-stack simulation
  type Frame = { nodeId: number; phase: 'left' | 'visit' | 'right' }
  const callStack: Frame[] = [{ nodeId: nodes[0].id, phase: 'left' }]

  while (callStack.length > 0) {
    const frame = callStack[callStack.length - 1]
    const node = nodeById(frame.nodeId)

    if (frame.phase === 'left') {
      frame.phase = 'visit'
      yield {
        state: snap(frame.nodeId),
        highlights: [
          { index: frame.nodeId, role: 'current', label: 'curr' },
          ...visited.map(id => ({ index: id, role: 'visited' as const })),
        ],
        message: 'ds.binaryTree.traverse.goLeft',
        codeLine: 3,
        auxState: { v: node.value },
      }
      if (node.left !== null) {
        callStack.push({ nodeId: node.left, phase: 'left' })
      }
    } else if (frame.phase === 'visit') {
      frame.phase = 'right'
      yield {
        state: snap(node.id),
        highlights: [
          { index: node.id, role: 'current', label: 'curr' },
          ...visited.map(id => ({ index: id, role: 'visited' as const })),
        ],
        message: 'ds.binaryTree.traverse.visit',
        codeLine: 4,
        auxState: { v: node.value },
      }
      visited.push(node.id)
    } else {
      // right phase
      callStack.pop()
      if (node.right !== null) {
        yield {
          state: snap(node.id),
          highlights: [
            { index: node.id, role: 'visited' },
            ...visited.filter(id => id !== node.id).map(id => ({ index: id, role: 'visited' as const })),
          ],
          message: 'ds.binaryTree.traverse.goRight',
          codeLine: 5,
          auxState: { v: node.value },
        }
        callStack.push({ nodeId: node.right, phase: 'left' })
      }
    }
  }

  yield {
    state: snap(null),
    highlights: visited.map(id => ({ index: id, role: 'visited' as const })),
    message: 'ds.binaryTree.traverse.done',
    codeLine: 6,
    auxState: { order: visited.map(id => nodeById(id).value) },
  }
}

// ─── dsOperations export ─────────────────────────────────────────────────────
export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 42) => insertGenerator(value),
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
    generator: (value = 40) => searchGenerator(value),
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
    type: 'traverse',
    label: 'In-Order Traverse',
    takesValue: false,
    generator: (_value?: number) => traverseGenerator(_value),
    codeSnippets: {
      typescript: [
        { line: 1, code: 'inOrder(node: Node | null, result: number[]): void {' },
        { line: 2, code: '  if (!node) return' },
        { line: 3, code: '  this.inOrder(node.left, result)' },
        { line: 4, code: '  result.push(node.val)' },
        { line: 5, code: '  this.inOrder(node.right, result)' },
        { line: 6, code: '}' },
      ],
      cpp: [
        { line: 1, code: 'void inOrder(Node* node, vector<int>& result, vector<int>& idx) {' },
        { line: 2, code: '    if (!node) return;' },
        { line: 3, code: '    inOrder(node->left, result, idx);' },
        { line: 4, code: '    result[(*idx)++] = node->val;' },
        { line: 5, code: '    inOrder(node->right, result, idx);' },
        { line: 6, code: '}' },
      ],
      csharp: [
        { line: 1, code: 'void inOrder(Node node, List<Integer> result) {' },
        { line: 2, code: '    if (node == null) return;' },
        { line: 3, code: '    inOrder(node.left, result);' },
        { line: 4, code: '    result.add(node.val);' },
        { line: 5, code: '    inOrder(node.right, result);' },
        { line: 6, code: '}' },
      ],
      python: [
        { line: 1, code: 'def in_order(self, node, result):' },
        { line: 2, code: '    if node is None: return' },
        { line: 3, code: '    self.in_order(node.left, result)' },
        { line: 4, code: '    result.append(node.val)' },
        { line: 5, code: '    self.in_order(node.right, result)' },
        { line: 6, code: '# result: [20, 30, 40, 50, 70]' },
      ],
      c: [
        { line: 1, code: 'void inOrder(Node* node, int* result, int* idx) {' },
        { line: 2, code: '    if (!node) return;' },
        { line: 3, code: '    inOrder(node->left, result, idx);' },
        { line: 4, code: '    result[(*idx)++] = node->val;' },
        { line: 5, code: '    inOrder(node->right, result, idx);' },
        { line: 6, code: '}' },
      ],
      java: [
        { line: 1, code: 'void inOrder(Node node, List<Integer> result) {' },
        { line: 2, code: '    if (node == null) return;' },
        { line: 3, code: '    inOrder(node.left, result);' },
        { line: 4, code: '    result.add(node.val);' },
        { line: 5, code: '    inOrder(node.right, result);' },
        { line: 6, code: '}' },
      ],
      go: [
        { line: 1, code: 'func inOrder(node *Node, result *[]int) {' },
        { line: 2, code: '    if node == nil { return }' },
        { line: 3, code: '    inOrder(node.Left, result)' },
        { line: 4, code: '    *result = append(*result, node.Val)' },
        { line: 5, code: '    inOrder(node.Right, result)' },
        { line: 6, code: '}' },
      ],
      javascript: [
        { line: 1, code: 'inOrder(node: Node | null, result) {' },
        { line: 2, code: '  if (!node) return' },
        { line: 3, code: '  this.inOrder(node.left, result)' },
        { line: 4, code: '  result.push(node.val)' },
        { line: 5, code: '  this.inOrder(node.right, result)' },
        { line: 6, code: '}' },
      ],
    },
  },
]

// ─── Top-level generator (in-order traversal of fixed tree) ─────────────────
export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* traverseGenerator()
}

// ─── Top-level codeSnippets (in-order) ───────────────────────────────────────
export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1, code: 'inOrder(node: Node | null, result: number[]): void {' },
    { line: 2, code: '  if (!node) return' },
    { line: 3, code: '  this.inOrder(node.left, result)' },
    { line: 4, code: '  result.push(node.val)' },
    { line: 5, code: '  this.inOrder(node.right, result)' },
    { line: 6, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void inOrder(Node* node, vector<int>& result, vector<int>& idx) {' },
    { line: 2, code: '    if (!node) return;' },
    { line: 3, code: '    inOrder(node->left, result, idx);' },
    { line: 4, code: '    result[(*idx)++] = node->val;' },
    { line: 5, code: '    inOrder(node->right, result, idx);' },
    { line: 6, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'void inOrder(Node node, List<Integer> result) {' },
    { line: 2, code: '    if (node == null) return;' },
    { line: 3, code: '    inOrder(node.left, result);' },
    { line: 4, code: '    result.add(node.val);' },
    { line: 5, code: '    inOrder(node.right, result);' },
    { line: 6, code: '}' },
  ],

  python: [
    { line: 1, code: 'def in_order(self, node, result):' },
    { line: 2, code: '    if node is None: return' },
    { line: 3, code: '    self.in_order(node.left, result)' },
    { line: 4, code: '    result.append(node.val)' },
    { line: 5, code: '    self.in_order(node.right, result)' },
    { line: 6, code: '# result: [20, 30, 40, 50, 70]' },
  ],
  c: [
    { line: 1, code: 'void inOrder(Node* node, int* result, int* idx) {' },
    { line: 2, code: '    if (!node) return;' },
    { line: 3, code: '    inOrder(node->left, result, idx);' },
    { line: 4, code: '    result[(*idx)++] = node->val;' },
    { line: 5, code: '    inOrder(node->right, result, idx);' },
    { line: 6, code: '}' },
  ],
  java: [
    { line: 1, code: 'void inOrder(Node node, List<Integer> result) {' },
    { line: 2, code: '    if (node == null) return;' },
    { line: 3, code: '    inOrder(node.left, result);' },
    { line: 4, code: '    result.add(node.val);' },
    { line: 5, code: '    inOrder(node.right, result);' },
    { line: 6, code: '}' },
  ],
  go: [
    { line: 1, code: 'func inOrder(node *Node, result *[]int) {' },
    { line: 2, code: '    if node == nil { return }' },
    { line: 3, code: '    inOrder(node.Left, result)' },
    { line: 4, code: '    *result = append(*result, node.Val)' },
    { line: 5, code: '    inOrder(node.Right, result)' },
    { line: 6, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'inOrder(node: Node | null, result) {' },
    { line: 2, code: '  if (!node) return' },
    { line: 3, code: '  this.inOrder(node.left, result)' },
    { line: 4, code: '  result.push(node.val)' },
    { line: 5, code: '  this.inOrder(node.right, result)' },
    { line: 6, code: '}' },
  ],
}
