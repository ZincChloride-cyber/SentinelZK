#!/usr/bin/env node
/**
 * Compile SafetyOracle.compact with the Midnight Compact toolchain.
 * On Windows the system `compact.exe` is NTFS compression — use WSL.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const midnightRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = 'contracts/SafetyOracle.compact'
const outDir = 'contracts/managed/safety-oracle'

mkdirSync(path.join(midnightRoot, 'contracts', 'managed'), { recursive: true })

const wslSource = '/mnt/' + midnightRoot[0].toLowerCase() + midnightRoot.slice(2).replaceAll('\\', '/')
const isWin = process.platform === 'win32'

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })
  return result.status ?? 1
}

function looksLikeMidnightCompact(whichOutput, versionOutput) {
  if (!versionOutput) return false
  if (/NTFS|compress/i.test(versionOutput)) return false
  return /\d+\.\d+/.test(versionOutput) && !/Windows/i.test(whichOutput ?? '')
}

if (isWin) {
  const probe = spawnSync(
    'wsl',
    ['-e', 'bash', '-lc', 'compact --version && compact compile --version && which compact'],
    { encoding: 'utf8' },
  )
  const combined = `${probe.stdout ?? ''}\n${probe.stderr ?? ''}`
  if (probe.status !== 0 || !/\d+\.\d+/.test(combined) || /NTFS/i.test(combined)) {
    console.error('Midnight Compact compiler was not found in WSL.')
    console.error('Install it (Linux/WSL):')
    console.error(
      '  curl --proto "=https" --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh',
    )
    console.error('Then: compact update 0.30.0')
    process.exit(1)
  }
  console.log(combined.trim())
  const cmd = `cd '${wslSource}' && compact compile ${source} ${outDir}`
  const status = run('wsl', ['-e', 'bash', '-lc', cmd], midnightRoot)
  process.exit(status)
}

const version = spawnSync('compact', ['--version'], { encoding: 'utf8' })
const compileVersion = spawnSync('compact', ['compile', '--version'], { encoding: 'utf8' })
const which = spawnSync('which', ['compact'], { encoding: 'utf8' })
const versionOut = `${version.stdout ?? ''}${compileVersion.stdout ?? ''}`
if (
  version.status !== 0 ||
  compileVersion.status !== 0 ||
  !looksLikeMidnightCompact(which.stdout, versionOut)
) {
  console.error('Midnight Compact compiler not found on PATH.')
  console.error(`compact --version => ${(version.stdout || version.stderr || '').trim()}`)
  process.exit(1)
}
console.log(versionOut.trim())
const status = run('compact', ['compile', source, outDir], midnightRoot)
process.exit(status)
