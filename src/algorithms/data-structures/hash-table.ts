import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'hash-table',
  category: 'data-structures',
  nameKey: 'algorithms.hashTable.name',
  descriptionKey: 'algorithms.hashTable.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    operations: [
      { name: 'insert', best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
      { name: 'remove', best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
      { name: 'search', best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    ],
  },
  tags: ['hash', 'key-value', 'O(1)-lookup'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode',   url: 'https://leetcode.com/problems/two-sum/',                                   title: '#1 Two Sum',          difficulty: 'Easy' },
    { platform: 'hackerrank', url: 'https://www.hackerrank.com/challenges/sherlock-and-anagrams/problem',      title: 'Sherlock and Anagrams', difficulty: 'Medium' },
    { platform: 'neetcode',   url: 'https://neetcode.io/problems/two-integer-sum',                             title: 'Two Sum',             difficulty: 'Easy' },
  ],
}

// ── Internal types ────────────────────────────────────────────────────────────

type HashEntry = { key: string; value: string }
type HashTableState = {
  buckets: Array<Array<HashEntry>>
  currentBucket: number | null
  operation: string
}

// ── Shared utilities ──────────────────────────────────────────────────────────

const NUM_BUCKETS = 8

function hashKey(key: string): number {
  let sum = 0
  for (let i = 0; i < key.length; i++) {
    sum += key.charCodeAt(i)
  }
  return sum % NUM_BUCKETS
}

function cloneBuckets(buckets: Array<Array<HashEntry>>): Array<Array<HashEntry>> {
  return buckets.map(bucket => bucket.map(e => ({ ...e })))
}

function emptyBuckets(): Array<Array<HashEntry>> {
  return Array.from({ length: NUM_BUCKETS }, () => [])
}

/** Pre-populated buckets used by search and remove operations */
function prepopulatedBuckets(): Array<Array<HashEntry>> {
  const buckets = emptyBuckets()
  const seed: Array<[string, string]> = [
    ['10', 'val_10'],
    ['20', 'val_20'],
    ['30', 'val_30'],
    ['42', 'val_42'],
    ['55', 'val_55'],
  ]
  for (const [k, v] of seed) {
    buckets[hashKey(k)].push({ key: k, value: v })
  }
  return buckets
}

// ── Top-level demo generator (kept from original) ────────────────────────────

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const buckets = emptyBuckets()

  function makeState(currentBucket: number | null, operation: string): HashTableState {
    return { buckets: cloneBuckets(buckets), currentBucket, operation }
  }

  yield {
    state: makeState(null, 'init'),
    highlights: [],
    message: 'algorithms.hashTable.steps.init',
    codeLine: 1,
  }

  // Insert pairs
  const insertPairs: Array<[string, string]> = [
    ['name', 'Alice'],
    ['age', '30'],
    ['city', 'SP'],
    ['job', 'Dev'],
    ['lang', 'TS'],
  ]

  for (const [key, value] of insertPairs) {
    const bucket = hashKey(key)

    yield {
      state: makeState(bucket, 'hash'),
      highlights: [{ index: bucket, role: 'current' }],
      message: 'algorithms.hashTable.steps.hash',
      codeLine: 3,
      auxState: { key, bucket },
    }

    const isCollision = buckets[bucket].length > 0

    if (isCollision) {
      yield {
        state: makeState(bucket, 'collision'),
        highlights: [{ index: bucket, role: 'compare' }],
        message: 'algorithms.hashTable.steps.collision',
        codeLine: 5,
        auxState: { key, bucket, existing: buckets[bucket].map(e => e.key) },
      }
    }

    buckets[bucket].push({ key, value })

    yield {
      state: makeState(bucket, 'insert'),
      highlights: [{ index: bucket, role: isCollision ? 'swap' : 'current' }],
      message: 'algorithms.hashTable.steps.insert',
      codeLine: isCollision ? 6 : 4,
      auxState: { key, value, bucket },
    }
  }

  // Lookup 'city'
  const lookupKey = 'city'
  const lookupBucket = hashKey(lookupKey)

  yield {
    state: makeState(lookupBucket, 'lookup'),
    highlights: [{ index: lookupBucket, role: 'current' }],
    message: 'algorithms.hashTable.steps.lookup',
    codeLine: 8,
    auxState: { key: lookupKey, bucket: lookupBucket },
  }

  const found = buckets[lookupBucket].find(e => e.key === lookupKey)
  if (found) {
    yield {
      state: makeState(lookupBucket, 'found'),
      highlights: [{ index: lookupBucket, role: 'found' }],
      message: 'algorithms.hashTable.steps.found',
      codeLine: 9,
      auxState: { key: lookupKey, value: found.value },
    }
  }

  // Demonstrate a collision
  const collisionKey = 'gnal'
  const collisionBucket = hashKey(collisionKey)

  yield {
    state: makeState(collisionBucket, 'hash'),
    highlights: [{ index: collisionBucket, role: 'current' }],
    message: 'algorithms.hashTable.steps.hash',
    codeLine: 3,
    auxState: { key: collisionKey, bucket: collisionBucket },
  }

  yield {
    state: makeState(collisionBucket, 'collision'),
    highlights: [{ index: collisionBucket, role: 'compare' }],
    message: 'algorithms.hashTable.steps.collision',
    codeLine: 5,
    auxState: { key: collisionKey, bucket: collisionBucket, existing: buckets[collisionBucket].map(e => e.key) },
  }

  buckets[collisionBucket].push({ key: collisionKey, value: 'demo' })

  yield {
    state: makeState(collisionBucket, 'insert'),
    highlights: [{ index: collisionBucket, role: 'swap' }],
    message: 'algorithms.hashTable.steps.insert',
    codeLine: 6,
    auxState: { key: collisionKey, value: 'demo', bucket: collisionBucket },
  }

  yield {
    state: makeState(null, 'done'),
    highlights: [],
    message: 'algorithms.hashTable.steps.done',
    codeLine: 11,
  }
}

// ── Top-level codeSnippets (kept from original) ───────────────────────────────

export const codeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'const NUM_BUCKETS = 8' },
    { line: 2, code: 'const table: Array<Array<[string, string]>> = Array(NUM_BUCKETS).fill([]).map(() => [])' },
    { line: 3, code: 'function hash(key: string): number {' },
    { line: 4, code: '  let s = 0' },
    { line: 5, code: '  for (const c of key) s += c.charCodeAt(0)' },
    { line: 6, code: '  return s % NUM_BUCKETS' },
    { line: 7, code: '}' },
    { line: 8, code: 'function insert(key: string, val: string) {' },
    { line: 9, code: '  table[hash(key)].push([key, val])  // chaining' },
    { line: 10, code: '}' },
    { line: 11, code: 'function lookup(key: string): string | null {' },
    { line: 12, code: '  const bucket = table[hash(key)]' },
    { line: 13, code: '  return bucket.find(([k]) => k === key)?.[1] ?? null' },
    { line: 14, code: '}' },
  ],
  python: [
    { line: 1, code: 'NUM_BUCKETS = 8' },
    { line: 2, code: 'table = [[] for _ in range(NUM_BUCKETS)]' },
    { line: 3, code: 'def hash_key(key):' },
    { line: 4, code: '    return sum(ord(c) for c in key) % NUM_BUCKETS' },
    { line: 5, code: 'def insert(key, val):' },
    { line: 6, code: '    table[hash_key(key)].append((key, val))' },
    { line: 7, code: 'def lookup(key):' },
    { line: 8, code: '    for k, v in table[hash_key(key)]:' },
    { line: 9, code: '        if k == key: return v' },
    { line: 10, code: '    return None' },
  ],
  c: [
    { line: 1, code: '#define BUCKETS 8' },
    { line: 2, code: 'typedef struct { char key[32]; char val[32]; } Entry;' },
    { line: 3, code: 'Entry table[BUCKETS][10]; int sizes[BUCKETS] = {0};' },
    { line: 4, code: 'int hashKey(const char* key) {' },
    { line: 5, code: '    int s = 0;' },
    { line: 6, code: '    for (int i = 0; key[i]; i++) s += key[i];' },
    { line: 7, code: '    return s % BUCKETS;' },
    { line: 8, code: '}' },
    { line: 9, code: 'void insert(const char* k, const char* v) {' },
    { line: 10, code: '    int b = hashKey(k);' },
    { line: 11, code: '    strcpy(table[b][sizes[b]].key, k);' },
    { line: 12, code: '    strcpy(table[b][sizes[b]++].val, v);' },
    { line: 13, code: '}' },
  ],
  java: [
    { line: 1, code: 'int BUCKETS = 8;' },
    { line: 2, code: 'List<List<String[]>> table = new ArrayList<>();' },
    { line: 3, code: 'for (int i = 0; i < BUCKETS; i++) table.add(new ArrayList<>());' },
    { line: 4, code: 'int hashKey(String key) {' },
    { line: 5, code: '    int s = 0;' },
    { line: 6, code: '    for (char c : key.toCharArray()) s += c;' },
    { line: 7, code: '    return s % BUCKETS;' },
    { line: 8, code: '}' },
    { line: 9, code: 'void insert(String k, String v) {' },
    { line: 10, code: '    table.get(hashKey(k)).add(new String[]{k, v});' },
    { line: 11, code: '}' },
  ],
  go: [
    { line: 1, code: 'const BUCKETS = 8' },
    { line: 2, code: 'type Entry struct{ key, val string }' },
    { line: 3, code: 'var table [BUCKETS][]Entry' },
    { line: 4, code: 'func hashKey(key string) int {' },
    { line: 5, code: '    s := 0' },
    { line: 6, code: '    for _, c := range key { s += int(c) }' },
    { line: 7, code: '    return s % BUCKETS' },
    { line: 8, code: '}' },
    { line: 9, code: 'func insert(k, v string) {' },
    { line: 10, code: '    b := hashKey(k)' },
    { line: 11, code: '    table[b] = append(table[b], Entry{k, v})' },
    { line: 12, code: '}' },
  ],
}

// ── Per-operation generators ──────────────────────────────────────────────────

function* htInsertGenerator(value?: number): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const key = String(val)
  const entryValue = `val_${val}`
  const buckets = emptyBuckets()
  const hashIdx = hashKey(key)

  function makeState(currentBucket: number | null, operation: string): HashTableState {
    return { buckets: cloneBuckets(buckets), currentBucket, operation }
  }

  // Frame 1: show empty buckets
  yield {
    state: makeState(null, 'init'),
    highlights: [],
    message: 'ds.hashTable.insert.step1',
    codeLine: 1,
    auxState: { key, value: entryValue },
  }

  // Frame 2: compute hash, highlight bucket
  yield {
    state: makeState(hashIdx, 'hash'),
    highlights: [{ index: hashIdx, role: 'active', label: 'hash' }],
    message: 'ds.hashTable.insert.step2',
    codeLine: 2,
    auxState: { key, hashIdx },
  }

  // Frame 3: insert into bucket
  buckets[hashIdx].push({ key, value: entryValue })
  yield {
    state: makeState(hashIdx, 'insert'),
    highlights: [{ index: hashIdx, role: 'found', label: 'bucket' }],
    message: 'ds.hashTable.insert.step3',
    codeLine: 3,
    auxState: { key, value: entryValue, hashIdx },
  }
}

function* htSearchGenerator(value?: number): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const key = String(val)
  const buckets = prepopulatedBuckets()
  const hashIdx = hashKey(key)

  function makeState(currentBucket: number | null, operation: string): HashTableState {
    return { buckets: cloneBuckets(buckets), currentBucket, operation }
  }

  // Frame 1: show populated buckets
  yield {
    state: makeState(null, 'init'),
    highlights: [],
    message: 'ds.hashTable.search.step1',
    codeLine: 1,
    auxState: { key },
  }

  // Frame 2: compute hash, highlight bucket
  yield {
    state: makeState(hashIdx, 'hash'),
    highlights: [{ index: hashIdx, role: 'active', label: 'hash' }],
    message: 'ds.hashTable.search.step2',
    codeLine: 2,
    auxState: { key, hashIdx },
  }

  // Frame 3: check bucket contents
  yield {
    state: makeState(hashIdx, 'scan'),
    highlights: [{ index: hashIdx, role: 'current', label: 'i' }],
    message: 'ds.hashTable.search.step3',
    codeLine: 3,
    auxState: { key, hashIdx },
  }

  // Frame 4: found or not found
  const match = buckets[hashIdx].find(e => e.key === key)
  if (match) {
    yield {
      state: makeState(hashIdx, 'found'),
      highlights: [{ index: hashIdx, role: 'found', label: 'found' }],
      message: 'ds.hashTable.search.found',
      codeLine: 4,
      auxState: { key, value: match.value, hashIdx },
    }
  } else {
    yield {
      state: makeState(hashIdx, 'notFound'),
      highlights: [{ index: hashIdx, role: 'inactive', label: 'miss' }],
      message: 'ds.hashTable.search.notFound',
      codeLine: 6,
      auxState: { key, hashIdx },
    }
  }
}

function* htRemoveGenerator(value?: number): Generator<AlgorithmFrame> {
  const val = value ?? 42
  const key = String(val)
  const buckets = prepopulatedBuckets()
  const hashIdx = hashKey(key)

  function makeState(currentBucket: number | null, operation: string): HashTableState {
    return { buckets: cloneBuckets(buckets), currentBucket, operation }
  }

  // Frame 1: show populated buckets
  yield {
    state: makeState(null, 'init'),
    highlights: [],
    message: 'ds.hashTable.remove.step1',
    codeLine: 1,
    auxState: { key },
  }

  // Frame 2: compute hash, highlight bucket
  yield {
    state: makeState(hashIdx, 'hash'),
    highlights: [{ index: hashIdx, role: 'active', label: 'hash' }],
    message: 'ds.hashTable.remove.step2',
    codeLine: 2,
    auxState: { key, hashIdx },
  }

  // Frame 3: filter out key, show updated bucket
  buckets[hashIdx] = buckets[hashIdx].filter(e => e.key !== key)
  yield {
    state: makeState(hashIdx, 'remove'),
    highlights: [{ index: hashIdx, role: 'swap', label: 'del' }],
    message: 'ds.hashTable.remove.step3',
    codeLine: 3,
    auxState: { key, hashIdx },
  }
}

// ── Per-operation codeSnippets ────────────────────────────────────────────────

const insertSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'insert(key: string, val: string): void {' },
    { line: 2, code: '  const i = this.hash(key)' },
    { line: 3, code: '  this.buckets[i].push({ key, val })' },
    { line: 4, code: '}' },
  ],
  python: [
    { line: 1, code: 'def insert(self, key, val):' },
    { line: 2, code: '  i = self.hash(key)' },
    { line: 3, code: '  self.buckets[i].append((key, val))' },
  ],
  c: [
    { line: 1, code: 'void insert(const char* key, const char* val) {' },
    { line: 2, code: '  int i = hashKey(key);' },
    { line: 3, code: '  strcpy(table[i][sizes[i]].key, key);' },
    { line: 4, code: '  strcpy(table[i][sizes[i]++].val, val);' },
    { line: 5, code: '}' },
  ],
  java: [
    { line: 1, code: 'void insert(String key, String val) {' },
    { line: 2, code: '  int i = hash(key);' },
    { line: 3, code: '  buckets.get(i).add(new String[]{key, val});' },
    { line: 4, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (h *HashTable) Insert(key, val string) {' },
    { line: 2, code: '  i := h.hash(key)' },
    { line: 3, code: '  h.buckets[i] = append(h.buckets[i], Entry{key, val})' },
    { line: 4, code: '}' },
  ],
}

const htSearchSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'search(key: string): string | null {' },
    { line: 2, code: '  const i = this.hash(key)' },
    { line: 3, code: '  for (const pair of this.buckets[i]) {' },
    { line: 4, code: '    if (pair.key === key) return pair.val' },
    { line: 5, code: '  }' },
    { line: 6, code: '  return null' },
    { line: 7, code: '}' },
  ],
  python: [
    { line: 1, code: 'def search(self, key):' },
    { line: 2, code: '  i = self.hash(key)' },
    { line: 3, code: '  for k, v in self.buckets[i]:' },
    { line: 4, code: '    if k == key: return v' },
    { line: 5, code: '  return None' },
  ],
  c: [
    { line: 1, code: 'const char* search(const char* key) {' },
    { line: 2, code: '  int i = hashKey(key);' },
    { line: 3, code: '  for (int j = 0; j < sizes[i]; j++) {' },
    { line: 4, code: '    if (!strcmp(table[i][j].key, key)) return table[i][j].val;' },
    { line: 5, code: '  }' },
    { line: 6, code: '  return NULL;' },
    { line: 7, code: '}' },
  ],
  java: [
    { line: 1, code: 'String search(String key) {' },
    { line: 2, code: '  int i = hash(key);' },
    { line: 3, code: '  for (String[] pair : buckets.get(i)) {' },
    { line: 4, code: '    if (pair[0].equals(key)) return pair[1];' },
    { line: 5, code: '  }' },
    { line: 6, code: '  return null;' },
    { line: 7, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (h *HashTable) Search(key string) (string, bool) {' },
    { line: 2, code: '  i := h.hash(key)' },
    { line: 3, code: '  for _, e := range h.buckets[i] {' },
    { line: 4, code: '    if e.key == key { return e.val, true }' },
    { line: 5, code: '  }' },
    { line: 6, code: '  return "", false' },
    { line: 7, code: '}' },
  ],
}

const removeSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'remove(key: string): void {' },
    { line: 2, code: '  const i = this.hash(key)' },
    { line: 3, code: '  this.buckets[i] = this.buckets[i].filter(p => p.key !== key)' },
    { line: 4, code: '}' },
  ],
  python: [
    { line: 1, code: 'def remove(self, key):' },
    { line: 2, code: '  i = self.hash(key)' },
    { line: 3, code: '  self.buckets[i] = [(k,v) for k,v in self.buckets[i] if k != key]' },
  ],
  c: [
    { line: 1, code: 'void removeKey(const char* key) {' },
    { line: 2, code: '  int i = hashKey(key);' },
    { line: 3, code: '  /* shift entries left, decrement sizes[i] */' },
    { line: 4, code: '}' },
  ],
  java: [
    { line: 1, code: 'void remove(String key) {' },
    { line: 2, code: '  int i = hash(key);' },
    { line: 3, code: '  buckets.get(i).removeIf(p -> p[0].equals(key));' },
    { line: 4, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (h *HashTable) Remove(key string) {' },
    { line: 2, code: '  i := h.hash(key)' },
    { line: 3, code: '  h.buckets[i] = slices.DeleteFunc(h.buckets[i], func(e Entry) bool {' },
    { line: 4, code: '    return e.key == key' },
    { line: 5, code: '  })' },
    { line: 6, code: '}' },
  ],
}

// ── dsOperations export ───────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: htInsertGenerator,
    codeSnippets: insertSnippets,
  },
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: htSearchGenerator,
    codeSnippets: htSearchSnippets,
  },
  {
    type: 'remove',
    label: 'Remove',
    takesValue: true,
    generator: htRemoveGenerator,
    codeSnippets: removeSnippets,
  },
]
