#!/usr/bin/env node
// @ts-check
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import process from 'node:process'
import sharp from 'sharp'

/**
 * Fetches real box/case art from SteamGridDB for the whole roster and writes
 * it into public/covers/, then records the paths in
 * src/data/covers.generated.ts.
 *
 * Deliberately opt-in and reversible:
 *   - public/covers/ and .env are both gitignored — nothing copyrighted
 *     enters git history unless the repo owner deliberately commits it.
 *   - Requires STEAMGRIDDB_KEY in the environment (or a local .env file).
 *     Never hardcode a key here.
 *   - Prints a hit/miss report. Coverage for pre-2000 console titles is thin
 *     and title matching against a fan-run database is genuinely ambiguous —
 *     misses are expected and are made visible on purpose, not hidden.
 *   - The procedural label (src/three/covers.ts, MediaFigure.tsx) is the
 *     permanent fallback for anything this script does not find, so a box is
 *     never blank waiting on a file.
 *
 * Usage:
 *   STEAMGRIDDB_KEY=xxxx npm run covers
 *   npm run covers -- --console=nes        # only one console
 *   npm run covers -- --dry-run            # search + report, write nothing
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const COVERS_DIR = path.join(ROOT, 'public', 'covers')
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'covers.generated.ts')
const API = 'https://www.steamgriddb.com/api/v2'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyConsole = args.find((a) => a.startsWith('--console='))?.split('=')[1] ?? null

async function loadDotEnv() {
  try {
    const text = await readFile(path.join(ROOT, '.env'), 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // No .env file — fine, STEAMGRIDDB_KEY may already be in the environment.
  }
}

function slug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function sgdbFetch(key, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
  if (!res.ok) return null
  const json = await res.json()
  return json?.success ? json.data : null
}

/** Best-effort title match: exact (case-insensitive) beats the first result. */
function pickMatch(title, candidates) {
  if (!candidates?.length) return null
  const norm = (s) => s.toLowerCase().trim()
  return candidates.find((c) => norm(c.name) === norm(title)) ?? candidates[0]
}

/**
 * SteamGridDB grids are 600x900 (portrait, aspect 0.667) — close to a DVD
 * keepcase (0.71) or Blu-ray case (0.79), but wrong for a landscape
 * cartridge label (an SNES label is 96x56mm, aspect 1.71). Archetypes wider
 * than tall pull a landscape hero asset instead and fall back to a
 * centre-crop of the grid if no hero exists.
 */
async function fetchArt(key, sgdbId, wantLandscape) {
  if (wantLandscape) {
    const heroes = await sgdbFetch(key, `${API}/heroes/game/${sgdbId}`)
    if (heroes?.length) return { url: heroes[0].url, landscape: true }
  }
  const grids = await sgdbFetch(key, `${API}/grids/game/${sgdbId}?dimensions=600x900&types=static`)
  if (grids?.length) return { url: grids[0].url, landscape: false }
  return null
}

async function main() {
  await loadDotEnv()
  const key = process.env.STEAMGRIDDB_KEY
  if (!key) {
    console.error(
      '[fetch-covers] STEAMGRIDDB_KEY is not set.\n' +
        '  Get a key at https://www.steamgriddb.com/profile/preferences/api\n' +
        '  then either export STEAMGRIDDB_KEY=... or add it to a local .env file\n' +
        '  (both public/covers/ and .env are gitignored).',
    )
    process.exit(1)
  }

  // Lazy import so this script has no hard dependency on the app's path alias.
  // Dynamic import() requires a proper file:// URL, not a raw filesystem
  // path — a bare Windows path like "E:\..." gets misread as a URL with an
  // "e:" scheme and throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
  const { CONSOLES } = await import(
    pathToFileURL(path.join(ROOT, 'src', 'data', 'consoles', 'index.ts')).href
  )
  const { archetype: getArchetype } = await import(
    pathToFileURL(path.join(ROOT, 'src', 'data', 'kits', 'media-archetypes.ts')).href
  )

  const consoles = onlyConsole ? CONSOLES.filter((c) => c.id === onlyConsole) : CONSOLES

  /** @type {Record<string, string>} */
  const manifest = {}
  const report = []

  for (const entry of consoles) {
    const media = getArchetype(entry.mediaArchetype)
    const wantLandscape = (media.cartridgeLabel?.widthMm ?? media.dimensions.width) >
      (media.cartridgeLabel?.heightMm ?? media.dimensions.height)

    for (const game of entry.games) {
      const search = await sgdbFetch(
        key,
        `${API}/search/autocomplete/${encodeURIComponent(game.title)}`,
      )
      const match = pickMatch(game.title, search)
      if (!match) {
        report.push({ console: entry.id, rank: game.rank, title: game.title, hit: false })
        await sleep(120)
        continue
      }

      const art = await fetchArt(key, match.id, wantLandscape)
      if (!art) {
        report.push({ console: entry.id, rank: game.rank, title: game.title, hit: false })
        await sleep(120)
        continue
      }

      const dir = path.join(COVERS_DIR, entry.id)
      const file = `${game.rank}-${slug(game.title)}.jpg`
      const outPath = path.join(dir, file)
      const publicPath = `/covers/${entry.id}/${file}`

      if (!dryRun) {
        await mkdir(dir, { recursive: true })
        const res = await fetch(art.url)
        const buf = Buffer.from(await res.arrayBuffer())
        await sharp(buf).resize({ width: 512, height: 512, fit: 'inside' }).jpeg({ quality: 86 }).toFile(outPath)
        manifest[`${entry.id}:${game.rank}`] = publicPath
      }

      report.push({ console: entry.id, rank: game.rank, title: game.title, hit: true, landscape: art.landscape })
      await sleep(120)
    }
  }

  const hits = report.filter((r) => r.hit).length
  console.log(`\n[fetch-covers] ${hits}/${report.length} matched\n`)
  for (const r of report) {
    const status = r.hit ? `hit${r.landscape ? ' (landscape)' : ''}` : 'MISS'
    console.log(`  ${status.padEnd(16)} ${r.console.padEnd(14)} #${String(r.rank).padStart(2)}  ${r.title}`)
  }

  if (dryRun) {
    console.log('\n[fetch-covers] --dry-run: nothing written.')
    return
  }

  const body =
    `/**\n` +
    ` * GENERATED FILE — do not hand-edit.\n` +
    ` *\n` +
    ` * Written by \`npm run covers\` (scripts/fetch-covers.mjs), which fetches real\n` +
    ` * box/case art from SteamGridDB into public/covers/ and records the path\n` +
    ` * here, keyed \`\${consoleId}:\${rank}\`. public/covers/ itself is gitignored —\n` +
    ` * this manifest is committed only when the repo owner deliberately chooses\n` +
    ` * to ship a specific piece of art; everything else falls back to the\n` +
    ` * procedural label (src/three/covers.ts, src/components/room/MediaFigure.tsx).\n` +
    ` */\n` +
    `export const COVERS: Record<string, string> = ${JSON.stringify(manifest, null, 2)}\n`

  await writeFile(MANIFEST_PATH, body, 'utf8')
  console.log(`\n[fetch-covers] wrote ${Object.keys(manifest).length} entries to ${path.relative(ROOT, MANIFEST_PATH)}`)
}

main().catch((err) => {
  console.error('[fetch-covers] failed:', err)
  process.exit(1)
})
