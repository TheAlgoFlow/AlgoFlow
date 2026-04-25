import sys
import json
import io
import traceback
from contextlib import redirect_stdout

_SKIP = {"__builtins__", "__name__", "__doc__", "__package__", "__loader__", "__spec__", "__build_class__"}


def _serialize(val, heap: dict, depth: int = 0):
    if depth > 4:
        return {"__type__": "truncated", "repr": str(val)[:60]}

    if val is None or isinstance(val, bool) or isinstance(val, (int, float, str)):
        return val

    oid = str(id(val))

    if isinstance(val, (list, tuple)):
        if oid not in heap:
            heap[oid] = {"__placeholder__": True}
            heap[oid] = {
                "type": "list" if isinstance(val, list) else "tuple",
                "elements": [_serialize(v, heap, depth + 1) for v in val],
            }
        return {"__ref__": oid}

    if isinstance(val, dict):
        if oid not in heap:
            heap[oid] = {"__placeholder__": True}
            heap[oid] = {
                "type": "dict",
                "pairs": [[_serialize(k, heap, depth + 1), _serialize(v, heap, depth + 1)] for k, v in val.items()],
            }
        return {"__ref__": oid}

    if isinstance(val, set):
        if oid not in heap:
            heap[oid] = {"__placeholder__": True}
            heap[oid] = {"type": "set", "elements": [_serialize(v, heap, depth + 1) for v in val]}
        return {"__ref__": oid}

    if hasattr(val, "__dict__") and not callable(val):
        if oid not in heap:
            heap[oid] = {"__placeholder__": True}
            heap[oid] = {
                "type": "object",
                "class": type(val).__name__,
                "fields": {k: _serialize(v, heap, depth + 1) for k, v in vars(val).items() if not k.startswith("__")},
            }
        return {"__ref__": oid}

    return {"__type__": type(val).__name__, "repr": repr(val)[:80]}


def execute_python(code: str, max_steps: int = 500) -> dict:
    trace = []
    heap: dict = {}
    buf = io.StringIO()
    call_stack: list = []
    steps = [0]

    def _locals(frame_locals: dict) -> dict:
        result = {}
        for k, v in frame_locals.items():
            if k in _SKIP or k.startswith("__"):
                continue
            try:
                result[k] = _serialize(v, heap)
            except Exception:
                result[k] = "?"
        return result

    def _heap_snapshot():
        return {k: v for k, v in heap.items() if not (isinstance(v, dict) and "__placeholder__" in v)}

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<string>":
            return tracer
        if steps[0] >= max_steps:
            raise RuntimeError("step limit exceeded")

        if event == "call":
            call_stack.append({"func_name": frame.f_code.co_name, "line": frame.f_lineno, "locals": {}})

        if event in ("line", "call", "return"):
            loc = _locals(frame.f_locals)
            if call_stack:
                call_stack[-1]["locals"] = loc
                call_stack[-1]["line"] = frame.f_lineno

            trace.append({
                "line": frame.f_lineno,
                "event": event,
                "func_name": frame.f_code.co_name,
                "stack_frames": [s.copy() for s in call_stack],
                "heap": _heap_snapshot(),
                "stdout": buf.getvalue(),
            })
            steps[0] += 1

        if event == "return" and call_stack:
            call_stack.pop()

        return tracer

    user_globals: dict = {"__name__": "__main__"}
    try:
        compiled = compile(code, "<string>", "exec")
        sys.settrace(tracer)
        with redirect_stdout(buf):
            exec(compiled, user_globals)
    except RuntimeError as e:
        if "step limit" in str(e):
            trace.append({"line": -1, "event": "exception", "exception_msg": str(e),
                          "stack_frames": [], "heap": {}, "stdout": buf.getvalue()})
    except Exception as e:
        trace.append({
            "line": -1, "event": "exception",
            "exception_msg": f"{type(e).__name__}: {e}",
            "traceback": traceback.format_exc(),
            "stack_frames": list(call_stack),
            "heap": _heap_snapshot(),
            "stdout": buf.getvalue(),
        })
    finally:
        sys.settrace(None)

    return {"trace": trace, "error": None}
