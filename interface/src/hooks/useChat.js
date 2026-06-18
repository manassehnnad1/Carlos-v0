import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * useChat — the single source of truth for the conversation.
 *
 * This is the SWAPPABLE SEAM. Until a real model is connected, every assistant
 * turn returns a fixed "not connected yet" notice (streamed in for the UI). To
 * go live, replace the body of `streamAssistantReply` with a real Claude API
 * call that reads the streamed response — no component that consumes this hook
 * needs to change.
 */

// Placeholder assistant reply shown for every message until the project is
// wired to a real LLM. Replace `streamAssistantReply`'s body to go live.
const NOT_CONNECTED_REPLY =
  'Sorry, this project has not been connected to a real LLM model yet, so we ' +
  'cannot provide an answer for you.'

let idSeq = 0
const nextId = () => `m${++idSeq}`

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const timerRef = useRef(null)

  // Clear any in-flight streaming timer on unmount.
  useEffect(() => () => clearInterval(timerRef.current), [])

  const streamAssistantReply = useCallback((assistantId, fullText) => {
    // --- Replace this block with a real streamed API call. ---
    // For now it just streams in the fixed NOT_CONNECTED_REPLY notice.
    const tokens = fullText.match(/\s+|\S+/g) ?? [fullText]
    let i = 0
    setIsStreaming(true)
    timerRef.current = setInterval(() => {
      i += 1
      const partial = tokens.slice(0, i).join('')
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
      )
      if (i >= tokens.length) {
        clearInterval(timerRef.current)
        setIsStreaming(false)
      }
    }, 20)
    // --- end mock ---
  }, [])

  const sendMessage = useCallback(
    (text, attachments = []) => {
      const trimmed = text.trim()
      if ((!trimmed && attachments.length === 0) || isStreaming) return

      const assistantId = nextId()
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed, attachments },
        { id: assistantId, role: 'assistant', content: '' },
      ])
      streamAssistantReply(assistantId, NOT_CONNECTED_REPLY)
    },
    [isStreaming, streamAssistantReply],
  )

  const newChat = useCallback(() => {
    clearInterval(timerRef.current)
    setIsStreaming(false)
    setMessages([])
  }, [])

  return { messages, isStreaming, sendMessage, newChat }
}
