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
