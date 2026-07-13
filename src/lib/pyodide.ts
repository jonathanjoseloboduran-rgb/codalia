// Carga Pyodide desde los archivos bundleados en /pyodide (offline).
// Usa import dinámico con @vite-ignore para que Vite NO intente empaquetar
// pyodide.mjs (lo carga tal cual en runtime, que es lo que funciona en el WebView).

import { explainPyError } from './pyErrors'

interface PyodideAPI {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched: (s: string) => void }) => void
  setStderr: (opts: { batched: (s: string) => void }) => void
}

let instance: PyodideAPI | null = null
let loadingPromise: Promise<PyodideAPI> | null = null

export function isPyodideReady(): boolean {
  return instance !== null
}

export async function getPyodide(): Promise<PyodideAPI> {
  if (instance) return instance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const indexURL = new URL('pyodide/', document.baseURI).href
    // @vite-ignore evita que Vite transforme/empaquete el módulo
    const mod = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)
    const py = await mod.loadPyodide({ indexURL })
    instance = py as PyodideAPI
    return instance
  })()

  return loadingPromise
}

export interface RunResult {
  stdout: string
  stderr: string
  error: string | null
}

export async function runPython(code: string): Promise<RunResult> {
  const py = await getPyodide()
  let stdout = ''
  let stderr = ''
  py.setStdout({ batched: (s: string) => { stdout += s + '\n' } })
  py.setStderr({ batched: (s: string) => { stderr += s + '\n' } })

  try {
    await py.runPythonAsync(code)
    return { stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), error: cleanError(msg) }
  }
}

// ─── Autocorrección de ejercicios ───────────────────────────────────────────

export interface ExerciseTest {
  call: string       // expresión Python a evaluar, ej: "suma(2, 3)"
  expected: string   // resultado esperado como literal Python, ej: "5"
}

export interface TestResult {
  call: string
  ok: boolean
  actual: string
  expected: string
}

// Quédate con la última línea útil del traceback y explicala en español
function cleanError(msg: string): string {
  const lines = msg.trim().split('\n').filter(Boolean)
  const last = lines[lines.length - 1] ?? msg
  return explainPyError(last)
}

// Ejecuta el código del usuario y corre los tests contra él
export async function runExercise(
  userCode: string,
  tests: ExerciseTest[],
): Promise<{ results: TestResult[]; error: string | null }> {
  const py = await getPyodide()
  py.setStdout({ batched: () => {} })
  py.setStderr({ batched: () => {} })

  // Pasamos los tests en base64 (UTF-8 seguro) para que comillas, barras
  // invertidas o triples comillas en los tests no rompan el script de Python.
  const testsJson = JSON.stringify(tests)
  const testsB64 = btoa(unescape(encodeURIComponent(testsJson)))
  const script = `
${userCode}

import json as _json, base64 as _b64
_TESTS = _json.loads(_b64.b64decode("${testsB64}").decode("utf-8"))
_results = []
for _t in _TESTS:
    try:
        _actual = eval(_t["call"])
        _exp = eval(_t["expected"])
        _results.append({"call": _t["call"], "ok": bool(_actual == _exp), "actual": repr(_actual), "expected": repr(_exp)})
    except Exception as _e:
        _results.append({"call": _t["call"], "ok": False, "actual": "error: " + str(_e), "expected": _t["expected"]})
_json.dumps(_results)
`

  try {
    const ret = await py.runPythonAsync(script)
    const results = JSON.parse(ret as string) as TestResult[]
    return { results, error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { results: [], error: cleanError(msg) }
  }
}
