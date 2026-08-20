/** Locale binding helpers shared across faces. @module dsh-chat-enhancements/shared */

/** Translator bound to a locale namespace. */
export type Translator = (key: string, params?: Record<string, string>) => string
