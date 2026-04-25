# AlgoFlow

Interactive algorithm visualizer with step-by-step code execution across 8 languages.

## Project structure

```
AlgoFlow/
├── frontend/          # Next.js 16 app (React 19, TypeScript, Tailwind CSS 4)
│   ├── src/
│   │   ├── algorithms/      # 31 algorithms across 4 categories
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI atoms, molecules, organisms, visualizers
│   │   ├── engine/          # AlgorithmFrame types + execution model
│   │   ├── hooks/           # useAlgorithmPlayer, useCodeExecution
│   │   ├── i18n/            # EN / PT translations
│   │   └── types/           # Execution trace types (Playground)
│   └── public/
│       ├── locales/         # i18n JSON files
│       └── logos/           # Language SVG logos
└── backend/           # Python FastAPI — code execution engine
    ├── main.py
    ├── executors/
    │   ├── python_executor.py    # sys.settrace step tracer
    │   ├── js_executor.py        # V8 Inspector (CDP) step tracer
    │   ├── ts_executor.py        # esbuild/tsc transpile → JS tracer
    │   ├── c_executor.py         # GCC -g + GDB MI step tracer
    │   ├── go_executor.py        # go build -gcflags -N -l + GDB MI
    │   ├── csharp_executor.py    # dotnet instrumented run
    │   └── java_executor.py      # javac + source instrumentation
    └── requirements.txt
```

## Features

- **Visualizer** — step-by-step animation for 31 algorithms (sorting, searching, data structures, dynamic programming)
- **Code panel** — 8 language tabs per algorithm: C, C++, C#, Java, Python, Go, JavaScript, TypeScript
- **Playground** — write your own code, run it, and watch memory allocation, stack frames, and heap objects evolve step by step (Python Tutor style)
- **Reference** — Big-O cheat sheet, algorithm comparison
- **i18n** — English and Portuguese

## Running with Docker (recommended)

Single command — no toolchain installations needed:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

To deploy with a custom backend URL (e.g. a VPS):

```bash
docker compose build --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com frontend
docker compose up
```

---

## Running locally (manual)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`.

### Backend (required for Playground)

**System requirements:**

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | JavaScript / TypeScript tracing |
| GCC / G++ | any | C / C++ compilation |
| GDB | any | C / C++ / Go step debugging |
| Go | 1.21+ | Go compilation |
| JDK | 11+ | Java compilation |
| .NET SDK | 7+ | C# compilation |
| esbuild *(optional)* | any | Faster TypeScript transpilation |

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend reads `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`).  
Create `frontend/.env.local` to override:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Supported languages

| Language | Visualizer snippets | Playground tracing |
|----------|--------------------|--------------------|
| C | ✓ | ✓ GCC + GDB MI |
| C++ | ✓ | ✓ G++ + GDB MI |
| C# | ✓ | ✓ dotnet + source instrumentation |
| Java | ✓ | ✓ javac + source instrumentation |
| Python | ✓ | ✓ sys.settrace (full heap model) |
| Go | ✓ | ✓ go build + GDB MI |
| JavaScript | ✓ | ✓ Node.js V8 Inspector (CDP) |
| TypeScript | ✓ | ✓ esbuild/tsc → JS tracer |

## Algorithm categories

| Category | Count |
|----------|-------|
| Sorting | 9 (Bubble, Insertion, Selection, Shell, Merge, Quick, Heap, Counting, Radix) |
| Searching | 4 (Linear, Binary, BFS, DFS) |
| Data Structures | 13 (Linked List, Stack, Queue, BST, Min-Heap, Hash Table, B-Tree family…) |
| Dynamic Programming | 5 (Fibonacci, Knapsack, LCS, LIS, Coin Change) |
