import type { ComposedProps, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './constants.ts'
import type { AttachmentsLocaleKey } from './locale.ts'

// Loads the ui-conversation SlotMap declaration (conversation.input.left /
// conversation.input.dock) so the composed slot props below resolve against
// the real owner/scope contract instead of a hand-rolled key.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

/**
 * Locale namespace declaration for the attachments feature. The namespace key
 * must match `LOCALE_NS` from `src/shared/constants.ts`; the value is the exact
 * dictionary key union, so `LocaleRuntime.register` and the framework-injected
 * `t` seat are both checked against the real dictionary. Kept in this module
 * (rather than an ambient .d.ts) so every importing component loads the merge.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    chatEnhancements: AttachmentsLocaleKey
  }
}

/** Per-session attachment metadata. */
export interface UploadMeta {
  name: string
  bytes: number
  label: string
  status: 'uploading' | 'ready' | 'error'
  error?: string
  previewUrl?: string
  /** Byte-budgeted text preview for large text files, shown in the dock. */
  preview?: string
  relativePath?: string
}

/** Response body of the host /api/upload route. */
export interface UploadResponse {
  path?: string
  name?: string
  bytes?: number
  sniffedType?: string
  label?: string
  /** Full decoded text of a small text file, dropped straight into the composer. */
  inlineText?: string
  /** Byte-budgeted text preview of a large text file, shown in the dock. */
  preview?: string
  imageMode?: 'native' | 'ocr'
  imageDescription?: string
  relativePath?: string
  error?: string
}

/** Typed translate of the attachments locale namespace. */
export type AttachmentsTranslate = TranslateNS<typeof NS>

/** Injected business face of the attachments slot entries. */
export interface AttachmentsInjected {
  attach: (files: File[]) => Promise<void>
}

/** Props shared by the attachments UI components (manual render sites). */
export interface AttachmentsProps extends AttachmentsInjected {
  t: AttachmentsTranslate
}

/**
 * Composed props of an entry registered into one of the input-region slots
 * (`conversation.input.left` / `conversation.input.dock`, both `list` + `session`
 * with the same `InputZone` owner share). The framework synthesizes the `t` seat
 * from the `locale:` registration and the `attach` seat from the inject factory.
 */
export type AttachmentsSlotProps = ComposedProps<
  'conversation.input.left',
  string,
  never,
  undefined,
  AttachmentsInjected,
  never,
  typeof NS
>
