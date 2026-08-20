import type { Translator } from '../../shared/locale.ts'

/** Per-session attachment metadata. */
export interface UploadMeta {
  name: string
  bytes: number
  label: string
  status: 'uploading' | 'ready' | 'error'
  error?: string
  previewUrl?: string
  relativePath?: string
}

/** Snapshot of the conversation input state. */
export interface InputSnapshot {
  draft: string
  draftRev: number
  occurrences: Array<{ source: string; ref: string; occurrenceId: string; offset: number }>
}

export interface InputService {
  for(actx: unknown): {
    state: { getSnapshot(): InputSnapshot }
  }
}

export interface ConversationService {
  input: InputService
}

/** Narrow view of the harness action context the client flow needs. */
export interface ActionContext {
  get(name: string): ConversationService | undefined
  emit(event: string, payload: Record<string, unknown>): void
}

/** Response body of the host /api/upload route. */
export interface UploadResponse {
  path?: string
  name?: string
  bytes?: number
  sniffedType?: string
  label?: string
  /** Text preview for large text files; currently not produced by the host. */
  preview?: string
  imageMode?: 'native' | 'ocr'
  imageDescription?: string
  relativePath?: string
  error?: string
}

/** Props shared by the attachments UI components. */
export interface AttachmentsProps {
  attach: (files: File[]) => Promise<void>
  t: Translator
}
