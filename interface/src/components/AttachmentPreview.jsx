import { FileText, X } from 'lucide-react'

// Formats a byte count into a short human-readable label (e.g. "12.4 KB").
function formatBytes(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/*
 * Renders a single attachment.
 *  - Images show a thumbnail (using the object URL created when picked).
 *  - Everything else shows a file chip (icon + name + size).
 * Pass `onRemove` to show a remove (X) button — used in the composer; omit it
 * when rendering inside a sent message.
 */
export default function AttachmentPreview({ attachment, onRemove }) {
  const { name, size, type, url } = attachment
  const isImage = type?.startsWith('image/') && url

  return (
    <div className="group relative">
      {isImage ? (
        <img
          src={url}
          alt={name}
          className="h-14 w-14 rounded-lg border border-line object-cover"
        />
      ) : (
        <div className="flex max-w-[220px] items-center gap-2 rounded-xl border border-line bg-elevated px-3 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-chat-bg">
            <FileText size={16} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm text-ink">{name}</span>
            <span className="block text-xs text-muted">{formatBytes(size)}</span>
          </span>
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          aria-label={`Remove ${name}`}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-chat-bg text-muted shadow-sm transition-colors hover:text-ink"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
