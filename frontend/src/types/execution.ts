export type Language = 'c' | 'cpp' | 'csharp' | 'java' | 'python' | 'go' | 'javascript' | 'typescript'

export type HeapObject =
  | { type: 'list' | 'tuple'; elements: TraceValue[] }
  | { type: 'dict'; pairs: [TraceValue, TraceValue][] }
  | { type: 'set'; elements: TraceValue[] }
  | { type: 'object'; class: string; fields: Record<string, TraceValue> }
  | { type: 'object'; desc: string }

export type TraceValue =
  | null
  | boolean
  | number
  | string
  | { __ref__: string; __desc__?: string }
  | { __type__: string; repr: string }

export type StackFrame = {
  func_name: string
  line: number
  locals: Record<string, TraceValue>
}

export type TraceStep = {
  line: number
  event: 'line' | 'call' | 'return' | 'exception'
  func_name: string
  stack_frames: StackFrame[]
  heap: Record<string, HeapObject>
  stdout: string
  exception_msg?: string
  traceback?: string
}

export type ExecutionResult = {
  trace: TraceStep[]
  error: string | null
}
