import type { AttachmentsLocaleKey } from './attachments/locale.ts'

/**
 * Locale namespace declaration for the attachments feature. The namespace key
 * must match `LOCALE_NS` from `src/shared/constants.ts`; the value is the exact
 * dictionary key union, so `LocaleRuntime.register` and the framework-injected
 * `t` seat are both checked against the real dictionary.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    chatEnhancements: AttachmentsLocaleKey
  }
}
