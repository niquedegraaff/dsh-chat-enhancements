import { STYLE_TAG } from './constants.ts'

export function injectCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-chat-enhancements'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = `
.dsh-plus-root{display:inline-flex;order:-1;margin-right:-4px}
.dsh-plus-btn{width:28px;height:28px;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;cursor:pointer}
.dsh-plus-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-plus-btn:disabled{opacity:.45;cursor:default}
.dsh-plus-icon{display:inline-flex;transition:transform .25s ease}
.dsh-plus-icon-open{transform:rotate(45deg)}
.dsh-upload-dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto 6px;padding:0 var(--dsh-composer-dock-inset);display:flex;flex-wrap:wrap;gap:8px;flex:none}
.dsh-upload-card{position:relative;flex-direction:column;align-items:center;gap:5px;width:88px;flex:none;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);background:var(--dsw-specific-input-major,var(--dsw-alias-surface-2));border-radius:12px;padding:12px 8px 9px;box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-label-primary)}
.dsh-upload-badge{width:44px;height:56px;border-radius:6px;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:700;font-family:var(--ds-font-family-code,monospace);display:inline-flex;align-items:center;justify-content:center;letter-spacing:.5px;flex:none;background:var(--dsw-alias-interactive-bg-hover);border:1px solid var(--dsw-alias-border-l2-darkmode-thin)}
.dsh-upload-thumb{width:44px;height:44px;object-fit:cover;border-radius:6px}
.dsh-upload-name{width:100%;font-size:12px;line-height:16px;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-all}
.dsh-upload-size{color:var(--dsw-alias-label-tertiary);font-size:10.5px;flex:none}
.dsh-upload-preview{width:100%;font-size:10px;line-height:13px;color:var(--dsw-alias-label-tertiary);text-align:left;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;word-break:break-all;font-family:var(--ds-font-family-code,monospace)}
.dsh-upload-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;line-height:0;flex:none}
.dsh-upload-remove:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsh-upload-card>.dsh-upload-remove{position:absolute;top:4px;right:4px}
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
`
  document.head.appendChild(tag)
}
