import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Plus } from 'lucide-react'
import AttachmentPreview from './AttachmentPreview'

const MAX_HEIGHT = 200 // px — grows up to here, then scrolls internally.

// Monotonic id for attachments (avoids relying on Math.random/Date).
let attSeq = 0
const nextAttId = () => `a${++attSeq}`

// The message input. Auto-grows with content, sends on Enter (Shift+Enter for
// a newline), supports attaching files via the + button, and disables the send
// button while there's nothing to send or while a reply is streaming.
export default function Composer({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Resize the textarea to fit its content, capped at MAX_HEIGHT.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const addFiles = (fileList) => {
    const mapped = Array.from(fileList).map((file) => ({
      id: nextAttId(),
      name: file.name,
      size: file.size,
      type: file.type,
      // Object URL lets us render image thumbnails locally (no backend yet).
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      file,
    }))
    setAttachments((prev) => [...prev, ...mapped])
  }

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = '' // reset so the same file can be picked again
  }

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target?.url) URL.revokeObjectURL(target.url) // not sent — safe to free
      return prev.filter((a) => a.id !== id)
    })
  }

  const submit = () => {
    const text = value.trim()
    if ((!text && attachments.length === 0) || disabled) return
    onSend(text, attachments)
    setValue('')
    setAttachments([]) // ownership passes to the message; don't revoke URLs here
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = (value.trim() || attachments.length > 0) && !disabled

  return (
    <div className="px-4 pb-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-line bg-composer p-2 shadow-sm">
          {/* Attachment previews (inside the composer box, above the input) */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
              {attachments.map((a) => (
                <AttachmentPreview
                  key={a.id}
                  attachment={a}
                  onRemove={removeAttachment}
                />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Upload / attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-hover"
            >
              <Plus size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.md,.json"
              onChange={handleFileInput}
            />

            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="max-h-50 flex-1 resize-none bg-transparent py-2 text-ink placeholder:text-faint focus:outline-none"
            />

            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer rounded-full bg-ink text-chat-bg transition-opacity disabled:opacity-30"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-faint">
          This agent is powered by <a href="https://walrus.xyz/products/walrus-memory/" className="underline">Walrus Memory</a> 
        </p>
      </div>
    </div>
  )
}
