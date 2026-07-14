# 🐍 Codalia

App para **aprender Python desde el teléfono**, con un intérprete real que corre **dentro del navegador** — sin servidor, sin instalar nada.

## ✨ Funciones

- **Curso interactivo en español**: lecciones con teoría + ejercicios de código verificados al instante.
- **Playground**: editor Python completo (resaltado, autocompletado) para experimentar libremente.
- **Quizzes y rutas de aprendizaje** con progreso, rachas y badges.
- **Funciona offline**: el intérprete y el contenido del curso van empaquetados en la app.

## 🛠️ Cómo funciona

La pieza central es **[Pyodide](https://pyodide.org/)** — CPython compilado a WebAssembly. El código del alumno se ejecuta localmente en el dispositivo, lo que permite:

- feedback inmediato sin latencia de red ni costo de servidor,
- uso 100% offline,
- ejecutar código arbitrario del usuario sin riesgo (sandbox del navegador).

```
React (screens/) ──► CodeMirror (editor Python)
      │                    │
      ▼                    ▼
 Curso/quizzes JSON   Pyodide (WASM) ── ejecuta y valida el código
      │
      ▼
 Supabase (perfil, progreso) + Capacitor Preferences (local)
```

## 📦 Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Editor**: CodeMirror 6 (`@codemirror/lang-python`)
- **Runtime Python**: Pyodide (WebAssembly), copiado al bundle en build (`scripts/copy-pyodide.mjs`)
- **Android**: Capacitor 8 (notificaciones locales, share, AdMob)
- **Backend**: Supabase (auth y sincronización de progreso)

## 🚀 Desarrollo

```bash
npm install
npm run dev          # web en localhost
npm run cap:sync     # build + sincronizar proyecto Android
npm run cap:open     # abrir en Android Studio
```

## 📚 Contenido del curso

El contenido completo del curso (lecciones, ejercicios, quizzes) es propietario y **no está incluido** en este repositorio. Se incluyen archivos `*.sample.json` con la estructura y una muestra para poder compilar y probar la app:

```bash
cd src/data
cp course_es.sample.json course_es.json
cp exercises.sample.json exercises.json
cp quizzes.sample.json quizzes.json
cp bundled/catalog.sample.json bundled/catalog.json
cp bundled/python-fundamentals.sample.json bundled/python-fundamentals.json
```
