import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'bst',
  category: 'data-structures',
  nameKey: 'algorithms.bst.name',
  descriptionKey: 'algorithms.bst.description',
  complexity: {
    time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  tags: ['tree', 'hierarchical', 'ordered', 'search'],
  defaultInput: null,
}

type BSTNode = {
  id: number
  value: number
  left: number | null
  right: number | null
}

type BSTState = {
  nodes: BSTNode[]
  current: number | null
  comparing: number | null
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const nodes: BSTNode[] = []
  let nextId = 1

  function cloneNodes(): BSTNode[] {
    return nodes.map(n => ({ ...n }))
  }

  function makeState(current: number | null, comparing: number | null): BSTState {
    return { nodes: cloneNodes(), current, comparing }
  }

  // Insert a value into BST, yielding comparison frames
  function* insertValue(value: number): Generator<AlgorithmFrame> {
    if (nodes.length === 0) {
      const id = nextId++
      nodes.push({ id, value, left: null, right: null })
      yield {
        state: makeState(id, null),
        highlights: [{ index: id, role: 'current' }],
        message: 'algorithms.bst.steps.insert',
        codeLine: 2,
        auxState: { v: value },
      }
      return
    }

    let currentId: number | null = nodes[0].id
    while (currentId !== null) {
      const node = nodes.find(n => n.id === currentId)!

      yield {
        state: makeState(currentId, currentId),
        highlights: [{ index: currentId, role: 'compare' }],
        message: 'algorithms.bst.steps.compare',
        codeLine: 4,
        auxState: { v: value, nodeV: node.value },
      }

      if (value < node.value) {
        if (node.left === null) {
          const newId = nextId++
          node.left = newId
          nodes.push({ id: newId, value, left: null, right: null })
          yield {
            state: makeState(newId, null),
            highlights: [{ index: newId, role: 'current' }],
            message: 'algorithms.bst.steps.placed',
            codeLine: 6,
            auxState: { v: value },
          }
          return
        }
        currentId = node.left
      } else {
        if (node.right === null) {
          const newId = nextId++
          node.right = newId
          nodes.push({ id: newId, value, left: null, right: null })
          yield {
            state: makeState(newId, null),
            highlights: [{ index: newId, role: 'current' }],
            message: 'algorithms.bst.steps.placed',
            codeLine: 8,
            auxState: { v: value },
          }
          return
        }
        currentId = node.right
      }
    }
  }

  // Insert values: 50, 30, 70, 20, 40, 60, 80
  const insertValues = [50, 30, 70, 20, 40, 60, 80]

  for (const v of insertValues) {
    yield {
      state: makeState(null, null),
      highlights: [],
      message: 'algorithms.bst.steps.insert',
      codeLine: 1,
      auxState: { v },
    }
    yield* insertValue(v)
  }

  // Search for 60
  const searchTarget = 60

  yield {
    state: makeState(null, null),
    highlights: [],
    message: 'algorithms.bst.steps.search',
    codeLine: 11,
    auxState: { target: searchTarget },
  }

  let searchCurrent: number | null = nodes[0].id
  while (searchCurrent !== null) {
    const node = nodes.find(n => n.id === searchCurrent)!

    yield {
      state: makeState(searchCurrent, searchCurrent),
      highlights: [{ index: searchCurrent, role: 'compare' }],
      message: 'algorithms.bst.steps.compare',
      codeLine: 12,
      auxState: { v: node.value, target: searchTarget },
    }

    if (node.value === searchTarget) {
      yield {
        state: makeState(searchCurrent, null),
        highlights: [{ index: searchCurrent, role: 'found' }],
        message: 'algorithms.bst.steps.found',
        codeLine: 13,
        auxState: { v: node.value },
      }
      break
    } else if (searchTarget < node.value) {
      searchCurrent = node.left
    } else {
      searchCurrent = node.right
    }
  }

  yield {
    state: makeState(null, null),
    highlights: [],
    message: 'algorithms.bst.steps.done',
    codeLine: 15,
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function insert(root: BSTNode | null, val: number): BSTNode {' },
    { line: 2, code: '  if (!root) return new BSTNode(val)' },
    { line: 3, code: '  if (val < root.val)' },
    { line: 4, code: '    root.left = insert(root.left, val)' },
    { line: 5, code: '  else' },
    { line: 6, code: '    root.right = insert(root.right, val)' },
    { line: 7, code: '  return root' },
    { line: 8, code: '}' },
    { line: 9, code: 'function search(root: BSTNode | null, val: number): boolean {' },
    { line: 10, code: '  if (!root) return false' },
    { line: 11, code: '  if (root.val === val) return true' },
    { line: 12, code: '  if (val < root.val) return search(root.left, val)' },
    { line: 13, code: '  return search(root.right, val)' },
    { line: 14, code: '}' },
    { line: 15, code: '// search(root, 60) → true' },
  ],
  python: [
    { line: 1, code: 'def insert(root, val):' },
    { line: 2, code: '    if root is None: return Node(val)' },
    { line: 3, code: '    if val < root.val:' },
    { line: 4, code: '        root.left = insert(root.left, val)' },
    { line: 5, code: '    else:' },
    { line: 6, code: '        root.right = insert(root.right, val)' },
    { line: 7, code: '    return root' },
    { line: 8, code: 'def search(root, val):' },
    { line: 9, code: '    if root is None: return False' },
    { line: 10, code: '    if root.val == val: return True' },
    { line: 11, code: '    if val < root.val: return search(root.left, val)' },
    { line: 12, code: '    return search(root.right, val)' },
  ],
  c: [
    { line: 1, code: 'Node* insert(Node* root, int val) {' },
    { line: 2, code: '    if (!root) return newNode(val);' },
    { line: 3, code: '    if (val < root->val)' },
    { line: 4, code: '        root->left = insert(root->left, val);' },
    { line: 5, code: '    else' },
    { line: 6, code: '        root->right = insert(root->right, val);' },
    { line: 7, code: '    return root;' },
    { line: 8, code: '}' },
    { line: 9, code: 'int search(Node* root, int val) {' },
    { line: 10, code: '    if (!root) return 0;' },
    { line: 11, code: '    if (root->val == val) return 1;' },
    { line: 12, code: '    if (val < root->val) return search(root->left, val);' },
    { line: 13, code: '    return search(root->right, val);' },
    { line: 14, code: '}' },
  ],
  java: [
    { line: 1, code: 'TreeNode insert(TreeNode root, int val) {' },
    { line: 2, code: '    if (root == null) return new TreeNode(val);' },
    { line: 3, code: '    if (val < root.val)' },
    { line: 4, code: '        root.left = insert(root.left, val);' },
    { line: 5, code: '    else' },
    { line: 6, code: '        root.right = insert(root.right, val);' },
    { line: 7, code: '    return root;' },
    { line: 8, code: '}' },
    { line: 9, code: 'boolean search(TreeNode root, int val) {' },
    { line: 10, code: '    if (root == null) return false;' },
    { line: 11, code: '    if (root.val == val) return true;' },
    { line: 12, code: '    if (val < root.val) return search(root.left, val);' },
    { line: 13, code: '    return search(root.right, val);' },
    { line: 14, code: '}' },
  ],
  go: [
    { line: 1, code: 'func insert(root *TreeNode, val int) *TreeNode {' },
    { line: 2, code: '    if root == nil { return &TreeNode{Val: val} }' },
    { line: 3, code: '    if val < root.Val {' },
    { line: 4, code: '        root.Left = insert(root.Left, val)' },
    { line: 5, code: '    } else {' },
    { line: 6, code: '        root.Right = insert(root.Right, val)' },
    { line: 7, code: '    }' },
    { line: 8, code: '    return root' },
    { line: 9, code: '}' },
    { line: 10, code: 'func search(root *TreeNode, val int) bool {' },
    { line: 11, code: '    if root == nil { return false }' },
    { line: 12, code: '    if root.Val == val { return true }' },
    { line: 13, code: '    if val < root.Val { return search(root.Left, val) }' },
    { line: 14, code: '    return search(root.Right, val)' },
    { line: 15, code: '}' },
  ],
}
