import subprocess
import tempfile
import os
import re


def _parse_typed(v: str):
    v = v.strip()
    try:
        return int(v)
    except ValueError:
        pass
    try:
        return float(v)
    except ValueError:
        pass
    if v in ("true", "false"):
        return v == "true"
    if v.startswith('"') and v.endswith('"'):
        return v[1:-1]
    return v


def _run_gdb_go(exe_path: str, max_steps: int = 300) -> dict:
    trace = []

    proc = subprocess.Popen(
        ["gdb", "--interpreter=mi2", "--quiet", exe_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        bufsize=1,
    )

    def read_to_prompt():
        lines = []
        while True:
            line = proc.stdout.readline()
            if not line:
                break
            line = line.rstrip("\n")
            lines.append(line)
            if line == "(gdb)":
                break
        return lines

    def cmd(c: str):
        try:
            proc.stdin.write(c + "\n")
            proc.stdin.flush()
        except BrokenPipeError:
            return []
        return read_to_prompt()

    def parse_line(lines):
        for l in lines:
            m = re.search(r'line="(\d+)"', l)
            if m:
                return int(m.group(1))
        return -1

    def is_exited(lines):
        return any("exited" in l or "^error" in l for l in lines)

    def get_locals():
        out = cmd("-stack-list-variables --simple-values")
        variables = {}
        for line in out:
            if not line.startswith("^done"):
                continue
            for m in re.finditer(r'\{name="([^"]+)",(?:type="[^"]+",)?value="([^"]*)"\}', line):
                name = m.group(1)
                if not name.startswith("~") and not name.startswith("&"):
                    variables[name] = _parse_typed(m.group(2))
        return variables

    def get_frames():
        out = cmd("-stack-list-frames")
        frames = []
        for line in out:
            if "^done" not in line:
                continue
            for m in re.finditer(r'frame=\{level="(\d+)",[^}]*func="([^"]+)",[^}]*line="(\d+)"', line):
                frames.append({"func_name": m.group(2), "line": int(m.group(3)), "locals": {}})
        return frames

    try:
        read_to_prompt()
        cmd("-break-insert main.main")
        out = cmd("-exec-run")

        if is_exited(out):
            return {"trace": trace, "error": "Program exited immediately"}

        current_line = parse_line(out)

        for _ in range(max_steps):
            if current_line <= 0:
                break

            locals_dict = get_locals()
            frames = get_frames()
            if frames:
                frames[0]["locals"] = locals_dict

            trace.append({
                "line": current_line,
                "event": "line",
                "func_name": frames[0]["func_name"] if frames else "main",
                "stack_frames": frames,
                "heap": {},
                "stdout": "",
            })

            out = cmd("-exec-next")
            if is_exited(out):
                break
            next_line = parse_line(out)
            if next_line == current_line and not any("stopped" in l for l in out):
                break
            current_line = next_line

        cmd("-gdb-quit")
    except FileNotFoundError:
        return {"trace": trace, "error": "GDB não encontrado. No Windows instale MinGW/MSYS2 e adicione gdb ao PATH."}
    except Exception as e:
        return {"trace": trace, "error": str(e)}
    finally:
        try:
            proc.terminate()
        except Exception:
            pass

    return {"trace": trace, "error": None}


def execute_go(code: str) -> dict:
    with tempfile.TemporaryDirectory() as tmpdir:
        src = os.path.join(tmpdir, "main.go")
        exe = os.path.join(tmpdir, "prog")

        with open(src, "w", encoding="utf-8") as f:
            f.write(code)

        # Compile with debug info, disable optimisations
        result = subprocess.run(
            ["go", "build", "-gcflags=all=-N -l", "-o", exe, src],
            capture_output=True,
            text=True,
            timeout=20,
        )

        if result.returncode != 0:
            return {"trace": [], "error": result.stderr.strip() or "Compilation failed"}

        return _run_gdb_go(exe)
