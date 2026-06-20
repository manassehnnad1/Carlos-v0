import { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE = 'https://carlos-v0.onrender.com'

let idSeq = 0
const nextId = () => `m${++idSeq}`

export function useChat(username) {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [memories, setMemories] = useState([])
  const [newMemory, setNewMemory] = useState(null)
  const timerRef = useRef(null)
  const historyRef = useRef([])

  useEffect(() => () => clearInterval(timerRef.current), [])

  useEffect(() => {
    if (!username) return
    fetch(`${API_BASE}/memories/${username}`)
      .then((r) => r.json())
      .then((data) => setMemories(data.memories ?? []))
      .catch(console.error)
  }, [username])

  const streamIn = useCallback((assistantId, fullText) => {
    const tokens = fullText.match(/\s+|\S+/g) ?? [fullText]
    let i = 0
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
  }, [])

  const sendMessage = useCallback(
    async (text, attachments = []) => {
      const trimmed = text.trim()
      if ((!trimmed && attachments.length === 0) || isStreaming) return

      const assistantId = nextId()
      setIsStreaming(true)

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed, attachments },
        { id: assistantId, role: 'assistant', content: '' },
      ])

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: username,
            message: trimmed,
            history: historyRef.current,
          }),
        })

        const data = await res.json()
        const reply = data.reply ?? 'Something went wrong.'

        historyRef.current = [
          ...historyRef.current,
          { role: 'user', content: trimmed },
          { role: 'assistant', content: reply },
        ]

        streamIn(assistantId, reply)

        if (data.new_memory) {
          setNewMemory(data.new_memory)
          setMemories((prev) => [data.new_memory, ...prev])
        }
      } catch (err) {
        console.error('API error:', err)
        streamIn(assistantId, 'Could not reach the server. Is the backend running?')
      }
    },
    [isStreaming, username, streamIn],
  )

  const newChat = useCallback(() => {
    clearInterval(timerRef.current)
    setIsStreaming(false)
    setMessages([])
    historyRef.current = []
    setNewMemory(null)
  }, [])

  return { messages, isStreaming, sendMessage, newChat, memories, newMemory }
}