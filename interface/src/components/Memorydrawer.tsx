import { useEffect, useRef, useState } from "react"

interface MemoryDrawerProps {
  memories?: string[]
  newMemory?: string | null
}

interface MemoryEntry {
  id: string
  text: string
  date: string
  isNew?: boolean
}

const PLACEHOLDERS: MemoryEntry[] = [
  { id: "p1", text: "Backed Brazil to win the tournament", date: "2026-06-08T10:00:00Z", isNew: false },
  { id: "p2", text: "Thinks Mbappé is overrated this year", date: "2026-06-09T14:22:00Z", isNew: false },
  { id: "p3", text: "Called the Japan upset before it happened", date: "2026-06-10T09:11:00Z", isNew: false },
  { id: "p4", text: "Flip-flopped on Morocco after the draw", date: "2026-06-11T18:45:00Z", isNew: false },
]

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const MemoryDrawer = ({ memories = [], newMemory }: MemoryDrawerProps) => {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<MemoryEntry[]>(
    memories.length > 0
      ? memories.map((text, i) => ({
          id: `init-${i}`,
          text,
          date: new Date().toISOString(),
          isNew: false,
        }))
      : PLACEHOLDERS
  )
  const prevNewMemory = useRef<string | null>(null)

  useEffect(() => {
    if (!newMemory || newMemory === prevNewMemory.current) return
    prevNewMemory.current = newMemory
    const entry: MemoryEntry = {
      id: `${Date.now()}`,
      text: newMemory,
      date: new Date().toISOString(),
      isNew: true,
    }
    setEntries((prev) => [entry, ...prev])
    setTimeout(() => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, isNew: false } : e))
      )
    }, 600)
  }, [newMemory])

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
        aria-label="Open memory"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
        memory
      </button>

      {/* Full screen side drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black">
          <p className="text-lg text-white/60 font-medium">
            memory fragments
          </p>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            close
          </button>
        </div>

        {/* Centered fragments */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm flex flex-col gap-5">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`transition-all duration-500 ${
                  entry.isNew ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                }`}
              >
                <p className="text-sm text-neutral-700 leading-relaxed">{entry.text}</p>
                <p className="text-[10px] text-neutral-400 mt-1 ">{formatDate(entry.date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default MemoryDrawer