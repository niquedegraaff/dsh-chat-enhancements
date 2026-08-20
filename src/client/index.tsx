// dsh-chat-enhancements client face: assembles the attachments module into the
// harness seams — locale, the "+" composer slot, the dock slot, and the "@"
// input-trigger source.

import { NS, SOURCE_NAME } from './attachments/constants.ts'
import { zh, en } from './attachments/locale.ts'
import { injectCss } from './attachments/styles.ts'
import { attachFiles } from './attachments/upload.ts'
import { uploadMetaBySession } from './attachments/state.ts'
import { fileGlyph, formatBytes } from './attachments/format.ts'
import { PlusMenuButton } from './attachments/menu.tsx'
import { UploadDock } from './attachments/dock.tsx'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
// Loads the client-locale service augmentation so `ctx.locale` resolves to the
// real LocaleRuntime (typed register/bind) instead of an untyped member.
import type {} from '@deepseek-ai/dsh-client-locale/client'

/** Client-side view of the plugin config (only the fields this face reads). */
interface ClientConfig {
  attachReferences?: boolean
}

export function apply(ctx: ClientContext, config?: ClientConfig): void {
  const attachReferences = config?.attachReferences === true
  injectCss()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }))
  const t = ctx.locale.bind(NS)

  const referenceSource: InputTriggerSource = {
    trigger: '@',
    name: SOURCE_NAME,
    // Codex-style: pick an already-uploaded file by its relative path. The
    // menu shows the bare filename (not the storage path), with the path
    // carried opaquely on `value` so `onPick` can resolve it losslessly.
    candidates: async (session, _req) => {
      const metas = uploadMetaBySession.get(session.sessionId)
      if (metas === undefined) return []
      return Array.from(metas.entries()).map(([path, meta]) => ({
        name: meta.name,
        description: `${meta.label} · ${formatBytes(meta.bytes)}`,
        icon: fileGlyph(meta.label, meta.previewUrl),
        value: path
      }))
    },
    onPick: (pick) => {
      const metas = uploadMetaBySession.get(pick.session.sessionId)
      if (metas === undefined || pick.candidate.value === undefined) return undefined
      const meta = metas.get(pick.candidate.value)
      if (meta === undefined) return undefined
      return {
        insert: {
          source: SOURCE_NAME,
          ref: pick.candidate.value,
          label: meta.name,
          appearance: 'file',
          clipboardText: `@${meta.name}`
        }
      }
    },
    codec: {
      clipboardText: (ref) => ref,
      serialize: async (ref, _signal) => ref
    }
  }
  ctx.effect(() => ctx.inputTriggers.registerSource(referenceSource))

  ctx.slots.inject('conversation.input.left', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.left',
        id: 'dsh-chat-enhancements-button',
        order: 0,
        locale: NS,
        inject: (sessionId) => ({
          attach: (files: File[]) => {
            const scope = ctx.sessions.scope(sessionId)
            return scope === undefined ? Promise.resolve() : attachFiles(scope, files, sessionId, t, attachReferences)
          }
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
        inject: (sessionId) => ({
          attach: (files: File[]) => {
            const scope = ctx.sessions.scope(sessionId)
            return scope === undefined ? Promise.resolve() : attachFiles(scope, files, sessionId, t, attachReferences)
          }
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
