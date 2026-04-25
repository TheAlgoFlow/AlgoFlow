from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

from executors.python_executor import execute_python
from executors.js_executor import execute_javascript
from executors.ts_executor import execute_typescript
from executors.c_executor import execute_c, execute_cpp
from executors.java_executor import execute_java
from executors.go_executor import execute_go
from executors.csharp_executor import execute_csharp

app = FastAPI(title="AlgoFlow Code Tracer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Language = Literal["python", "javascript", "typescript", "c", "cpp", "csharp", "java", "go"]


class ExecuteRequest(BaseModel):
    code: str
    language: Language


@app.post("/execute")
async def execute(req: ExecuteRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code is empty")
    if len(req.code) > 50_000:
        raise HTTPException(status_code=400, detail="Code too large (max 50 KB)")

    try:
        match req.language:
            case "python":     result = execute_python(req.code)
            case "javascript": result = execute_javascript(req.code)
            case "typescript": result = execute_typescript(req.code)
            case "c":          result = execute_c(req.code)
            case "cpp":        result = execute_cpp(req.code)
            case "csharp":     result = execute_csharp(req.code)
            case "java":       result = execute_java(req.code)
            case "go":         result = execute_go(req.code)
            case _:
                raise HTTPException(status_code=400, detail=f"Unsupported language: {req.language}")
    except FileNotFoundError:
        _tools = {
            "python":     "Python 3.11+",
            "javascript": "Node.js 18+",
            "typescript": "Node.js 18+ e esbuild (npm i -g esbuild)",
            "c":          "GCC — no Windows instale MinGW ou MSYS2",
            "cpp":        "G++ — no Windows instale MinGW ou MSYS2",
            "csharp":     ".NET SDK 7+",
            "java":       "JDK 11+",
            "go":         "Go 1.21+",
        }
        hint = _tools.get(req.language, "toolchain necessário")
        raise HTTPException(
            status_code=500,
            detail=f"Ferramenta não encontrada para {req.language}. Instale: {hint}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
