import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Matrix4, Vector3, type Mesh, type Object3D } from 'three'

/**
 * Drop-in GLB support — see public/models/README.md for the user-facing half
 * of this contract (exact filenames, format, scale/orientation notes).
 *
 * The design constraint that shapes everything here: most of the roster has
 * no file yet, and that must never be an error state. `useGLTF` suspends
 * while loading and *throws* on a failed fetch (a 404 becomes an uncaught
 * rejection), and Scene.tsx wraps the whole diorama in one shared
 * `<Suspense fallback={null}>` with no error boundary — so calling `useGLTF`
 * on a URL that doesn't exist yet would blank or crash the entire scene, not
 * just the one console. A HEAD request first, entirely outside Suspense,
 * means "no file yet" is answered before any loader that can throw ever
 * runs. The per-model ErrorBoundary below is a second safety net for the
 * cases HEAD can't catch — a corrupted file, a stale HEAD-then-race, a CDN
 * hiccup — so a bad model degrades to the fallback instead of taking the
 * scene down with it.
 */

type ExistsState = 'checking' | 'present' | 'absent'

/**
 * HEAD-check a URL. Never throws; a network error just resolves 'absent'.
 *
 * `res.ok` alone is not enough: Vite's dev server (and most static hosts
 * configured for SPA fallback) answer an unmatched path with 200 + index.html
 * rather than a real 404, so a missing model would otherwise read as
 * "present" and get handed to the glTF loader, which then fails trying to
 * parse HTML as binary glTF. A real `.glb` is never served as `text/html`,
 * so that content-type is the actual "doesn't exist" signal here.
 *
 * `enabled: false` skips the request entirely and reports 'present' — for
 * models already known to exist from the build-time manifest (see
 * GltfOrFallback's `known` prop). This check is a discovery mechanism for
 * files nothing knows about yet, and it is genuinely flaky as a gate: a HEAD
 * that Chrome reports as `net::ERR_ABORTED` REJECTS the fetch, landing in the
 * catch below and silently downgrading a model that exists and serves fine.
 * Anything we already know about should never be subject to that.
 */
export function useUrlExists(url: string, enabled: boolean): ExistsState {
  // The verdict is stored WITH the url that produced it. The previous version
  // kept only the verdict and reset it inside the effect — which runs a commit
  // late, so the first render after a url change handed the loader the
  // *previous* model's 'present'. Comparing during render makes the reset
  // synchronous and that stale-'present' window impossible.
  const [checked, setChecked] = useState<{ url: string; state: ExistsState }>({
    url,
    state: 'checking',
  })

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') ?? ''
        const isSpaFallback = contentType.includes('text/html')
        const present = res.ok && !isSpaFallback
        // A 404, or the SPA-fallback HTML that stands in for one, is the
        // ordinary "no file here yet" answer for most of the roster and not
        // worth saying. Any OTHER way of arriving at 'absent' — a 405 from a
        // host that refuses HEAD, a 5xx, an empty-bodied 200 — is a surprise
        // that silently costs a model, so it gets said out loud.
        if (!present && !isSpaFallback && res.status !== 404 && import.meta.env.DEV) {
          console.warn(
            `[GltfModel] unexpected HEAD response for ${url} — falling back ` +
              `(status ${res.status}, content-type "${contentType || 'none'}")`,
          )
        }
        if (!cancelled) setChecked({ url, state: present ? 'present' : 'absent' })
      })
      .catch((error) => {
        // Previously silent, which is exactly how a model that exists on disk
        // could degrade to a grey box with nothing said about it anywhere.
        if (import.meta.env.DEV) {
          console.warn(`[GltfModel] HEAD ${url} failed — falling back:`, error)
        }
        if (!cancelled) setChecked({ url, state: 'absent' })
      })
    return () => {
      cancelled = true
    }
  }, [url, enabled])

  if (!enabled) return 'present'
  return checked.url === url ? checked.state : 'checking'
}

type BoundaryProps = { fallback: ReactNode; resetKey: string; children: ReactNode }
type BoundaryState = { failed: boolean; resetKey: string }

export class GltfErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<BoundaryState> {
    return { failed: true }
  }

  /**
   * A new url is a new model, so a previous model's failure must not carry
   * over. Without this the flag was permanent: nothing in the tree keys this
   * component, so switching consoles reconciles the SAME boundary instance,
   * and one bad model rendered every console after it as a fallback for the
   * rest of the session.
   */
  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): BoundaryState | null {
    if (props.resetKey === state.resetKey) return null
    return { failed: false, resetKey: props.resetKey }
  }

  componentDidCatch(error: unknown) {
    // A malformed/corrupt model shouldn't be a silent no-op — surface it in
    // dev without taking the scene down, matching ControllerFromForm's
    // existing console.warn-on-recoverable-gap convention.
    if (import.meta.env.DEV) {
      console.warn(`[GltfModel] ${this.props.resetKey} failed to load, falling back:`, error)
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Floor-align and centre a loaded glTF scene, returning the local offset that
 * makes its visible meshes rest on y=0 centred at x/z=0 — the scene-wide
 * convention every other object in a diorama follows. Shared by the console
 * loader (GltfPrimitive below) and the cartridge loader (CartridgeModel), so
 * a dropped-in file lands in the same frame either way.
 *
 * It also enforces `hideMeshIndices` and opts every mesh into shadow
 * casting/receiving (GLTFLoader imports with both false), so a dropped-in
 * file behaves like every other model in the scene.
 */
export function floorAlignOffset(
  scene: Object3D,
  hideMeshIndices: number[] | undefined,
  url: string,
): [number, number, number] {
  const box = new Box3()
  let index = 0
  let shown = 0
  const hide = hideMeshIndices?.length ? new Set(hideMeshIndices) : null

  /*
    Accumulated via LOCAL matrices walked up to `scene`, never `matrixWorld`
    — this is the fix for a real bug, not a style preference. `scene` is
    cached and shared by useGLTF across every component that has ever
    rendered this URL (a console's shelf ArtifactSlot, then its own
    HeroConsole once selected). This runs during React's RENDER phase,
    before commit — at that point `scene` can still be attached
    under its PREVIOUS owner's group, so `matrixWorld` (which folds in
    every ancestor) reflects wherever that owner happened to place it,
    not the identity-ish "just this model" frame this offset is supposed
    to describe. Concretely: taking a console off the shelf picked up that
    shelf bay's own board height (over 2m) as a phantom Y offset, launching
    the console far below the floor the instant it was selected. Building
    the transform from each mesh's own `.matrix` up through its ancestors
    — stopping at `scene`, never reading anything above it — makes the
    result depend only on the model's own authored hierarchy, so it can't
    be corrupted by whatever `scene` is or isn't parented to right now.
  */
  const meshBox = new Box3()
  const localToScene = new Matrix4()
  scene.traverse((o) => {
    if (!(o as Mesh).isMesh) return
    const included = !hide?.has(index)
    o.visible = included
    // GLTFLoader imports meshes with three's defaults (castShadow and
    // receiveShadow both false), so a dropped-in GLB never casts or receives
    // a shadow — it floats over the room's shadow-catching floor and the
    // museum plinths. The generated models (ConsoleFromForm, the SNES
    // factory) opt in explicitly; this makes a GLB behave like every other
    // model in the scene. The `scene` object is the shared useGLTF cache, so
    // this is the same idempotent, wanted-everywhere mutation as `visible`
    // above — every instance of this model (hero, shelf bay) casts and
    // receives, which is the project's uniform posture.
    o.castShadow = true
    o.receiveShadow = true
    if (included) {
      localToScene.identity()
      const chain: Object3D[] = []
      for (let node: Object3D | null = o; node && node !== scene; node = node.parent) {
        chain.push(node)
      }
      for (let i = chain.length - 1; i >= 0; i -= 1) {
        chain[i].updateMatrix()
        localToScene.multiply(chain[i].matrix)
      }
      const mesh = o as Mesh
      mesh.geometry.computeBoundingBox()
      if (mesh.geometry.boundingBox) {
        meshBox.copy(mesh.geometry.boundingBox).applyMatrix4(localToScene)
        box.union(meshBox)
      }
      shown += 1
    }
    index += 1
  })

  /*
    These indices are positions in a specific export's mesh list, so they go
    stale the moment a source file is re-exported or recompressed — and the
    failure is silent and total. It has already happened once: n64.glb went
    from 24 mesh nodes to 16, its index list still named 0-17, and the
    console vanished from every screen it appears on with nothing logged.
  */
  if (import.meta.env.DEV && hide) {
    const stale = [...hide].filter((i) => i >= index)
    if (stale.length > 0) {
      console.warn(
        `[GltfModel] ${url}: hideMeshIndices names ${stale.join(', ')} but the file only ` +
          `has ${index} meshes (0-${index - 1}). The list is stale — re-derive it.`,
      )
    }
    if (shown === 0) {
      console.warn(
        `[GltfModel] ${url}: hideMeshIndices hides EVERY mesh, so nothing will render.`,
      )
    }
  }

  const center = box.getCenter(new Vector3())
  return [-center.x, -box.min.y, -center.z] as [number, number, number]
}

function GltfPrimitive({
  url,
  scale,
  hideMeshIndices,
}: {
  url: string
  scale: number
  hideMeshIndices?: number[]
}) {
  const { scene } = useGLTF(url)

  // `scene` is cached by drei's useGLTF (same url -> same object across
  // remounts), so hiding by traversal index has to be idempotent rather than
  // toggled — setting the same meshes invisible on every render is harmless.
  // `hideMeshIndices` is always the same array reference (it comes straight
  // from the static GLTF_TRANSFORMS table), so it's a legitimate, stable
  // dependency rather than a fresh array every render.
  //
  // The same pass also floor-aligns and centres the model: a raw glTF's own
  // origin can be anywhere (its authoring pivot, not necessarily the base),
  // and every other object in this scene rests on y=0 centred at its own
  // x/z=0 — the diorama positions consoles by that convention. The offset is
  // computed from only the meshes staying VISIBLE (excluding a hidden
  // bundled controller/cartridge), or a stray extra part would throw off
  // where "the floor" is. It is set on the inner primitive rather than this
  // component's own root, so it lands in the SAME space the scale is
  // applied in (Object3D.position is evaluated in the parent's space, before
  // this object's own scale reaches it) — set directly on `scene`, whatever
  // offset is computed here would be applied at raw/unscaled magnitude by
  // the parent, not the scaled-down visual size.
  const offset = useMemo(
    () => floorAlignOffset(scene, hideMeshIndices, url),
    [scene, hideMeshIndices, url],
  )

  return (
    <group scale={scale}>
      <primitive object={scene} position={offset} />
    </group>
  )
}

/**
 * Renders the GLB at `url` if one exists there, otherwise `fallback`
 * (the existing bespoke/form/Block chain). This is the zeroth tier ahead of
 * everything registry.tsx already does — an override always wins once a
 * file shows up, and nothing changes for ids that don't have one yet.
 *
 * `known` marks a model the build already knows exists, skipping the HEAD
 * probe. gltf-transforms.ts is that manifest: an id only earns an entry there
 * by having its scale measured against the actual file, so the table cannot
 * claim a model that isn't on disk. Files nobody has catalogued yet still get
 * discovered by HEAD, so pasting one in still works — it just renders at
 * scale 1 until measured, which was already true.
 *
 * `loading` shows while the file downloads (some are >12 MB). Defaults to
 * `fallback`, but callers should pass something that reads as provisional —
 * the fallback is a finished-looking object and would be mistaken for the
 * real model mid-download.
 *
 * `scale` and `hideMeshIndices` come from gltf-transforms.ts — see that file
 * for how each console's scale was actually measured, not guessed.
 */
export function GltfOrFallback({
  url,
  fallback,
  loading,
  known = false,
  scale = 1,
  hideMeshIndices,
}: {
  url: string
  fallback: ReactNode
  loading?: ReactNode
  known?: boolean
  scale?: number
  hideMeshIndices?: number[]
}) {
  const exists = useUrlExists(url, !known)

  if (exists !== 'present') return <>{fallback}</>

  return (
    <GltfErrorBoundary resetKey={url} fallback={fallback}>
      <Suspense fallback={loading ?? fallback}>
        <GltfPrimitive url={url} scale={scale} hideMeshIndices={hideMeshIndices} />
      </Suspense>
    </GltfErrorBoundary>
  )
}
