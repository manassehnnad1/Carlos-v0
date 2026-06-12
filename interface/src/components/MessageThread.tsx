interface Message {
  role: "user" | "assistant"
  content: string
}

interface MessageThreadProps {
  messages: Message[]
  isLoading?: boolean
}

const MessageThread = ({ messages, isLoading = false }: MessageThreadProps) => {
  if (messages.length === 0) return null

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto px-6 pb-48">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex gap-3 ${
            msg.role === "user" ? "justify-end" : "justify-start items-start"
          }`}
        >
          {/* Agent logo */}
          {msg.role === "assistant" && (
            <img
              src="/h1.png"
              alt="analyst"
              className="w-5 h-5 mt-1 shrink-0 opacity-60"
            />
          )}

          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed w-fit max-w-xs break-words ${
              msg.role === "user"
                ? "bg-neutral-900 text-white rounded-br-none"
                : "bg-white text-neutral-800 rounded-bl-none shadow-sm"
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 justify-start items-start">
          <img
            src="/h1.png"
            alt="analyst"
            className="w-5 h-5 mt-1 shrink-0 opacity-60"
          />
          <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageThread
export type { Message }