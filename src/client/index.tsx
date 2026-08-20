// dsh-chat-enhancements client face: assembles the attachments module into the
// harness seams — locale, the "+" composer slot, the dock slot, and the "@"
// input-trigger source.

import { NS, SOURCE_NAME } from './attachments/constants.ts'
import { zh, en } from './attachments/locale.ts'
import { injectCss } from './attachments/styles.ts'
import { attachFiles } from './attachments/upload.ts'
import { uploadMetaBySession } from './attachments/state.ts'
import { formatBytes } from './attachments/format.ts'
import { PlusMenuButton } from './attachments/menu.tsx'
import { UploadDock } from './attachments/dock.tsx'
import type { ActionContext } from './attachments/types.ts'
import type { Translator } from '../shared/locale.ts'

/**
 * Narrow structural view of the harness client context consumed by this plugin.
 * The full service types live in the runtime-injected `@deepseek-ai/dsh-client-*`
 * packages; keeping this self-contained lets the client face type-check without
 * importing that whole graph.
 */
interface ClientContext {
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
}

export function apply(ctx: ClientContext): void {
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
