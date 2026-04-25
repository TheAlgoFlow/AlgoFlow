import asyncio
import json
import os
import re
import subprocess
import tempfile


def _cdp_val(obj: dict) -> object:
    t = obj.get("type")
    if t in ("number", "boolean", "string"):
        return obj.get("value")
    if t in ("undefined", None):
        return None
    if t == "object":
        if obj.get("subtype") == "null":
            return None
        desc = obj.get("description", "object")
        oid = obj.get("objectId")
        return {"__ref__": oid or desc, "__desc__": desc} if oid else desc
    return str(obj.get("description", obj.get("value", "?")))


async def _trace(code: str, max_steps: int = 500) -> dict:
    with tempfile.NamedTemporaryFile(suffix=".js", mode="w", delete=False, encoding="utf-8") as f:
        f.write(code)
        path = f.name

    try:
        proc = subprocess.Popen(
            ["node", "--inspect-brk=0", path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        ws_url = None
        for _ in range(30):
            line = proc.stderr.readline()
            m = re.search(r"ws://[^\s]+", line)
            if m:
                ws_url = m.group()
                break

        if not ws_url:
            proc.kill()
            return {"trace": [], "error": "Node.js inspector URL not found — is Node.js installed?"}

        import websockets  # type: ignore

        trace = []
        stdout_acc = ""
        responses: dict = {}
        events: asyncio.Queue = asyncio.Queue()
        cid = [1]

        async with websockets.connect(ws_url) as ws:

            async def _recv():
                while True:
                    try:
                        msg = json.loads(await ws.recv())
                        if "id" in msg:
                            responses[msg["id"]] = msg
                        else:
                            await events.put(msg)
                    except Exception:
                        break

            recv_task = asyncio.create_task(_recv())

            async def send(method, params=None):
                rid = cid[0]
                cid[0] += 1
                payload: dict = {"id": rid, "method": method}
                if params:
                    payload["params"] = params
                await ws.send(json.dumps(payload))
                for _ in range(300):
                    if rid in responses:
                        return responses.pop(rid)
                    await asyncio.sleep(0.01)
                return {}

            await send("Runtime.enable")
            await send("Debugger.enable")
            await send("Runtime.runIfWaitingForDebugger")

            steps = 0
            while steps < max_steps:
                try:
                    msg = await asyncio.wait_for(events.get(), timeout=6.0)
                except asyncio.TimeoutError:
                    break

                method = msg.get("method", "")

                if method == "Runtime.consoleAPICalled":
                    parts = [str(a.get("value", a.get("description", ""))) for a in msg["params"].get("args", [])]
                    stdout_acc += " ".join(parts) + "\n"

                elif method == "Debugger.paused":
                    frames = msg["params"].get("callFrames", [])
                    if not frames:
                        await send("Debugger.resume")
                        continue

                    top = frames[0]
                    line_num = top["location"]["lineNumber"] + 1
                    func_name = top.get("functionName") or "<anonymous>"

                    locals_dict: dict = {}
                    heap: dict = {}

                    for scope in top.get("scopeChain", []):
                        if scope["type"] not in ("local", "block"):
                            continue
                        oid = scope.get("object", {}).get("objectId")
                        if not oid:
                            continue
                        resp = await send("Runtime.getProperties",
                                         {"objectId": oid, "ownProperties": True})
                        for prop in resp.get("result", {}).get("result", []):
                            name = prop.get("name", "")
                            if not name or name.startswith("__") or not name.isidentifier():
                                continue
                            v = _cdp_val(prop.get("value", {}))
                            if isinstance(v, dict) and "__ref__" in v:
                                heap[v["__ref__"]] = {"type": "object", "desc": v.get("__desc__", "")}
                            locals_dict[name] = v

                    stack_frames = [
                        {
                            "func_name": f.get("functionName") or "<anonymous>",
                            "line": f["location"]["lineNumber"] + 1,
                            "locals": locals_dict if i == 0 else {},
                        }
                        for i, f in enumerate(frames[:5])
                    ]

                    trace.append({
                        "line": line_num,
                        "event": "line",
                        "func_name": func_name,
                        "stack_frames": stack_frames,
                        "heap": heap,
                        "stdout": stdout_acc,
                    })
                    steps += 1
                    await send("Debugger.stepOver")

                elif method == "Runtime.executionContextDestroyed":
                    break

            recv_task.cancel()

        proc.terminate()
        return {"trace": trace, "error": None}

    except FileNotFoundError:
        return {"trace": [], "error": "Node.js não encontrado. Instale Node.js 18+ e adicione ao PATH."}
    except Exception as e:
        return {"trace": [], "error": str(e)}
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass


def execute_javascript(code: str) -> dict:
    return asyncio.run(_trace(code))
