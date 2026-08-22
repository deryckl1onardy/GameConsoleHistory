#!/usr/bin/env node
// @ts-check
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import process from 'node:process'

/**
 * Fetches each game's real title-logo graphic (the stylised wordmark, e.g.
 * the "PAC-MAN" logotype — not the box art) from SteamGridDB's `/logos`
 * endpoint into public/logos/, then records the paths in
 * src/data/logos.generated.ts.
 *
 * Sibling script to fetch-covers.mjs, same contract:
 *   - public/logos/ and .env are both gitignored — nothing enters git
 *     history unless the repo owner deliberately commits it.
 *   - Requires STEAMGRIDDB_KEY in the environment (or a local .env file).
 *   - Prints a hit/miss report; coverage is genuinely ambiguous for obscure
 *     or pre-2000 titles, and a miss is expected, not hidden.
 *   - GameArtifactBody's plain-text <h3> is the permanent fallback for
 *     anything this script does not find — a title is never left blank.
 *
 * Logos are transparent PNGs at whatever aspect the source art was drawn in
 * (Pac-Man's is a wide ~4:1 banner; many are closer to 2:1) — unlike grids,
 * which are always fixed to 600x900, so no `wantLandscape` branching is
 * needed here. Downloaded as-is (no sharp resize/recompress): a logo is
 * rendered small in the panel and re-encoding a PNG with transparency through
 * a lossy pipeline risks visible edge artefacts for no real size win.
 *
 * Usage:
 *   STEAMGRIDDB_KEY=xxxx npm run logos
 *   npm run logos -- --console=nes        # only one console
 *   npm run logos -- --dry-run            # search + report, write nothing
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const LOGOS_DIR = path.join(ROOT, 'public', 'logos')
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'logos.generated.ts')
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

/** Prefer an English, non-humour, non-NSFW logo; otherwise the top result. */
function pickLogo(logos) {
  if (!logos?.length) return null
  const clean = logos.filter((l) => !l.nsfw && !l.humor)
  const pool = clean.length ? clean : logos
  return pool.find((l) => l.language === 'en') ?? pool[0]
}

async function main() {
  await loadDotEnv()
  const key = process.env.STEAMGRIDDB_KEY
  if (!key) {
    console.error(
      '[fetch-logos] STEAMGRIDDB_KEY is not set.\n' +
        '  Get a key at https://www.steamgriddb.com/profile/preferences/api\n' +
        '  then either export STEAMGRIDDB_KEY=... or add it to a local .env file\n' +
        '  (both public/logos/ and .env are gitignored).',
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

  const consoles = onlyConsole ? CONSOLES.filter((c) => c.id === onlyConsole) : CONSOLES

  /** @type {Record<string, string>} */
  const manifest = {}
  const report = []

  for (const entry of consoles) {
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

      const logos = await sgdbFetch(key, `${API}/logos/game/${match.id}`)
      const logo = pickLogo(logos)
      if (!logo) {
        report.push({ console: entry.id, rank: game.rank, title: game.title, hit: false })
        await sleep(120)
        continue
      }

      const ext = logo.mime === 'image/webp' ? 'webp' : logo.mime === 'image/png' ? 'png' : 'jpg'
      const dir = path.join(LOGOS_DIR, entry.id)
      const file = `${game.rank}-${slug(game.title)}.${ext}`
      const outPath = path.join(dir, file)
      const publicPath = `/logos/${entry.id}/${file}`

      if (!dryRun) {
        await mkdir(dir, { recursive: true })
        const res = await fetch(logo.url)
        const buf = Buffer.from(await res.arrayBuffer())
        await writeFile(outPath, buf)
        manifest[`${entry.id}:${game.rank}`] = publicPath
      }

      report.push({ console: entry.id, rank: game.rank, title: game.title, hit: true })
      await sleep(120)
    }
  }

  const hits = report.filter((r) => r.hit).length
  console.log(`\n[fetch-logos] ${hits}/${report.length} matched\n`)
  for (const r of report) {
    const status = r.hit ? 'hit' : 'MISS'
    console.log(`  ${status.padEnd(6)} ${r.console.padEnd(14)} #${String(r.rank).padStart(2)}  ${r.title}`)
  }

  if (dryRun) {
    console.log('\n[fetch-logos] --dry-run: nothing written.')
    return
  }

  const body =
    `/**\n` +
    ` * GENERATED FILE — do not hand-edit.\n` +
    ` *\n` +
    ` * Written by \`npm run logos\` (scripts/fetch-logos.mjs), which fetches each\n` +
    ` * game's real title-logo graphic (the stylised wordmark, not the box art)\n` +
    ` * from SteamGridDB into public/logos/ and records the path here, keyed\n` +
    ` * \`\${consoleId}:\${rank}\`. public/logos/ itself is gitignored — this\n` +
    ` * manifest is committed only when the repo owner deliberately chooses to\n` +
    ` * ship a specific piece of art; everything else falls back to the plain\n` +
    ` * text title in src/components/room/tabs/GameArtifact.tsx.\n` +
    ` */\n` +
    `export const LOGOS: Record<string, string> = ${JSON.stringify(manifest, null, 2)}\n`

  await writeFile(MANIFEST_PATH, body, 'utf8')
  console.log(`\n[fetch-logos] wrote ${Object.keys(manifest).length} entries to ${path.relative(ROOT, MANIFEST_PATH)}`)
}

main().catch((err) => {
  console.error('[fetch-logos] failed:', err)
  process.exit(1)
})
