import type { AlgorithmMeta, AlgorithmFrame, CodeSnippets, DSOperationConfig } from '@/engine/types'

export const meta: AlgorithmMeta = {
  slug: 'ext-hash',
  category: 'data-structures',
  nameKey: 'algorithms.extHash.name',
  descriptionKey: 'algorithms.extHash.description',
  complexity: {
    time: { best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    operations: [
      { name: 'search', best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
      { name: 'insert', best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    ],
  },
  tags: ['hash', 'dynamic', 'directory', 'extensible', 'database'],
  defaultInput: null,
  exercises: [
    { platform: 'leetcode', url: 'https://leetcode.com/problems/design-hashmap/', title: '#706 Design HashMap', difficulty: 'Easy' },
    { platform: 'leetcode', url: 'https://leetcode.com/problems/design-hashset/', title: '#705 Design HashSet', difficulty: 'Easy' },
  ],
}

// Bucket capacity
const BUCKET_CAP = 2

export type EHashBucket = {
  id: number
  keys: number[]
  localDepth: number
}

export type EHashState = {
  directory: number[]  // directory[i] = bucket id
  buckets: EHashBucket[]
  globalDepth: number
  activeDir: number | null
  activeBucket: number | null
}

function hash(key: number, depth: number): number {
  return key & ((1 << depth) - 1)
}

function makeBase(): EHashState {
  // globalDepth=1, 2 buckets, some pre-inserted values
  // directory: [0]→bucket0, [1]→bucket1
  // bucket0: keys=[2,4], localDepth=1
  // bucket1: keys=[1,3], localDepth=1
  return {
    directory: [0, 1],
    buckets: [
      { id: 0, keys: [2, 4], localDepth: 1 },
      { id: 1, keys: [1, 3], localDepth: 1 },
    ],
    globalDepth: 1,
    activeDir: null,
    activeBucket: null,
  }
}

function cloneState(s: EHashState): EHashState {
  return {
    directory: [...s.directory],
    buckets: s.buckets.map(b => ({ ...b, keys: [...b.keys] })),
    globalDepth: s.globalDepth,
    activeDir: s.activeDir,
    activeBucket: s.activeBucket,
  }
}

function snap(s: EHashState, activeDir: number | null, activeBucket: number | null): EHashState {
  return { ...cloneState(s), activeDir, activeBucket }
}

function getBucket(state: EHashState, id: number): EHashBucket {
  return state.buckets.find(b => b.id === id)!
}

// ─── Search ──────────────────────────────────────────────────────────────────

function* searchGenerator(value = 3, initialState?: unknown): Generator<AlgorithmFrame> {
  const state: EHashState = initialState ? cloneState(initialState as EHashState) : makeBase()
  let nextBucketId = Math.max(...state.buckets.map(b => b.id)) + 1

  yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.search.start', codeLine: 1, auxState: { v: value } }

  const dirIdx = hash(value, state.globalDepth)

  yield { state: snap(state, dirIdx, null), highlights: [], message: 'ds.extHash.search.hash', codeLine: 2, auxState: { v: value, h: dirIdx, depth: state.globalDepth } }

  const bucketId = state.directory[dirIdx]
  const bucket = getBucket(state, bucketId)

  yield { state: snap(state, dirIdx, bucketId), highlights: [], message: 'ds.extHash.search.bucket', codeLine: 3, auxState: { v: value, bucket: bucketId } }

  if (bucket.keys.includes(value)) {
    yield { state: snap(state, dirIdx, bucketId), highlights: [{ index: bucketId, role: 'found', label: 'found' }], message: 'ds.extHash.search.found', codeLine: 4, auxState: { v: value } }
  } else {
    yield { state: snap(state, dirIdx, bucketId), highlights: [], message: 'ds.extHash.search.notFound', codeLine: 5, auxState: { v: value } }
  }

  void nextBucketId
}

// ─── Insert ──────────────────────────────────────────────────────────────────

function* insertGenerator(value = 5, initialState?: unknown): Generator<AlgorithmFrame> {
  const state: EHashState = initialState ? cloneState(initialState as EHashState) : makeBase()
  let nextBucketId = Math.max(...state.buckets.map(b => b.id)) + 1

  yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.insert.start', codeLine: 1, auxState: { v: value } }

  // Compute hash
  const dirIdx = hash(value, state.globalDepth)

  yield { state: snap(state, dirIdx, null), highlights: [], message: 'ds.extHash.insert.hash', codeLine: 2, auxState: { v: value, h: dirIdx, depth: state.globalDepth } }

  const bucketId = state.directory[dirIdx]
  const bucket = getBucket(state, bucketId)

  yield { state: snap(state, dirIdx, bucketId), highlights: [], message: 'ds.extHash.insert.bucket', codeLine: 3, auxState: { v: value, bucket: bucketId } }

  // No overflow
  if (bucket.keys.length < BUCKET_CAP) {
    bucket.keys.push(value)
    bucket.keys.sort((a, b) => a - b)

    yield { state: snap(state, dirIdx, bucketId), highlights: [{ index: bucketId, role: 'found', label: 'inserted' }], message: 'ds.extHash.insert.placed', codeLine: 4, auxState: { v: value } }
    yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.insert.done', codeLine: 8, auxState: { v: value } }
    return
  }

  // Overflow → split bucket
  yield { state: snap(state, dirIdx, bucketId), highlights: [{ index: bucketId, role: 'swap', label: 'overflow' }], message: 'ds.extHash.insert.overflow', codeLine: 5, auxState: { v: value, bucket: bucketId } }

  if (bucket.localDepth === state.globalDepth) {
    // Double the directory
    yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.insert.doubleDir', codeLine: 6, auxState: { globalDepth: state.globalDepth + 1 } }

    state.globalDepth++
    state.directory = [...state.directory, ...state.directory]  // double

    yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.insert.doubled', codeLine: 7, auxState: { globalDepth: state.globalDepth } }
  }

  // Split the overflowing bucket
  bucket.localDepth++
  const newBucket: EHashBucket = { id: nextBucketId++, keys: [], localDepth: bucket.localDepth }
  state.buckets.push(newBucket)

  // Redistribute all keys including the new value
  const allKeys = [...bucket.keys, value]
  bucket.keys = []
  newBucket.keys = []

  for (const k of allKeys) {
    const targetIdx = hash(k, bucket.localDepth)
    const baseIdx = targetIdx & ((1 << (bucket.localDepth - 1)) - 1)
    if (targetIdx === baseIdx) {
      bucket.keys.push(k)
    } else {
      newBucket.keys.push(k)
    }
  }
  bucket.keys.sort((a, b) => a - b)
  newBucket.keys.sort((a, b) => a - b)

  // Repoint directory entries
  for (let i = 0; i < state.directory.length; i++) {
    if (state.directory[i] === bucketId) {
      const maskedIdx = i & ((1 << bucket.localDepth) - 1)
      const oldPattern = dirIdx & ((1 << (bucket.localDepth - 1)) - 1)
      if ((maskedIdx & ((1 << (bucket.localDepth - 1)) - 1)) === oldPattern) {
        if (maskedIdx !== (dirIdx & ((1 << bucket.localDepth) - 1))) {
          state.directory[i] = newBucket.id
        }
      }
    }
  }

  yield { state: snap(state, null, newBucket.id), highlights: [{ index: newBucket.id, role: 'active', label: 'new bucket' }], message: 'ds.extHash.insert.split', codeLine: 8, auxState: { v: value } }

  yield { state: snap(state, null, null), highlights: [], message: 'ds.extHash.insert.done', codeLine: 9, auxState: { v: value } }
}

// ─── Code snippets ───────────────────────────────────────────────────────────

const searchSnippets: CodeSnippets = {
  ts: [
    { line: 1, code: 'search(key: number): boolean {' },
    { line: 2, code: '  const idx = key & ((1 << this.globalDepth) - 1)' },
    { line: 3, code: '  const bucket = this.directory[idx]' },
    { line: 4, code: '  return bucket.keys.includes(key)' },
    { line: 5, code: '}' },
  ],
  python: [
    { line: 1, code: 'def search(self, key):' },
    { line: 2, code: '    idx = key & ((1 << self.global_depth) - 1)' },
    { line: 3, code: '    bucket = self.directory[idx]' },
    { line: 4, code: '    return key in bucket.keys' },
  ],
  c: [
    { line: 1, code: 'int ehash_search(EHash* t, int key) {' },
    { line: 2, code: '    int idx = key & ((1 << t->global_depth) - 1);' },
    { line: 3, code: '    Bucket* b = t->directory[idx];' },
    { line: 4, code: '    for (int i = 0; i < b->n; i++)' },
    { line: 5, code: '        if (b->keys[i] == key) return 1;' },
    { line: 6, code: '    return 0;' },
    { line: 7, code: '}' },
  ],
  java: [
    { line: 1, code: 'boolean search(int key) {' },
    { line: 2, code: '    int idx = key & ((1 << globalDepth) - 1);' },
    { line: 3, code: '    Bucket b = directory[idx];' },
    { line: 4, code: '    return b.keys.contains(key);' },
    { line: 5, code: '}' },
  ],
  go: [
    { line: 1, code: 'func (h *EHash) Search(key int) bool {' },
    { line: 2, code: '    idx := key & ((1 << h.GlobalDepth) - 1)' },
    { line: 3, code: '    b := h.Directory[idx]' },
    { line: 4, code: '    for _, k := range b.Keys { if k == key { return true } }' },
    { line: 5, code: '    return false' },
    { line: 6, code: '}' },
  ],
}

const insertSnippets: CodeSnippets = {
  ts: [
    { line: 1,  code: 'insert(key: number): void {' },
    { line: 2,  code: '  const idx = key & ((1 << this.globalDepth) - 1)' },
    { line: 3,  code: '  const b = this.directory[idx]' },
    { line: 4,  code: '  if (b.keys.length < CAPACITY) { b.keys.push(key); return }' },
    { line: 5,  code: '  // Overflow: split bucket' },
    { line: 6,  code: '  if (b.localDepth === this.globalDepth) this.doubleDirectory()' },
    { line: 7,  code: '  b.localDepth++' },
    { line: 8,  code: '  const b2 = new Bucket(b.localDepth)' },
    { line: 9,  code: '  this.redistribute(b, b2, [key])' },
    { line: 10, code: '  this.updateDirectory(b, b2)' },
    { line: 11, code: '}' },
  ],
  python: [
    { line: 1,  code: 'def insert(self, key):' },
    { line: 2,  code: '    idx = key & ((1 << self.global_depth) - 1)' },
    { line: 3,  code: '    b = self.directory[idx]' },
    { line: 4,  code: '    if len(b.keys) < CAPACITY:' },
    { line: 5,  code: '        b.keys.append(key); return' },
    { line: 6,  code: '    if b.local_depth == self.global_depth:' },
    { line: 7,  code: '        self.double_directory()' },
    { line: 8,  code: '    b2 = Bucket(b.local_depth + 1)' },
    { line: 9,  code: '    self.redistribute(b, b2, key)' },
    { line: 10, code: '    self.update_directory(b, b2)' },
  ],
  c: [
    { line: 1,  code: 'void ehash_insert(EHash* t, int key) {' },
    { line: 2,  code: '    int idx = key & ((1 << t->gd) - 1);' },
    { line: 3,  code: '    Bucket* b = t->dir[idx];' },
    { line: 4,  code: '    if (b->n < CAP) { b->keys[b->n++] = key; return; }' },
    { line: 5,  code: '    if (b->ld == t->gd) double_dir(t);' },
    { line: 6,  code: '    b->ld++;' },
    { line: 7,  code: '    Bucket* b2 = new_bucket(b->ld);' },
    { line: 8,  code: '    redistribute(t, b, b2, key);' },
    { line: 9,  code: '    update_dir(t, b, b2);' },
    { line: 10, code: '}' },
  ],
  java: [
    { line: 1,  code: 'void insert(int key) {' },
    { line: 2,  code: '    int idx = key & ((1 << globalDepth) - 1);' },
    { line: 3,  code: '    Bucket b = directory[idx];' },
    { line: 4,  code: '    if (b.keys.size() < CAP) { b.keys.add(key); return; }' },
    { line: 5,  code: '    if (b.localDepth == globalDepth) doubleDirectory();' },
    { line: 6,  code: '    b.localDepth++;' },
    { line: 7,  code: '    Bucket b2 = new Bucket(b.localDepth);' },
    { line: 8,  code: '    redistribute(b, b2, key);' },
    { line: 9,  code: '    updateDirectory(b, b2);' },
    { line: 10, code: '}' },
  ],
  go: [
    { line: 1,  code: 'func (h *EHash) Insert(key int) {' },
    { line: 2,  code: '    idx := key & ((1 << h.GlobalDepth) - 1)' },
    { line: 3,  code: '    b := h.Directory[idx]' },
    { line: 4,  code: '    if len(b.Keys) < CAP { b.Keys = append(b.Keys, key); return }' },
    { line: 5,  code: '    if b.LocalDepth == h.GlobalDepth { h.DoubleDirectory() }' },
    { line: 6,  code: '    b.LocalDepth++' },
    { line: 7,  code: '    b2 := &Bucket{LocalDepth: b.LocalDepth}' },
    { line: 8,  code: '    h.Redistribute(b, b2, key)' },
    { line: 9,  code: '    h.UpdateDirectory(b, b2)' },
    { line: 10, code: '}' },
  ],
}

// ─── dsOperations ────────────────────────────────────────────────────────────

export const dsOperations: DSOperationConfig[] = [
  {
    type: 'search',
    label: 'Search',
    takesValue: true,
    generator: (value = 3, initialState?: unknown) => searchGenerator(value, initialState),
    codeSnippets: searchSnippets,
  },
  {
    type: 'insert',
    label: 'Insert',
    takesValue: true,
    generator: (value = 5, initialState?: unknown) => insertGenerator(value, initialState),
    codeSnippets: insertSnippets,
  },
]

export function* generator(_input: unknown): Generator<AlgorithmFrame> {
  yield* searchGenerator(3)
}

export const codeSnippets: CodeSnippets = searchSnippets
