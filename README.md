# dsh-chat-enhancements

Chat-experience plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh).

This plugin is an umbrella for chat-experience upgrades. It currently provides a **Gemini-style "+" composer menu for attachments** — multi-file upload, global drag-and-drop (files and folders), paste-to-attach, Codex-style `@path` references, and a `read_document` tool for agents. Voice dictation, markdown rendering of your own messages, and a redesigned composer bar are planned.

It is based on [`dsh-file-upload`](https://github.com/HongMing-Huang/dsh-file-upload) by HongMing-Huang (MIT) — see [License / Attribution](#license--attribution).

## Features

- **Gemini-style "+" menu** — the composer's "+" opens the harness's own `Menu` component ("Upload files"), positioned left of the access-mode dropdown. The icon rotates to an "×" while the menu is open.
- **Upload** — multi-file upload from the "+" menu, global drag-and-drop (files and folders), and paste-to-attach.
- **Attachment cards** — uploaded files appear as removable, color-coded cards above the composer.
- **Codex-style references** — files are sent as `@relative/path` references (never raw content dumped into the composer); the agent reads them with `read_document`.
- **`@` mentions** — type `@` in the composer to pick an uploaded file by its relative path.
- **Document → Markdown, fully bundled** — the MarkItDown engine ships inside the plugin (Microsoft MarkItDown TypeScript port, `markitdown-node`): PDF / DOCX / PPTX / XLSX / HTML / CSV / JSON / XML / RSS / Atom / ZIP / Jupyter / image OCR / audio transcription. **No Python, no downloads, no setup.**
- **Image handling** — multimodal routes (and vision bridges) use the official `read_image` tool; text-only routes get an automatic image description via a vision discovery chain (local Ollama → OpenAI-compatible endpoint with a dsh-credentials key).
- **`read_document` tool** — paged Markdown reading (`offset`/`limit`) with a byte-budgeted LRU cache, reading through `ctx.fs` (inherits sandbox and fs-observation policy).
- **Security** — loopback-only uploads, sanitized file names, session-isolated storage (`.dsh-uploads/<sessionId>`), sha256 content dedup, bounded concurrency, TTL sweep.

## Install

From GitHub (current — the package is not yet on npm):

```sh
dsh plugin --profile web add github:niquedegraaff/dsh-chat-enhancements
# restart dsh web, then hard-refresh the browser
```

## Usage

1. Click the "+" in the composer toolbar, or drag files/folders anywhere over the window (or paste them into the composer).
2. Documents appear as attachment cards; their `@relative/path` reference is sent with your message.
3. The agent reads documents with `read_document <path>` — converted to Markdown on demand, pageable with `offset`/`limit`.

### MarkItDown (fully bundled — no downloads, no setup)

**The MarkItDown capability ships inside the plugin. Works out of the box: no Python, no pip, no downloads, no build-script approval.**

- **Bundled engine** — the Microsoft MarkItDown TypeScript port (`markitdown-node`) is a regular dependency covering **20+ formats**: PDF, DOCX, PPTX, XLSX, HTML, CSV, JSON, XML, RSS, Atom, ZIP, Jupyter notebooks, images (OCR via Tesseract, 110+ languages), and audio transcription (via LLM, needs model credentials).
- **Images** — OCR to text by default through the bundled engine.
- **Offline** — all parsing runs locally, no network calls.

> Optional upgrade: if an official MarkItDown CLI already exists on your machine (or is set via `markitdownBin`), the plugin prefers it (adds EPUB and more); without one the bundled engine is always available.

### How images are handled (auto-explained)

The plugin **detects your session's model capability at upload time**:

| Detected route | What happens |
|---|---|
| **Multimodal model** (declares `image` input, e.g. GPT-4o / Qwen-VL / Claude / Gemini) | `imageMode: native` — the agent uses the official `read_image` tool; the image enters model context directly |
| **Vision bridge installed** (e.g. dsh-vision-proxy) | detected automatically (they declare image input on their route) — same native path |
| **Text-only model** (the DeepSeek API is text-only) | an automatic **image description** is generated via the vision discovery chain and inserted with the message — the model reasons about the image content immediately |

**Vision discovery chain** (zero-config): ① explicit `visionEndpoint`/`visionModel` → ② **local Ollama** at `http://localhost:11434` (picks a VL model such as DeepSeek-VL2 — images never leave the machine) → ③ OpenAI standard endpoint using a key from the dsh credentials seam.

The route detection mirrors the official `read_image` gate (`ctx.llm.resolveModelInfo` + `inputModalities`).

## Configuration

> All fields have sensible defaults — you can install and use the plugin
> without touching any of them. Tune only what you need.

| Field | Default | Description |
|---|---|---|
| `uploadMaxBytes` | 25165824 (24 MB) | Max bytes per uploaded file |
| `allowedExtensions` | `[]` | Extension allowlist; empty = all allowed |
| `uploadTtlMs` | 604800000 (7 days) | Unreferenced upload lifetime |
| `sweepIntervalMs` | 3600000 (1 h) | Sweep period; 0 = disabled |
| `maxConcurrentUploads` | 4 | Concurrent upload limit |
| `inlineTextLimit` | 8192 (8 KB) | Text inlined into the composer up to this size |
| `previewTextLimit` | 2048 (2 KB) | Preview length for larger text files |
| `maxFileBytes` | 25165824 | Byte cap for one document read |
| `readLimit` | 2000 | Max lines returned by one `read_document` call |
| `sheetRowLimit` | 200 | Rows kept per XLSX sheet |
| `maxSheets` | 5 | Sheets read per workbook |
| `cacheEntries` | 16 | Parse-cache entry count |
| `cacheMaxBytes` | 67108864 (64 MB) | Parse-cache byte budget |
| `markitdownBin` | `''` | Optional MarkItDown CLI path; empty = auto-detect PATH |
| `markitdownTimeoutMs` | 120000 | Timeout for one CLI invocation |
| `visionEndpoint` | `''` | Vision endpoint for image explanations; empty = auto (local Ollama → OpenAI standard) |
| `visionModel` | `''` | Vision model id; empty = auto |
| `visionApiKeyEnv` | `OPENAI_API_KEY` | Credential reference for the vision key (dsh credentials seam) |
| `visionMaxBytes` | 10485760 (10 MB) | Max image bytes sent to the vision endpoint |

## Development

```sh
pnpm install
pnpm typecheck   # strict TypeScript
pnpm build       # tsc (host) + esbuild (client bundle)
pnpm test        # node --test
pnpm build:install  # build + copy lib/ into the running dsh profile; then restart dsh web + hard-refresh
pnpm dev            # watch src/ → auto-build + install on every change
```

## Architecture

```
src/
├── index.ts            # thin re-export entry (keeps package main/lib shape)
├── host/
│   ├── index.ts        # plugin entry: apply + Config schema + assembly
│   └── attachments/    # detect, convert, vision, upload, tool (read_document)
├── client/
│   ├── index.tsx       # client apply: locale, slots, input-trigger source
│   └── attachments/    # "+" menu, upload flow, dock, drag/paste overlay
└── shared/             # common constants + locale binding types
```

Dual-face plugin: `dsh.bundle` (host) + `dsh.client` (web UI). No official patches — everything uses official seams (`ctx.webServer`, `ctx.tools`, `ctx.systemPrompt`, `ctx.sessions`, `slash/input-insert-text`, `slash/input-insert-reference`, and the client slot framework).

## Security

- Uploads are loopback-only and same-origin checked.
- File names are sanitized (control chars, path separators, dot segments, leading dots stripped).
- Storage is session-isolated under the session's own workspace; unknown sessions get 403.
- sha256 content dedup, bounded concurrency (429 on overload), TTL sweep.
- Text extraction parses bytes, never trusts extensions; binaries are handed to the agent by path only.

## License / Attribution

MIT. Based on [`dsh-file-upload`](https://github.com/HongMing-Huang/dsh-file-upload) by HongMing-Huang (MIT). See [LICENSE](LICENSE).
