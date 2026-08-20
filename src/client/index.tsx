// dsh-chat-enhancements client face: Gemini-style "+" composer menu.
//   - a "+" button in the composer toolbar (conversation.input.left) opens the
//     harness's own Menu primitive (same dropdown style as the access/workspace
//     menus) with an Upload files entry.
//   - uploads run through the same pipeline as before: files land per-session
//     inside the session workspace (.dsh-uploads/<sessionId>) where the agent's
//     fs backend can always resolve them; small text files are inlined straight
//     into the composer; images are handled via read_image/vision description.
//   - global drag-and-drop overlay: drag files anywhere over the window and
//     drop them onto the chat to attach (conversation.input.dock hosts cards).
//   - the product's hardcoded command-launcher "+" is hidden via CSS (a stable
//     aria-haspopup="listbox" selector plus the shipped class hash) so this
//     plugin's "+" is the single entry point; slash commands stay reachable by
//     typing "/" directly (see injectCss).

import { useEffect, useRef, useState } from 'react'
import { Tooltip, Menu, IconPlusOutline16, IconPaperclipOutline16, IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'

const SOURCE_NAME = 'dsh-chat-enhancements'
const STYLE_TAG = 'dsh-chat-enhancements/style.css'

/** Locale namespace owned by this plugin. */
const NS = 'chatEnhancements'

/** Translator bound to this plugin's locale namespace. */
type Translator = (key: string, params?: Record<string, string>) => string

/** Simplified Chinese dictionary (the key-set source of truth). */
const zh: Record<string, string> = {
  'http.413': '文件超过大小限制',
  'http.415': '文件类型不被允许',
  'http.403': '会话校验失败，请刷新页面重试',
  'http.429': '上传太频繁，请稍后再试',
  'upload.busy': '上传中…',
  'upload.label': '上传文件',
  'drag.title': '松开以添加文件',
  'drag.desc': '文件/文件夹将上传到当前会话,agent 可读取其内容',
  'card.remove': '移除',
  'card.close': '关闭',
  'image.native': '当前模型支持图像输入,请用 read_image 工具查看 {path}',
  'image.description': '图片讲解(自动生成):\n{description}\n原始文件: {path}',
  'image.file': '图片以文件形式上传({path});未生成讲解,请用 read_document 工具读取',
  'image.tag': '[图片: {name}] {description}',
  'menu.button': '添加',
  'menu.upload.files': '上传文件'
}

/** English dictionary, checked complete against the zh key set (fallback). */
const en: Record<string, string> = {
  'http.413': 'File exceeds the size limit',
  'http.415': 'File type not allowed',
  'http.403': 'Session validation failed; refresh the page and try again',
  'http.429': 'Uploading too frequently; try again later',
  'upload.busy': 'Uploading…',
  'upload.label': 'Upload file',
  'drag.title': 'Release to add files',
  'drag.desc': 'Files/folders upload to the current session; the agent can read their contents',
  'card.remove': 'Remove',
  'card.close': 'Close',
  'image.native': 'The current model supports image input; use the read_image tool to view {path}',
  'image.description': 'Image description (auto-generated):\n{description}\nOriginal file: {path}',
  'image.file': 'Image uploaded as a file ({path}); no description generated, use the read_document tool to read it',
  'image.tag': '[image: {name}] {description}',
  'menu.button': 'Add',
  'menu.upload.files': 'Upload files'
}

interface UploadMeta {
  name: string
  bytes: number
  label: string
  status: 'uploading' | 'ready' | 'error'
  error?: string
  previewUrl?: string
  relativePath?: string
}

/** Per-session attachment metadata: Map<sessionId, Map<path, meta>>. */
const uploadMetaBySession = new Map<string, Map<string, UploadMeta>>()

function metaFor(sessionId: string): Map<string, UploadMeta> {
  let m = uploadMetaBySession.get(sessionId)
  if (m === undefined) {
    m = new Map()
    uploadMetaBySession.set(sessionId, m)
  }
  return m
}
let uploadError: { seq: number; text: string } | null = null
let errorSeq = 0
const errorListeners = new Set<() => void>()

function subscribeErrors(listener: () => void): () => void {
  errorListeners.add(listener)
  return () => {
    errorListeners.delete(listener)
  }
}

function setUploadError(text: string): void {
  uploadError = { seq: ++errorSeq, text }
  for (const listener of errorListeners) listener()
}

function clearUploadError(): void {
  uploadError = null
  for (const listener of errorListeners) listener()
}

function badgeStyle(name: string): { bg: string; ext: string } {
  const ext = name.slice(name.lastIndexOf('.') + 1).toUpperCase().slice(0, 4)
  const lower = ext.toLowerCase()
  if (lower === 'pdf') return { bg: '#C93B2E', ext: 'PDF' }
  if (lower === 'docx' || lower === 'doc') return { bg: '#2B579A', ext: 'DOC' }
  if (lower === 'xlsx' || lower === 'xls') return { bg: '#217346', ext: 'XLS' }
  if (lower === 'csv' || lower === 'tsv') return { bg: '#217346', ext: 'CSV' }
  if (lower === 'txt' || lower === 'md' || lower === 'markdown') return { bg: '#757575', ext: 'TXT' }
  if (lower === 'zip') return { bg: '#7A5BB0', ext: 'ZIP' }
  if (lower === 'json' || lower === 'jsonl') return { bg: '#B8860B', ext: 'JSON' }
  if (lower === 'png' || lower === 'jpg' || lower === 'jpeg' || lower === 'gif' || lower === 'webp') return { bg: '#2E7D6B', ext: 'IMG' }
  return { bg: '#5B7DB1', ext: ext === '' ? 'FILE' : ext }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function injectCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-chat-enhancements'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = `
.dsh-plus-root{display:inline-flex;order:-1;margin-right:-4px}
.dsh-plus-btn{width:28px;height:28px;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;cursor:pointer}
.dsh-plus-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dsh-plus-btn:disabled{opacity:.45;cursor:default}
.dsh-plus-icon{display:inline-flex;transition:transform .25s ease}
.dsh-plus-icon-open{transform:rotate(45deg)}
.dsh-upload-dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto 6px;padding:0 var(--dsh-composer-dock-inset);display:flex;flex-wrap:wrap;gap:8px;flex:none}
.dsh-upload-card{position:relative;flex-direction:column;align-items:center;gap:5px;width:88px;flex:none;border:1px solid var(--dsw-alias-border-l2-darkmode-thin,rgba(127,127,127,.22));background:var(--dsw-specific-input-major,var(--dsw-alias-surface-2,rgba(127,127,127,.08)));border-radius:12px;padding:12px 8px 9px;box-shadow:var(--dsw-shadow-lv1,0 1px 2px rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,inherit)}
.dsh-upload-badge{width:44px;height:56px;border-radius:6px;color:#fff;font-size:12px;font-weight:700;font-family:var(--ds-font-family-code,monospace);display:inline-flex;align-items:center;justify-content:center;letter-spacing:.5px;flex:none;box-shadow:inset 0 -10px 14px rgba(0,0,0,.14),inset 0 10px 12px rgba(255,255,255,.16)}
.dsh-upload-name{width:100%;font-size:12px;line-height:16px;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-all}
.dsh-upload-size{color:var(--dsw-alias-label-tertiary,inherit);font-size:10.5px;flex:none}
.dsh-upload-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary,inherit);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;line-height:0;flex:none}
.dsh-upload-remove:hover{color:var(--dsw-alias-label-primary,inherit);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dsh-upload-card>.dsh-upload-remove{position:absolute;top:4px;right:4px}
.dsh-upload-error{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid var(--dsw-alias-border-l2-darkmode-thin,rgba(127,127,127,.22));background:var(--dsw-alias-interactive-bg-hover-danger,rgba(216,97,97,.14));color:var(--dsw-alias-state-error-primary,#d86161);border-radius:10px;padding:6px 8px 6px 10px;font-size:13px}
.dsh-upload-error-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}
.dsh-upload-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;background:color-mix(in srgb,var(--dsw-alias-surface-1,#101014) 72%,transparent);backdrop-filter:blur(2px);opacity:0;transition:opacity .12s ease}
.dsh-upload-overlay.active{opacity:1}
.dsh-upload-overlay-box{border:2px dashed var(--dsw-alias-border-accent,rgba(99,132,255,.55));border-radius:16px;padding:28px 44px;color:var(--dsw-alias-label-primary,inherit);font-size:15px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--dsw-specific-input-major,rgba(127,127,127,.08))}
.dsh-upload-overlay-hint{font-size:12px;color:var(--dsw-alias-label-tertiary,inherit)}
/* Hide the product's hardcoded command-launcher "+" so this plugin's "+"
   (attachments) is the single entry point. Slash commands stay reachable by
   typing "/". Two selectors for resilience across harness updates: the shipped
   CSS-module hash (current version) and the stable aria-haspopup="listbox"
   attribute (unique in the composer, survives hash changes). */
button.uV2eYG_add,button[aria-haspopup="listbox"]{display:none}
`
  document.head.appendChild(tag)
}

interface InputSnapshot {
  draft: string
  draftRev: number
  occurrences: Array<{ source: string; ref: string; occurrenceId: string; offset: number }>
}

interface InputService {
  for(actx: unknown): {
    state: { getSnapshot(): InputSnapshot }
  }
}

interface ConversationService {
  input: InputService
}

interface ActionContext {
  get(name: string): ConversationService | undefined
  emit(event: string, payload: Record<string, unknown>): void
}

interface UploadResponse {
  path?: string
  name?: string
  bytes?: number
  sniffedType?: string
  label?: string
  imageMode?: 'native' | 'ocr'
  imageDescription?: string
  relativePath?: string
  error?: string
}

function httpErrorText(status: number, t: Translator): string {
  if (status === 413) return t('http.413')
  if (status === 415) return t('http.415')
  if (status === 403) return t('http.403')
  if (status === 429) return t('http.429')
  return `HTTP ${status}`
}

async function uploadFile(actx: ActionContext, file: File, sessionId: string, t: Translator): Promise<string | null> {
  const conversation = actx.get('conversation')
  if (conversation === undefined) throw new Error('conversation service unavailable')
  const input = conversation.input.for(actx)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relPath = (file as any).relPath as string | undefined
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'x-file-name': encodeURIComponent(file.name),
      ...(relPath !== undefined ? { 'x-file-relpath': encodeURIComponent(relPath) } : {}),
      'x-session-id': sessionId
    },
    body: file
  })
  if (!res.ok) {
    let detail = httpErrorText(res.status, t)
    try {
      const payload = (await res.json()) as { error?: string }
      if (typeof payload.error === 'string') detail = payload.error
    } catch {
      // keep the status-based message
    }
    throw new Error(`${file.name}: ${detail}`)
  }
  const payload = (await res.json()) as UploadResponse
  if (typeof payload.path !== 'string') throw new Error('missing path in response')
  const name = payload.name ?? file.name
  const bytes = payload.bytes ?? file.size
  metaFor(sessionId).set(payload.path, {
    name,
    bytes,
    label: payload.label ?? name.slice(name.lastIndexOf('.') + 1).toUpperCase(),
    status: 'ready',
    ...(payload.relativePath !== undefined ? { relativePath: payload.relativePath } : {}),
    ...(file.type.startsWith('image/') ? { previewUrl: URL.createObjectURL(file) } : {})
  })
  clearUploadError()

  const state = input.state.getSnapshot()

  if (payload.sniffedType === 'image') {
    // Images: multimodal routes (incl. vision bridges like dsh-vision-proxy)
    // → agent uses the official read_image tool; text-only routes → an
    // automatic description was generated, insert it so the text-only model
    // can reason about the image immediately.
    const description =
      payload.imageMode === 'native'
        ? t('image.native', { path: payload.path })
        : payload.imageDescription !== undefined
          ? t('image.description', { description: payload.imageDescription, path: payload.path })
          : t('image.file', { path: payload.path })
    const text = t('image.tag', { name, description })
    actx.emit('slash/input-insert-text', {
      text,
      span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
    })
    return payload.path
  }

  // Larger text or documents: insert a path reference (Codex-style
  // `@relative/path`); the agent reads it with read_document (converted to
  // Markdown on demand).
  const refText = payload.relativePath !== undefined ? `@${payload.relativePath}` : payload.path
  const label = payload.preview !== undefined ? `[file: ${name}] (preview) ${payload.preview}` : ''
  actx.emit('slash/input-insert-reference', {
    reference: {
      source: SOURCE_NAME,
      ref: payload.path,
      label,
      clipboardText: refText
    },
    span: {
      start: state.draft.length,
      end: state.draft.length,
      draftRev: state.draftRev
    }
  })
  return payload.path
}

/** Recursively collect files from dropped dataTransfer items (folder support). */
async function collectDroppedFiles(items: DataTransferItemList | null): Promise<File[]> {
  if (items === null) return []
  const files: File[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = async (entry: any, prefix: string): Promise<void> => {
    if (entry === null) return
    if (entry.isFile) {
      const file = await new Promise<File | null>((resolve) => entry.file(resolve))
      if (file !== null) {
        if (prefix !== '') {
          const rel = `${prefix}/${file.name}`
          Object.defineProperty(file, 'relPath', { value: rel })
        }
        files.push(file)
      }
      return
    }
    if (entry.isDirectory) {
      const reader = entry.createReader()
      // readEntries returns in batches; loop until empty.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const entries = await new Promise<any[]>((resolve) => reader.readEntries(resolve))
        if (entries.length === 0) break
        for (const child of entries) await walk(child, prefix === '' ? entry.name : `${prefix}/${entry.name}`)
      }
    }
  }
  const jobs: Promise<void>[] = []
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
    if (entry !== null) {
      jobs.push(walk(entry, ''))
    } else {
      const f = item.getAsFile()
      if (f !== null) files.push(f)
    }
  }
  await Promise.all(jobs)
  return files
}

/** Files carried by a paste event (images and files). */
function filesFromClipboard(e: ClipboardEvent): File[] {
  const items = e.clipboardData?.items
  const files: File[] = []
  if (items !== undefined) {
    for (let i = 0; i < items.length; i += 1) {
      const f = items[i].getAsFile()
      if (f !== null) files.push(f)
    }
  }
  return files
}

async function attachFiles(actx: ActionContext, files: File[], sessionId: string, t: Translator): Promise<void> {
  for (const file of files) {
    try {
      await uploadFile(actx, file, sessionId, t)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err))
    }
  }
}

/** Open a native file picker and resolve the chosen files. */
function pickFiles(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.style.display = 'none'
    document.body.appendChild(input)
    input.onchange = () => {
      const files = Array.from(input.files ?? [])
      input.remove()
      resolve(files)
    }
    input.click()
  })
}

interface PlusMenuProps {
  attach: (files: File[]) => Promise<void>
  t: Translator
}

function PlusMenuButton({ attach, t }: PlusMenuProps) {
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

/** Global drag overlay + paste: drag files/folders anywhere over the window
 * or paste images/files into the composer to attach (Claude/Codex style). */
function DragOverlay({ attach, t }: { attach: (files: File[]) => Promise<void>; t: Translator }) {
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

interface DockProps {
  attach: (files: File[]) => Promise<void>
  sessionId: string
  t: Translator
}

function UploadDock({ attach, sessionId, t }: DockProps) {
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
            const badge = badgeStyle(meta.name)
            return (
              <div key={ref} className="dsh-upload-card">
                {meta.previewUrl !== undefined ? (
                  <img
                    src={meta.previewUrl}
                    alt={meta.name}
                    className="dsh-upload-thumb"
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                  />
                ) : (
                  <div className="dsh-upload-badge" style={{ background: badge.bg }}>
                    {badge.ext}
                  </div>
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

export function apply(ctx: {
  effect(fn: () => unknown): void
  inputTriggers: {
    registerSource(source: Record<string, unknown>): void
  }
  slots: {
    inject(name: string, fn: () => unknown): void
    register(spec: Record<string, unknown>, component: unknown): unknown
  }
  sessions: {
    scope(sessionId: string): ActionContext
  }
  locale: {
    register(ns: string, dicts: Record<string, Record<string, string>>): void
    bind(ns: string): Translator
  }
}): void {
  injectCss()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }))
  const t = ctx.locale.bind(NS)
  ctx.effect(() =>
    ctx.inputTriggers.registerSource({
      trigger: '@',
      name: SOURCE_NAME,
      // Codex-style: pick an already-uploaded file by its relative path.
      candidates: async (projection: { sessionId: string }) => {
        const metas = uploadMetaBySession.get(projection.sessionId)
        if (metas === undefined) return []
        return Array.from(metas.entries()).map(([path, meta]) => ({
          name: meta.relativePath ?? path,
          description: `${meta.label} · ${formatBytes(meta.bytes)}`,
          icon: '📎'
        }))
      },
      onPick: (pick: {
        candidate: { name: string }
        session: { sessionId: string }
      }): { insert: { source: string; ref: string; label: string; clipboardText: string } } | undefined => {
        const metas = uploadMetaBySession.get(pick.session.sessionId)
        if (metas === undefined) return undefined
        for (const [path, meta] of metas.entries()) {
          if ((meta.relativePath ?? path) === pick.candidate.name) {
            return {
              insert: {
                source: SOURCE_NAME,
                ref: path,
                label: meta.name,
                clipboardText: `@${meta.relativePath ?? path}`
              }
            }
          }
        }
        return undefined
      },
      codec: {
        clipboardText: (ref: string) => ref,
        serialize: async (ref: string) => ref
      }
    })
  )
  ctx.slots.inject('conversation.input.left', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.left',
        id: 'dsh-chat-enhancements-button',
        order: 0,
        locale: NS,
        inject: (sessionId: string) => ({
          attach: (files: File[]) => attachFiles(ctx.sessions.scope(sessionId), files, sessionId, t)
        })
      },
      PlusMenuButton
    )
  )
  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'dsh-chat-enhancements-dock',
        order: 5,
        locale: NS,
        inject: (sessionId: string) => ({
          attach: (files: File[]) => attachFiles(ctx.sessions.scope(sessionId), files, sessionId, t)
        })
      },
      UploadDock
    )
  )
}

// The client bundle must export the plugin object; esbuild iife does not write
// module.exports automatically, so assign it explicitly (banner defines the
// module variable at runtime). Mirrors the official dual-face plugin pattern.
declare const module: { exports: unknown } | undefined
if (typeof module !== 'undefined' && module !== null) {
  module.exports = {
    apply,
    inject: ['slots', 'inputTriggers', 'sessions', 'locale']
  }
}
