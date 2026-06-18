import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/*
 * Custom renderer for fenced code blocks inside markdown.
 * Renders a ChatGPT-style header bar (language label + copy button)
 * above the highlighted code. Inline code (no language / single line)
 * falls back to a simple styled <code>.
 */
export default function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false)
  const language = /language-(\w+)/.exec(className || '')?.[1]
  const code = String(children).replace(/\n$/, '')

  // Inline code: react-markdown passes no language class for `inline` code.
  if (!language && !code.includes('\n')) {
    return (
      <code className="rounded bg-black/[0.08] px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-black/10 bg-ink">
      <div className="flex items-center justify-between px-4 py-1.5 text-xs text-gray-400">
        <span>{language || 'text'}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded px-1.5 py-1 transition-colors hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 pb-4 pt-1 text-sm leading-relaxed">
        <code className={`hljs font-mono ${className || ''}`}>{children}</code>
      </pre>
    </div>
  )
}
