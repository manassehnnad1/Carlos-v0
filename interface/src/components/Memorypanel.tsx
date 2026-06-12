import { useEffect, useRef, useState } from "react"

interface MemoryPanelProps {
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

const MemoryPanel = ({ memories = [], newMemory }: MemoryPanelProps) => {
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
    <div className="w-70 p-16 ">
      {/* Header */}
      <p className="text-sm text-neutral-400">
        memory fragments
      </p>
      {/* Fragments */}
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (       
          <div
            key={entry.id}
            className={`bg-transparent  px-4 py-3  transition-all duration-500 ${
              entry.isNew
                ? "opacity-0 -translate-y-1"
                : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-sm text-neutral-700 leading-relaxed">{entry.text}</p>
            <p className="text-[10px] text-neutral-400 mt-1.5 ">{formatDate(entry.date)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemoryPanel