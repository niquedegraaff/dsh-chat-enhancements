window.__ModuleLoader__.load({ id: "dsh-chat-enhancements", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/shared/constants.ts
  var PLUGIN_NAME = "dsh-chat-enhancements";
  var LOCALE_NS = "chatEnhancements";

  // src/client/attachments/constants.ts
  var NS = LOCALE_NS;
  var SOURCE_NAME = PLUGIN_NAME;
  var STYLE_TAG = `${PLUGIN_NAME}/style.css`;

  // src/client/attachments/locale.ts
  var zh = {
    "http.413": "\u6587\u4EF6\u8D85\u8FC7\u5927\u5C0F\u9650\u5236",
    "http.415": "\u6587\u4EF6\u7C7B\u578B\u4E0D\u88AB\u5141\u8BB8",
    "http.403": "\u4F1A\u8BDD\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5",
    "http.429": "\u4E0A\u4F20\u592A\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
    "upload.busy": "\u4E0A\u4F20\u4E2D\u2026",
    "upload.label": "\u4E0A\u4F20\u6587\u4EF6",
    "drag.title": "\u677E\u5F00\u4EE5\u6DFB\u52A0\u6587\u4EF6",
    "drag.desc": "\u6587\u4EF6/\u6587\u4EF6\u5939\u5C06\u4E0A\u4F20\u5230\u5F53\u524D\u4F1A\u8BDD,agent \u53EF\u8BFB\u53D6\u5176\u5185\u5BB9",
    "card.remove": "\u79FB\u9664",
    "card.close": "\u5173\u95ED",
    "image.native": "\u5F53\u524D\u6A21\u578B\u652F\u6301\u56FE\u50CF\u8F93\u5165,\u8BF7\u7528 read_image \u5DE5\u5177\u67E5\u770B {path}",
    "image.description": "\u56FE\u7247\u8BB2\u89E3(\u81EA\u52A8\u751F\u6210):\n{description}\n\u539F\u59CB\u6587\u4EF6: {path}",
    "image.file": "\u56FE\u7247\u4EE5\u6587\u4EF6\u5F62\u5F0F\u4E0A\u4F20({path});\u672A\u751F\u6210\u8BB2\u89E3,\u8BF7\u7528 read_document \u5DE5\u5177\u8BFB\u53D6",
    "image.tag": "[\u56FE\u7247: {name}] {description}",
    "menu.button": "\u6DFB\u52A0",
    "menu.upload.files": "\u4E0A\u4F20\u6587\u4EF6"
  };
  var en = {
    "http.413": "File exceeds the size limit",
    "http.415": "File type not allowed",
    "http.403": "Session validation failed; refresh the page and try again",
    "http.429": "Uploading too frequently; try again later",
    "upload.busy": "Uploading\u2026",
    "upload.label": "Upload file",
    "drag.title": "Release to add files",
    "drag.desc": "Files/folders upload to the current session; the agent can read their contents",
    "card.remove": "Remove",
    "card.close": "Close",
    "image.native": "The current model supports image input; use the read_image tool to view {path}",
    "image.description": "Image description (auto-generated):\n{description}\nOriginal file: {path}",
    "image.file": "Image uploaded as a file ({path}); no description generated, use the read_document tool to read it",
    "image.tag": "[image: {name}] {description}",
    "menu.button": "Add",
    "menu.upload.files": "Upload files"
  };

  // src/client/attachments/styles.ts
  function injectCss() {
    if (typeof document === "undefined") return;
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return;
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-chat-enhancements";
    tag.dataset.pluginCss = STYLE_TAG;
    tag.textContent = `
.dsh-plus-root{display:inline-flex;order:-1;margin-right:-4px}
.dsh-plus-btn{width:28px;height:28px;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;cursor:pointer}
.dsh-plus-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-plus-btn:disabled{opacity:.45;cursor:default}
.dsh-plus-icon{display:inline-flex;transition:transform .25s ease}
.dsh-plus-icon-open{transform:rotate(45deg)}
.dsh-upload-dock{display:flex;flex-wrap:wrap;gap:8px;width:100%}
.dsh-upload-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;width:180px;max-width:100%;flex:none;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);background:var(--dsw-specific-input-major,var(--dsw-alias-surface-2));border-radius:12px;padding:10px 12px;box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-label-primary)}
.dsh-upload-label{font-size:10px;font-weight:700;letter-spacing:.5px;color:var(--dsw-alias-label-tertiary);text-transform:uppercase;flex:none}
.dsh-upload-thumb{width:44px;height:44px;object-fit:cover;border-radius:6px;flex:none}
.dsh-upload-name{width:100%;font-size:12px;line-height:16px;text-align:left;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-all}
.dsh-upload-size{color:var(--dsw-alias-label-tertiary);font-size:10.5px;flex:none;text-align:left}
.dsh-upload-preview{width:100%;font-size:10px;line-height:13px;color:var(--dsw-alias-label-tertiary);text-align:left;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;word-break:break-all;font-family:var(--ds-font-family-code,monospace)}
.dsh-upload-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;line-height:0;flex:none}
.dsh-upload-remove:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-upload-card>.dsh-upload-remove{position:absolute;top:6px;right:6px;opacity:0;pointer-events:none;transition:opacity .12s ease}
.dsh-upload-card:hover>.dsh-upload-remove{opacity:1;pointer-events:auto}
.dsh-upload-error{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:10px;padding:6px 8px 6px 10px;font-size:13px}
.dsh-upload-error-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}
.dsh-upload-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;background:color-mix(in srgb,var(--dsw-alias-surface-1) 72%,transparent);backdrop-filter:blur(2px);opacity:0;transition:opacity .12s ease}
.dsh-upload-overlay.active{opacity:1}
.dsh-upload-overlay-box{border:2px dashed var(--dsw-alias-border-accent);border-radius:16px;padding:28px 44px;color:var(--dsw-alias-label-primary);font-size:15px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--dsw-specific-input-major,var(--dsw-alias-surface-2))}
.dsh-upload-overlay-hint{font-size:12px;color:var(--dsw-alias-label-tertiary)}
/* Hide the product's hardcoded command-launcher "+" so this plugin's "+"
   (attachments) is the single entry point. Slash commands stay reachable by
   typing "/". Two selectors for resilience across harness updates: the shipped
   CSS-module hash (current version) and the stable aria-haspopup="listbox"
   attribute (unique in the composer, survives hash changes). */
button.uV2eYG_add,button[aria-haspopup="listbox"]{display:none}
`;
    document.head.appendChild(tag);
  }

  // src/client/attachments/state.ts
  var uploadMetaBySession = /* @__PURE__ */ new Map();
  function metaFor(sessionId) {
    let m = uploadMetaBySession.get(sessionId);
    if (m === void 0) {
      m = /* @__PURE__ */ new Map();
      uploadMetaBySession.set(sessionId, m);
    }
    return m;
  }
  var uploadError = null;
  var errorSeq = 0;
  var errorListeners = /* @__PURE__ */ new Set();
  function subscribeErrors(listener) {
    errorListeners.add(listener);
    return () => {
      errorListeners.delete(listener);
    };
  }
  function setUploadError(text) {
    uploadError = { seq: ++errorSeq, text };
    for (const listener of errorListeners) listener(uploadError);
  }
  function clearUploadError() {
    uploadError = null;
    for (const listener of errorListeners) listener(uploadError);
  }

  // src/client/attachments/upload.ts
  function httpErrorText(status, t) {
    if (status === 413) return t("http.413");
    if (status === 415) return t("http.415");
    if (status === 403) return t("http.403");
    if (status === 429) return t("http.429");
    return `HTTP ${status}`;
  }
  async function uploadFile(actx, file, sessionId, t, attachReferences) {
    const conversation = actx.get("conversation");
    if (conversation === void 0) throw new Error("conversation service unavailable");
    const input = conversation.input.for(actx);
    const relPath = file.relPath;
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "x-file-name": encodeURIComponent(file.name),
        ...relPath !== void 0 ? { "x-file-relpath": encodeURIComponent(relPath) } : {},
        "x-session-id": sessionId
      },
      body: file
    });
    if (!res.ok) {
      let detail = httpErrorText(res.status, t);
      try {
        const payload2 = await res.json();
        if (typeof payload2.error === "string") detail = payload2.error;
      } catch {
      }
      throw new Error(`${file.name}: ${detail}`);
    }
    const payload = await res.json();
    if (typeof payload.path !== "string") throw new Error("missing path in response");
    const name = payload.name ?? file.name;
    const bytes = payload.bytes ?? file.size;
    metaFor(sessionId).set(payload.path, {
      name,
      bytes,
      label: payload.label ?? name.slice(name.lastIndexOf(".") + 1).toUpperCase(),
      status: "ready",
      ...payload.relativePath !== void 0 ? { relativePath: payload.relativePath } : {},
      ...payload.preview !== void 0 ? { preview: payload.preview } : {},
      ...file.type.startsWith("image/") ? { previewUrl: URL.createObjectURL(file) } : {}
    });
    clearUploadError();
    const state = input.state.getSnapshot();
    if (payload.sniffedType === "image") {
      const description = payload.imageMode === "native" ? t("image.native", { path: payload.path }) : payload.imageDescription !== void 0 ? t("image.description", { description: payload.imageDescription, path: payload.path }) : t("image.file", { path: payload.path });
      const text = t("image.tag", { name, description });
      actx.emit("slash/input-insert-text", {
        text,
        span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
      });
      return payload.path;
    }
    if (payload.inlineText !== void 0) {
      actx.emit("slash/input-insert-text", {
        text: payload.inlineText,
        span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
      });
      return payload.path;
    }
    if (attachReferences) {
      actx.emit("slash/input-insert-reference", {
        reference: {
          source: SOURCE_NAME,
          ref: payload.path,
          label: name,
          appearance: "file",
          clipboardText: `@${name}`
        },
        span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
      });
    }
    return payload.path;
  }
  async function collectDroppedFiles(items) {
    if (items === null) return [];
    const files = [];
    const walk = async (entry, prefix) => {
      if (entry === null) return;
      if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve));
        if (file !== null) {
          if (prefix !== "") {
            const rel = `${prefix}/${file.name}`;
            Object.defineProperty(file, "relPath", { value: rel });
          }
          files.push(file);
        }
        return;
      }
      if (entry.isDirectory) {
        const reader = entry.createReader();
        while (true) {
          const entries = await new Promise((resolve) => reader.readEntries(resolve));
          if (entries.length === 0) break;
          for (const child of entries) await walk(child, prefix === "" ? entry.name : `${prefix}/${entry.name}`);
        }
      }
    };
    const jobs = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry !== null) {
        jobs.push(walk(entry, ""));
      } else {
        const f = item.getAsFile();
        if (f !== null) files.push(f);
      }
    }
    await Promise.all(jobs);
    return files;
  }
  function filesFromClipboard(e) {
    const items = e.clipboardData?.items;
    const files = [];
    if (items !== void 0) {
      for (let i = 0; i < items.length; i += 1) {
        const f = items[i].getAsFile();
        if (f !== null) files.push(f);
      }
    }
    return files;
  }
  async function attachFiles(actx, files, sessionId, t, attachReferences) {
    for (const file of files) {
      try {
        await uploadFile(actx, file, sessionId, t, attachReferences);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : String(err));
      }
    }
  }
  function pickFiles() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      document.body.appendChild(input);
      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        input.remove();
        resolve(files);
      };
      input.click();
    });
  }

  // src/client/attachments/format.ts
  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }
  function fileGlyph(label, previewUrl) {
    if (previewUrl !== void 0) return "\u{1F5BC}\uFE0F";
    switch (label.toUpperCase()) {
      case "PDF":
        return "\u{1F4C4}";
      case "DOCX":
        return "\u{1F4DD}";
      case "XLSX":
        return "\u{1F4CA}";
      case "ZIP":
        return "\u{1F4E6}";
      case "MP3":
      case "WAV":
      case "M4A":
      case "FLAC":
      case "OGG":
      case "AUDIO":
        return "\u{1F3B5}";
      default:
        return "\u{1F4C4}";
    }
  }

  // src/client/attachments/menu.tsx
  var import_react = __require("react");
  var import_dsh_client_ui_primitives = __require("@deepseek-ai/dsh-client-ui-primitives");
  var import_jsx_runtime = __require("react/jsx-runtime");
  function PlusMenuButton({ attach, t }) {
    const [open, setOpen] = (0, import_react.useState)(false);
    const [busy, setBusy] = (0, import_react.useState)(false);
    const runUpload = async (files) => {
      if (files.length === 0) return;
      setBusy(true);
      setOpen(false);
      try {
        await attach(files);
      } finally {
        setBusy(false);
      }
    };
    const pick = () => {
      void pickFiles().then(runUpload);
    };
    const items = [
      { id: "files", label: t("menu.upload.files"), icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconPaperclipOutline16, { size: 16 }) }
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-plus-root", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Menu,
      {
        open,
        items,
        onSelect: (id) => {
          setOpen(false);
          if (id === "files") pick();
        },
        onClose: () => setOpen(false),
        side: "top",
        anchor: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-plus-btn",
            "aria-label": t("menu.button"),
            disabled: busy,
            onClick: () => setOpen((v) => !v),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: open ? "dsh-plus-icon dsh-plus-icon-open" : "dsh-plus-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconPlusOutline16, { size: 14 }) })
          }
        )
      }
    ) });
  }

  // src/client/attachments/dock.tsx
  var import_react3 = __require("react");
  var import_dsh_client_ui_primitives2 = __require("@deepseek-ai/dsh-client-ui-primitives");

  // src/client/attachments/overlay.tsx
  var import_react2 = __require("react");
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  function DragOverlay({ attach, t }) {
    const [active, setActive] = (0, import_react2.useState)(false);
    const depth = (0, import_react2.useRef)(0);
    (0, import_react2.useEffect)(() => {
      const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
      const onDragEnter = (e) => {
        if (!hasFiles(e)) return;
        depth.current += 1;
        setActive(true);
      };
      const onDragOver = (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
      };
      const onDragLeave = (e) => {
        if (!hasFiles(e)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setActive(false);
      };
      const onDrop = (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        depth.current = 0;
        setActive(false);
        void (async () => {
          const files = await collectDroppedFiles(e.dataTransfer?.items ?? null);
          if (files.length > 0) await attach(files);
        })();
      };
      const onPaste = (e) => {
        const files = filesFromClipboard(e);
        if (files.length > 0 && files.some((f) => f.type.startsWith("image/") || f.type !== "")) {
          e.preventDefault();
          void attach(files);
        }
      };
      document.addEventListener("dragenter", onDragEnter);
      document.addEventListener("dragover", onDragOver);
      document.addEventListener("dragleave", onDragLeave);
      document.addEventListener("drop", onDrop);
      document.addEventListener("paste", onPaste);
      return () => {
        document.removeEventListener("dragenter", onDragEnter);
        document.removeEventListener("dragover", onDragOver);
        document.removeEventListener("dragleave", onDragLeave);
        document.removeEventListener("drop", onDrop);
        document.removeEventListener("paste", onPaste);
      };
    }, [attach]);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `dsh-upload-overlay${active ? " active" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-upload-overlay-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: t("drag.title") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-upload-overlay-hint", children: t("drag.desc") })
    ] }) });
  }

  // src/client/attachments/dock.tsx
  var import_jsx_runtime3 = __require("react/jsx-runtime");
  function UploadDock({ attach, sessionId, t }) {
    const [metaVersion, setMetaVersion] = (0, import_react3.useState)(0);
    const [error, setError] = (0, import_react3.useState)(null);
    (0, import_react3.useEffect)(() => {
      const offs = [
        subscribeErrors((next) => {
          setError(next);
          setMetaVersion((v) => v + 1);
        })
      ];
      return () => {
        for (const off of offs) off();
      };
    }, []);
    if (sessionId === void 0) return null;
    const removeCard = (ref) => {
      metaFor(sessionId).delete(ref);
      setMetaVersion((v) => v + 1);
      void fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
          "x-file-path": ref
        }
      }).catch(() => void 0);
    };
    const entries = Array.from(metaFor(sessionId).entries());
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-upload-dock", children: entries.map(([ref, meta]) => {
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-upload-card", children: [
          meta.previewUrl !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "img",
            {
              src: meta.previewUrl,
              alt: meta.name,
              className: "dsh-upload-thumb"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-upload-label", children: meta.label }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-upload-name", title: meta.name, children: meta.name }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-upload-size", children: formatBytes(meta.bytes) }),
          meta.preview !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-upload-preview", title: meta.preview, children: meta.preview }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.Tooltip, { label: t("card.remove"), side: "top", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              className: "dsh-upload-remove",
              "aria-label": t("card.remove"),
              onClick: () => removeCard(ref),
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCloseOutline16, { size: 12 })
            }
          ) })
        ] }, ref);
      }) }),
      error !== null && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-upload-error", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-upload-error-text", children: error.text }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-upload-remove",
            "aria-label": t("card.close"),
            onClick: () => setError(null),
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCloseOutline16, { size: 12 })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(DragOverlay, { attach, t })
    ] });
  }

  // src/client/index.tsx
  function apply(ctx, config) {
    const attachReferences = config?.attachReferences === true;
    injectCss();
    ctx.effect(() => ctx.locale.register(NS, { zh, en }));
    const t = ctx.locale.bind(NS);
    const referenceSource = {
      trigger: "@",
      name: SOURCE_NAME,
      // Codex-style: pick an already-uploaded file by its relative path. The
      // menu shows the bare filename (not the storage path), with the path
      // carried opaquely on `value` so `onPick` can resolve it losslessly.
      candidates: async (session, _req) => {
        const metas = uploadMetaBySession.get(session.sessionId);
        if (metas === void 0) return [];
        return Array.from(metas.entries()).map(([path, meta]) => ({
          name: meta.name,
          description: `${meta.label} \xB7 ${formatBytes(meta.bytes)}`,
          icon: fileGlyph(meta.label, meta.previewUrl),
          value: path
        }));
      },
      onPick: (pick) => {
        const metas = uploadMetaBySession.get(pick.session.sessionId);
        if (metas === void 0 || pick.candidate.value === void 0) return void 0;
        const meta = metas.get(pick.candidate.value);
        if (meta === void 0) return void 0;
        return {
          insert: {
            source: SOURCE_NAME,
            ref: pick.candidate.value,
            label: meta.name,
            appearance: "file",
            clipboardText: `@${meta.name}`
          }
        };
      },
      codec: {
        clipboardText: (ref) => ref,
        serialize: async (ref, _signal) => ref
      }
    };
    ctx.effect(() => ctx.inputTriggers.registerSource(referenceSource));
    ctx.slots.inject(
      "conversation.input.left",
      () => ctx.slots.register(
        {
          name: "conversation.input.left",
          id: "dsh-chat-enhancements-button",
          order: 0,
          locale: NS,
          inject: (sessionId) => ({
            attach: (files) => {
              const scope = ctx.sessions.scope(sessionId);
              return scope === void 0 ? Promise.resolve() : attachFiles(scope, files, sessionId, t, attachReferences);
            }
          })
        },
        PlusMenuButton
      )
    );
    ctx.slots.inject(
      "conversation.input.attachments",
      () => ctx.slots.register(
        {
          name: "conversation.input.attachments",
          locale: NS,
          inject: (sessionId) => ({
            attach: (files) => {
              if (sessionId === void 0) return Promise.resolve();
              const scope = ctx.sessions.scope(sessionId);
              return scope === void 0 ? Promise.resolve() : attachFiles(scope, files, sessionId, t, attachReferences);
            }
          })
        },
        UploadDock
      )
    );
  }
  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      apply,
      inject: ["slots", "inputTriggers", "sessions", "locale"]
    };
  }
})();
return module.exports; } });
//# sourceMappingURL=client.js.map
