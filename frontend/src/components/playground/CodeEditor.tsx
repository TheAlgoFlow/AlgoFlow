'use client'

import dynamic from 'next/dynamic'
import type { Language } from '@/types/execution'
import { useTheme } from '@/i18n/theme-context'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANG_MAP: Record<Language, string> = {
  c:          'c',
  cpp:        'cpp',
  csharp:     'csharp',
  java:       'java',
  python:     'python',
  go:         'go',
  javascript: 'javascript',
  typescript: 'typescript',
}

const DEFAULT_CODE: Record<Language, string> = {
  c: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    printf("%d\\n", result);
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    cout << result << endl;
    return 0;
}
`,
  csharp: `using System;

class Program {
    static int Factorial(int n) {
        if (n <= 1) return 1;
        return n * Factorial(n - 1);
    }

    static void Main() {
        int result = Factorial(5);
        Console.WriteLine(result);
    }
}
`,
  java: `public class Main {
    static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(5);
        System.out.println(result);
    }
}
`,
  python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print(result)
`,
  go: `package main

import "fmt"

func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}

func main() {
    result := factorial(5)
    fmt.Println(result)
}
`,
  javascript: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const result = factorial(5);
console.log(result);
`,
  typescript: `function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const result: number = factorial(5);
console.log(result);
`,
}

type Props = {
  language: Language
  value: string
  onChange: (v: string) => void
  highlightLine?: number
}

export function CodeEditor({ language, value, onChange, highlightLine }: Props) {
  const { theme } = useTheme()

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <MonacoEditor
        height="100%"
        language={LANG_MAP[language]}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={v => onChange(v ?? '')}
        options={{
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: highlightLine ? 'line' : 'none',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 6,
          overviewRulerLanes: 0,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}

export { DEFAULT_CODE }
