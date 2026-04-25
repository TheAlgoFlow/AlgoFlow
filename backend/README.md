# AlgoFlow — Code Tracer Backend

Python FastAPI backend that executes user code step-by-step and returns execution traces.

## Requirements

| Tool | Purpose |
|------|---------|
| Python 3.11+ | Backend runtime |
| Node.js 18+  | JavaScript tracing (V8 Inspector) |
| GCC / G++    | C / C++ compilation |
| GDB          | C / C++ step debugging |
| JDK 11+      | Java compilation + execution |

## Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

The frontend expects the backend at `http://localhost:8000` by default.
Override with `NEXT_PUBLIC_BACKEND_URL` in `.env.local`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/execute` | Execute code and return trace |
| GET  | `/health`  | Health check |

### POST `/execute`

```json
{
  "code": "x = 5\nprint(x)",
  "language": "python"
}
```

Supported languages: `python`, `javascript`, `c`, `cpp`, `java`

### Response

```json
{
  "trace": [
    {
      "line": 1,
      "event": "line",
      "func_name": "<module>",
      "stack_frames": [
        {
          "func_name": "<module>",
          "line": 1,
          "locals": { "x": 5 }
        }
      ],
      "heap": {},
      "stdout": ""
    }
  ],
  "error": null
}
```

## Language notes

- **Python**: uses `sys.settrace()` — full step trace with heap objects
- **JavaScript**: uses Node.js V8 Inspector (CDP) — step trace with scope variables
- **C / C++**: uses GCC `-g` flag + GDB MI interface — line-level trace with locals
- **Java**: source instrumentation + `javac`/`java` — variable capture per statement
