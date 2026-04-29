'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface LessonContentProps { content: string }

/** Limpia el raw_content antes de renderizar:
 *  1. Elimina líneas de metadata al inicio (key: "value")
 *  2. Elimina el primer H1 (ya se muestra como título en la página)
 */
function cleanContent(raw: string): string {
  let text = raw.trim()

  // Eliminar frontmatter YAML (--- ... ---) si existe
  if (text.startsWith('---')) {
    const end = text.indexOf('---', 3)
    if (end !== -1) text = text.slice(end + 3).trim()
  }

  // Eliminar líneas sueltas de metadata tipo: source_course: "x" source_lesson: "y"
  text = text.replace(/^[\w_]+:\s*"[^"]*"\s*/gm, '').trim()

  // Eliminar el primer H1 (# Título) ya que se muestra arriba en la página
  text = text.replace(/^#\s+.+\n?/, '').trim()

  return text
}

export function LessonContent({ content }: LessonContentProps) {
  const clean = cleanContent(content)
  return (
    <article className="prose prose-invert prose-slate max-w-none
      prose-headings:font-bold prose-headings:text-white
      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
      prose-p:text-slate-300 prose-p:leading-7
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5
      prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#0D1117] prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-xl
      prose-pre:p-0 prose-pre:overflow-hidden
      prose-blockquote:border-blue-500 prose-blockquote:bg-blue-950/20 prose-blockquote:rounded-r-lg
      prose-blockquote:text-slate-300 prose-blockquote:py-1
      prose-li:text-slate-300
      prose-hr:border-slate-700
      prose-table:text-sm
      prose-th:text-slate-200 prose-td:text-slate-300
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          pre({ children }) {
            return <pre className="not-prose overflow-x-auto p-4 text-sm leading-relaxed">{children}</pre>
          },
        }}
      >
        {clean}
      </ReactMarkdown>
    </article>
  )
}
