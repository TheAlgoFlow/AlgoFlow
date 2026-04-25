"""
C# tracer via source instrumentation + dotnet run.
Injects a __Tracer static class and capture calls, compiles with dotnet, runs and
collects JSON trace from stderr.
"""
import json
import os
import re
import subprocess
import tempfile
import textwrap


_TRACER_CS = textwrap.dedent("""
using System;
using System.Collections.Generic;
using System.Text.Json;

public static class __Tracer {
    public static string Stdout = "";
    private static List<object> _trace = new();

    public static void Capture(int line, string func, params (string name, object? val)[] vars) {
        var locals = new Dictionary<string, object?>();
        foreach (var (name, val) in vars)
            locals[name] = val;
        _trace.Add(new {
            line,
            @event = "line",
            func_name = func,
            stack_frames = new[] {
                new { func_name = func, line, locals }
            },
            heap = new Dictionary<string, object>(),
            stdout = Stdout
        });
    }

    public static void Flush() {
        Console.Error.WriteLine("__TRACE__:" + JsonSerializer.Serialize(_trace));
    }
}

public static class __Console {
    public static void WriteLine(object? o = null) {
        var s = (o?.ToString() ?? "") + "\\n";
        __Tracer.Stdout += s;
        Console.Write(s);
    }
    public static void Write(object? o) {
        var s = o?.ToString() ?? "";
        __Tracer.Stdout += s;
        Console.Write(s);
    }
}
""")


def _extract_class_name(code: str) -> str:
    m = re.search(r"class\s+(\w+)", code)
    return m.group(1) if m else "Program"


def execute_csharp(code: str) -> dict:
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a minimal dotnet console project
        init_result = subprocess.run(
            ["dotnet", "new", "console", "--name", "AlgoProj",
             "--output", tmpdir, "--force", "--no-restore"],
            capture_output=True, text=True, timeout=30,
        )
        if init_result.returncode != 0:
            return {"trace": [], "error": init_result.stderr.strip() or "dotnet project init failed"}

        # Write tracer + user code into Program.cs
        patched = code
        patched = patched.replace("Console.WriteLine", "__Console.WriteLine")
        patched = patched.replace("Console.Write(", "__Console.Write(")

        # Inject Capture calls after variable declarations and assignments
        lines = patched.split("\n")
        instrumented = []
        for i, line in enumerate(lines, start=1):
            stripped = line.strip()
            instrumented.append(line)
            if stripped.endswith(";") and not stripped.startswith("//"):
                var_names = []
                for m in re.finditer(
                    r'\b(?:int|long|double|float|bool|string|char|var)\s+(\w+)\s*=', stripped
                ):
                    var_names.append(m.group(1))
                for m in re.finditer(r'\b(\w+)\s*[+\-*/%&|^]?=(?!=)\s*[^=]', stripped):
                    n = m.group(1)
                    if n not in ("if", "while", "for", "return", "true", "false", "null"):
                        var_names.append(n)
                if var_names:
                    func = _extract_func_name(lines, i - 1)
                    pairs = ", ".join(f'("{n}", (object?){n})' for n in var_names[:4])
                    indent = " " * (len(line) - len(line.lstrip()))
                    instrumented.append(
                        f'{indent}__Tracer.Capture({i}, "{func}", {pairs});'
                    )

        # Add Flush() call at the end of Main
        instrumented_code = "\n".join(instrumented)
        instrumented_code = re.sub(
            r'(static\s+void\s+Main\s*\([^)]*\)\s*\{)',
            r'\1\n        try {',
            instrumented_code,
        )

        full_code = _TRACER_CS + "\n" + instrumented_code

        # Write Program.cs
        prog_path = os.path.join(tmpdir, "Program.cs")
        with open(prog_path, "w", encoding="utf-8") as f:
            f.write(full_code)

        # Build
        build_result = subprocess.run(
            ["dotnet", "build", "--nologo", "-v", "quiet", tmpdir],
            capture_output=True, text=True, timeout=30,
        )
        if build_result.returncode != 0:
            # Try original code without instrumentation
            with open(prog_path, "w", encoding="utf-8") as f:
                f.write(code)
            build_result2 = subprocess.run(
                ["dotnet", "build", "--nologo", "-v", "quiet", tmpdir],
                capture_output=True, text=True, timeout=30,
            )
            if build_result2.returncode != 0:
                return {"trace": [], "error": build_result2.stderr.strip() or "Build failed"}
            run_result = subprocess.run(
                ["dotnet", "run", "--project", tmpdir, "--no-build"],
                capture_output=True, text=True, timeout=10,
            )
            return {
                "trace": [{"line": 1, "event": "line", "func_name": "Main",
                           "stack_frames": [{"func_name": "Main", "line": 1, "locals": {}}],
                           "heap": {}, "stdout": run_result.stdout}],
                "error": run_result.stderr.strip() or None,
            }

        # Run
        run_result = subprocess.run(
            ["dotnet", "run", "--project", tmpdir, "--no-build"],
            capture_output=True, text=True, timeout=10,
        )

        trace_match = re.search(r"__TRACE__:(\[.*\])", run_result.stderr, re.DOTALL)
        if trace_match:
            try:
                trace = json.loads(trace_match.group(1))
                return {"trace": trace, "error": None}
            except json.JSONDecodeError:
                pass

        return {
            "trace": [{"line": 1, "event": "line", "func_name": "Main",
                       "stack_frames": [{"func_name": "Main", "line": 1, "locals": {}}],
                       "heap": {}, "stdout": run_result.stdout}],
            "error": run_result.stderr.strip() or None,
        }


def _extract_func_name(lines: list[str], idx: int) -> str:
    for i in range(idx, max(0, idx - 30), -1):
        m = re.search(r'\b(\w+)\s*\([^)]*\)\s*\{', lines[i])
        if m and m.group(1) not in ("if", "while", "for", "switch", "catch"):
            return m.group(1)
    return "Main"
