import { PythonRunner } from '@/components/editor/PythonRunner'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Playground Python' }

const EXAMPLES = [
  {
    label: 'Hola Mundo',
    code: `# Tu primer programa en Python
print("¡Hola, mundo!")
print("Python es genial 🐍")
`,
  },
  {
    label: 'Variables y tipos',
    code: `nombre = "Ana"
edad = 25
altura = 1.68
es_programadora = True

print(f"Nombre: {nombre}")
print(f"Edad: {edad} años")
print(f"Altura: {altura} m")
print(f"¿Programadora? {es_programadora}")
print(f"Tipo de 'edad': {type(edad).__name__}")
`,
  },
  {
    label: 'Listas y bucles',
    code: `frutas = ["manzana", "banana", "naranja", "mango"]

print("Frutas disponibles:")
for i, fruta in enumerate(frutas, 1):
    print(f"  {i}. {fruta.capitalize()}")

print(f"\\nTotal: {len(frutas)} frutas")

# List comprehension
mayusculas = [f.upper() for f in frutas]
print("En mayúsculas:", mayusculas)
`,
  },
  {
    label: 'Funciones',
    code: `def saludar(nombre, idioma="es"):
    saludos = {
        "es": f"¡Hola, {nombre}!",
        "en": f"Hello, {nombre}!",
        "pt": f"Olá, {nombre}!",
    }
    return saludos.get(idioma, f"Hola, {nombre}!")

print(saludar("María"))
print(saludar("John", "en"))
print(saludar("Pedro", "pt"))

# Función con *args
def suma(*numeros):
    return sum(numeros)

print(f"\\n1 + 2 + 3 + 4 = {suma(1, 2, 3, 4)}")
`,
  },
  {
    label: 'Clases',
    code: `class Persona:
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad

    def saludar(self):
        return f"Hola, soy {self.nombre} y tengo {self.edad} años."

    def __repr__(self):
        return f"Persona('{self.nombre}', {self.edad})"

class Programadora(Persona):
    def __init__(self, nombre, edad, lenguaje):
        super().__init__(nombre, edad)
        self.lenguaje = lenguaje

    def saludar(self):
        base = super().saludar()
        return f"{base} Programo en {self.lenguaje}."

ana = Programadora("Ana", 28, "Python")
print(ana.saludar())
print(repr(ana))
`,
  },
]

export default function PlaygroundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Playground Python</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Experimenta con Python directamente en el navegador. No necesitas instalar nada.
        </p>
      </div>

      {/* Info de Pyodide */}
      <div className="mb-6 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <span className="text-xl">🐍</span>
        <div>
          <p className="text-blue-300 text-sm font-medium">Python real en el navegador</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Usamos <strong className="text-slate-300">Pyodide</strong> — CPython compilado a WebAssembly.
            La primera ejecución tarda unos segundos mientras carga el runtime (~10 MB).
            Las siguientes son inmediatas.
          </p>
        </div>
      </div>

      {/* Editor principal */}
      <PythonRunner
        initialCode={EXAMPLES[0].code}
        title="playground.py"
        minHeight="280px"
      />

      {/* Ejemplos rápidos */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Ejemplos para practicar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {EXAMPLES.slice(1).map(ex => (
            <div
              key={ex.label}
              className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <div className="px-4 py-2 bg-[#161B22] border-b border-slate-700">
                <span className="text-sm font-medium text-slate-300">{ex.label}</span>
              </div>
              <PythonRunner
                initialCode={ex.code}
                title={`${ex.label.toLowerCase().replace(/ /g, '_')}.py`}
                minHeight="160px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
