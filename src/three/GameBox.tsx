import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Game, MediaArchetype } from '@/types/console'
import { LIFT_M, boxProfile, boxSizeMetres, coverAspect, edgeBevelMetres, labelPlane } from './geometry/gameBox'
import { placeholderCover } from './covers'
import { shellFor } from '@/data/kits/media-shells'
import { MM } from '@/data/kits/media-archetypes'
import { coverFor } from '@/data/covers'
import { CartridgeModel } from './models/CartridgeModel'

const textureLoader = new THREE.TextureLoader()
/** Real covers, once loaded, are cached by URL so switching consoles and back
 * doesn't refetch. */
const REAL_COVER_CACHE = new Map<string, THREE.Texture>()

/**
 * A real cover if `coverFor` resolves one for this game, applied via
 * `texture.repeat`/`offset` so it fills the printed area at the correct
 * aspect rather than stretching. The procedural placeholder always renders
 * FIRST — this only swaps in once (and if) the real art finishes loading, so
 * a box is never blank waiting on a network request.
 */
function useRealCoverTexture(
  consoleId: string,
  game: Game,
  printAspect: number,
): THREE.Texture | null {
  const url = coverFor(consoleId, game)
  const [texture, setTexture] = useState<THREE.Texture | null>(() => (url ? REAL_COVER_CACHE.get(url) ?? null : null))

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }
    const cached = REAL_COVER_CACHE.get(url)
    if (cached) {
      setTexture(cached)
      return
    }
    let cancelled = false
    textureLoader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.SRGBColorSpace
        REAL_COVER_CACHE.set(url, tex)
        setTexture(tex)
      },
      undefined,
      () => {
        // Fetch or decode failed — stay on the procedural placeholder.
      },
    )
    return () => {
      cancelled = true
    }
  }, [url])

  useEffect(() => {
    const image = texture?.image as { width: number; height: number } | undefined
    if (!texture || !image) return
    const imgAspect = image.width / image.height
    // Cover-fit: crop the longer axis rather than stretch, same intent as
    // CSS object-fit: cover / SVG's preserveAspectRatio="...slice".
    if (imgAspect > printAspect) {
      const scale = printAspect / imgAspect
      texture.repeat.set(scale, 1)
      texture.offset.set((1 - scale) / 2, 0)
    } else {
      const scale = imgAspect / printAspect
      texture.repeat.set(1, scale)
      texture.offset.set(0, (1 - scale) / 2)
    }
    texture.needsUpdate = true
  }, [texture, printAspect])

  return texture
}

/**
 * One physical game box, at true published dimensions and true published
 * shell colour.
 *
 * Cartridges and cases collapse to the same construction: a rounded shell
 * plus a printed plane sitting proud of the front face. For a cartridge that
 * plane is the label sticker at its real size, with a slightly larger recess
 * plate behind it; for a case it covers the whole face over a printed sleeve
 * or, for a jewel case, a dark tray glimpsed behind clear plastic.
 *
 * Shell colour comes from `shellFor(archetype.id, consoleId)` — per-console,
 * not per-kind, because one archetype (e.g. bluray-case) covers consoles with
 * completely different case colours (a black PS3, a white PS5, a green Xbox
 * One). This is the accuracy the parametric kit was missing: dimensions were
 * always real, but every cartridge used to render as the same identical box.
 *
 * This component is the entire reason the roster scales: ~220 games across 22
 * consoles need ~10 archetype entries and one texture each, not 220 models.
 *
 * The printed plane's texture is the procedural placeholder by default; if
 * `coverFor` (src/data/covers.ts) resolves a real cover for this game, it
 * loads in the background and swaps in once ready — see
 * `useRealCoverTexture` below. The box is never blank while that load is in
 * flight.
 */

/** How proud the recess plate sits behind the label, in metres. */
const RECESS_PROUD_MM = 0.05
/** How much larger than the label the recess plate is, per side, in mm. */
const RECESS_MARGIN_MM = 2

/** Segments around the XY corner curve — was 8; 20 removes the facets that
 * were visible at the library shot's close orbit distance (~0.4-1m). */
const CURVE_SEGMENTS = 20
/** Segments along the edge roundover itself, for a soft highlight rather
 * than a single hard chamfer line. */
const BEVEL_SEGMENTS = 5

/**
 * Per-`kind` plastic finish. This is legitimately kind-based, unlike shell
 * COLOUR (which had to move to media-shells.ts because it is per-console):
 * every cartridge in the roster is the same injection-moulded matte plastic
 * family, every optical case is the same glossy polystyrene, regardless of
 * which console it belongs to.
 */
const FINISH: Record<MediaArchetype['kind'], { clearcoat: number; clearcoatRoughness: number }> = {
  cartridge: { clearcoat: 0.25, clearcoatRoughness: 0.35 },
  optical: { clearcoat: 0.7, clearcoatRoughness: 0.1 },
  card: { clearcoat: 0.45, clearcoatRoughness: 0.2 },
}

export type GameBoxProps = {
  game: Game
  archetype: MediaArchetype
  consoleId: string
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  onSelect?: (rank: number) => void
}

/** Rounded-rect extruded shell geometry, centred on the origin. */
function useShellGeometry(archetype: MediaArchetype, depth: number, bevel: number) {
  return useMemo(() => {
    const { w, h, r } = boxProfile(archetype)
    const x = w / 2
    const y = h / 2

    const shape = new THREE.Shape()
    shape.moveTo(-x + r, -y)
    shape.lineTo(x - r, -y)
    shape.quadraticCurveTo(x, -y, x, -y + r)
    shape.lineTo(x, y - r)
    shape.quadraticCurveTo(x, y, x - r, y)
    shape.lineTo(-x + r, y)
    shape.quadraticCurveTo(-x, y, -x, y - r)
    shape.lineTo(-x, -y + r)
    shape.quadraticCurveTo(-x, -y, -x + r, -y)

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: BEVEL_SEGMENTS,
      curveSegments: CURVE_SEGMENTS,
    })
    // ExtrudeGeometry extrudes from z=0 to z=depth; the rest of this file
    // (labelPlane, print positions) assumes a box centred on the origin.
    geometry.translate(0, 0, -depth / 2)
    // Smooths the shading across the bevel's own segments — without this the
    // roundover still shades as flat facets even though the geometry is
    // curved, because ExtrudeGeometry assigns hard per-face normals.
    geometry.computeVertexNormals()
    return geometry
  }, [archetype, depth, bevel])
}

export function GameBox({
  game,
  archetype,
  consoleId,
  position,
  rotation = [0, 0, 0],
  selected = false,
  onSelect,
}: GameBoxProps) {
  const [hovered, setHovered] = useState(false)

  const [w, h, d] = useMemo(() => boxSizeMetres(archetype), [archetype])
  const label = useMemo(() => labelPlane(archetype), [archetype])
  const shell = useMemo(() => shellFor(archetype.id, consoleId), [archetype.id, consoleId])
  const bevel = useMemo(() => edgeBevelMetres(archetype, d), [archetype, d])
  const shellGeometry = useShellGeometry(archetype, d, bevel)

  useEffect(() => () => shellGeometry.dispose(), [shellGeometry])

  const aspect = coverAspect(archetype)
  const placeholder = useMemo(
    () => placeholderCover({ game, archetype, shell, aspect }),
    [game, archetype, shell, aspect],
  )
  const realCover = useRealCoverTexture(consoleId, game, aspect)
  const cover = realCover ?? placeholder

  /*
    The shell's ACTUAL front face sits at d/2 + bevel, not d/2 — three.js's
    ExtrudeGeometry bevel pushes the whole flat cap outward by
    `bevelThickness`, not just the rounded corners. Every plane meant to sit
    proud of that face has to add `bevel` on top of its authored proud-ness,
    or the shell simply grows past it and buries it — confirmed by measuring
    the built geometry's own bounding box, which is how this was caught.
  */
  // Cases print edge to edge, so the printed plane is the full front face.
  const print = label
    ? { width: label.width, height: label.height, position: [label.position[0], label.position[1], label.position[2] + bevel] as [number, number, number] }
    : { width: w, height: h, position: [0, 0, d / 2 + bevel + 0.15 * MM] as [number, number, number] }

  const recess = label
    ? {
        width: label.width + (RECESS_MARGIN_MM * 2) * MM,
        height: label.height + (RECESS_MARGIN_MM * 2) * MM,
        position: [
          label.position[0],
          label.position[1],
          d / 2 + bevel + RECESS_PROUD_MM * MM,
        ] as [number, number, number],
      }
    : null

  // Selecting lifts the box for reading — that IS this app's pick-up-a-game
  // metaphor. Hovering only brightens the shell a touch; no lift, no glow.
  // The artifact camera aims at the LIFTED position (LIFT_M, shared with
  // shots.ts), so a lifted box stays dead-centre in frame.
  const lift = selected ? LIFT_M : 0
  const shellColor = useMemo(() => {
    const c = new THREE.Color(shell.body)
    if (hovered && !selected) c.offsetHSL(0, 0, 0.06)
    return c
  }, [shell.body, hovered, selected])

  const stop = (e: ThreeEvent<PointerEvent>) => e.stopPropagation()

  /*
    Everything parametric — the extruded shell, the label recess plate, the
    printed plane, the spine — is the FALLBACK for a dropped-in cartridge
    model. The moment a real GLB exists at /models/cartridges/<archetype>.glb
    it replaces this whole construction (see CartridgeModel.tsx), and the
    per-game cover that would have been the plane's map is printed onto the
    model's `label` mesh instead. The parametric shell is what renders for
    every archetype without a file, which is all of them today.
  */
  const parametric = (
    <>
      <mesh castShadow receiveShadow geometry={shellGeometry}>
        <meshPhysicalMaterial
          color={shellColor}
          roughness={shell.roughness}
          metalness={0}
          clearcoat={FINISH[archetype.kind].clearcoat}
          clearcoatRoughness={FINISH[archetype.kind].clearcoatRoughness}
        />
      </mesh>

      {/* The tray behind a clear jewel case front — visible through the shell
          rather than printed on it, so a jewel case reads as layered plastic
          rather than a flat coloured box. */}
      {shell.tray && (
        <mesh position={[0, 0, -d / 2 + 0.5 * MM]}>
          <planeGeometry args={[w * 0.94, h * 0.94]} />
          <meshStandardMaterial color={shell.tray} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Cartridge label recess — a slightly larger, slightly darker plate the
          sticker sits on, so the label reads as inset rather than floating. */}
      {recess && shell.recess && (
        <mesh position={recess.position}>
          <planeGeometry args={[recess.width, recess.height]} />
          <meshStandardMaterial color={shell.recess} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/*
        Double-sided on purpose: a plane mesh is invisible from behind by
        default, and this box gets viewed from a wide range of orbit angles.
        A print that vanished whenever the camera crossed to the wrong side
        of it read as "missing box art" when the geometry was actually fine.
      */}
      <mesh position={print.position}>
        <planeGeometry args={[print.width, print.height]} />
        {archetype.kind === 'cartridge' ? (
          // A cartridge label is paper, printed and stuck on — matte, no sheen.
          <meshStandardMaterial map={cover} roughness={0.85} side={THREE.DoubleSide} />
        ) : (
          // A case's cover is a printed sleeve held under a clear plastic
          // front — the clearcoat is that plastic layer catching light over
          // the print, not the print itself being glossy.
          <meshPhysicalMaterial
            map={cover}
            roughness={0.5}
            clearcoat={0.6}
            clearcoatRoughness={0.12}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Printed spine, on the side that actually gets read on a shelf. */}
      {archetype.hasBackArt && (
        <mesh position={[-w / 2 - 0.05 * MM, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[d * 0.9, h * 0.9]} />
          <meshStandardMaterial color={shell.body} roughness={shell.roughness} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  )

  return (
    <group
      position={[position[0], position[1] + lift, position[2]]}
      rotation={rotation}
      onPointerOver={(e) => {
        stop(e)
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        stop(e)
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(game.rank)
      }}
    >
      {/* Only cartridge archetypes have a drop-in path — cases print edge to
          edge and stay parametric. Gating on kind also keeps the HEAD probe
          (one per box, and the spread renders ten) off URLs that can never
          exist. */}
      {archetype.kind === 'cartridge' ? (
        <CartridgeModel
          archetypeId={archetype.id}
          cover={cover}
          shellColor={shell.body}
          fallback={parametric}
        />
      ) : (
        parametric
      )}
    </group>
  )
}
