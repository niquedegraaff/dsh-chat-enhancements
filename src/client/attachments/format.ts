/** UI formatting helpers for attachment badges and sizes. */

/** Short extension label shown on the neutral, token-styled attachment badge. */
export function fileBadgeExt(name: string): string {
  const ext = name.slice(name.lastIndexOf('.') + 1).toUpperCase().slice(0, 4)
  return ext === '' ? 'FILE' : ext
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/** Compact text glyph for an uploaded file's `@`-menu candidate. The trigger
 * menu renders candidate icons as a plain string, so this stays a single
 * emoji rather than a React icon (the inline chip uses the framework's
 * `appearance: 'file'` glyph instead). */
export function fileGlyph(label: string, previewUrl: string | undefined): string {
  if (previewUrl !== undefined) return '🖼️'
  switch (label.toUpperCase()) {
    case 'PDF': return '📄'
    case 'DOCX': return '📝'
    case 'XLSX': return '📊'
    case 'ZIP': return '📦'
    case 'MP3':
    case 'WAV':
    case 'M4A':
    case 'FLAC':
    case 'OGG':
    case 'AUDIO': return '🎵'
    default: return '📄'
  }
}
