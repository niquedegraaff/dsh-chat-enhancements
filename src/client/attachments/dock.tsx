import { useEffect, useState } from 'react'
import { Tooltip, IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { metaFor, subscribeErrors } from './state.ts'
import { fileBadgeExt, formatBytes } from './format.ts'
import { DragOverlay } from './overlay.tsx'
import type { AttachmentsSlotProps } from './types.ts'

export function UploadDock({ attach, sessionId, t }: AttachmentsSlotProps) {
  const [metaVersion, setMetaVersion] = useState(0)
  const [error, setError] = useState<{ seq: number; text: string } | null>(null)

  useEffect(() => {
    const offs = [
      subscribeErrors((next) => {
        setError(next)
        setMetaVersion((v) => v + 1)
      })
    ]
    return () => {
      for (const off of offs) off()
    }
  }, [])

  const removeCard = (ref: string): void => {
    metaFor(sessionId).delete(ref)
    setMetaVersion((v) => v + 1)
    void fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'x-session-id': sessionId,
        'x-file-path': ref
      }
    }).catch(() => undefined)
  }

  const entries = Array.from(metaFor(sessionId).entries())

  return (
    <>
      {entries.length > 0 && (
        <div className="dsh-upload-dock">
          {entries.map(([ref, meta]) => {
            const ext = fileBadgeExt(meta.name)
            return (
              <div key={ref} className="dsh-upload-card">
                {meta.previewUrl !== undefined ? (
                  <img
                    src={meta.previewUrl}
                    alt={meta.name}
                    className="dsh-upload-thumb"
                  />
                ) : (
                  <div className="dsh-upload-badge">{ext}</div>
                )}
                <div className="dsh-upload-name" title={meta.name}>
                  {meta.name}
                </div>
                <div className="dsh-upload-size">{formatBytes(meta.bytes)}</div>
                <Tooltip label={t('card.remove')} side="top">
                  <button
                    type="button"
                    className="dsh-upload-remove"
                    aria-label={t('card.remove')}
                    onClick={() => removeCard(ref)}
                  >
                    <IconCloseOutline16 size={12} />
                  </button>
                </Tooltip>
              </div>
            )
          })}
        </div>
      )}
      {error !== null && (
        <div className="dsh-upload-error">
          <span className="dsh-upload-error-text">{error.text}</span>
          <button
            type="button"
            className="dsh-upload-remove"
            aria-label={t('card.close')}
            onClick={() => setError(null)}
          >
            <IconCloseOutline16 size={12} />
          </button>
        </div>
      )}
      <DragOverlay attach={attach} t={t} />
    </>
  )
}
