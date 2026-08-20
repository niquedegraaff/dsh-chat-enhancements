// dev — watch the source tree and rebuild + install into the running harness
// profile on every change, so you only need to restart `dsh web` + hard-refresh.
//
// Usage:  pnpm dev
//
// No extra dependencies: fs.watch (recursive on Windows/macOS) + spawn.
import { existsSync, watch } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installLib } from './install-lib.mjs'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(repoRoot, 'src')

const watched = [
  srcDir,
  join(repoRoot, 'tsconfig.json'),
  join(repoRoot, 'tsconfig.build.json'),
  join(repoRoot, 'build.mjs'),
  join(repoRoot, 'package.json'),
  join(repoRoot, 'cordis.patch.yml')
]

let timer = null
let pending = false

function run(cmd, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      // pnpm/npm are .cmd shims on Windows and need a shell to resolve.
      shell: process.platform === 'win32'
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

function scheduleBuild() {
  if (pending) return
  pending = true
  clearTimeout(timer)
  timer = setTimeout(async () => {
    pending = false
    console.log('[dev] change detected — rebuilding…')
    const started = Date.now()
    try {
      await run('pnpm', ['build'])
      const target = installLib()
      console.log(`[dev] built + installed -> ${target} (${Date.now() - started}ms)`)
      console.log('[dev] restart dsh web and hard-refresh the browser to load the new code')
    } catch (err) {
      console.error('[dev] rebuild failed:', err instanceof Error ? err.message : String(err))
    }
  }, 350)
}

if (!existsSync(srcDir)) {
  console.error(`[dev] src/ not found at ${srcDir}`)
  process.exit(1)
}

for (const root of watched) {
  if (!existsSync(root)) continue
  watch(root, { recursive: true }, () => scheduleBuild())
}

// Sync the already-built lib once at startup, then wait for changes.
try {
  const target = installLib()
  console.log(`[dev] initial install -> ${target}`)
} catch (err) {
  console.error('[dev] initial install skipped:', err instanceof Error ? err.message : String(err))
}
console.log('[dev] watching for changes in src/ and build config… (Ctrl+C to stop)')
