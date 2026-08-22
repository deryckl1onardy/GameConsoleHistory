import { useMemo, useState } from 'react'
import type { Game } from '@/types/console'
import { useActiveArchetypeId, useActiveConsole, useSelectedGame } from '@/store/scene'
import { enrichGame } from '@/data/game-facts'
import { attachRate, firstReleaseYear, yearsAfterLaunch } from '@/data/game-metrics'
import { archetype as getArchetype } from '@/data/kits/media-archetypes'
import { logoFor } from '@/data/logos'
import { formatUnits } from '@/components/format'
import { GlobeIcon } from '@/components/icons'
import { COPY } from '../panel-copy'

/**
 * The Game Artifact view: clicking one game in the Games section opens its
 * own detail, mirroring the console's panel rather than inventing a new one.
 *
 * DetailPanel owns the layout grid; this file supplies the games section's
 * three columns — GameArtifactSummary | GameArtifactBody | GameArtifactFact
 * (the console section is a single tab column instead; its own hero stats
 * live inside OverviewTab now, not a sibling column here), and `GameArtifact`
 * stacks all three for the compact single-scroll layout.
 *
 * Every researched block (fun fact, launch price) renders only when present.
 * Absence is a normal, designed state — the shell simply omits the block,
 * never shows a placeholder. The facts and prices themselves come from
 * src/data/game-facts.ts, merged onto the game by `enrichGame` here; the
 * left column's numbers are derived by src/data/game-metrics.ts.
 */

/** The selected game with its researched enrichment applied, or null. */
function useEnrichedGame(): Game | null {
  const entry = useActiveConsole()
  const game = useSelectedGame()
  return useMemo(() => (game ? enrichGame(game, entry.id) : null), [game, entry.id])
}

/** A two-line stat pair — the left column's quieter numbers under the hero. */
function ArtifactStat({
  caption,
  value,
  sub,
  compact = false,
}: {
  caption: string
  value: string
  sub?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <p className="flex min-w-0 items-baseline gap-1.5 text-[12px] text-ink/85">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/40">{caption}</span>
        <span className="min-w-0 truncate tabular-nums">{value}</span>
        {sub && <span className="shrink-0 text-ink/40">· {sub}</span>}
      </p>
    )
  }
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink/40">{caption}</p>
      <p className="mt-0.5 text-[13px] text-ink/85">
        <span className="tabular-nums">{value}</span>
        {sub && <span className="text-ink/40"> · {sub}</span>}
      </p>
    </div>
  )
}

/**
 * Left column: the game's hero stat (units sold), then the two derived
 * numbers — attach rate (share of the console's install base that bought it,
 * dropped when it exceeds 1.0) and how long after the console's first release
 * the game arrived — then the developer and publisher. Numbers come first
 * and stay shrink-0, so they never scroll out of view in the short panel.
 */
export function GameArtifactSummary({ compact = false }: { compact?: boolean }) {
  const entry = useActiveConsole()
  const game = useEnrichedGame()
  if (!game) return null

  const rate = attachRate(game, entry)
  const years = yearsAfterLaunch(game, entry)

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="shrink-0">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/45">
          <GlobeIcon size={12} className="text-amber/80" />
          {COPY.statUnits} · {COPY.statUnitsSub}
        </p>
        <p
          className={[
            'font-display leading-none tabular-nums text-ink',
            compact ? 'mt-1.5 text-3xl' : 'mt-2 text-4xl',
          ].join(' ')}
        >
          {formatUnits(game.unitsSold)}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-ink/10 pt-2.5">
          {rate !== null && (
            <ArtifactStat
              caption={COPY.gameStatAttachRate}
              value={`${Math.round(rate * 100)}%`}
              sub={`of ${entry.shortName} owners`}
              compact={compact}
            />
          )}
          <ArtifactStat
            caption={COPY.gameStatAfterLaunch}
            value={`${years} ${years === 1 ? 'year' : 'years'}`}
            sub={`first release ${firstReleaseYear(entry)}`}
            compact={compact}
          />
        </div>
      </div>

      <div className="border-t border-ink/10 pt-3">
        <div className="flex flex-col gap-2">
          <ArtifactStat caption={COPY.gameStatDeveloper} value={game.developer} compact={compact} />
          <ArtifactStat caption={COPY.gameStatPublisher} value={game.publisher} compact={compact} />
        </div>
      </div>
    </div>
  )
}

/**
 * The game's title, as its real logo graphic (the stylised wordmark
 * SteamGridDB's `/logos` endpoint returns — e.g. the "PAC-MAN" logotype)
 * when `scripts/fetch-logos.mjs` found one, falling back to the plain-text
 * heading otherwise. A game's name is never left blank waiting on a file.
 *
 * Also falls back on a load failure (`onError`), not just a missing manifest
 * entry — the same posture as the cover art / cartridge label pipeline: a
 * stale or bad path degrades to text instead of a broken-image icon.
 * `key={src}` forces a fresh `<img>` per game so a previous game's error
 * state can never leak onto the next one when only the src prop changes.
 */
function TitleGraphic({ consoleId, game }: { consoleId: string; game: Game }) {
  const src = logoFor(consoleId, game)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <h3 className="font-display text-[26px] leading-tight text-ink">{game.title}</h3>
  }

  return (
    <img
      key={src}
      src={src}
      alt={game.title}
      className="h-[46px] max-w-full object-contain object-left"
      onError={() => setFailed(true)}
    />
  )
}

/**
 * Middle column: the game's editorial story. The cover figure is gone — the
 * 3D subject on stage and the floating list's thumbnails already carry the
 * box, so the panel spends its width on words instead: the title as an
 * article header, the blurb as the lede, then the researched "Why it
 * matters" paragraph (from game-facts.ts, absent = designed), the media
 * archetype with its provenance, and the launch price when a credible source
 * was found. The editorial and the price each carry their `source` as a
 * title attribute so the sourcing stays on the content without cluttering
 * the layout.
 *
 * Navigation is the floating GameList, not a back button — picking another
 * game from the list flies the camera to it, so there is no "back" to go to.
 */
export function GameArtifactBody() {
  const entry = useActiveConsole()
  const archetypeId = useActiveArchetypeId()
  const game = useEnrichedGame()

  const archetype = useMemo(() => getArchetype(archetypeId), [archetypeId])

  if (!game) return null

  return (
    <div>
      <TitleGraphic consoleId={entry.id} game={game} />
      <p className="mt-1 text-[12px] text-ink/50">{game.year}</p>

      {/* The lede — the game's own one-line story, leading into the fuller synopsis. */}
      <p className="mt-4 text-[13px] leading-relaxed text-ink/70">{game.blurb}</p>

      {game.description && (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber/80">{COPY.gameDescription}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/75">{game.description}</p>
        </div>
      )}

      {game.editorial && (
        <div className="mt-5 border-t border-ink/10 pt-4" title={game.editorial.source}>
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber/80">{COPY.gameEditorial}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/75">{game.editorial.body}</p>
        </div>
      )}

      {game.criticReception && game.criticReception.length > 0 && (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber/80">
            {COPY.gameCriticReception}
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {game.criticReception.map((c) => (
              <div key={c.outlet} title={c.source}>
                {c.quote ? (
                  <p className="text-[13px] leading-relaxed text-ink/75">
                    &ldquo;{c.quote}&rdquo;
                    {c.score && <span className="text-ink/45"> · {c.score}</span>}
                  </p>
                ) : (
                  <p className="text-[13px] leading-relaxed text-ink/75">
                    Scored <span className="tabular-nums">{c.score}</span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-ink/45">{c.outlet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-amber/70">{archetype.label}</p>
        <p className="mt-1 text-[13px] text-ink/70">
          {archetype.dimensions.width} × {archetype.dimensions.height} × {archetype.dimensions.depth}{' '}
          {COPY.gamesDimensions} ·{' '}
          {archetype.precision === 'exact' ? COPY.gamesPrecisionExact : COPY.gamesPrecisionApprox}
        </p>
      </div>

      {game.msrpUsd !== undefined && game.msrpUsd !== null && (
        <div className="mt-5 border-t border-ink/10 pt-4" title={game.msrpSource}>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink/40">{COPY.statPrice}</p>
          <p className="mt-1 font-display text-xl tabular-nums text-ink">
            ${game.msrpUsd.toFixed(2)}
            {game.msrpUsdAdjusted !== undefined && game.msrpUsdAdjusted !== null && (
              <span className="text-ink/45"> · ≈ ${game.msrpUsdAdjusted} today</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Right column: the game's own fun fact, in exactly the FunFactCard treatment
 * — eyebrow, display title, prose. Renders nothing without a researched fact.
 */
export function GameArtifactFact() {
  const game = useEnrichedGame()
  if (!game?.fact) return null

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber/80">{COPY.funFact}</p>
      <h4 className="mt-2 font-display text-lg leading-snug text-ink">{game.fact.title}</h4>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/70">{game.fact.body}</p>
    </div>
  )
}

/** The whole artifact as one column — the compact layout's single scroll. */
export function GameArtifact({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <GameArtifactSummary compact={compact} />
      <GameArtifactBody />
      <GameArtifactFact />
    </div>
  )
}
