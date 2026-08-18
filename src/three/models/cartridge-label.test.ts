import { describe, expect, it } from 'vitest'
import { BufferAttribute, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry, Texture } from 'three'
import {
  applyCoverToLabel,
  findLabelMesh,
  LABEL_MESH_NAME,
  mirrorLabelU,
  offsetLabelMesh,
  stripShellTextures,
} from './cartridge-label'

/**
 * The artwork contract for a dropped-in cartridge GLB. Two properties are
 * load-bearing and both are pinned here:
 *
 *  1. The label surface is found BY NAME, never by position — the renderer
 *     has no idea where the recessed sticker area is on a real model, so the
 *     name `label` is the entire contract.
 *  2. The swap clones the mesh's material, because useGLTF hands every
 *     instance ONE shared cached scene: assigning the map directly would make
 *     every box in the ten-wide spread print the last box's art.
 */

const fakeTexture = () => new Texture()

/** A minimal scene with a labelled mesh nested under some groups. */
function sceneWithLabel(labelMaterial?: MeshStandardMaterial) {
  const label = new Mesh(
    new PlaneGeometry(1, 1),
    labelMaterial ?? new MeshStandardMaterial({ color: 0x808080 }),
  )
  label.name = LABEL_MESH_NAME
  const outer = new Group()
  outer.add(label)
  const root = new Group()
  root.add(outer)
  return { root, label, material: label.material as MeshStandardMaterial }
}

describe('findLabelMesh', () => {
  it('finds a mesh named `label` anywhere in the tree', () => {
    const { root, label } = sceneWithLabel()
    expect(findLabelMesh(root)).toBe(label)
  })

  it('returns the first label when several are nested', () => {
    const { root } = sceneWithLabel()
    const second = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    second.name = LABEL_MESH_NAME
    root.add(second)
    expect(findLabelMesh(root)).toBe(root.children[0].children[0])
    expect(findLabelMesh(root)).not.toBe(second)
  })

  it('returns null when no mesh carries the name', () => {
    const bare = new Group()
    bare.add(new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial()))
    expect(findLabelMesh(new Group().add(bare))).toBeNull()
  })

  it('ignores non-mesh nodes carrying the name', () => {
    const decoy = new Group()
    decoy.name = LABEL_MESH_NAME
    expect(findLabelMesh(decoy)).toBeNull()
  })

  it('accepts common real-world names for the sticker surface', () => {
    // Files straight out of Blender/Sketchfab rarely name the surface exactly
    // `label` — tolerate the usual variants so a dropped-in model needs no
    // mesh-renaming pass.
    for (const name of ['Sticker', 'FrontLabel', 'Label_Mesh', 'front label', 'LABEL SURFACE']) {
      const label = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
      label.name = name
      expect(findLabelMesh(label), name).toBe(label)
    }
  })

  it('prefers an exact `label` match over a variant elsewhere in the tree', () => {
    const sticker = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    sticker.name = 'Sticker'
    const label = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    label.name = LABEL_MESH_NAME
    const root = new Group()
    root.add(sticker, label)
    expect(findLabelMesh(root)).toBe(label)
  })

  it('does not treat an unrelated name containing "label" as the sticker', () => {
    const decoy = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    decoy.name = 'label-screw-hole'
    expect(findLabelMesh(decoy)).toBeNull()
  })
})

describe('applyCoverToLabel', () => {
  it('prints the cover onto the label mesh and returns the material in use', () => {
    const { root } = sceneWithLabel()
    const cover = fakeTexture()
    const material = applyCoverToLabel(root, cover)
    expect(material).toBeInstanceOf(MeshStandardMaterial)
    expect((root.children[0].children[0] as Mesh).material).toBe(material)
    expect(material!.map).toBe(cover)
    // In three, Material.needsUpdate is a setter-only flag backed by `version`
    // — reading it back returns undefined, so the version bump is the signal
    // that the swap flagged the material for shader recompile.
    expect(material!.version).toBeGreaterThan(0)
  })

  it('clones the shared material instead of mutating it', () => {
    // useGLTF's cache hands every consumer the SAME material object. If the
    // swap wrote the map onto it directly, ten boxes of one archetype would
    // all end up with the last box's art.
    const { root, material } = sceneWithLabel()
    applyCoverToLabel(root, fakeTexture())
    expect((root.children[0].children[0] as Mesh).material).not.toBe(material)
    expect(material.map).toBeNull()
  })

  it("reuses the caller's previous clone so one box keeps ONE material", () => {
    // The placeholder renders first, the real cover swaps in on load — the
    // caller passes its previous clone back, so the swap does not leak a
    // material per cover change.
    const { root } = sceneWithLabel()
    const first = applyCoverToLabel(root, fakeTexture())!
    const second = applyCoverToLabel(root, fakeTexture(), first)
    expect(second).toBe(first)
    expect((root.children[0].children[0] as Mesh).material).toBe(first)
  })

  it('preserves a physical label material so its clearcoat survives the swap', () => {
    // The img2threejs spec mandates the label surface be MeshStandardMaterial
    // (or a subclass). A MeshPhysicalMaterial label keeps its clearcoat.
    const { root } = sceneWithLabel(new MeshPhysicalMaterial({ clearcoat: 1 }))
    const material = applyCoverToLabel(root, fakeTexture())
    expect(material).toBeInstanceOf(MeshPhysicalMaterial)
    expect(material!.map).not.toBeNull()
  })

  it('returns null and leaves the scene untouched when there is no label mesh', () => {
    const root = new Group()
    root.add(new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial()))
    expect(applyCoverToLabel(root, fakeTexture())).toBeNull()
    expect((root.children[0] as Mesh).material).toBeInstanceOf(MeshStandardMaterial)
  })
})

describe('offsetLabelMesh', () => {
  it('shifts the label by a plain offset when the mesh sits directly in the reference frame', () => {
    const referenceFrame = new Group()
    const { root, label } = sceneWithLabel()
    referenceFrame.add(root)
    referenceFrame.updateWorldMatrix(true, true)

    offsetLabelMesh(root, referenceFrame, [10, 0])

    // 10mm right, in metres, with no rotation between the mesh's parent and
    // the reference frame — a straight pass-through.
    expect(label.position.x).toBeCloseTo(0.01, 6)
    expect(label.position.y).toBeCloseTo(0, 6)
    expect(label.position.z).toBeCloseTo(0, 6)
  })

  it("re-expresses the offset in the mesh's own parent when it is rotated relative to the reference frame", () => {
    // This is the case that actually matters: a cartridge model authored on
    // its own axes, wrapped in CartridgeModel's rotationY group. A naive
    // "just add to x" implementation would shift the art the wrong way (or
    // not at all) the moment a model needs a rotation — exactly the bug this
    // function exists to avoid, caught empirically against the live NES
    // model before this was written.
    const referenceFrame = new Group()
    const rotatedChild = new Group()
    rotatedChild.rotation.y = Math.PI / 2 // 90° — local +x now points world -z
    referenceFrame.add(rotatedChild)
    const label = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    label.name = LABEL_MESH_NAME
    rotatedChild.add(label)
    referenceFrame.updateWorldMatrix(true, true)

    offsetLabelMesh(rotatedChild, referenceFrame, [10, 0])

    // 10mm "right" in the reference frame's own axes lands on the rotated
    // child's local +z, not +x — proof the rotation was actually accounted
    // for rather than assumed away.
    expect(label.position.x).toBeCloseTo(0, 6)
    expect(label.position.z).toBeCloseTo(0.01, 6)
  })

  it('does nothing when the model has no label mesh', () => {
    const referenceFrame = new Group()
    const root = new Group()
    const mesh = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial())
    root.add(mesh)
    referenceFrame.add(root)
    referenceFrame.updateWorldMatrix(true, true)

    expect(() => offsetLabelMesh(root, referenceFrame, [10, 0])).not.toThrow()
    expect(mesh.position.x).toBe(0)
  })
})

describe('mirrorLabelU', () => {
  it('flips every u coordinate (u -> 1-u), leaving v untouched', () => {
    const { root, label } = sceneWithLabel()
    const originalUv = label.geometry.attributes.uv as BufferAttribute
    const before = Array.from({ length: originalUv.count }, (_, i) => [originalUv.getX(i), originalUv.getY(i)])

    mirrorLabelU(root)

    const uv = label.geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) {
      expect(uv.getX(i), `u[${i}]`).toBeCloseTo(1 - before[i][0], 6)
      expect(uv.getY(i), `v[${i}] should be untouched`).toBeCloseTo(before[i][1], 6)
    }
  })

  it('is its own inverse — mirroring twice restores the original UVs', () => {
    const { root, label } = sceneWithLabel()
    const originalUv = label.geometry.attributes.uv as BufferAttribute
    const original = Array.from({ length: originalUv.count }, (_, i) => [originalUv.getX(i), originalUv.getY(i)])

    mirrorLabelU(root)
    mirrorLabelU(root)

    const uv = label.geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) {
      expect(uv.getX(i)).toBeCloseTo(original[i][0], 6)
      expect(uv.getY(i)).toBeCloseTo(original[i][1], 6)
    }
  })

  it('clones the geometry rather than mutating it in place, and returns the clone', () => {
    const { root, label } = sceneWithLabel()
    const originalGeometry = label.geometry

    const returned = mirrorLabelU(root)

    expect(returned).toBe(label.geometry)
    expect(label.geometry).not.toBe(originalGeometry)
  })

  it(
    'does not corrupt (or get corrupted by) a sibling mesh sharing the same geometry object — ' +
      'the actual bug: useGLTF hands every consumer of a cached model the same scene, and ' +
      'Object3D.clone() does not deep-clone geometry, so MediaSpread\'s boxes of one archetype ' +
      'start out sharing ONE BufferGeometry. An in-place mutation toggled that shared buffer once ' +
      'per box; with an even box count the flips cancelled straight back to the original, still-' +
      'mirrored state — the bug this clone-before-mutating design exists to prevent.',
    () => {
      const { root: rootA, label: labelA } = sceneWithLabel()
      const sharedGeometry = labelA.geometry
      const sharedUv = sharedGeometry.attributes.uv as BufferAttribute
      const before = Array.from({ length: sharedUv.count }, (_, i) => sharedUv.getX(i))

      const rootB = new Group()
      const labelB = new Mesh(sharedGeometry, new MeshStandardMaterial())
      labelB.name = LABEL_MESH_NAME
      rootB.add(labelB)
      expect(labelA.geometry).toBe(labelB.geometry) // sanity: genuinely shared going in

      mirrorLabelU(rootA)
      mirrorLabelU(rootB)

      // Both boxes end up with their own independent, correctly-mirrored
      // geometry — not two mutations of one shared buffer, which would
      // have cancelled back to the original.
      expect(labelA.geometry).not.toBe(sharedGeometry)
      expect(labelB.geometry).not.toBe(sharedGeometry)
      expect(labelA.geometry).not.toBe(labelB.geometry)
      for (let i = 0; i < before.length; i++) {
        expect(labelA.geometry.attributes.uv.getX(i), `A u[${i}]`).toBeCloseTo(1 - before[i], 6)
        expect(labelB.geometry.attributes.uv.getX(i), `B u[${i}]`).toBeCloseTo(1 - before[i], 6)
      }
      // The original shared buffer itself must be untouched — sibling boxes
      // that haven't run their own effect yet still need the original.
      for (let i = 0; i < before.length; i++) {
        expect(sharedGeometry.attributes.uv.getX(i), `shared u[${i}]`).toBeCloseTo(before[i], 6)
      }
    },
  )

  it('does nothing when the model has no label mesh', () => {
    const root = new Group()
    root.add(new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial()))
    expect(mirrorLabelU(root)).toBeNull()
  })
})

describe('stripShellTextures', () => {
  /** A label plus a "shell" mesh that carries its own baked, leftover texture. */
  function sceneWithBakedShell() {
    const { root, label } = sceneWithLabel()
    const shellMaterial = new MeshStandardMaterial({ map: fakeTexture(), color: 0xffffff })
    const shell = new Mesh(new PlaneGeometry(1, 1), shellMaterial)
    shell.name = 'shell'
    root.add(shell)
    return { root, label, shell, shellMaterial }
  }

  it('clears the baked map and repaints the shell, leaving the label untouched', () => {
    const { root, label, shell } = sceneWithBakedShell()
    const labelMap = (label.material as MeshStandardMaterial).map

    stripShellTextures(root, '#1a3ea8')

    const shellMat = shell.material as MeshStandardMaterial
    expect(shellMat.map).toBeNull()
    expect(`#${shellMat.color.getHexString()}`).toBe('#1a3ea8')
    // The label mesh — found by name and explicitly excluded — must be
    // completely unaffected: this function's whole job is separating the
    // shell's own leftover art from the correctly-updated cover art.
    expect((label.material as MeshStandardMaterial).map).toBe(labelMap)
  })

  it('clones the material rather than mutating it in place', () => {
    const { root, shell, shellMaterial } = sceneWithBakedShell()
    stripShellTextures(root, '#1a3ea8')
    expect(shell.material).not.toBe(shellMaterial)
    // The original, potentially shared material must survive untouched —
    // same reasoning as applyCoverToLabel and mirrorLabelU.
    expect(shellMaterial.map).not.toBeNull()
  })

  it('returns every cloned material so the caller can dispose them', () => {
    const { root } = sceneWithBakedShell()
    const clones = stripShellTextures(root, '#1a3ea8')
    expect(clones).toHaveLength(1)
    expect(clones[0].map).toBeNull()
  })

  it('strips every non-label mesh, not just the first', () => {
    const { root, label } = sceneWithLabel(new MeshStandardMaterial({ map: fakeTexture() }))
    const shellA = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial({ map: fakeTexture() }))
    const shellB = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial({ map: fakeTexture() }))
    root.add(shellA, shellB)
    const labelMap = (label.material as MeshStandardMaterial).map

    const clones = stripShellTextures(root, '#107c10')

    expect(clones).toHaveLength(2)
    expect((shellA.material as MeshStandardMaterial).map).toBeNull()
    expect((shellB.material as MeshStandardMaterial).map).toBeNull()
    // The label's own cover art must survive completely untouched.
    expect((label.material as MeshStandardMaterial).map).toBe(labelMap)
  })

  it('applies a sane default roughness, or an explicit override', () => {
    const { root: rootA, shell: shellA } = sceneWithBakedShell()
    stripShellTextures(rootA, '#1a3ea8')
    expect((shellA.material as MeshStandardMaterial).roughness).toBeCloseTo(0.55, 6)

    const { root: rootB, shell: shellB } = sceneWithBakedShell()
    stripShellTextures(rootB, '#1a3ea8', 0.3)
    expect((shellB.material as MeshStandardMaterial).roughness).toBeCloseTo(0.3, 6)
  })
})
