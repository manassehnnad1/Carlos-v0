import { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface MemoryFragment {
  id: string
  text: string
  date: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "assistant", content: "First time here. Tell me something about the World Cup — a take, a prediction, a team you're backing. Let's see what you've got." },
  { id: "2", role: "user", content: "I think Brazil are winning it. Their attack is unplayable this tournament." },
  { id: "3", role: "assistant", content: "Bold. Their attack is sharp but the midfield is a liability — you're betting on Vinicius carrying the whole thing. What happens if he has a quiet game?" },
  { id: "4", role: "user", content: "He won't. And even if he does, Rodrygo covers. You're underrating them." },
  { id: "5", role: "assistant", content: "Rodrygo is good. Not 'carry Brazil to a World Cup' good. But I'll hold you to this." },
]

const INITIAL_MEMORIES: MemoryFragment[] = [
  { id: "m1", text: "Backed Brazil to win the tournament", date: "Jun 8" },
  { id: "m2", text: "Thinks Vinicius is unplayable this year", date: "Jun 8" },
  { id: "m3", text: "Dismisses midfield concerns — backs depth", date: "Jun 9" },
  { id: "m4", text: "Flip-flopped on Morocco after the draw", date: "Jun 10" },
  { id: "m5", text: "Believes Mbappé is underperforming", date: "Jun 11" },
]

const MOCK_REPLIES = [
  "Interesting. Most people sleep on that. Let's see if you still feel that way after the group stage.",
  "That's a hot take and a half. Back it up — what are you seeing that others aren't?",
  "Classic overconfidence. You said the same thing last tournament and we both know how that ended.",
  "I'll give you that one. The data actually supports it, even if the take sounds outrageous.",
  "You're not wrong but you're not right either. Three teams could ruin that prediction easily.",
  "Now that's something. Keep going.",
]

let replyIndex = 0

export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [memories, setMemories] = useState<MemoryFragment[]>(INITIAL_MEMORIES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeMemory, setActiveMemory] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const reply = MOCK_REPLIES[replyIndex % MOCK_REPLIES.length]
      replyIndex++

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)

      if (trimmed.length > 15) {
        const fragment: MemoryFragment = {
          id: `m${Date.now()}`,
          text: trimmed.length > 50 ? trimmed.slice(0, 50) + "…" : trimmed,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
        setMemories((prev) => [fragment, ...prev])
      }
    }, 900)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">

      {/* Navbar: evenly spaced left / center / right */}
      <nav className="absolute top-0 left-0 right-0 grid grid-cols-3 items-center py-7">
        <div className="flex items-center justify-start pl-10">
          <img src="./h2.png" alt="logo" className="w-32 h-16" />
        </div>

        <div className="flex items-center justify-center">
          <span className="text-sm tracking-tight text-neutral-900 font-medium">your FIFA world cup pundit buddy.</span>
        </div>

        <div className="absolute right-10 flex items-center justify-end gap-4 pr-10">
          <img src="./h4.png" alt="logo" className="w-9 h-18" />
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            memory
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="px-10 pb-40 max-w-6xl w-full">
        <div className="flex gap-20">

          {/* Left — conversation */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-8">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-0.5 ${msg.role === "user" ? "pl-12" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-xs text-neutral-400 tracking-widest mb-1">
                      agent
                    </span>
                  )}
                  <p
                    className={`text-base leading-relaxed ${
                      msg.role === "user"
                        ? "text-neutral-500"
                        : "text-neutral-900"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-400 tracking-widest mb-1">agent</span>
                  <div className="flex items-center gap-1 h-6">
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:120ms]" />
                    <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input — anchored to left column */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-10 py-5">
              <div className="max-w-6xl flex items-end gap-6">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="drop a take."
                    rows={1}
                    className="w-full resize-none bg-transparent text-base text-neutral-900 placeholder:text-neutral-300 focus:outline-none leading-relaxed max-h-32 overflow-y-auto"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="text-sm text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition-colors pb-0.5 shrink-0"
                >
                  send
                </button>
              </div>
            </div>
          </div>

          {/* Right — memory panel, desktop only */}
          <div className="hidden md:block w-64 shrink-0">
            <p className="text-xs tracking-widest uppercase text-neutral-400 mb-6">
              memory fragments
            </p>
            <div className="flex flex-col gap-5">
              {memories.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveMemory(m.id === activeMemory ? null : m.id)
                    console.log("memory clicked:", m.text)
                  }}
                  className={`cursor-pointer group transition-opacity duration-200 ${
                    activeMemory && activeMemory !== m.id ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <p className="text-sm text-neutral-800 leading-relaxed group-hover:text-neutral-500 transition-colors">
                    {m.text}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{m.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Mobile memory drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden bg-white transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-10 py-7 border-b border-neutral-100">
          <p className="text-xs tracking-widest uppercase text-neutral-400">memory fragments</p>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            close
          </button>
        </div>
        <div className="px-10 py-8 flex flex-col gap-6">
          {memories.map((m) => (
            <div key={m.id} onClick={() => console.log("memory clicked:", m.text)} className="cursor-pointer">
              <p className="text-sm text-neutral-800 leading-relaxed">{m.text}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{m.date}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}