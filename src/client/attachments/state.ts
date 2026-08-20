import type { UploadMeta } from './types.ts'

/** Per-session attachment metadata: Map<sessionId, Map<path, meta>>. */
export const uploadMetaBySession = new Map<string, Map<string, UploadMeta>>()

export function metaFor(sessionId: string): Map<string, UploadMeta> {
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

export function subscribeErrors(listener: () => void): () => void {
  errorListeners.add(listener)
  return () => {
    errorListeners.delete(listener)
  }
}

export function setUploadError(text: string): void {
  uploadError = { seq: ++errorSeq, text }
  for (const listener of errorListeners) listener()
}

export function clearUploadError(): void {
  uploadError = null
  for (const listener of errorListeners) listener()
}
