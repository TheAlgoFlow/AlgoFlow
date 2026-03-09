export type HighlightRole =
  | 'compare'
  | 'swap'
  | 'pivot'
  | 'found'
  | 'visited'
  | 'current'
  | 'sorted'
  | 'active'
  | 'inactive'
  | 'head'
  | 'tail'
  | 'left'
  | 'right'
  | 'mid'
  | 'pointer'
  | 'selected'
  | 'dp-fill'
  | 'dp-current'

export type Highlight = {
  index: number | string
  role: HighlightRole
  label?: string   // e.g. 'curr', 'prev', 'temp', 'pivot', 'i', 'j'
}

export type AlgorithmFrame = {
  state: unknown
  highlights: Highlight[]
  message: string
  codeLine: number
  auxState?: unknown
}

export type OperationComplexity = {
  name: string        // e.g. 'push', 'insert at head'
  best: string
  avg: string
  worst: string
}

export type Complexity = {
  time: {
    best: string
    avg: string
    worst: string
  }
  space: string
  operations?: OperationComplexity[]  // for data structures only
}

export type AlgorithmCategory = 'sorting' | 'searching' | 'data-structures' | 'dp'

export type CodeSnippets = {
  ts: CodeLine[]
  python: CodeLine[]
  c: CodeLine[]
  java: CodeLine[]
  go: CodeLine[]
}

export type CodeLine = {
  line: number
  code: string
}

export type ExercisePlatform = 'leetcode' | 'beecrowd' | 'hackerrank' | 'neetcode'

export type ExerciseLink = {
  platform: ExercisePlatform
  url: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export type AlgorithmMeta = {
  slug: string
  category: AlgorithmCategory
  nameKey: string
  descriptionKey: string
  complexity: Complexity
  tags: string[]
  defaultInput?: unknown
  exercises?: ExerciseLink[]
}

export type DSOperationType = 'insert' | 'remove' | 'search' | 'traverse'

export type DSOperationConfig = {
  type: DSOperationType
  label: string
  takesValue: boolean
  generator: (value?: number, initialState?: unknown) => Generator<AlgorithmFrame>
  codeSnippets: CodeSnippets
}

export type AlgorithmModule = {
  meta: AlgorithmMeta
  generator: (input: unknown) => Generator<AlgorithmFrame>
  codeSnippets: CodeSnippets
  dsOperations?: DSOperationConfig[]
}

// Sorting-specific state
export type SortingState = {
  array: number[]
  comparing?: number[]
  swapping?: number[]
  sorted?: number[]
  pivot?: number
}

// Searching-specific state
export type SearchingState = {
  array: number[]
  target: number
  low?: number
  high?: number
  mid?: number
  found?: number
}

// Graph state for BFS/DFS
export type GraphNode = {
  id: string
  x: number
  y: number
  label: string
}

export type GraphEdge = {
  from: string
  to: string
}

export type GraphState = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  visited: string[]
  queue?: string[]
  stack?: string[]
  current?: string
  path?: string[]
  traversedEdges?: Array<{ from: string; to: string }>
}

// Tree state
export type TreeNode = {
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

export type TreeState = {
  root: TreeNode | null
  traversalOrder?: number[]
  current?: number
  visiting?: number[]
}

// Linked list state
export type LinkedListNode = {
  value: number
  id: string
  next: string | null
}

export type LinkedListState = {
  nodes: LinkedListNode[]
  head: string | null
  current?: string
  prev?: string
  highlighted?: string[]
}

// DP state (grid/table)
export type DPState = {
  table: (number | null)[][]
  current?: [number, number]
  filled?: [number, number][]
  result?: number
}

// Stack/Queue state
export type StackQueueState = {
  items: number[]
  top?: number
  highlighted?: number
  operation?: 'push' | 'pop' | 'peek' | 'enqueue' | 'dequeue'
}
