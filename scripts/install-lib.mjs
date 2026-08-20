// install-lib — copy the freshly built `lib/` from this dev checkout into the
// running harness profile's installed copy, so `dsh web` loads the new build.
//
// Usage:
//   node scripts/install-lib.mjs
// or via:  pnpm build:install   (builds first, then installs)
//
// Override the target profile with DSH_CHAT_ENHANCEMENTS_PROFILE_LIB.
import { cpSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const libDir = join(repoRoot, 'lib')

const DEFAULT_PROFILE_LIB = join(
  os.homedir(),
  '.dsh',
  'profiles',
  'web',
  'node_modules',
  'dsh-chat-enhancements',
  'lib'
)

/** Resolve the installed profile `lib/` directory (env override supported). */
export function resolveTargetDir() {
  return process.env.DSH_CHAT_ENHANCEMENTS_PROFILE_LIB || DEFAULT_PROFILE_LIB
}

/** Copy the built `lib/` into the running profile; returns `{ target, mode }`. */
export function installLib() {
  if (!existsSync(libDir)) {
    throw new Error(`lib/ not found at ${libDir} — run pnpm build first`)
  }
  const target = resolveTargetDir()

  // When the profile is already linked to this checkout (pnpm `add link:.`
  // makes the target a junction/symlink back to our own lib/), `pnpm build`
  // writes straight into what the harness loads — nothing to copy. Detect by
  // real path so we never copy a directory onto itself.
  const realLib = realpathSync(libDir)
  const realTarget = realpathSync(target, { throwIfNoEntry: false })
  if (realTarget !== undefined && realTarget === realLib) {
    return { target, mode: 'linked' }
  }

  // Safety: on Windows, recursing into a junction/symlink can delete the *real*
  // target's contents. lstat reports both junctions and symlinks as symbolic
  // links, so refuse to clear a reparse point and copy into it instead.
  const lt = lstatSync(target, { throwIfNoEntry: false })
  if (lt !== undefined && lt.isSymbolicLink()) {
    console.warn(`[install-lib] target ${target} is a symlink/junction — copying in place (not clearing)`)
  } else {
    rmSync(target, { recursive: true, force: true })
  }
  mkdirSync(target, { recursive: true })
  cpSync(libDir, target, { recursive: true })
  return { target, mode: 'copied' }
}

// Direct run (not imported by the dev watcher): install and report.
const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p)
const isDirectRun =
  process.argv[1] !== undefined && norm(process.argv[1]) === norm(fileURLToPath(import.meta.url))

if (isDirectRun) {
  const { target, mode } = installLib()
  if (mode === 'linked') {
    console.log(`[install-lib] profile already linked to this checkout (${target}) — nothing to copy.`)
  } else {
    console.log(`[install-lib] copied ${libDir} -> ${target}`)
  }
  console.log('[install-lib] restart dsh web and hard-refresh the browser to load the new code')
}
