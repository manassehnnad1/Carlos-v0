import { useEffect, useRef } from 'react'
import Message from './Message'

// Scrollable conversation column. Auto-scrolls to the bottom whenever the
// messages change (including while a reply streams in).
export default function MessageList({ messages, isStreaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {messages.map((m, i) => (
          <Message
            key={m.id}
            role={m.role}
            content={m.content}
            attachments={m.attachments}
            isStreaming={isStreaming && i === messages.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
