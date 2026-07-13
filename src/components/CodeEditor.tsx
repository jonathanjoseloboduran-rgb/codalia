import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'

// Evita que el teclado del celular ponga mayúscula al inicio de línea
// (rompería palabras reservadas como `if`, `print`, `def`...).
const noAutoCapitalize = EditorView.contentAttributes.of({
  autocapitalize: 'none',
  autocorrect: 'off',
  spellcheck: 'false',
})

// Palabras reservadas y funciones comunes de Python para autocompletar
const PY_WORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for',
  'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or',
  'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  'print', 'len', 'range', 'int', 'str', 'float', 'bool', 'list', 'dict', 'set',
  'tuple', 'sum', 'min', 'max', 'abs', 'sorted', 'reversed', 'enumerate', 'zip',
  'map', 'filter', 'input', 'type', 'round', 'isinstance', 'any', 'all', 'open',
  'format', 'append', 'split', 'join', 'strip', 'lower', 'upper', 'replace',
]

function pyComplete(ctx: CompletionContext) {
  const word = ctx.matchBefore(/\w+/)
  if (!word || (word.from === word.to && !ctx.explicit)) return null
  return {
    from: word.from,
    options: PY_WORDS.map(w => ({ label: w, type: 'keyword' })),
  }
}

// Corrige la mayúscula automática del teclado (SwiftKey ignora autocapitalize).
// Solo palabras reservadas/funciones de Python; NUNCA toca True/False/None ni
// variables del usuario. Actúa cuando la palabra está "cerrada" por un delimitador.
const FIX_WORDS = [
  'If', 'Elif', 'Else', 'For', 'While', 'Def', 'Class', 'Return', 'Import',
  'From', 'As', 'With', 'Try', 'Except', 'Finally', 'Raise', 'Pass', 'Break',
  'Continue', 'In', 'Is', 'And', 'Or', 'Not', 'Lambda', 'Global', 'Nonlocal',
  'Del', 'Assert', 'Async', 'Await', 'Yield',
  'Print', 'Len', 'Range', 'Input', 'Int', 'Str', 'Float', 'Bool', 'List',
  'Dict', 'Set', 'Tuple', 'Sum', 'Min', 'Max', 'Sorted', 'Enumerate', 'Zip',
  'Map', 'Filter', 'Type', 'Abs', 'Round', 'Open', 'Any', 'All',
  'Append', 'Split', 'Join', 'Strip', 'Lower', 'Upper', 'Replace',
]
const FIX_RE = new RegExp('\\b(' + FIX_WORDS.join('|') + ')(?=[\\s(:\\[\\],.=])', 'g')

function fixCaps(v: string): string {
  return v.replace(FIX_RE, m => m.toLowerCase())
}

interface CodeEditorProps {
  value: string
  onChange: (v: string) => void
  minHeight?: string
}

export function CodeEditor({ value, onChange, minHeight = '160px' }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      onChange={(v) => onChange(fixCaps(v))}
      theme={oneDark}
      extensions={[
        python(),
        noAutoCapitalize,
        autocompletion({ override: [pyComplete], activateOnTyping: true }),
      ]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        autocompletion: false, // usamos el nuestro
        highlightActiveLine: true,
        tabSize: 4,
      }}
      style={{ fontSize: 14 }}
      minHeight={minHeight}
      // Refuerzo: fuerza los atributos en el elemento editable directamente
      // (algunos teclados ignoran autocapitalize si solo va por la config)
      onCreateEditor={(view) => {
        const el = view.contentDOM
        el.setAttribute('autocapitalize', 'none')
        el.setAttribute('autocorrect', 'off')
        el.setAttribute('autocomplete', 'off')
        el.setAttribute('spellcheck', 'false')
        el.setAttribute('inputmode', 'text')
      }}
    />
  )
}
