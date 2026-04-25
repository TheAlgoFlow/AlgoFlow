"""
TypeScript tracer: transpile TS → JS with esbuild (fast) or tsc fallback,
then reuse the existing JS V8 inspector tracer.
"""
import subprocess
import tempfile
import os
from .js_executor import _trace
import asyncio


def _transpile_ts(ts_code: str, tmpdir: str) -> tuple[str | None, str | None]:
    ts_path = os.path.join(tmpdir, "prog.ts")
    js_path = os.path.join(tmpdir, "prog.js")

    with open(ts_path, "w", encoding="utf-8") as f:
        f.write(ts_code)

    # Try esbuild first (fast, no type checking needed for execution)
    result = subprocess.run(
        ["esbuild", ts_path, "--bundle=false", "--outfile=" + js_path,
         "--target=node18", "--format=cjs"],
        capture_output=True, text=True, timeout=10,
    )
    if result.returncode == 0 and os.path.exists(js_path):
        with open(js_path, encoding="utf-8") as f:
            return f.read(), None

    # Fallback: tsc
    tsc_result = subprocess.run(
        ["tsc", "--target", "ES2020", "--module", "commonjs",
         "--strict", "false", "--outDir", tmpdir, ts_path],
        capture_output=True, text=True, timeout=15,
    )
    if os.path.exists(js_path):
        with open(js_path, encoding="utf-8") as f:
            return f.read(), None

    # Last resort: npx ts-node
    return None, (result.stderr or tsc_result.stderr or "Transpilation failed").strip()


def execute_typescript(code: str) -> dict:
    with tempfile.TemporaryDirectory() as tmpdir:
        js_code, err = _transpile_ts(code, tmpdir)
        if err:
            return {"trace": [], "error": err}
        return asyncio.run(_trace(js_code))
