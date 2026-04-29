'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface LessonContentProps { content: string }

/** Limpia el raw_content antes de renderizar */
function cleanContent(raw: string): string {
  let text = raw.trim()

  // Eliminar frontmatter YAML
  if (text.startsWith('---')) {
    const end = text.indexOf('---', 3)
    if (end !== -1) text = text.slice(end + 3).trim()
  }

  // Eliminar metadata tipo: source_course: "x"
  text = text.replace(/^[\w_]+:\s*"[^"]*"\s*/gm, '').trim()

  // Eliminar el primer H1
  text = text.replace(/^#\s+.+\n?/, '').trim()

  return text
}

export function LessonContent({ content }: LessonContentProps) {
  const clean = cleanContent(content)
  return (
    <article className="prose prose-invert prose-slate max-w-none
      prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
      prose-h1:text-2xl prose-h1:mt-0 prose-h1:mb-6
      prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-800
      prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-slate-200
      prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-4
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
      prose-strong:text-white prose-strong:font-semibold
      prose-em:text-slate-200
      prose-code:text-blue-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5
      prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:font-normal
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#0D1117] prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-xl
      prose-pre:p-0 prose-pre:overflow-hidden prose-pre:my-5
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-950/20
      prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
      prose-blockquote:text-slate-300 prose-blockquote:not-italic
      prose-blockquote:[&>p]:my-1
      prose-ul:my-4 prose-ul:space-y-1.5
      prose-ol:my-4 prose-ol:space-y-1.5
      prose-li:text-slate-300 prose-li:leading-relaxed prose-li:my-0
      prose-li:marker:text-slate-500
      prose-hr:border-slate-800 prose-hr:my-8
      prose-table:text-sm prose-table:my-5
      prose-th:text-slate-200 prose-th:bg-slate-800/50 prose-th:px-3 prose-th:py-2
      prose-td:text-slate-300 prose-td:px-3 prose-td:py-2 prose-td:border-slate-800
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
