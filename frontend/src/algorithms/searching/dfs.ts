import type {
  AlgorithmFrame,
  AlgorithmMeta,
  CodeSnippets,
} from '@/engine/types';

// ---------------------------------------------------------------------------
// Graph types (local – mirrors the GraphState expected by the visualizer)
// ---------------------------------------------------------------------------
type GraphNode = { id: string; x: number; y: number; label: string };
type GraphEdge = { from: string; to: string };
type GraphState = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: string[];
  stack?: string[];
  current?: string;
  path?: string[];
  traversedEdges?: Array<{ from: string; to: string }>;
};

// ---------------------------------------------------------------------------
// Hardcoded graph (identical layout to BFS)
// ---------------------------------------------------------------------------
const NODES: GraphNode[] = [
  { id: 'A', x: 300, y: 50,  label: 'A' },
  { id: 'B', x: 150, y: 150, label: 'B' },
  { id: 'C', x: 450, y: 150, label: 'C' },
  { id: 'D', x: 75,  y: 250, label: 'D' },
  { id: 'E', x: 225, y: 250, label: 'E' },
  { id: 'F', x: 375, y: 250, label: 'F' },
  { id: 'G', x: 525, y: 250, label: 'G' },
];

const EDGES: GraphEdge[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'B', to: 'E' },
  { from: 'C', to: 'F' },
  { from: 'C', to: 'G' },
];

// Build adjacency list
const ADJ: Record<string, string[]> = {};
for (const { from, to } of EDGES) {
  if (!ADJ[from]) ADJ[from] = [];
  ADJ[from].push(to);
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
export const meta: AlgorithmMeta = {
  slug: 'dfs',
  category: 'searching',
  nameKey: 'algorithms.dfs.name',
  descriptionKey: 'algorithms.dfs.description',
  complexity: {
    time: { best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
  },
  tags: ['graph', 'recursive', 'backtracking'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/number-of-islands/',                      title: '#200 Number of Islands',               difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/dfs-connected-cell-in-a-grid/problem', title: 'DFS: Connected Cell in a Grid',   difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/number-of-islands',                        title: 'Number of Islands',                    difficulty: 'Medium' },
  ],
};

// ---------------------------------------------------------------------------
// Generator  (iterative DFS using an explicit stack)
// ---------------------------------------------------------------------------
export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const START = 'A';
  const visited: string[] = [];
  const stack: string[] = [START];
  const path: string[] = [];

  let nodesVisited = 0
  const traversedEdges: Array<{ from: string; to: string }> = []

  const baseState = (): GraphState => ({
    nodes: NODES,
    edges: EDGES,
    visited: [...visited],
    stack: [...stack],
    path: [...path],
    traversedEdges: [...traversedEdges],
  });

  // Initial frame – show the starting node on the stack
  yield {
    state: { ...baseState(), current: START },
    highlights: [{ index: START, role: 'active' }],
    message: 'algorithms.dfs.steps.start',
    codeLine: 1,
    auxState: { node: START, nodesVisited },
  };

  while (stack.length > 0) {
    const current = stack.pop() as string;

    if (visited.includes(current)) {
      // Already visited – this is a backtrack scenario
      yield {
        state: {
          ...baseState(),
          current,
          stack: [...stack],
        },
        highlights: [
          { index: current, role: 'visited' },
          ...visited
            .filter((n) => n !== current)
            .map((n) => ({ index: n, role: 'visited' as const })),
          ...stack.map((n) => ({ index: n, role: 'active' as const })),
        ],
        message: 'algorithms.dfs.steps.backtrack',
        codeLine: 4,
        auxState: { node: current, nodesVisited },
      };
      continue;
    }

    visited.push(current);
    path.push(current);
    nodesVisited++

    // Frame: visit the popped node
    yield {
      state: {
        ...baseState(),
        current,
        stack: [...stack],
      },
      highlights: [
        { index: current, role: 'current' },
        ...visited
          .filter((n) => n !== current)
          .map((n) => ({ index: n, role: 'visited' as const })),
        ...stack.map((n) => ({ index: n, role: 'active' as const })),
      ],
      message: 'algorithms.dfs.steps.visit',
      codeLine: 3,
      auxState: { node: current, nodesVisited },
    };

    // Push unvisited neighbours onto the stack (reverse order so leftmost is
    // processed first, matching the natural DFS left-to-right traversal)
    const neighbours = [...(ADJ[current] ?? [])].reverse();
    for (const neighbour of neighbours) {
      if (!visited.includes(neighbour)) {
        stack.push(neighbour);
        traversedEdges.push({ from: current, to: neighbour })
      }
    }
  }

  // Done
  yield {
    state: { ...baseState(), current: undefined },
    highlights: visited.map((n) => ({ index: n, role: 'visited' as const })),
    message: 'algorithms.dfs.steps.done',
    codeLine: 7,
    auxState: { path, nodesVisited },
  };
}

// ---------------------------------------------------------------------------
// Code snippets
// ---------------------------------------------------------------------------
export const codeSnippets: CodeSnippets = {
  typescript: [
    { line: 1,  code: 'function dfs(graph: Record<string, string[]>, start: string): string[] {' },
    { line: 2,  code: '  const visited = new Set<string>();' },
    { line: 3,  code: '  const stack = [start];' },
    { line: 4,  code: '  const order: string[] = [];' },
    { line: 5,  code: '  while (stack.length > 0) {' },
    { line: 6,  code: '    const node = stack.pop()!;' },
    { line: 7,  code: '    if (visited.has(node)) continue;' },
    { line: 8,  code: '    visited.add(node);' },
    { line: 9,  code: '    order.push(node);' },
    { line: 10, code: '    for (const nb of (graph[node] ?? []).slice().reverse()) {' },
    { line: 11, code: '      if (!visited.has(nb)) stack.push(nb);' },
    { line: 12, code: '    }' },
    { line: 13, code: '  }' },
    { line: 14, code: '  return order;' },
    { line: 15, code: '}' },
  ],
  cpp: [
    { line: 1, code: 'void dfs(int graph[][MAX], int n, int start) {' },
    { line: 2, code: '    int visited[MAX] = {0};' },
    { line: 3, code: '    int stack[MAX], top = -1;' },
    { line: 4, code: '    stack[++top] = start;' },
    { line: 5, code: '    while (top >= 0) {' },
    { line: 6, code: '        int node = stack[top--];' },
    { line: 7, code: '        if (visited[node]) continue;' },
    { line: 8, code: '        visited[node] = 1;' },
    { line: 9, code: '        printf("%d ", node);' },
    { line: 10, code: '        for (int i = n - 1; i >= 0; i--)' },
    { line: 11, code: '            if (graph[node][i] && !visited[i]) stack[++top] = i;' },
    { line: 12, code: '    }' },
    { line: 13, code: '}' },
  ],
  csharp: [
    { line: 1, code: 'List<String> dfs(Map<String,List<String>> graph, String start) {' },
    { line: 2, code: '    Set<String> visited = new HashSet<>();' },
    { line: 3, code: '    Deque<String> stack = new ArrayDeque<>();' },
    { line: 4, code: '    List<String> order = new ArrayList<>();' },
    { line: 5, code: '    stack.push(start);' },
    { line: 6, code: '    while (!stack.isEmpty()) {' },
    { line: 7, code: '        String node = stack.pop();' },
    { line: 8, code: '        if (visited.contains(node)) continue;' },
    { line: 9, code: '        visited.add(node);' },
    { line: 10, code: '        order.add(node);' },
    { line: 11, code: '        List<String> nbs = new ArrayList<>(graph.getOrDefault(node, List.of()));' },
    { line: 12, code: '        Collections.reverse(nbs);' },
    { line: 13, code: '        for (String nb : nbs)' },
    { line: 14, code: '            if (!visited.contains(nb)) stack.push(nb);' },
    { line: 15, code: '    }' },
    { line: 16, code: '    return order;' },
    { line: 17, code: '}' },
  ],

  python: [
    { line: 1,  code: 'def dfs(graph: dict, start: str) -> list[str]:' },
    { line: 2,  code: '    visited, stack, order = set(), [start], []' },
    { line: 3,  code: '    while stack:' },
    { line: 4,  code: '        node = stack.pop()' },
    { line: 5,  code: '        if node in visited: continue' },
    { line: 6,  code: '        visited.add(node)' },
    { line: 7,  code: '        order.append(node)' },
    { line: 8,  code: '        for nb in reversed(graph.get(node, [])):' },
    { line: 9,  code: '            if nb not in visited: stack.append(nb)' },
    { line: 10, code: '    return order' },
  ],
  c: [
    { line: 1,  code: 'void dfs(int graph[][MAX], int n, int start) {' },
    { line: 2,  code: '    int visited[MAX] = {0};' },
    { line: 3,  code: '    int stack[MAX], top = -1;' },
    { line: 4,  code: '    stack[++top] = start;' },
    { line: 5,  code: '    while (top >= 0) {' },
    { line: 6,  code: '        int node = stack[top--];' },
    { line: 7,  code: '        if (visited[node]) continue;' },
    { line: 8,  code: '        visited[node] = 1;' },
    { line: 9,  code: '        printf("%d ", node);' },
    { line: 10, code: '        for (int i = n - 1; i >= 0; i--)' },
    { line: 11, code: '            if (graph[node][i] && !visited[i]) stack[++top] = i;' },
    { line: 12, code: '    }' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1,  code: 'List<String> dfs(Map<String,List<String>> graph, String start) {' },
    { line: 2,  code: '    Set<String> visited = new HashSet<>();' },
    { line: 3,  code: '    Deque<String> stack = new ArrayDeque<>();' },
    { line: 4,  code: '    List<String> order = new ArrayList<>();' },
    { line: 5,  code: '    stack.push(start);' },
    { line: 6,  code: '    while (!stack.isEmpty()) {' },
    { line: 7,  code: '        String node = stack.pop();' },
    { line: 8,  code: '        if (visited.contains(node)) continue;' },
    { line: 9,  code: '        visited.add(node);' },
    { line: 10, code: '        order.add(node);' },
    { line: 11, code: '        List<String> nbs = new ArrayList<>(graph.getOrDefault(node, List.of()));' },
    { line: 12, code: '        Collections.reverse(nbs);' },
    { line: 13, code: '        for (String nb : nbs)' },
    { line: 14, code: '            if (!visited.contains(nb)) stack.push(nb);' },
    { line: 15, code: '    }' },
    { line: 16, code: '    return order;' },
    { line: 17, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func dfs(graph map[string][]string, start string) []string {' },
    { line: 2,  code: '    visited := map[string]bool{}' },
    { line: 3,  code: '    stack := []string{start}' },
    { line: 4,  code: '    var order []string' },
    { line: 5,  code: '    for len(stack) > 0 {' },
    { line: 6,  code: '        node := stack[len(stack)-1]; stack = stack[:len(stack)-1]' },
    { line: 7,  code: '        if visited[node] { continue }' },
    { line: 8,  code: '        visited[node] = true' },
    { line: 9,  code: '        order = append(order, node)' },
    { line: 10, code: '        nbs := graph[node]' },
    { line: 11, code: '        for i := len(nbs) - 1; i >= 0; i-- {' },
    { line: 12, code: '            if !visited[nbs[i]] { stack = append(stack, nbs[i]) }' },
    { line: 13, code: '        }' },
    { line: 14, code: '    }' },
    { line: 15, code: '    return order' },
    { line: 16, code: '}' },
  ],
  javascript: [
    { line: 1, code: 'function dfs(graph: Record<string, string[]>, start)[] {' },
    { line: 2, code: '  const visited = new Set();' },
    { line: 3, code: '  const stack = [start];' },
    { line: 4, code: '  const order[] = [];' },
    { line: 5, code: '  while (stack.length > 0) {' },
    { line: 6, code: '    const node = stack.pop()!;' },
    { line: 7, code: '    if (visited.has(node)) continue;' },
    { line: 8, code: '    visited.add(node);' },
    { line: 9, code: '    order.push(node);' },
    { line: 10, code: '    for (const nb of (graph[node] ?? []).slice().reverse()) {' },
    { line: 11, code: '      if (!visited.has(nb)) stack.push(nb);' },
    { line: 12, code: '    }' },
    { line: 13, code: '  }' },
    { line: 14, code: '  return order;' },
    { line: 15, code: '}' },
  ],
};
