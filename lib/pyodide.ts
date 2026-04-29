'use client'

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInstance>
  }
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (config: { batched: (s: string) => void }) => void
  setStderr: (config: { batched: (s: string) => void }) => void
  loadPackage: (names: string[]) => Promise<void>
  globals: { get: (name: string) => unknown }
}

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/'

let instance: PyodideInstance | null = null
let loadPromise: Promise<PyodideInstance> | null = null

export async function getPyodide(): Promise<PyodideInstance> {
  if (instance) return instance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    // Inject CDN script if not loaded yet
    if (typeof window.loadPyodide !== 'function') {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `${PYODIDE_URL}pyodide.js`
        script.crossOrigin = 'anonymous'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('No se pudo cargar Pyodide'))
        document.head.appendChild(script)
      })
    }

    const py = await window.loadPyodide({ indexURL: PYODIDE_URL })
    instance = py
    return py
  })()

  return loadPromise
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
    return { stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), error: msg }
  }
}
