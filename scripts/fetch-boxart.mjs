#!/usr/bin/env node
// @ts-check
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import process from 'node:process'

/**
 * Fetches real FRONT, SPINE and BACK box-art scans for every "box/case"
 * console (jewel-cd, dvd-keepcase, bluray-case, switch-case, box-sms
 * archetypes — i.e. anything printsPerFace covers, see
 * src/three/geometry/gameBox.ts) from the LaunchBox Games Database, into
 * public/covers/, public/covers-back/ and public/covers-spine/, recording
 * the paths in src/data/covers.generated.ts, covers-back.generated.ts and
 * covers-spine.generated.ts.
 *
 * Sibling script to fetch-covers.mjs / fetch-logos.mjs, same opt-in
 * contract (gitignored output, dry-run flag, hit/miss report), but talking
 * to a different site: neither SteamGridDB's `/grids` nor `/logos`
 * endpoint has back-of-box or spine scans (see covers-spine.generated.ts's
 * own doc comment) — LaunchBox Games Database is the one source found with
 * real per-region "Box - Front" / "Box - Back" / "Box - Spine" scans,
 * searchable by title and filterable by platform. It has no public JSON
 * API for this — the search-results and images pages are scraped as plain
 * server-rendered HTML, which the site does emit (verified: no JS
 * execution needed).
 *
 * FRONT is handled differently from back/spine: fetch-covers.mjs already
 * populates covers.generated.ts from SteamGridDB for every console
 * (cartridges included), and a SteamGridDB "grid" is fine for a cartridge
 * label — real cart labels rarely carry big platform branding either. For
 * a BOX or CASE, though, the platform's own branding (the black
 * "NINTENDO GAMECUBE" band, the console logo, the ratings seal) is part of
 * what makes it read as a real object, and SteamGridDB grids are fan-made
 * poster art that typically omit all of it. So for exactly the consoles
 * this script covers, a real LaunchBox front scan REPLACES whatever
 * fetch-covers.mjs put there — unconditionally, not merge-if-missing like
 * back/spine — because the goal isn't filling a gap, it's swapping fan art
 * for the real, branded object. `--no-front` skips this and leaves
 * covers.generated.ts alone.
 *
 * MERGE, NOT OVERWRITE for back/spine specifically: existing manifest
 * entries are read first and kept unless --force is passed. This is what
 * keeps a hand-curated entry (the real Master System scans already in the
 * manifest) from being clobbered by a lower-confidence automated match —
 * see CONSOLE_PLATFORMS below, which deliberately does NOT include
 * master-system.
 *
 * Usage:
 *   npm run boxart
 *   npm run boxart -- --console=gamecube   # only one console
 *   npm run boxart -- --dry-run            # search + report, write nothing
 *   npm run boxart -- --force              # re-fetch back/spine even where an entry exists
 *   npm run boxart -- --no-front           # skip the front-cover replacement
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const FRONT_DIR = path.join(ROOT, 'public', 'covers')
const BACK_DIR = path.join(ROOT, 'public', 'covers-back')
const SPINE_DIR = path.join(ROOT, 'public', 'covers-spine')
const FRONT_MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'covers.generated.ts')
const BACK_MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'covers-back.generated.ts')
const SPINE_MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'covers-spine.generated.ts')
const SITE = 'https://gamesdb.launchbox-app.com'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const force = args.includes('--force')
const skipFront = args.includes('--no-front')
const onlyConsole = args.find((a) => a.startsWith('--console='))?.split('=')[1] ?? null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function slug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Small, deliberately partial entity decoder — just what LaunchBox's own
 * server-rendered titles actually use (curly quotes, ampersands, a handful
 * of accented letters via numeric refs). Not a general HTML decoder. */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2B;/g, '+')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
}

const normalize = (s) =>
  decodeEntities(s)
    .toLowerCase()
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')

/**
 * Every console this project renders as a box/case (printsPerFace ===
 * true), mapped to its exact LaunchBox platform label — confirmed live,
 * one search each, not guessed from memory. `master-system` is
 * deliberately absent: its manifest entries were hand-sourced from real
 * scans already and this script must never touch them.
 */
const CONSOLE_PLATFORMS = {
  dreamcast: 'Sega Dreamcast',
  gamecube: 'Nintendo GameCube',
  playstation: 'Sony Playstation',
  ps2: 'Sony Playstation 2',
  ps3: 'Sony Playstation 3',
  ps4: 'Sony Playstation 4',
  ps5: 'Sony Playstation 5',
  saturn: 'Sega Saturn',
  switch: 'Nintendo Switch',
  'switch-2': 'Nintendo Switch 2',
  wii: 'Nintendo Wii',
  'wii-u': 'Nintendo Wii U',
  xbox: 'Microsoft Xbox',
  'xbox-360': 'Microsoft Xbox 360',
  'xbox-one': 'Microsoft Xbox One',
  'xbox-series': 'Microsoft Xbox Series X/S',
}

/** Region preference when a face has scans from more than one region. */
const REGION_PRIORITY = ['North America', 'United States', 'USA', 'World', 'Europe']

/**
 * Search LaunchBox by title, return every {title, platform, id, slug}
 * result card on the page (the site does not paginate this view — every
 * candidate for a title is on the one response).
 *
 * Parsed by SPLITTING on each card's anchor, not by one combined regex with
 * a fixed proximity window — a card's own thumbnail markup varies in size
 * (some carry a second "imgOver" image, some don't), so a fixed gap cap
 * silently dropped cards whose title/platform sat past it. Splitting can't
 * have that failure mode: every chunk starts exactly at a real anchor, and
 * a 1500-char slice comfortably covers the title/platform that follow it
 * without ever reaching into the NEXT card's own anchor.
 */
async function searchGames(title) {
  const url = `${SITE}/games/results?title=${encodeURIComponent(title)}`
  const res = await fetch(url)
  if (!res.ok) return []
  const html = await res.text()

  const cards = []
  const chunks = html.split('list-item link-no-underline" href="').slice(1)
  for (const raw of chunks) {
    const chunk = raw.slice(0, 1500)
    const href = chunk.match(/^\/games\/details\/(\d+)-([a-z0-9-]+)"/)
    const titleM = chunk.match(/<h3 b-vc2zqgtrpa>([^<]*)<\/h3>/)
    const platM = chunk.match(/<p b-vc2zqgtrpa>([^<]*)<\/p>/)
    if (!href || !titleM || !platM) continue
    cards.push({
      id: href[1],
      slug: href[2],
      title: decodeEntities(titleM[1]),
      platform: decodeEntities(platM[1]),
    })
  }
  return cards
}

/**
 * Every image on a game's images page, as {url, type, region}. `type` is
 * whatever precedes " Image (" or " (" in LaunchBox's own label — e.g.
 * "Box - Back", "Box - Spine", "Box - Front", "Clear Logo".
 */
async function fetchImageList(id, gameSlug) {
  const url = `${SITE}/games/images/${id}-${gameSlug}`
  const res = await fetch(url)
  if (!res.ok) return []
  const html = await res.text()

  const images = []
  const re = /href="(https:\/\/images\.launchbox-app\.com\/[^"]+)"[\s\S]{0,300}?data-title="([^"]+)"/g
  let m
  while ((m = re.exec(html))) {
    const label = decodeEntities(m[2])
    // Label shape: "<Game Title> - <Type>[ Image][ - Reconstructed] (<Region>)"
    const regionMatch = label.match(/\(([^)]+)\)\s*$/)
    const region = regionMatch ? regionMatch[1] : 'World'
    const typePart = label.slice(label.indexOf(' - ') + 3, regionMatch ? label.lastIndexOf('(') : label.length)
    images.push({ url: m[1], type: typePart.replace(/\bImage\b/g, '').trim(), region })
  }
  return images
}

/** Best-matching image of `wantType` ("Box - Back" / "Box - Spine"), by region priority. */
function pickByRegion(images, wantType) {
  const candidates = images.filter((i) => i.type.startsWith(wantType))
  if (!candidates.length) return null
  for (const region of REGION_PRIORITY) {
    const hit = candidates.find((c) => c.region === region)
    if (hit) return hit
  }
  return candidates[0]
}

/** Exact (decoded, case-insensitive) title match beats platform-filtered first result. */
function pickBestCard(cards, wantPlatform, wantTitle) {
  const onPlatform = cards.filter((c) => c.platform === wantPlatform)
  if (!onPlatform.length) return null
  const exact = onPlatform.find((c) => normalize(c.title) === normalize(wantTitle))
  return exact ?? onPlatform[0]
}

function extOf(url) {
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i)
  return m ? m[1].toLowerCase() : 'jpg'
}

async function loadExistingManifest(filePath, exportName) {
  try {
    const mod = await import(pathToFileURL(filePath).href + `?t=${Date.now()}`)
    return { ...mod[exportName] }
  } catch {
    return {}
  }
}

function writeManifest(filePath, exportName, kind, manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  const body =
    `/**\n` +
    ` * GENERATED-STYLE MANIFEST — same shape and contract as covers.generated.ts,\n` +
    ` * but for the ${kind} panel, not the front.\n` +
    ` *\n` +
    ` * Written by \`npm run boxart\` (scripts/fetch-boxart.mjs), which fetches real\n` +
    ` * ${kind.toLowerCase()} scans from the LaunchBox Games Database into public/covers-${kind.toLowerCase()}/\n` +
    ` * and records the path here, keyed \`\${consoleId}:\${rank}\`. Entries for\n` +
    ` * archetypes the script does not cover (cartridges — see printsPerFace in\n` +
    ` * src/three/geometry/gameBox.ts) or that were hand-sourced (master-system)\n` +
    ` * are added or kept by hand, not by this script.\n` +
    ` * public/covers-${kind.toLowerCase()}/ is gitignored — this manifest is committed only\n` +
    ` * when the repo owner deliberately chooses to ship a specific piece of art;\n` +
    ` * everything else falls back to the parametric shell colour (spine) or no\n` +
    ` * extra print at all (back). See src/data/covers.ts.\n` +
    ` */\n` +
    `export const ${exportName}: Record<string, string> = ${JSON.stringify(sorted, null, 2)}\n`
  return writeFile(filePath, body, 'utf8')
}

/**
 * covers.generated.ts is jointly owned with fetch-covers.mjs (cartridges) —
 * this header has to describe both writers accurately regardless of which
 * one ran last. Kept in sync with the near-identical header fetch-covers.mjs
 * writes; if you edit one, edit the other.
 */
function writeFrontManifest(manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  const body =
    `/**\n` +
    ` * GENERATED FILE — do not hand-edit.\n` +
    ` *\n` +
    ` * Two writers, split by archetype (see printsPerFace in\n` +
    ` * src/three/geometry/gameBox.ts):\n` +
    ` *   - Cartridge entries: \`npm run covers\` (scripts/fetch-covers.mjs), from\n` +
    ` *     SteamGridDB, into public/covers/.\n` +
    ` *   - Box/case entries: \`npm run boxart\` (this file's script), from real\n` +
    ` *     photographed scans on the LaunchBox Games Database, into\n` +
    ` *     public/covers/ as well — a box's own platform branding is part of\n` +
    ` *     what makes it read as real, which fan-made SteamGridDB grids don't\n` +
    ` *     carry (see this file's own doc comment).\n` +
    ` * Both merge onto whatever is already here rather than rebuilding from\n` +
    ` * scratch, so running one never erases the other's entries. Keyed\n` +
    ` * \`\${consoleId}:\${rank}\`. public/covers/ itself is gitignored — this\n` +
    ` * manifest is committed only when the repo owner deliberately chooses to\n` +
    ` * ship a specific piece of art; everything else falls back to the\n` +
    ` * procedural label (src/three/covers.ts, src/components/room/MediaFigure.tsx).\n` +
    ` */\n` +
    `export const COVERS: Record<string, string> = ${JSON.stringify(sorted, null, 2)}\n`
  return writeFile(FRONT_MANIFEST_PATH, body, 'utf8')
}

async function main() {
  const { CONSOLES } = await import(
    pathToFileURL(path.join(ROOT, 'src', 'data', 'consoles', 'index.ts')).href
  )

  const targets = onlyConsole
    ? CONSOLES.filter((c) => c.id === onlyConsole && CONSOLE_PLATFORMS[c.id])
    : CONSOLES.filter((c) => CONSOLE_PLATFORMS[c.id])

  if (!targets.length) {
    console.error('[fetch-boxart] no matching consoles (check --console= against CONSOLE_PLATFORMS)')
    process.exit(1)
  }

  const backManifest = await loadExistingManifest(BACK_MANIFEST_PATH, 'BACK_COVERS')
  const spineManifest = await loadExistingManifest(SPINE_MANIFEST_PATH, 'SPINE_COVERS')
  const frontManifest = skipFront ? {} : await loadExistingManifest(FRONT_MANIFEST_PATH, 'COVERS')

  const report = []

  for (const entry of targets) {
    const platform = CONSOLE_PLATFORMS[entry.id]

    for (const game of entry.games) {
      const key = `${entry.id}:${game.rank}`
      const needBack = force || !backManifest[key]
      const needSpine = force || !spineManifest[key]
      // Front is NOT gated on "already have one" — the whole point is
      // replacing a SteamGridDB fan-art entry with a real branded scan
      // (see this file's doc comment), so it's attempted every run unless
      // --no-front says not to bother.
      const needFront = !skipFront
      if (!needBack && !needSpine && !needFront) {
        report.push({ console: entry.id, rank: game.rank, title: game.title, status: 'skip (already have both)' })
        continue
      }

      const cards = await searchGames(game.title)
      await sleep(350)
      const card = pickBestCard(cards, platform, game.title)
      if (!card) {
        report.push({ console: entry.id, rank: game.rank, title: game.title, status: 'MISS (no platform match)' })
        continue
      }

      const images = await fetchImageList(card.id, card.slug)
      await sleep(350)

      const gameSlug = slug(game.title)
      let frontHit = false
      let backHit = false
      let spineHit = false

      if (needFront) {
        const pick = pickByRegion(images, 'Box - Front')
        if (pick) {
          const file = `${game.rank}-${gameSlug}.${extOf(pick.url)}`
          const outPath = path.join(FRONT_DIR, entry.id, file)
          const publicPath = `/covers/${entry.id}/${file}`
          if (!dryRun) {
            await mkdir(path.dirname(outPath), { recursive: true })
            const res = await fetch(pick.url)
            await writeFile(outPath, Buffer.from(await res.arrayBuffer()))
            await sleep(200)
          }
          frontManifest[key] = publicPath
          frontHit = true
        }
      }

      if (needBack) {
        const pick = pickByRegion(images, 'Box - Back')
        if (pick) {
          const file = `${game.rank}-${gameSlug}.${extOf(pick.url)}`
          const outPath = path.join(BACK_DIR, entry.id, file)
          const publicPath = `/covers-back/${entry.id}/${file}`
          if (!dryRun) {
            await mkdir(path.dirname(outPath), { recursive: true })
            const res = await fetch(pick.url)
            await writeFile(outPath, Buffer.from(await res.arrayBuffer()))
            await sleep(200)
          }
          backManifest[key] = publicPath
          backHit = true
        }
      }

      if (needSpine) {
        const pick = pickByRegion(images, 'Box - Spine')
        if (pick) {
          const file = `${game.rank}-${gameSlug}.${extOf(pick.url)}`
          const outPath = path.join(SPINE_DIR, entry.id, file)
          const publicPath = `/covers-spine/${entry.id}/${file}`
          if (!dryRun) {
            await mkdir(path.dirname(outPath), { recursive: true })
            const res = await fetch(pick.url)
            await writeFile(outPath, Buffer.from(await res.arrayBuffer()))
            await sleep(200)
          }
          spineManifest[key] = publicPath
          spineHit = true
        }
      }

      const matchNote = normalize(card.title) === normalize(game.title) ? 'exact' : `fuzzy:"${card.title}"`
      const parts = []
      if (needFront) parts.push(`front:${frontHit ? 'hit' : 'MISS'}`)
      parts.push(`back:${backHit ? 'hit' : needBack ? 'MISS' : '—'}`)
      parts.push(`spine:${spineHit ? 'hit' : needSpine ? 'MISS' : '—'}`)
      const status = `${parts.join(' ')} (${matchNote})`
      report.push({ console: entry.id, rank: game.rank, title: game.title, status })
    }
  }

  console.log(`\n[fetch-boxart] ${report.length} games processed\n`)
  for (const r of report) {
    console.log(`  ${r.console.padEnd(13)} #${String(r.rank).padStart(2)}  ${r.title.padEnd(45)} ${r.status}`)
  }

  if (dryRun) {
    console.log('\n[fetch-boxart] --dry-run: nothing written.')
    return
  }

  await writeManifest(BACK_MANIFEST_PATH, 'BACK_COVERS', 'BACK', backManifest)
  await writeManifest(SPINE_MANIFEST_PATH, 'SPINE_COVERS', 'SPINE', spineManifest)
  if (!skipFront) await writeFrontManifest(frontManifest)
  console.log(
    `\n[fetch-boxart] wrote ${Object.keys(backManifest).length} back + ${Object.keys(spineManifest).length} spine` +
      (skipFront ? '' : ` + ${Object.keys(frontManifest).length} front`) +
      ' entries',
  )
}

main().catch((err) => {
  console.error('[fetch-boxart] failed:', err)
  process.exit(1)
})
