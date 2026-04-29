'use client'

import { useEffect, useState } from 'react'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  minHeight?: string
  readOnly?: boolean
}

// Extensión para mínimo de altura
function minHeightExtension(h: string) {
  return EditorView.theme({ '.cm-editor': { minHeight: h }, '.cm-scroller': { minHeight: h } })
}

export function CodeEditor({ value, onChange, minHeight = '180px', readOnly = false }: CodeEditorProps) {
  const [CodeMirror, setCodeMirror] = useState<React.ComponentType<any> | null>(null)

  // Importación dinámica para evitar SSR
  useEffect(() => {
    import('@uiw/react-codemirror').then(mod => {
      setCodeMirror(() => mod.default)
    })
  }, [])

  if (!CodeMirror) {
    return (
      <div
        className="bg-[#282c34] rounded-t-xl border border-slate-700 p-4 font-mono text-sm text-slate-500 animate-pulse"
        style={{ minHeight }}
      >
        Cargando editor...
      </div>
    )
  }

  return (
    <div className="rounded-t-xl overflow-hidden border border-slate-700">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[python(), minHeightExtension(minHeight)]}
        theme={oneDark}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          highlightActiveLine: true,
          tabSize: 4,
        }}
      />
    </div>
  )
}
