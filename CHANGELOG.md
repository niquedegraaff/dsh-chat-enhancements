# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- Small text files are inlined straight into the composer; larger text files return a preview snippet shown on their attachment card.
- `attachReferences` config: when enabled, uploading a document appends an `@filename` reference to the end of the composer draft.
- Enhanced system prompt so the agent can resolve "the file I just attached" by name from `.dsh-uploads/<sessionId>/` without an `@` reference.

### Changed

- Documents no longer auto-insert an `@path` reference at the caret; they stay in the dock until referenced.
- `@` menu candidates show the bare filename (not the storage path) with a file-type glyph; the inserted chip shows `@filename`.

## [0.6.0] - 2026-08-20

Initial release of `dsh-chat-enhancements`, forked from `dsh-file-upload` (MIT).

### Added

- Gemini-style "+" composer menu for attachments, using the harness's own `Menu` primitive (opens above the input, "+" rotates to "×" while open).
- Multi-file upload, global drag-and-drop (files and folders), and paste-to-attach.
- Codex-style `@relative/path` references and `@` mentions for uploaded files.
- `read_document` tool: paged Markdown reading with a byte-budgeted LRU cache.
- Fully bundled document → Markdown conversion (MarkItDown engine, 20+ formats).
- Image handling: `read_image` for multimodal routes, automatic descriptions for text-only routes.
- Locale-aware UI (zh/en) via the harness locale system.
