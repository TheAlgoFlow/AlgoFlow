# AlgoFlow

> Step through algorithms, not just read about them.

**AlgoFlow** is an interactive algorithm visualizer built with Next.js 16. Watch sorting, searching, graph traversal, data structures, and dynamic programming algorithms execute frame by frame — with full playback controls, complexity references, and side-by-side comparison.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)

---

## Features

- **Step-by-step playback** — scrub forward/backward through every state change in an algorithm's execution
- **25 algorithms** across 4 categories, all with frame-accurate visualization
- **Code panel** — highlighted pseudocode synced to the current execution step
- **Side-by-side compare** — run two algorithms simultaneously with linked or independent playback
- **Complexity reference** — Big-O cheat sheet with time/space complexity for every algorithm
- **Custom input** — test algorithms against your own data
- **Responsive design** — works on desktop and tablet
- **i18n ready** — internationalization support built in

---

## Algorithm Library

| Category | Algorithms |
|---|---|
| **Sorting** | Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort, Counting Sort, Radix Sort |
| **Searching** | Linear Search, Binary Search, BFS, DFS |
| **Data Structures** | Array Operations, Linked List, Stack, Queue, Binary Tree, BST, Hash Table, Min-Heap |
| **Dynamic Programming** | Fibonacci, 0/1 Knapsack, Longest Common Subsequence, Longest Increasing Subsequence, Coin Change |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/your-username/algoflow.git
cd algoflow

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── algorithms/          # Algorithm implementations + frame generators
│   ├── sorting/
│   ├── searching/
│   ├── data-structures/
│   └── dp/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Homepage
│   ├── reference/       # Big-O complexity cheat sheet
│   ├── compare/         # Side-by-side algorithm comparison
│   └── visualizer/
│       └── [category]/
│           └── [slug]/  # Individual visualizer
├── components/
│   ├── atoms/
│   ├── molecules/       # PlaybackControls, CodePanel, SearchOverlay, AlgorithmCard
│   └── organisms/       # Nav
├── engine/              # Core types and frame engine
├── hooks/               # useAlgorithmPlayer playback hook
└── i18n/                # Internationalization context
```

---

## How It Works

Each algorithm is implemented as a **frame generator** — a pure function that produces snapshots of program state at every meaningful step. The visualizer replays these frames, letting you scrub through execution at your own pace.

```ts
// Every algorithm exports a generate() function that produces frames
export function generate(input: number[]): AlgorithmFrame[] {
  const frames: AlgorithmFrame[] = []
  // ... algorithm logic, push a frame on each state change
  return frames
}
```

The `useAlgorithmPlayer` hook manages playback state: play/pause, speed, step navigation, and progress.

---

## Tech Stack

| Tool | Role |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework (App Router) |
| [React 19](https://react.dev) | UI |
| [TypeScript 5](https://typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Recharts](https://recharts.org) | Charts (complexity graphs) |
| [Prism React Renderer](https://github.com/FormidableLabs/prism-react-renderer) | Code highlighting |

---

## Contributing

Contributions are welcome — especially new algorithms and visualizer renderers.

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-algorithm`
3. Add your algorithm in `src/algorithms/<category>/my-algorithm.ts`
4. Register it in `src/algorithms/index.ts`
5. Open a pull request

See the existing algorithm files for the expected shape of `meta`, `generate()`, and the frame types in `src/engine/types.ts`.

---

## License

Apache 2.0 — free to use, fork, and build on. See [LICENSE](./LICENSE) for details.
Copyright 2026 Wide Chain & Co.

---

<p align="center">
  Built for learners, by learners.
</p>
