import { Suspense, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Matrix4, type BufferGeometry, type Group, type Mesh, type MeshStandardMaterial, type Texture } from 'three'
import type { MediaArchetypeId } from '@/types/console'
import { GltfErrorBoundary, floorAlignOffset, useUrlExists } from './GltfModel'
import { CARTRIDGE_TRANSFORMS } from './gltf-transforms'
import {
  applyCoverToLabel,
  LABEL_MESH_NAME,
  mirrorLabelU,
  offsetLabelMesh,
  stripShellTextures,
} from './cartridge-label'

/**
 * Drop-in real cartridge models — the media sibling of GltfOrFallback.
 *
 * A cartridge GLB at `/models/cartridges/<archetype>.glb` replaces the
 * parametric GameBox shell the moment it exists; nothing changes for
 * archetypes without a file (the parametric shell keeps rendering, exactly
 * like a console without a GLB keeps its form-built model). The file is
 * authored by the img2threejs pipeline at TRUE MILLIMETRES in local metres —
 * the scene-wide convention — so it drops into the existing spread layout
 * with no sizing code: the spread positions boxes from `archetype.dimensions`,
 * and the model is already that size. When a raw export isn't in metres, the
 * measured correction lives in `CARTRIDGE_TRANSFORMS` (scale, optional
 * rotationY when the model's label face isn't authored toward +z).
 *
 * The artwork contract is the one thing this loader enforces that the console
 * loader does not: the label surface must be a mesh named `label` (see
 * cartridge-label.ts), so the per-game cover texture can be placed on the
 * real recessed sticker area instead of the parametric label plane. The
 * texture itself arrives pre-resolved by GameBox — procedural placeholder
 * first, real art swapped in on load — and is applied via
 * `applyCoverToLabel`, which clones the material per model instance.
 *
 * Why the per-instance scene clone is mandatory: MediaSpread renders up to
 * ten boxes of the SAME archetype simultaneously, and useGLTF hands every
 * consumer ONE shared cached scene object. three.js gives an Object3D a
 * single parent, so ten `<primitive object={scene}>` mounts would fight over
 * one scene graph, and the label material is a single shared object too —
 * without the clone every box would print the last box's art. `clone(true)`
 * shares geometry (memory-cheap for a small shell) and copies material
 * references (the label one is cloned separately per instance anyway).
 */

export type CartridgeModelProps = {
  archetypeId: MediaArchetypeId
  /** The cover texture to print on the label — placeholder or real art. */
  cover: Texture
  /**
   * The console's real shell colour — the same value GameBox's parametric
   * fallback already resolves via `shellFor(archetype.id, consoleId).body`
   * (see media-shells.ts). Used only when `stripShellTexture` is set on this
   * archetype's `CARTRIDGE_TRANSFORMS` entry, so the GLB and the parametric
   * shell it falls back to can never disagree about the case colour.
   */
  shellColor: string
  /** What renders while no GLB exists yet: the parametric GameBox shell. */
  fallback: ReactNode
}

export function CartridgeModel({ archetypeId, cover, shellColor, fallback }: CartridgeModelProps) {
  const url = `/models/cartridges/${archetypeId}.glb`
  // An entry in CARTRIDGE_TRANSFORMS is proof the file was measured against
  // the archetype's published dimensions — same manifest discipline as the
  // console table, and it takes this archetype off the HEAD-probe path.
  const transform = CARTRIDGE_TRANSFORMS[archetypeId]
  const exists = useUrlExists(url, !transform)

  if (exists !== 'present') return <>{fallback}</>

  return (
    <GltfErrorBoundary resetKey={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <CartridgeScene
          url={url}
          cover={cover}
          shellColor={shellColor}
          scale={transform?.scale ?? 1}
          rotationX={transform?.rotationX ?? 0}
          rotationY={transform?.rotationY ?? 0}
          hideMeshIndices={transform?.hideMeshIndices}
          labelOffsetMm={transform?.labelOffsetMm}
          mirrorLabelU={transform?.mirrorLabelU}
          stripShellTexture={transform?.stripShellTexture}
        />
      </Suspense>
    </GltfErrorBoundary>
  )
}

function CartridgeScene({
  url,
  cover,
  shellColor,
  scale,
  rotationX,
  rotationY,
  hideMeshIndices,
  labelOffsetMm,
  mirrorLabelU: mirror,
  stripShellTexture: shouldStripShell,
}: {
  url: string
  cover: Texture
  shellColor: string
  scale: number
  rotationX: number
  rotationY: number
  hideMeshIndices?: number[]
  labelOffsetMm?: [right: number, up: number]
  mirrorLabelU?: boolean
  stripShellTexture?: boolean
}) {
  const { scene } = useGLTF(url)
  // rotationX is baked into the GEOMETRY (not the node) so that
  // floorAlignOffset sees the correct rotated bounding box. Applying it to
  // the instance node doesn't work: floorAlignOffset walks meshes UP TO but
  // NOT INCLUDING the instance, so the node's own rotation is invisible to
  // the offset computation — the model ends up placed for the unrotated shape
  // but rendered rotated, landing below the floor.
  const rotatedGeometriesRef = useRef<BufferGeometry[]>([])
  const instance = useMemo(() => {
    // Dispose geometries from the previous computation (useMemo has no
    // built-in cleanup — the next call disposes the previous batch).
    for (const g of rotatedGeometriesRef.current) g.dispose()
    rotatedGeometriesRef.current = []
    const clone = scene.clone(true)
    if (rotationX) {
      const rot = new Matrix4().makeRotationX(rotationX)
      clone.traverse((o) => {
        if ((o as Mesh).isMesh) {
          const mesh = o as Mesh
          const g = mesh.geometry.clone()
          g.applyMatrix4(rot)
          mesh.geometry = g
          rotatedGeometriesRef.current.push(g)
        }
      })
    }
    return clone
  }, [scene, rotationX])
  const groupRef = useRef<Group>(null)
  const offset = useMemo(
    () => floorAlignOffset(instance, hideMeshIndices, url),
    [instance, hideMeshIndices, url],
  )

  // Dispose rotated geometry clones on unmount.
  useEffect(
    () => () => {
      for (const g of rotatedGeometriesRef.current) g.dispose()
      rotatedGeometriesRef.current = []
    },
    [],
  )

  // Applied ONCE per model instance, in its own effect — not folded into the
  // cover-swap effect below, which re-runs on every placeholder-to-real-art
  // transition and would double the shift if the two lived together.
  //
  // The reference frame passed in is groupRef's OWN PARENT, not groupRef
  // itself — a real bug caught by measuring the result: groupRef is the node
  // that CARRIES rotationY, so using it as the reference made rotationY
  // common to both sides of the offsetLabelMesh transform and cancel out
  // entirely. The offset landed on the mesh's local X unrotated, which (after
  // rotationY actually rendered) pushed the label deeper into the shell's Z
  // depth rather than sliding it sideways across the face — it happened to
  // read as "shifted right" on screen only because the library camera views
  // the row at an oblique angle, not because the shift was actually correct.
  // The parent (GameBox's own per-box group, which has no rotationY) is the
  // frame where "right" and "up" mean what they say.
  // Owned here so it can be disposed on unmount — mirrorLabelU clones the
  // label's geometry rather than mutating the shared original in place (the
  // geometry sibling of why labelMaterialRef below is cloned), so this
  // clone is this box's own and nobody else's.
  const labelGeometryRef = useRef<BufferGeometry | null>(null)

  useEffect(() => {
    if (mirror) {
      // A geometry fix (see mirrorLabelU's own doc comment for why), so it
      // runs on the mesh directly and never touches the shared `cover`
      // texture other boxes/archetypes also use.
      labelGeometryRef.current = mirrorLabelU(instance)
    }
    if (labelOffsetMm) {
      const reference = groupRef.current?.parent
      if (reference) offsetLabelMesh(instance, reference, labelOffsetMm)
    }
  }, [instance, labelOffsetMm, mirror])

  // Owned here so the clones can be disposed on unmount — same reasoning as
  // labelGeometryRef above, one level up: some source models bake a fake
  // box-art graphic straight onto the SHELL mesh's own UVs (see
  // stripShellTextures's own doc comment), which sits proud of and fully
  // hides a correctly-updated `label` mesh underneath it. Runs once per
  // model instance, never inside the cover-swap effect below.
  const shellMaterialsRef = useRef<MeshStandardMaterial[]>([])

  useEffect(() => {
    if (!shouldStripShell) return
    shellMaterialsRef.current = stripShellTextures(instance, shellColor)
  }, [instance, shellColor, shouldStripShell])

  useEffect(
    () => () => {
      for (const material of shellMaterialsRef.current) material.dispose()
      shellMaterialsRef.current = []
    },
    [],
  )

  useEffect(
    () => () => {
      labelGeometryRef.current?.dispose()
      labelGeometryRef.current = null
    },
    [],
  )

  // The clone lives here, owned by this instance, so the placeholder→real
  // cover swap reuses one material instead of leaking a clone per change.
  // Disposed on unmount; the shared cached materials must NOT be disposed.
  const labelMaterialRef = useRef<MeshStandardMaterial | null>(null)

  useEffect(() => {
    let material: MeshStandardMaterial | null
    try {
      material = applyCoverToLabel(instance, cover, labelMaterialRef.current)
    } catch {
      return
    }
    if (material) {
      labelMaterialRef.current = material
    } else if (import.meta.env.DEV) {
      // A model without a `label` mesh can't show any game's art — a silent
      // failure would read as "the cover art is broken". Say it once, in the
      // same voice GltfModel uses for stale hideMeshIndices lists, and name
      // what the model actually contains so the missing surface is findable.
      const meshNames = new Set<string>()
      instance.traverse((o) => {
        if ((o as Mesh).isMesh) meshNames.add(o.name)
      })
      console.warn(
        `[CartridgeModel] ${url}: no mesh named "${LABEL_MESH_NAME}" (or a known variant) — ` +
          `cover art cannot be placed. Meshes in model: ${[...meshNames].join(', ') || '(none)'}. ` +
          'The artwork contract requires the label surface to be a named mesh.',
      )
    }
  }, [instance, cover, url])

  useEffect(
    () => () => {
      labelMaterialRef.current?.dispose()
      labelMaterialRef.current = null
    },
    [],
  )

  return (
    <group ref={groupRef} scale={scale} rotation={[0, rotationY, 0]}>
      <primitive object={instance} position={offset} />
    </group>
  )
}
