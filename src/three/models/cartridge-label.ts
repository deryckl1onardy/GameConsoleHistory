import {
  type BufferAttribute,
  type BufferGeometry,
  Matrix4,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
  Vector3,
} from 'three'
import { MM } from '@/data/kits/media-archetypes'

/**
 * The artwork contract for a dropped-in cartridge model.
 *
 * A real cartridge GLB has the label surface modelled as a genuine recessed
 * area (the sticker sits flush with the shell, not proud of it), and that
 * surface is exported under this exact mesh name with UVs covering exactly
 * the printed rect (0..1 over the label). The renderer never has to know
 * where the label is: it finds the mesh by name and swaps its map per game.
 * This is the same named-mesh convention the console models already use
 * (`animatedParts.slot`, hardwareDiagram anchors) applied to the one surface
 * that changes between games.
 */
export const LABEL_MESH_NAME = 'label'

/**
 * Names real-world cartridge models commonly give the sticker surface.
 * Authored models use exactly `label` (the contract, matched with priority);
 * files straight out of Blender/Sketchfab often call it `Sticker`,
 * `FrontLabel`, `Label_Mesh` or similar, and matching those saves a rename
 * pass. Anything matched by a variant gets the same treatment.
 */
const LABEL_NAME_VARIANTS = [
  'sticker',
  'frontlabel',
  'labelfront',
  'labelmesh',
  'labelsurface',
  'frontlabelmesh',
]

/** Lowercased name with every non-alphanumeric character stripped. */
function normalized(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * First mesh that carries the label surface, or null. Two passes: an exact
 * `label` match anywhere in the tree wins over any variant, so an authored
 * model that happens to contain an unrelated `sticker` mesh is never
 * misread.
 */
export function findLabelMesh(root: Object3D): Mesh | null {
  const meshes: Mesh[] = []
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh)
  })
  return (
    meshes.find((m) => m.name === LABEL_MESH_NAME) ??
    meshes.find((m) => LABEL_NAME_VARIANTS.includes(normalized(m.name))) ??
    null
  )
}

/**
 * Nudges the label mesh sideways/vertically by a real-world offset, expressed
 * in the same frame the model renders in after CartridgeModel's own
 * scale/rotationY — right is +x, up is +y, same convention as the rest of
 * the scene.
 *
 * Not every real cartridge shell is left-right symmetric: the NES's moulded
 * connector-release ridge runs down the left edge, so its actual label sits
 * right of the shell's own centre line, not dead-centre — the same insight
 * that drove `offsetXMm` on the parametric label plane in geometry/gameBox.ts,
 * needed again here because the GLB path positions its label from the
 * model's own baked geometry, not from that computation at all.
 *
 * The offset is computed by transforming two points through the world
 * transform and subtracting, rather than assuming which of the mesh's own
 * native axes is "sideways". Every cartridge model in this pipeline is
 * authored on its own axes (the NES plate faces +x and needs a rotationY; a
 * future model might not need one at all, or might need a different one) —
 * hardcoding a native axis here would silently break the next one. Verified
 * against the live NES model: shifting along its native "width" axis in the
 * wrong direction moved the art left instead of right, which is exactly the
 * class of bug this generic transform avoids.
 */
export function offsetLabelMesh(
  root: Object3D,
  referenceFrame: Object3D,
  offsetMm: [right: number, up: number],
): void {
  const mesh = findLabelMesh(root)
  if (!mesh || !mesh.parent) return

  referenceFrame.updateWorldMatrix(true, false)
  mesh.parent.updateWorldMatrix(true, false)

  const toMeshParentLocal = new Matrix4()
    .copy(mesh.parent.matrixWorld)
    .invert()
    .multiply(referenceFrame.matrixWorld)

  // Two points transformed and subtracted, rather than a single vector
  // rotated in place — this cancels translation correctly while still
  // carrying through the reference frame's rotation AND scale, which a
  // normalised "direction" transform would have discarded.
  const origin = new Vector3(0, 0, 0).applyMatrix4(toMeshParentLocal)
  const shifted = new Vector3(offsetMm[0] * MM, offsetMm[1] * MM, 0).applyMatrix4(toMeshParentLocal)

  mesh.position.add(shifted.sub(origin))
}

/**
 * Print `cover` onto the model's label mesh, returning the material now in
 * use on it — or null when the model has no mesh named `label`.
 *
 * The mesh's material is cloned ONCE per model instance and reused for every
 * subsequent call. Both halves of that matter:
 *
 *  - Cloning: MediaSpread renders up to ten boxes of the SAME archetype at
 *    once, and useGLTF hands every consumer one shared cached scene whose
 *    materials are shared objects. Assigning the map directly would make
 *    every box print the last box's art; cloning keeps each box's swap
 *    private. The caller owns the returned clone and disposes it on unmount.
 *  - Reuse: the procedural placeholder renders first and the real cover
 *    swaps in once loaded — passing the previous clone back in keeps ONE
 *    material per box across that swap instead of leaking a clone per cover
 *    change.
 *
 * The clone is a MeshStandardMaterial cast because that is the material
 * family the img2threejs spec mandates for the label surface
 * (MeshPhysicalMaterial extends it, so a physical label keeps its clearcoat).
 */
export function applyCoverToLabel(
  root: Object3D,
  cover: Texture,
  cloned?: MeshStandardMaterial | null,
): MeshStandardMaterial | null {
  const mesh = findLabelMesh(root)
  if (!mesh) return null
  const material = cloned ?? (mesh.material as MeshStandardMaterial).clone()
  material.map = cover
  material.needsUpdate = true
  mesh.material = material
  return material
}

/**
 * Flips the label mesh's own U coordinate (u -> 1-u), correcting a model
 * whose UVs were authored mirrored left-to-right.
 *
 * This is a geometry-level fix, not a texture one, on purpose: `cover` is a
 * shared texture object also used by the parametric fallback shell (see
 * GameBox.tsx) and by every other box in the spread via the same material
 * clone. Flipping `texture.repeat.x` instead would have mirrored the
 * parametric renderer and every OTHER cartridge model too — this touches
 * only this one mesh's own geometry, so it can never leak sideways.
 *
 * Caught on the live NES model: the source cover art (confirmed correct by
 * loading the raw file directly) read as legible "GOLF"/"ZELDA" text, but
 * the same texture on the model's `label` mesh rendered as a left-right
 * mirror image. The UV-range repair already on record in
 * `CARTRIDGE_TRANSFORMS['cart-nes'].notes` (fix-nes-uvs.mjs) fixed the u
 * 0.004..0.584 squeeze but evidently did not correct the winding direction.
 *
 * Clones the geometry before mutating it — this is the geometry sibling of
 * why `applyCoverToLabel` clones the MATERIAL. `useGLTF` hands every
 * consumer of a cached model the same scene, and `Object3D.clone()` does not
 * deep-clone geometry: MediaSpread's ten boxes of one archetype start out
 * sharing ONE BufferGeometry (and so one UV buffer) by reference. An
 * in-place mutation, called once per box, toggled that SAME shared buffer
 * ten times over — an even count, which cancelled straight back to the
 * original, still-mirrored state. Caught by reading the live UV values after
 * a fresh reload, not by trusting an earlier screenshot that happened to
 * look fixed for an unrelated reason (a leftover odd/even coincidence from
 * an earlier, different manual test in the same session).
 *
 * Returns the new geometry so the caller can dispose it on unmount — the
 * shared original must never be disposed, since sibling boxes (and the
 * cached source scene itself) still reference it.
 */
export function mirrorLabelU(root: Object3D): BufferGeometry | null {
  const mesh = findLabelMesh(root)
  if (!mesh) return null

  const geometry = mesh.geometry.clone()
  const uv = geometry.getAttribute('uv') as BufferAttribute | undefined
  if (!uv) return null

  for (let i = 0; i < uv.count; i++) {
    uv.setX(i, 1 - uv.getX(i))
  }
  uv.needsUpdate = true
  mesh.geometry = geometry
  return geometry
}

/**
 * Strips the baked texture off every mesh EXCEPT the label, replacing it
 * with the console's real shell colour.
 *
 * Some source models bake a fake, generic box-art graphic directly onto the
 * SHELL mesh's own UVs — not just onto the separate label plate the artwork
 * contract expects. Caught on the SNES model (`snes_cartridge.glb`): its
 * front-shell mesh carried its own leftover placeholder graphic across the
 * WHOLE 136x88mm face, sitting proud of and fully occluding the correctly
 * per-game-updated `label` mesh underneath. A real cover swap on `label` had
 * visibly no effect at all, because the shell's own baked art was the only
 * thing the camera ever saw — confirmed by hiding the shell mesh alone and
 * watching the correct, already-working cover art appear underneath it.
 *
 * `color` is the SAME value `GameBox`'s parametric shell already uses —
 * `shellFor(archetype.id, consoleId).body` (see media-shells.ts) — passed in
 * by the caller so the GLB and the parametric fallback can never disagree
 * about what colour this console's case actually is.
 *
 * Clones each mesh's material before mutating it, for the same reason
 * `applyCoverToLabel` and `mirrorLabelU` do: useGLTF hands every consumer of
 * a cached model the SAME scene, so an in-place mutation would repaint every
 * sibling box of the archetype (and the cached source scene itself), not
 * just this one instance. Returns the clones so the caller can dispose them
 * on unmount — the shared originals must never be disposed.
 */
export function stripShellTextures(
  root: Object3D,
  color: string,
  roughness = 0.55,
): MeshStandardMaterial[] {
  const label = findLabelMesh(root)
  const cloned: MeshStandardMaterial[] = []

  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || mesh === label) return
    const material = (mesh.material as MeshStandardMaterial).clone()
    material.map = null
    material.color.set(color)
    material.roughness = roughness
    material.needsUpdate = true
    mesh.material = material
    cloned.push(material)
  })

  return cloned
}
