export default function Sidebar({ isOpen, onClose, onToggle, onNewChat, username, memories = [], newMemory }) {
  const collapsed = !isOpen

  const row =
    'flex w-full items-center gap-3 rounded-lg py-2 text-sm text-ink transition-colors hover:bg-hover'
  const rowPad = collapsed ? 'justify-center px-2' : 'px-3'
  const labelHidden = collapsed ? 'hidden' : 'whitespace-nowrap'

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-65 shrink-0 overflow-hidden bg-sidebar transition-[transform,width] duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 md:w-65' : '-translate-x-full md:w-16'
        }`}
      >
        <div className="flex h-full flex-col">

          {/* Top — toggle */}
          <div className="flex flex-col gap-1 p-2">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Toggle sidebar"
              className={`${row} ${rowPad} cursor-pointer`}
            >
              <img src="./grid.png" alt="" className="shrink-0 h-5" />
            </button>
          </div>

          {/* Memory list */}
          <div className="flex-1 overflow-y-auto px-3">
            {!collapsed && (
              <>
                {memories.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-faint" style={{ fontFamily: 'Elms Sans' }}>
                    No memory yet
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 py-2">
                    {memories.map((m, i) => (
                      <div key={i} className="px-1">
                        <p className="text-xs text-ink leading-relaxed" style={{ fontFamily: 'Elms Sans' }}>
                          {m}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Account row */}
          <div className="border-t border-line p-2">
            <button
              type="button"
              className={`${row} ${collapsed ? 'justify-center px-2' : 'px-2'}`}
            >
              <img src="./user.png" alt="" className="shrink-0 h-3" />
              <span className={labelHidden} style={{ fontFamily: 'Elms Sans' }}>
                {username}
              </span>
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}