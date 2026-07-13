import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Limpia el contenido crudo antes de renderizar
function clean(raw: string): string {
  let text = raw.trim()
  // Quitar frontmatter YAML
  if (text.startsWith('---')) {
    const end = text.indexOf('---', 3)
    if (end !== -1) text = text.slice(end + 3).trim()
  }
  // Quitar metadata suelta key: "valor"
  text = text.replace(/^[\w_]+:\s*"[^"]*"\s*/gm, '').trim()
  // Quitar el primer H1 (ya se muestra como título de la pantalla)
  text = text.replace(/^#\s+.+\n?/, '').trim()
  return text
}

export function LessonMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-lesson">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{clean(content)}</ReactMarkdown>
    </div>
  )
}
