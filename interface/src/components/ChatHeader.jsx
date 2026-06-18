import { ChevronDown, PanelLeft, PenSquare } from 'lucide-react'

// Top bar. The hamburger (PanelLeft) toggles the sidebar drawer on mobile;
// the model name is a visual-only dropdown. The pencil starts a new chat.
export default function ChatHeader({ onToggleSidebar, onNewChat }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-hover md:hidden"
      >
        <img src="./grid.png" alt="" className="shrink-0 h-5" />
      </button>

      <button
        type="button"
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-hover"
      >
        Carlos v0
        <ChevronDown size={16} className="text-muted" />
      </button>

      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-hover md:hidden"
      >
      </button>
    </header>
  )
}
