// Copia los archivos de runtime de Pyodide desde node_modules a public/pyodide
// para que Vite los incluya en dist/ y queden bundleados dentro del APK (offline).
import { mkdirSync, copyFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'node_modules', 'pyodide')
const dest = join(root, 'public', 'pyodide')

// Archivos necesarios en tiempo de ejecución
const files = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'pyodide-lock.json',
  'python_stdlib.zip',
]

mkdirSync(dest, { recursive: true })

let copied = 0
for (const f of files) {
  const from = join(src, f)
  if (existsSync(from)) {
    copyFileSync(from, join(dest, f))
    copied++
    console.log('  copiado', f)
  } else {
    console.warn('  FALTA', f)
  }
}
console.log(`Pyodide: ${copied}/${files.length} archivos copiados a public/pyodide`)
