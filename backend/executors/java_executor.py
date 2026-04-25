"""
Java step tracer via source instrumentation.
Injects a __Tracer helper class and capture calls before each statement,
compiles with javac, runs and captures JSON from stderr.
"""
import json
import os
import re
import subprocess
import tempfile
import textwrap


_TRACER_CLASS = textwrap.dedent("""
import java.util.*;
class __Tracer {
    static List<Map<String,Object>> trace = new ArrayList<>();
    static String stdout = "";
    static void capture(int line, String funcName, Object... pairs) {
        Map<String,Object> step = new LinkedHashMap<>();
        step.put("line", line);
        step.put("event", "line");
        step.put("func_name", funcName);
        step.put("stdout", stdout);
        Map<String,Object> locals = new LinkedHashMap<>();
        for (int i = 0; i + 1 < pairs.length; i += 2) {
            String name = (String) pairs[i];
            Object val  = pairs[i + 1];
            locals.put(name, val == null ? null : val.toString());
        }
        List<Map<String,Object>> frames = new ArrayList<>();
        Map<String,Object> frame = new LinkedHashMap<>();
        frame.put("func_name", funcName);
        frame.put("line", line);
        frame.put("locals", locals);
        frames.add(frame);
        step.put("stack_frames", frames);
        step.put("heap", new HashMap<>());
        trace.add(step);
    }
    static void flush() {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < trace.size(); i++) {
            Map<String,Object> step = trace.get(i);
            sb.append(toJson(step));
            if (i < trace.size()-1) sb.append(",");
        }
        sb.append("]");
        System.err.println("__TRACE__:" + sb);
    }
    static String toJson(Object o) {
        if (o == null) return "null";
        if (o instanceof Boolean || o instanceof Number) return o.toString();
        if (o instanceof String) return "\\"" + ((String)o).replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"") + "\\"";
        if (o instanceof List) {
            List<?> l = (List<?>) o;
            StringBuilder s = new StringBuilder("[");
            for (int i=0;i<l.size();i++){s.append(toJson(l.get(i)));if(i<l.size()-1)s.append(",");}
            return s.append("]").toString();
        }
        if (o instanceof Map) {
            Map<?,?> m = (Map<?,?>) o;
            StringBuilder s = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?,?> e : m.entrySet()) {
                if (!first) s.append(",");
                s.append("\\"").append(e.getKey()).append("\\":");
                s.append(toJson(e.getValue()));
                first = false;
            }
            return s.append("}").toString();
        }
        return "\\"" + o.toString() + "\\"";
    }
}
""")


def _extract_class_name(code: str) -> str:
    m = re.search(r"public\s+class\s+(\w+)", code)
    return m.group(1) if m else "Main"


def _instrument_java(code: str) -> str:
    """
    Simple instrumentation: inject __Tracer.capture() calls before each
    statement-ending semicolon that's inside a method body.
    Also inject __Tracer.flush() before every return/end of main.
    """
    class_name = _extract_class_name(code)

    # Wrap System.out.println to also update __Tracer.stdout
    code = code.replace(
        "System.out.println",
        "__SysPrint.println",
    ).replace(
        "System.out.print(",
        "__SysPrint.print(",
    )

    sys_print_shim = textwrap.dedent(f"""
class __SysPrint {{
    static void println(Object o) {{
        String s = (o == null ? "null" : o.toString()) + "\\n";
        __Tracer.stdout += s;
        System.out.print(s);
    }}
    static void println(String s) {{ println((Object)s); }}
    static void println(int i)    {{ println((Object)i); }}
    static void println(long l)   {{ println((Object)l); }}
    static void println(double d) {{ println((Object)d); }}
    static void println(boolean b){{ println((Object)b); }}
    static void println()         {{ println(""); }}
    static void print(Object o)   {{
        String s = (o == null ? "null" : o.toString());
        __Tracer.stdout += s;
        System.out.print(s);
    }}
    static void print(String s)   {{ print((Object)s); }}
    static void print(int i)      {{ print((Object)i); }}
}}
""")

    instrumented = _TRACER_CLASS + sys_print_shim + code

    # Insert __Tracer.flush() just before the closing brace of main
    instrumented = re.sub(
        r'(public\s+static\s+void\s+main\s*\([^)]*\)\s*\{)',
        r'\1\n    try { ',
        instrumented,
    )
    instrumented = re.sub(
        r'(\}\s*\/\/\s*end\s+main|\n(\s*)\}(\s*\/\/[^\n]*)?\n(\s*)\})',
        lambda m: m.group(0).replace("}", "} finally { __Tracer.flush(); }", 1),
        instrumented,
        count=1,
    )

    return instrumented


def execute_java(code: str) -> dict:
    class_name = _extract_class_name(code)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Write original code instrumented with tracer
        # For simplicity, write the tracer + original code as separate files
        tracer_path = os.path.join(tmpdir, "__Tracer.java")
        sys_print_path = os.path.join(tmpdir, "__SysPrint.java")
        src_path = os.path.join(tmpdir, f"{class_name}.java")

        with open(tracer_path, "w", encoding="utf-8") as f:
            f.write(_TRACER_CLASS)

        with open(sys_print_path, "w", encoding="utf-8") as f:
            f.write(textwrap.dedent("""
class __SysPrint {
    static void println(Object o) {
        String s = (o == null ? "null" : o.toString()) + "\\n";
        __Tracer.stdout += s;
        System.out.print(s);
    }
    static void println(String s) { println((Object)s); }
    static void println(int i)    { println((Object)i); }
    static void println(long l)   { println((Object)l); }
    static void println(double d) { println((Object)d); }
    static void println(boolean b){ println((Object)b); }
    static void println()         { println(""); }
    static void print(Object o) {
        String s = (o == null ? "null" : o.toString());
        __Tracer.stdout += s;
        System.out.print(s);
    }
    static void print(String s) { print((Object)s); }
    static void print(int i)    { print((Object)i); }
}
"""))

        # Patch user code: replace System.out calls and inject trace calls
        patched = code
        patched = patched.replace("System.out.println", "__SysPrint.println")
        patched = patched.replace("System.out.print(", "__SysPrint.print(")

        # Inject __Tracer.capture() after variable declarations and assignments
        # Simple regex approach: after each semicolon in a method, add a capture hint
        # We use line numbers in the original code as reference
        lines = patched.split("\n")
        instrumented_lines = []
        in_method = False
        brace_depth = 0

        for i, line in enumerate(lines, start=1):
            stripped = line.strip()
            instrumented_lines.append(line)

            # Track method entry
            if re.match(r'.*(public|private|protected|static).*\w+\s*\([^)]*\)\s*\{', stripped):
                in_method = True

            if in_method and stripped.endswith(";"):
                # Find variable names on this line for capture
                var_names = []
                # variable declaration: type name = value;
                for m in re.finditer(r'\b(?:int|long|double|float|boolean|String|char|byte|short)\s+(\w+)\s*=', stripped):
                    var_names.append(m.group(1))
                # assignment: name = value;
                for m in re.finditer(r'\b(\w+)\s*[+\-*/%&|^]?=(?!=)\s*[^=]', stripped):
                    n = m.group(1)
                    if n not in ("if", "while", "for", "return", "true", "false") and not n.startswith("__"):
                        var_names.append(n)

                if var_names:
                    pairs = ", ".join(f'"{n}", {n}' for n in var_names[:4])
                    indent = len(line) - len(line.lstrip())
                    instrumented_lines.append(
                        " " * indent + f'__Tracer.capture({i}, "{_extract_func_name(lines, i-1)}", {pairs});'
                    )

            brace_depth += stripped.count("{") - stripped.count("}")
            if brace_depth <= 0:
                in_method = False

        patched = "\n".join(instrumented_lines)

        # Add flush call before closing brace of main method
        patched = re.sub(
            r'(public\s+static\s+void\s+main\s*\(.*?\)\s*\{)',
            r'\1\n        try { ',
            patched,
            flags=re.DOTALL,
        )

        with open(src_path, "w", encoding="utf-8") as f:
            f.write(patched)

        # Compile
        compile_result = subprocess.run(
            ["javac", "-cp", tmpdir, tracer_path, sys_print_path, src_path],
            capture_output=True,
            text=True,
            timeout=20,
            cwd=tmpdir,
        )

        if compile_result.returncode != 0:
            # Fall back: compile original without instrumentation and just run
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)
            compile_result2 = subprocess.run(
                ["javac", src_path],
                capture_output=True,
                text=True,
                timeout=20,
                cwd=tmpdir,
            )
            if compile_result2.returncode != 0:
                return {"trace": [], "error": compile_result2.stderr.strip() or "Compilation failed"}

            run_result = subprocess.run(
                ["java", "-cp", tmpdir, class_name],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tmpdir,
            )
            output = run_result.stdout
            return {
                "trace": [{"line": 1, "event": "line", "func_name": "main",
                           "stack_frames": [{"func_name": "main", "line": 1, "locals": {}}],
                           "heap": {}, "stdout": output}],
                "error": run_result.stderr.strip() or None,
            }

        # Run instrumented code
        run_result = subprocess.run(
            ["java", "-cp", tmpdir, class_name],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=tmpdir,
        )

        # Parse trace from stderr
        trace_json_match = re.search(r"__TRACE__:(\[.*\])", run_result.stderr, re.DOTALL)
        if trace_json_match:
            try:
                trace = json.loads(trace_json_match.group(1))
                return {"trace": trace, "error": None}
            except json.JSONDecodeError:
                pass

        # Fallback: return a single step with program output
        return {
            "trace": [{
                "line": 1,
                "event": "line",
                "func_name": "main",
                "stack_frames": [{"func_name": "main", "line": 1, "locals": {}}],
                "heap": {},
                "stdout": run_result.stdout,
            }],
            "error": run_result.stderr.strip() or None,
        }


def _extract_func_name(lines: list[str], idx: int) -> str:
    for i in range(idx, max(0, idx - 30), -1):
        m = re.search(r'\b(\w+)\s*\([^)]*\)\s*\{', lines[i])
        if m and m.group(1) not in ("if", "while", "for", "switch"):
            return m.group(1)
    return "main"
