import { useEffect, useRef, useState } from 'react'
import { collectDroppedFiles, filesFromClipboard } from './upload.ts'
import type { AttachmentsProps } from './types.ts'

/** Global drag overlay + paste: drag files/folders anywhere over the window
 * or paste images/files into the composer to attach (Claude/Codex style). */
export function DragOverlay({ attach, t }: AttachmentsProps) {
  const [active, setActive] = useState(false)
  const depth = useRef(0)

  useEffect(() => {
    const hasFiles = (e: DragEvent): boolean => Array.from(e.dataTransfer?.types ?? []).includes('Files')

    const onDragEnter = (e: DragEvent): void => {
      if (!hasFiles(e)) return
      depth.current += 1
      setActive(true)
    }
    const onDragOver = (e: DragEvent): void => {
      if (!hasFiles(e)) return
      e.preventDefault()
    }
    const onDragLeave = (e: DragEvent): void => {
      if (!hasFiles(e)) return
      depth.current = Math.max(0, depth.current - 1)
      if (depth.current === 0) setActive(false)
    }
    const onDrop = (e: DragEvent): void => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth.current = 0
      setActive(false)
      void (async () => {
        // Folder support: walk dropped entries (files + directories).
        const files = await collectDroppedFiles(e.dataTransfer?.items ?? null)
        if (files.length > 0) await attach(files)
      })()
    }

    // Paste support: images/files pasted into the composer upload too.
    const onPaste = (e: ClipboardEvent): void => {
      const files = filesFromClipboard(e)
      if (files.length > 0 && files.some((f) => f.type.startsWith('image/') || f.type !== '')) {
        e.preventDefault()
        void attach(files)
      }
    }

    document.addEventListener('dragenter', onDragEnter)
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('drop', onDrop)
    document.addEventListener('paste', onPaste)
    return () => {
      document.removeEventListener('dragenter', onDragEnter)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('paste', onPaste)
    }
  }, [attach])

  return (
    <div className={`dsh-upload-overlay${active ? ' active' : ''}`}>
      <div className="dsh-upload-overlay-box">
        <div>{t('drag.title')}</div>
        <div className="dsh-upload-overlay-hint">{t('drag.desc')}</div>
      </div>
    </div>
  )
}
