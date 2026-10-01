// Rebuilds the Core (public/models/core.glb) from art/core/build_core.py with
// Blender 5.2+: BLENDER_PATH if set, else the portable install, else `blender` on PATH.
// Usage: npm run model
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const portable = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'Programs', 'blender-5.2.1-windows-x64', 'blender.exe')
  : null
const blender = [process.env.BLENDER_PATH, portable].find((path) => path && existsSync(path)) ?? 'blender'

execFileSync(
  blender,
  ['-b', '--factory-startup', '--python', 'art/core/build_core.py', '--', 'public/models/core.glb'],
  { stdio: 'inherit' },
)
