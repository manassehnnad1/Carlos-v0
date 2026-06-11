import { useState, useRef, useEffect } from "react"

interface ChatBoxProps {
  onSend: (message: string) => void
  disabled?: boolean
}

const ChatBox = ({ onSend, disabled = false }: ChatBoxProps) => {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8">
      <div className="bg-white rounded-3xl border border-black/5 shadow-md px-8 pt-6 pb-5">

        {/* Top row — badge + textarea */}
        <div className="flex items-start gap-4  mb-6">
          {/* Logo badge */}
          <div className="bg-white rounded-xl p-16  shrink-0 mt-2 ">
            <img src="/h1.png" alt="logo" className="w-9 h-9" />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="drop a take..."
            disabled={disabled}
            rows={4}
            className="flex-1 resize-none bg-transparent text-neutral-800 placeholder:text-neutral-400 text-base leading-relaxed focus:outline-none disabled:opacity-50 max-h-80 overflow-y-auto"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-end">
            
          

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className="w-20 h-10 rounded-2xl bg-black  text-white flex items-center justify-center transition-all   active:scale-95"
              aria-label="Send"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ChatBox