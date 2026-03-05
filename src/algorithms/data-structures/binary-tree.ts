import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'binary-tree',
  category: 'data-structures',
  nameKey: 'algorithms.binaryTree.name',
  descriptionKey: 'algorithms.binaryTree.description',
  complexity: {
    time: { best: 'O(n)', avg: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
  },
  tags: ['tree', 'hierarchical', 'traversal'],
  defaultInput: null,
}

type BinaryTreeNode = {
  id: number
  value: number
  left: number | null
  right: number | null
}

type BinaryTreeState = {
  nodes: BinaryTreeNode[]
  current: number | null
  visited: number[]
}

// Fixed tree:
//         1
//        / \
//       2   3
//      / \ / \
//     4  5 6  7
const TREE_NODES: BinaryTreeNode[] = [
  { id: 1, value: 1, left: 2, right: 3 },
  { id: 2, value: 2, left: 4, right: 5 },
  { id: 3, value: 3, left: 6, right: 7 },
  { id: 4, value: 4, left: null, right: null },
  { id: 5, value: 5, left: null, right: null },
  { id: 6, value: 6, left: null, right: null },
  { id: 7, value: 7, left: null, right: null },
]

function nodeById(id: number): BinaryTreeNode {
  return TREE_NODES.find(n => n.id === id)!
}

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const visited: number[] = []

  function makeState(current: number | null): BinaryTreeState {
    return {
      nodes: TREE_NODES.map(n => ({ ...n })),
      current,
      visited: [...visited],
    }
  }

  function makeHighlights(current: number | null) {
    return [
      ...visited.map(id => ({ index: id, role: 'visited' as const })),
      ...(current !== null ? [{ index: current, role: 'current' as const }] : []),
    ]
  }

  yield {
    state: makeState(null),
    highlights: [],
    message: 'algorithms.binaryTree.steps.init',
    codeLine: 1,
  }

  // In-order traversal: 4, 2, 5, 1, 6, 3, 7
  // Implemented iteratively to allow yielding at each step

  // We'll use a recursive generator approach via a manual stack
  type Frame = { nodeId: number; phase: 'left' | 'visit' | 'right' }
  const callStack: Frame[] = [{ nodeId: 1, phase: 'left' }]

  while (callStack.length > 0) {
    const frame = callStack[callStack.length - 1]
    const node = nodeById(frame.nodeId)

    if (frame.phase === 'left') {
      frame.phase = 'visit'
      if (node.left !== null) {
        // Go left
        yield {
          state: makeState(frame.nodeId),
          highlights: makeHighlights(frame.nodeId),
          message: 'algorithms.binaryTree.steps.goLeft',
          codeLine: 3,
          auxState: { v: node.value },
        }
        callStack.push({ nodeId: node.left, phase: 'left' })
      }
    } else if (frame.phase === 'visit') {
      frame.phase = 'right'
      // Visit current node
      yield {
        state: makeState(node.id),
        highlights: makeHighlights(node.id),
        message: 'algorithms.binaryTree.steps.visit',
        codeLine: 5,
        auxState: { v: node.value },
      }
      visited.push(node.id)
    } else {
      // right
      callStack.pop()
      if (node.right !== null) {
        // Go right
        yield {
          state: makeState(node.id),
          highlights: makeHighlights(node.id),
          message: 'algorithms.binaryTree.steps.goRight',
          codeLine: 7,
          auxState: { v: node.value },
        }
        callStack.push({ nodeId: node.right, phase: 'left' })
      }
    }
  }

  yield {
    state: makeState(null),
    highlights: visited.map(id => ({ index: id, role: 'visited' as const })),
    message: 'algorithms.binaryTree.steps.done',
    codeLine: 9,
    auxState: { order: visited.map(id => nodeById(id).value) },
  }
}

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'function inOrder(node: TreeNode | null): void {' },
    { line: 2, code: '  if (!node) return' },
    { line: 3, code: '  inOrder(node.left)   // go left' },
    { line: 4, code: '  // visit' },
    { line: 5, code: '  console.log(node.value)' },
    { line: 6, code: '  // go right' },
    { line: 7, code: '  inOrder(node.right)' },
    { line: 8, code: '}' },
    { line: 9, code: '// Result: 4, 2, 5, 1, 6, 3, 7' },
  ],
  python: [
    { line: 1, code: 'def in_order(node):' },
    { line: 2, code: '    if node is None: return' },
    { line: 3, code: '    in_order(node.left)   # go left' },
    { line: 4, code: '    print(node.value)     # visit' },
    { line: 5, code: '    in_order(node.right)  # go right' },
    { line: 6, code: '# Result: 4, 2, 5, 1, 6, 3, 7' },
  ],
  c: [
    { line: 1, code: 'void inOrder(Node* node) {' },
    { line: 2, code: '    if (!node) return;' },
    { line: 3, code: '    inOrder(node->left);   // go left' },
    { line: 4, code: '    printf("%d ", node->val); // visit' },
    { line: 5, code: '    inOrder(node->right);  // go right' },
    { line: 6, code: '}' },
    { line: 7, code: '// Result: 4 2 5 1 6 3 7' },
  ],
  java: [
    { line: 1, code: 'void inOrder(TreeNode node) {' },
    { line: 2, code: '    if (node == null) return;' },
    { line: 3, code: '    inOrder(node.left);          // go left' },
    { line: 4, code: '    System.out.print(node.val);  // visit' },
    { line: 5, code: '    inOrder(node.right);         // go right' },
    { line: 6, code: '}' },
    { line: 7, code: '// Result: 4 2 5 1 6 3 7' },
  ],
  go: [
    { line: 1, code: 'func inOrder(node *TreeNode) {' },
    { line: 2, code: '    if node == nil { return }' },
    { line: 3, code: '    inOrder(node.Left)           // go left' },
    { line: 4, code: '    fmt.Print(node.Val, " ")     // visit' },
    { line: 5, code: '    inOrder(node.Right)          // go right' },
    { line: 6, code: '}' },
    { line: 7, code: '// Result: 4 2 5 1 6 3 7' },
  ],
}
