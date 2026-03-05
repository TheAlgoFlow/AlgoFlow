import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'hash-table',
  category: 'data-structures',
  nameKey: 'algorithms.hashTable.name',
  descriptionKey: 'algorithms.hashTable.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
  },
  tags: ['hash', 'key-value', 'O(1)-lookup'],
  defaultInput: null,
}

type HashEntry = { key: string; value: string }
type HashTableState = {
  buckets: Array<Array<HashEntry>>
  currentBucket: number | null
  operation: string
}

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

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  const buckets: Array<Array<HashEntry>> = Array.from({ length: NUM_BUCKETS }, () => [])

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

    // Show hashing step
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

  // Demonstrate a collision: 'lang' and show the chain
  // 'lang' has already been inserted; insert 'gnal' which has the same char sum
  // l=108,a=97,n=110,g=103 → sum=418 → 418%8=2
  // g=103,n=110,a=97,l=108 → sum=418 → 418%8=2 (same bucket)
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
