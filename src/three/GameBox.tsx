import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { ThreeEvent } from '@react-three/fiber'
import type { Game, MediaArchetype } from '@/types/console'
import {
  BOX_FACE,
  LIFT_M,
  boxProfile,
  boxSizeMetres,
  coverAspect,
  edgeBevelMetres,
  labelPlane,
  printsPerFace,
  spineAspect,
} from './geometry/gameBox'
import { placeholderCover } from './covers'
import { shellFor } from '@/data/kits/media-shells'
import { MM } from '@/data/kits/media-archetypes'
import { backCoverFor, coverFor, spineCoverFor } from '@/data/covers'
import { CartridgeModel } from './models/CartridgeModel'

const textureLoader = new THREE.TextureLoader()
/** Real covers, once loaded, are cached by URL so switching consoles and back
 * doesn't refetch. */
const REAL_COVER_CACHE = new Map<string, THREE.Texture>()

/**
 * A real texture at `url` if one is given, applied via
 * `texture.repeat`/`offset` so it fills the printed area at the correct
 * aspect rather than stretching. Whatever renders without it (the procedural
 * front placeholder, the flat-colour spine, no back print at all) always
 * shows FIRST — this only swaps in once (and if) the real art finishes
 * loading, so a box is never blank waiting on a network request.
 *
 * Shared by all three faces — front (`coverFor`), spine (`spineCoverFor`),
 * back (`backCoverFor`) — each just resolves a different manifest to the
 * `url` this hook actually loads.
 */
function useRealCoverTexture(url: string | null, printAspect: number): THREE.Texture | null {
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

/** Segments RoundedBoxGeometry's curve is built from — enough to read as a
 * genuine soft edge under the library's close orbit distance, not so many
 * that a case archetype's small 2-4mm radius spends triangles it can't show. */
const CASE_BEVEL_SEGMENTS = 3

/**
 * The shell, in one of two constructions chosen by `printsPerFace`.
 *
 * Face-mapped archetypes (boxes and cases) get a RoundedBoxGeometry, for the
 * two things a texture actually needs and a plain BoxGeometry's razor-sharp
 * edges cannot give: SIX addressable material groups with clean 0..1 UVs per
 * face (verified live: RoundedBoxGeometry extends BoxGeometry and keeps the
 * exact same six equal-sized groups in the exact same order, so BOX_FACE's
 * indices still apply unchanged), PLUS a real edge bevel with smoothly
 * interpolated normals. That second part is not cosmetic — a perfectly
 * sharp 90° edge cannot carry a specular highlight across itself at most
 * camera angles, which is a real reason a flat BoxGeometry case reads as a
 * plastic-less block no matter how good the printed texture is; a rounded
 * edge can, and does. The radius reuses `cornerRadiusMm`, the same field
 * cartridges already use for their own rounding — one honest measured
 * number per archetype, not a second guessed one.
 *
 * With this, the front/spine/back art IS the geometry — no floating planes
 * to position, and none of the bugs that come with positioning them.
 *
 * Cartridges keep the rounded-rect extrusion: their art is an inset label
 * plane anyway (see printsPerFace), so the six face slots would go unused,
 * and the rounded profile is doing real work on a chunky moulded shell that
 * a plain cuboid renders as a block of wood.
 */
function useShellGeometry(archetype: MediaArchetype, depth: number, bevel: number) {
  return useMemo(() => {
    const { w, h, r } = boxProfile(archetype)

    if (printsPerFace(archetype)) {
      return new RoundedBoxGeometry(w, h, depth, CASE_BEVEL_SEGMENTS, r)
    }

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

/**
 * One face of a face-mapped shell: the scan if there is one, the bare
 * material colour if there isn't.
 *
 * `attach="material-N"` is what puts it in the right slot of the mesh's
 * material array — BOX_FACE names those indices, matching the order
 * BoxGeometry emits its groups in.
 *
 * Two details that matter:
 *  - No `color` alongside a `map`. Three MULTIPLIES the two, so leaving the
 *    shell colour on would tint every scan by the cardboard or plastic it is
 *    printed on and quietly dull it. Colour is for the unprinted faces only.
 *  - The `key` flips with texture presence, so crossing the no-art/art
 *    boundary builds a fresh material rather than mutating one in place.
 *    A material compiled without a map needs `needsUpdate` to pick one up
 *    later; remounting sidesteps that question entirely.
 */
function PrintedFace({
  face,
  map,
  shell,
  color,
  kind,
}: {
  face: number
  map: THREE.Texture | null
  shell: ReturnType<typeof shellFor>
  color: THREE.Color
  kind: MediaArchetype['kind']
}) {
  return (
    <meshPhysicalMaterial
      key={map ? 'art' : 'plain'}
      attach={`material-${face}`}
      {...(map ? { map } : { color })}
      roughness={shell.roughness}
      metalness={0}
      clearcoat={FINISH[kind].clearcoat}
      clearcoatRoughness={FINISH[kind].clearcoatRoughness}
    />
  )
}

/** How far inside the outer glass surface an inner print plane sits, in mm.
 * Purely a z-fighting clearance — real jewel-case inserts sit right against
 * the inside of the cover, this just needs to be enough that the renderer
 * never has to decide which surface is in front. */
const INNER_PRINT_INSET_MM = 1

/**
 * A jewel case / Switch cartridge case: the shell itself IS clear or
 * translucent plastic (`shell.transparentShell`, see media-shells.ts for the
 * researched sources), so there is nothing to bake art onto — the outer
 * geometry gets ONE uniform transmissive material on every face, and the
 * front/spine/back scans sit on separate planes floating just inside it,
 * the way a real printed insert sits behind real glass. The tray (jewel
 * case only) sits further inside still, in the gap between the front and
 * back inserts — genuinely visible now, for the first time: it existed as
 * a field on `ShellStyle` since the very first parametric pass, but every
 * earlier construction (an opaque extruded shell, then an opaque
 * face-mapped one) hid it behind a solid front no light could pass.
 *
 * One material on a grouped geometry is deliberate, not an oversight: three
 * ignores `geometry.groups` entirely whenever `mesh.material` is a single
 * object rather than an array, and applies that one material to the whole
 * mesh — exactly what a uniformly clear shell needs, with no per-face
 * bookkeeping.
 */
function TransparentCase({
  geometry,
  w,
  h,
  d,
  shell,
  color,
  cover,
  spineCover,
  backCover,
}: {
  geometry: THREE.BufferGeometry
  w: number
  h: number
  d: number
  shell: ReturnType<typeof shellFor>
  color: THREE.Color
  cover: THREE.Texture
  spineCover: THREE.Texture | null
  backCover: THREE.Texture | null
}) {
  const inset = INNER_PRINT_INSET_MM * MM

  return (
    <>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          roughness={shell.roughness}
          metalness={0}
          transmission={0.92}
          ior={1.55}
          thickness={d}
          attenuationColor={color}
          attenuationDistance={0.012}
          clearcoat={0.6}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Front insert — always present, `cover` already falls back to the
          procedural placeholder so this is never blank. */}
      <mesh position={[0, 0, d / 2 - inset]}>
        <planeGeometry args={[w * 0.96, h * 0.96]} />
        <meshStandardMaterial map={cover} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* The tray (or, on a Switch case, empty air over the cartridge nub) —
          sits in the gap between the two inserts, dead centre. */}
      {shell.tray && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[w * 0.94, h * 0.94]} />
          <meshStandardMaterial color={shell.tray} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Spine insert — the strip actually read on a shelf. Rotated to face
          -X outward, same as the opaque construction's spine face did. */}
      {spineCover && (
        <mesh position={[-(w / 2 - inset), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[d * 0.9, h * 0.9]} />
          <meshStandardMaterial map={spineCover} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Back insert — the real "tray card" behind the rear glass. Rotated
          180° so it reads un-mirrored from behind, same reasoning as the
          opaque construction's back face. */}
      {backCover && (
        <mesh position={[0, 0, -(d / 2 - inset)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w * 0.96, h * 0.96]} />
          <meshStandardMaterial map={backCover} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  )
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
  const realCover = useRealCoverTexture(coverFor(consoleId, game), aspect)
  const cover = realCover ?? placeholder

  // Spine and back are optional, hand-sourced faces (see covers.ts) — unlike
  // the front, neither has a procedural placeholder to fall back to: `null`
  // here just means GameBox renders what it always rendered before these
  // existed (a flat-colour spine, no extra back print at all).
  const spineCover = useRealCoverTexture(spineCoverFor(consoleId, game), spineAspect(archetype))
  const backCover = useRealCoverTexture(backCoverFor(consoleId, game), aspect)

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
  const parametric = printsPerFace(archetype) ? (
    shell.transparentShell ? (
      <TransparentCase
        geometry={shellGeometry}
        w={w}
        h={h}
        d={d}
        shell={shell}
        color={shellColor}
        cover={cover}
        spineCover={spineCover}
        backCover={backCover}
      />
    ) : (
      /*
        Face-mapped, opaque: the artwork IS the shell. Six materials on one
        RoundedBoxGeometry, indexed by BOX_FACE — the front carries the
        cover, the LEFT face carries the spine (the side actually read on a
        shelf), the back carries the back panel, and the three unprinted
        faces are bare plastic. Correct for a DVD/Blu-ray keepcase (opaque
        shell, a thin clear window over the printed sleeve — see
        `clearSleeve`'s own doc comment) or a cardboard box (opaque, no
        window at all): the print sits directly on the surface either way.

        This replaced three planes floating proud of an extruded shell.
        Those planes had to be positioned clear of the shell's own bevel or
        they rendered INSIDE solid geometry and vanished — which is exactly
        what had happened to the spine: measured on this box, the bevel
        grows the shell 0.8mm past its authored profile while the spine
        plane sat only 0.05mm proud, leaving it buried 0.75mm deep.
        Invisible, and impossible to catch by eye, because a plane painted
        in `shell.body` is pixel-identical to the shell hiding it. A painted
        face has no proud-ness to get wrong, so that whole class of bug
        cannot recur here.
      */
      <mesh castShadow receiveShadow geometry={shellGeometry}>
        <PrintedFace face={BOX_FACE.front} map={cover} shell={shell} color={shellColor} kind={archetype.kind} />
        <PrintedFace face={BOX_FACE.left} map={spineCover} shell={shell} color={shellColor} kind={archetype.kind} />
        <PrintedFace face={BOX_FACE.back} map={backCover} shell={shell} color={shellColor} kind={archetype.kind} />
        <PrintedFace face={BOX_FACE.right} map={null} shell={shell} color={shellColor} kind={archetype.kind} />
        <PrintedFace face={BOX_FACE.top} map={null} shell={shell} color={shellColor} kind={archetype.kind} />
        <PrintedFace face={BOX_FACE.bottom} map={null} shell={shell} color={shellColor} kind={archetype.kind} />
      </mesh>
    )
  ) : (
    /*
      Cartridge: rounded extruded shell, with the label as its own inset
      plane. A plane is the right tool HERE and only here — the label is a
      sticker at its own published size, offset from the face's centre (see
      printsPerFace), which face-mapped UVs cannot express without baking
      that inset and offset into every individual game's artwork.
    */
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

        A cartridge label is paper, printed and stuck on — matte, no sheen.
      */}
      <mesh position={print.position}>
        <planeGeometry args={[print.width, print.height]} />
        <meshStandardMaterial map={cover} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
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
