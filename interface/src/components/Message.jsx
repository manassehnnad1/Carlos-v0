import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Sparkles } from 'lucide-react'
import CodeBlock from './CodeBlock'
import AttachmentPreview from './AttachmentPreview'

// Tailwind selectors that style the markdown output (paragraphs, lists, etc.).
const PROSE =
  'text-ink leading-7 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 ' +
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-brand ' +
  '[&_a]:underline [&_h1]:my-4 [&_h1]:text-xl [&_h1]:font-semibold ' +
  '[&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-semibold [&_strong]:font-semibold ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:text-muted'

const MARKDOWN_COMPONENTS = { code: CodeBlock }

export default function Message({ role, content, attachments = [], isStreaming }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2">
        {attachments.length > 0 && (
          <div className="flex max-w-[80%] flex-wrap justify-end gap-2">
            {attachments.map((a) => (
              <AttachmentPreview key={a.id} attachment={a} />
            ))}
          </div>
        )}
        {content && (
          <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-elevated px-5 py-2.5 text-ink">
            {content}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line">
        <Sparkles size={16} className="text-ink" />
      </div>
      <div className={`min-w-0 flex-1 ${PROSE}`}>
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={MARKDOWN_COMPONENTS}
          >
            {content}
          </ReactMarkdown>
        ) : (
          isStreaming && (
            <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-ink align-middle" />
          )
        )}
      </div>
    </div>
  )
}
