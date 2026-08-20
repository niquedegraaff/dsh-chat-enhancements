import { useState } from 'react'
import { Menu, IconPlusOutline16, IconPaperclipOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { pickFiles } from './upload.ts'
import type { AttachmentsProps } from './types.ts'

export function PlusMenuButton({ attach, t }: AttachmentsProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const runUpload = async (files: File[]): Promise<void> => {
    if (files.length === 0) return
    setBusy(true)
    setOpen(false)
    try {
      await attach(files)
    } finally {
      setBusy(false)
    }
  }

  const pick = (): void => {
    void pickFiles().then(runUpload)
  }

  const items = [
    { id: 'files', label: t('menu.upload.files'), icon: <IconPaperclipOutline16 size={16} /> }
  ]

  return (
    <div className="dsh-plus-root">
      <Menu
        open={open}
        items={items}
        onSelect={(id) => {
          setOpen(false)
          if (id === 'files') pick()
        }}
        onClose={() => setOpen(false)}
        side="top"
        anchor={
          <button
            type="button"
            className="dsh-plus-btn"
            aria-label={t('menu.button')}
            disabled={busy}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={open ? 'dsh-plus-icon dsh-plus-icon-open' : 'dsh-plus-icon'}>
              <IconPlusOutline16 size={14} />
            </span>
          </button>
        }
      />
    </div>
  )
}
