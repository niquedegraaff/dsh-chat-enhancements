# Step 2 — Modular refactor of `dsh-chat-enhancements`

> Session-start prompt. Paste this into a fresh session (with the plugin-development agent) and let it work from there. Keep each feature in its own fresh session afterwards.

## Context

`dsh-chat-enhancements` is a dual-face DeepSeek Harness plugin (host + web client) at `C:\Users\Dominique\dev\dsh-chat-enhancements` (git repo; `origin` → https://github.com/niquedegraaff/dsh-chat-enhancements).

It started as a fork of `dsh-file-upload` (MIT) and is an umbrella for chat-experience features. It currently provides:

- A Gemini-style "+" composer menu for attachments (`conversation.input.left`), using the harness's own `Menu` primitive (opens above the input via `side="top"`; the "+" rotates to "×" while open), with a single "Upload files" entry. Positioned left of the access-mode dropdown via CSS `order:-1`.
- Upload pipeline (host): `/api/upload`, session-isolated storage (`.dsh-uploads/<sessionId>`), content sniffing, bundled document → Markdown (markitdown-node, 20+ formats), `read_document` tool, image handling (`read_image` for multimodal routes / vision description for text-only).
- Codex-style `@relative/path` references and `@` mentions.
- Locale-aware UI (zh/en) via `ctx.locale` (namespace `chatEnhancements`).

Current layout is flat: `src/index.ts`, `src/detect.ts`, `src/convert.ts`, `src/vision.ts`, `src/upload.ts`, `src/tool.ts`, `src/client/index.tsx`.

## Goal

Refactor into a **modular structure** so new chat-experience features (voice dictation, markdown rendering of your own messages, a redesigned composer bar, model/effort selector split) can be added as isolated modules without touching existing code. This must be a **behavior-preserving refactor**: the plugin works identically before and after.

Proposed target (adjust as you see fit):

```
src/
├── host/
│   ├── index.ts        # plugin entry: apply, Config schema, assembly
│   └── attachments/    # detect, convert, vision, upload, tool (read_document)
├── client/
│   ├── index.tsx       # client apply: locale, slots, input-trigger source
│   └── attachments/    # "+" menu, upload flow, dock, drag/paste overlay
├── shared/             # common types / helpers (locale binding, constants)
└── index.ts            # thin re-export entry (keeps package main/lib shape)
```

## Constraints / learnings (important)

- Reuse harness components and seams: `Menu`/`Button`/`Tooltip`/icons from `@deepseek-ai/dsh-client-ui-primitives`; slots `conversation.input.left` / `.dock`; `ctx.locale.register`/`bind` (namespace `chatEnhancements`); `slash/input-insert-text` / `slash/input-insert-reference`; `ctx.inputTriggers`; `ctx.webServer`, `ctx.tools`, `ctx.systemPrompt`, `ctx.sessions`.
- Keep the i18n approach: `zh`/`en` dictionaries, `locale: NS` on slot registrations (auto live `t()`), **no hardcoded Chinese**.
- Do **not** break: the "+" menu; the native "+" hide rule (`button.uV2eYG_add, button[aria-haspopup="listbox"]` — the `aria-haspopup` selector is intentional); upload / drag-and-drop / paste; `@` mentions; `read_document`.
- `lib/` is committed (needed for GitHub installs) — rebuild and commit it after the refactor.
- Checks: `pnpm typecheck && pnpm build && pnpm test` must pass.
- Install/verify loop: copy `lib/` to `~/.dsh/profiles/web/node_modules/dsh-chat-enhancements/lib/`, restart `dsh web`, hard-refresh the browser.

## Deliverable

- Modular structure with clear boundaries, no behavior change.
- All checks pass; `lib/` rebuilt and committed.
- Commit on a branch and push to `origin`.
- Report what moved where, and a short example of how a new feature module (e.g. `client/voice/`) would be added.
