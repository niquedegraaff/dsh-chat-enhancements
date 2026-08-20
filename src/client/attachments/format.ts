/** UI formatting helpers for attachment badges and sizes. */

export function badgeStyle(name: string): { bg: string; ext: string } {
  const ext = name.slice(name.lastIndexOf('.') + 1).toUpperCase().slice(0, 4)
  const lower = ext.toLowerCase()
  if (lower === 'pdf') return { bg: '#C93B2E', ext: 'PDF' }
  if (lower === 'docx' || lower === 'doc') return { bg: '#2B579A', ext: 'DOC' }
  if (lower === 'xlsx' || lower === 'xls') return { bg: '#217346', ext: 'XLS' }
  if (lower === 'csv' || lower === 'tsv') return { bg: '#217346', ext: 'CSV' }
  if (lower === 'txt' || lower === 'md' || lower === 'markdown') return { bg: '#757575', ext: 'TXT' }
  if (lower === 'zip') return { bg: '#7A5BB0', ext: 'ZIP' }
  if (lower === 'json' || lower === 'jsonl') return { bg: '#B8860B', ext: 'JSON' }
  if (lower === 'png' || lower === 'jpg' || lower === 'jpeg' || lower === 'gif' || lower === 'webp') return { bg: '#2E7D6B', ext: 'IMG' }
  return { bg: '#5B7DB1', ext: ext === '' ? 'FILE' : ext }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
