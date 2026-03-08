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
  queue?: string[];
  current?: string;
  path?: string[];
};

// ---------------------------------------------------------------------------
// Hardcoded graph
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
  slug: 'bfs',
  category: 'searching',
  nameKey: 'algorithms.bfs.name',
  descriptionKey: 'algorithms.bfs.description',
  complexity: {
    time: { best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
  },
  tags: ['graph', 'level-order', 'shortest-path'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',       title: '#102 Level Order Traversal',           difficulty: 'Medium' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/bfsshortreach/problem',            title: 'BFS: Shortest Reach in a Graph',       difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/binary-tree-level-order-traversal',        title: 'Binary Tree Level Order Traversal',    difficulty: 'Medium' },
  ],
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------
export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const START = 'A';
  const visited: string[] = [];
  const queue: string[] = [START];
  const path: string[] = [];

  const baseState = (): GraphState => ({
    nodes: NODES,
    edges: EDGES,
    visited: [...visited],
    queue: [...queue],
    path: [...path],
  });

  // Initial frame
  yield {
    state: { ...baseState(), current: START },
    highlights: [{ index: START, role: 'active' }],
    message: 'algorithms.bfs.steps.start',
    codeLine: 1,
    auxState: { node: START },
  };

  while (queue.length > 0) {
    const current = queue.shift() as string;

    if (visited.includes(current)) continue;

    visited.push(current);
    path.push(current);

    // Frame: dequeue and visit current node
    yield {
      state: {
        ...baseState(),
        current,
        queue: [...queue],
      },
      highlights: [
        { index: current, role: 'current' },
        ...visited
          .filter((n) => n !== current)
          .map((n) => ({ index: n, role: 'visited' as const })),
        ...queue.map((n) => ({ index: n, role: 'active' as const })),
      ],
      message: 'algorithms.bfs.steps.dequeue',
      codeLine: 3,
      auxState: { node: current },
    };

    const neighbours = ADJ[current] ?? [];
    for (const neighbour of neighbours) {
      if (!visited.includes(neighbour)) {
        queue.push(neighbour);

        // Frame: enqueue a neighbour
        yield {
          state: {
            ...baseState(),
            current,
            queue: [...queue],
          },
          highlights: [
            { index: current, role: 'current' },
            ...visited
              .filter((n) => n !== current)
              .map((n) => ({ index: n, role: 'visited' as const })),
            ...queue.map((n) => ({ index: n, role: 'active' as const })),
          ],
          message: 'algorithms.bfs.steps.enqueue',
          codeLine: 5,
          auxState: { node: neighbour },
        };
      }
    }
  }

  // Done
  yield {
    state: { ...baseState(), current: undefined },
    highlights: visited.map((n) => ({ index: n, role: 'visited' as const })),
    message: 'algorithms.bfs.steps.done',
    codeLine: 7,
    auxState: { path },
  };
}

// ---------------------------------------------------------------------------
// Code snippets
// ---------------------------------------------------------------------------
export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'function bfs(graph: Record<string, string[]>, start: string): string[] {' },
    { line: 2,  code: '  const visited = new Set<string>();' },
    { line: 3,  code: '  const queue = [start];' },
    { line: 4,  code: '  const order: string[] = [];' },
    { line: 5,  code: '  while (queue.length > 0) {' },
    { line: 6,  code: '    const node = queue.shift()!;' },
    { line: 7,  code: '    if (visited.has(node)) continue;' },
    { line: 8,  code: '    visited.add(node);' },
    { line: 9,  code: '    order.push(node);' },
    { line: 10, code: '    for (const nb of graph[node] ?? []) {' },
    { line: 11, code: '      if (!visited.has(nb)) queue.push(nb);' },
    { line: 12, code: '    }' },
    { line: 13, code: '  }' },
    { line: 14, code: '  return order;' },
    { line: 15, code: '}' },
  ],
  python: [
    { line: 1,  code: 'from collections import deque' },
    { line: 2,  code: 'def bfs(graph: dict, start: str) -> list[str]:' },
    { line: 3,  code: '    visited, queue, order = set(), deque([start]), []' },
    { line: 4,  code: '    while queue:' },
    { line: 5,  code: '        node = queue.popleft()' },
    { line: 6,  code: '        if node in visited: continue' },
    { line: 7,  code: '        visited.add(node)' },
    { line: 8,  code: '        order.append(node)' },
    { line: 9,  code: '        for nb in graph.get(node, []):' },
    { line: 10, code: '            if nb not in visited: queue.append(nb)' },
    { line: 11, code: '    return order' },
  ],
  c: [
    { line: 1,  code: 'void bfs(int graph[][MAX], int n, int start) {' },
    { line: 2,  code: '    int visited[MAX] = {0};' },
    { line: 3,  code: '    int queue[MAX], front = 0, back = 0;' },
    { line: 4,  code: '    queue[back++] = start;' },
    { line: 5,  code: '    while (front < back) {' },
    { line: 6,  code: '        int node = queue[front++];' },
    { line: 7,  code: '        if (visited[node]) continue;' },
    { line: 8,  code: '        visited[node] = 1;' },
    { line: 9,  code: '        printf("%d ", node);' },
    { line: 10, code: '        for (int i = 0; i < n; i++)' },
    { line: 11, code: '            if (graph[node][i] && !visited[i]) queue[back++] = i;' },
    { line: 12, code: '    }' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1,  code: 'List<String> bfs(Map<String,List<String>> graph, String start) {' },
    { line: 2,  code: '    Set<String> visited = new HashSet<>();' },
    { line: 3,  code: '    Queue<String> queue = new LinkedList<>();' },
    { line: 4,  code: '    List<String> order = new ArrayList<>();' },
    { line: 5,  code: '    queue.add(start);' },
    { line: 6,  code: '    while (!queue.isEmpty()) {' },
    { line: 7,  code: '        String node = queue.poll();' },
    { line: 8,  code: '        if (visited.contains(node)) continue;' },
    { line: 9,  code: '        visited.add(node);' },
    { line: 10, code: '        order.add(node);' },
    { line: 11, code: '        for (String nb : graph.getOrDefault(node, List.of()))' },
    { line: 12, code: '            if (!visited.contains(nb)) queue.add(nb);' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return order;' },
    { line: 15, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func bfs(graph map[string][]string, start string) []string {' },
    { line: 2,  code: '    visited := map[string]bool{}' },
    { line: 3,  code: '    queue := []string{start}' },
    { line: 4,  code: '    var order []string' },
    { line: 5,  code: '    for len(queue) > 0 {' },
    { line: 6,  code: '        node := queue[0]; queue = queue[1:]' },
    { line: 7,  code: '        if visited[node] { continue }' },
    { line: 8,  code: '        visited[node] = true' },
    { line: 9,  code: '        order = append(order, node)' },
    { line: 10, code: '        for _, nb := range graph[node] {' },
    { line: 11, code: '            if !visited[nb] { queue = append(queue, nb) }' },
    { line: 12, code: '        }' },
    { line: 13, code: '    }' },
    { line: 14, code: '    return order' },
    { line: 15, code: '}' },
  ],
};
