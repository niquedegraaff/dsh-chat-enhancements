import type { Translator } from '../../shared/locale.ts'
import { SOURCE_NAME } from './constants.ts'
import { clearUploadError, metaFor, setUploadError } from './state.ts'
import type { ActionContext, UploadResponse } from './types.ts'

export function httpErrorText(status: number, t: Translator): string {
  if (status === 413) return t('http.413')
  if (status === 415) return t('http.415')
  if (status === 403) return t('http.403')
  if (status === 429) return t('http.429')
  return `HTTP ${status}`
}

export async function uploadFile(actx: ActionContext, file: File, sessionId: string, t: Translator): Promise<string | null> {
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
export async function collectDroppedFiles(items: DataTransferItemList | null): Promise<File[]> {
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
export function filesFromClipboard(e: ClipboardEvent): File[] {
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

export async function attachFiles(actx: ActionContext, files: File[], sessionId: string, t: Translator): Promise<void> {
  for (const file of files) {
    try {
      await uploadFile(actx, file, sessionId, t)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err))
    }
  }
}

/** Open a native file picker and resolve the chosen files. */
export function pickFiles(): Promise<File[]> {
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
