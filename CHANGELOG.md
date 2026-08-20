# Changelog

All notable changes to this project are documented in this file.

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
