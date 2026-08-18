import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BoxGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { ConsoleEntry } from '@/types/console'
import { consoleForm } from '@/data/kits/console-forms'
import { GLTF_TRANSFORMS } from './models/gltf-transforms'

/**
 * Offscreen thumbnail renderer — the sidebar's "snippet from the 3D model".
 *
 * Each console's dropped-in GLB is rendered ONCE into a small square image
 * with plain three (no R3F, no per-row WebGL context — one hidden renderer
 * serves the whole rail), and the result is cached as a data URL. The
 * rendering deliberately reuses the scene's OWN facts so the list shows the
 * model the way the hero does:
 *
 *   - the same GLTF_TRANSFORMS scale and hideMeshIndices (a bundled
 *     controller or ground plane must not appear in the thumbnail either),
 *   - the console's own diorama yaw, so the face that faces the camera in
 *     the room (the Switch's screen, the 360's power ring) faces it here,
 *   - the same floor-align-and-centre pass GltfPrimitive runs.
 *
 * Consoles without a catalogued GLB (switch-2 today) get the same honest
 * fallback the scene uses — a correctly sized shell box, tinted with the
 * console's own form palette where one exists.
 *
 * Rendering is queued one at a time (a dozen simultaneous 10MB GLB fetches
 * would hammer the network) and each model's GPU/JS resources are disposed
 * right after its frame is captured, so the whole roster costs one
 * renderer's worth of memory at rest.
 */

const THUMB = 256
const MM = 1000

const cache = new Map<string, Promise<string | null>>()

let renderer: WebGLRenderer | null = null
let rendererReady: Promise<WebGLRenderer | null> | null = null
let queue: Promise<unknown> = Promise.resolve()

function getRenderer(): Promise<WebGLRenderer | null> {
  if (renderer) return Promise.resolve(renderer)
  if (rendererReady) return rendererReady
  rendererReady = (async () => {
    try {
      // Never appended to the DOM — the frame is captured straight off the
      // context's own canvas.
      const canvas = document.createElement('canvas')
      const gl = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        // Required for toDataURL on a WebGL canvas; only used by the one-off
        // thumbnail pass, so the cost is irrelevant here.
        preserveDrawingBuffer: true,
      })
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      gl.setSize(THUMB, THUMB, false)
      gl.outputColorSpace = SRGBColorSpace
      gl.toneMapping = ACESFilmicToneMapping
      gl.toneMappingExposure = 1.05
      gl.setClearColor(0x000000, 0)
      renderer = gl
      return gl
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[thumbnails] WebGL unavailable — sidebar rows will show placeholders', error)
      }
      return null
    }
  })()
  return rendererReady
}

function loadModel(url: string): Promise<Object3D> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject)
  })
}

/**
 * Floor-align and centre over the meshes that stay VISIBLE — the same pass
 * GltfPrimitive runs in the live scene (see GltfModel.tsx for why the offset
 * must ignore hidden bundled extras). The model is freshly loaded and not yet
 * parented under anything with its own transform, so world matrices here are
 * just the model's own authored hierarchy.
 */
function offsetFor(scene: Object3D, hide: Set<number> | null): [number, number, number] {
  const box = new Box3()
  let index = 0
  scene.traverse((o) => {
    if (!(o as Mesh).isMesh) return
    const visible = !hide?.has(index)
    o.visible = visible
    if (visible) box.union(new Box3().setFromObject(o))
    index += 1
  })
  const center = box.getCenter(new Vector3())
  return [-center.x, -box.min.y, -center.z]
}

function disposeModel(root: Object3D): void {
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) material?.dispose()
  })
}

async function renderConsole(entry: ConsoleEntry): Promise<string | null> {
  const gl = await getRenderer()
  if (!gl) return null

  const transform = GLTF_TRANSFORMS[entry.id]
  const rotation = entry.diorama.consoleRotation ?? [0, 0, 0]

  const scene = new Scene()
  // Warm museum key + cool fill, echoing the room's own light rig.
  scene.add(new AmbientLight(0xffffff, 0.55))
  const key = new DirectionalLight(0xfff1dc, 2.6)
  key.position.set(1.3, 1.7, 1)
  scene.add(key)
  const fill = new DirectionalLight(0xcfe0ff, 0.9)
  fill.position.set(-1.4, 0.5, 0.7)
  scene.add(fill)

  const group = new Group()
  group.rotation.set(...rotation)
  scene.add(group)

  try {
    if (transform) {
      const model = await loadModel(`/models/consoles/${entry.id}.glb`)
      const hide = transform.hideMeshIndices?.length ? new Set(transform.hideMeshIndices) : null
      const offset = offsetFor(model, hide)
      const inner = new Group()
      inner.scale.setScalar(transform.scale)
      group.add(inner)
      inner.add(model)
      model.position.set(...offset)
    } else {
      // No catalogued model — the same honest box the live scene falls back
      // to, tinted with the console's own form palette when one exists.
      const form = consoleForm(entry.id)
      const [w, h, d] = [
        entry.dimensions.width,
        entry.dimensions.height,
        entry.dimensions.depth,
      ].map((mm) => mm / MM)
      const shell = new Mesh(
        new BoxGeometry(w, h, d),
        new MeshStandardMaterial({ color: form?.palette.shell ?? '#b9b7b2', roughness: 0.55 }),
      )
      shell.position.y = h / 2
      group.add(shell)
    }

    // Frame the ROTATED model — the box must be measured after the diorama
    // yaw, or a model turned 180° would be framed against the wrong extents.
    const box = new Box3().setFromObject(group)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const diagonal = Math.max(size.length(), 1e-4)

    const camera = new PerspectiveCamera(34, 1, diagonal / 1000, diagonal * 30)
    const distance = diagonal * 1.55
    const pitch = MathUtils.degToRad(20)
    const yaw = MathUtils.degToRad(30)
    const horizontal = distance * Math.cos(pitch)
    camera.position.set(
      center.x + horizontal * Math.cos(yaw),
      center.y + distance * Math.sin(pitch),
      center.z + horizontal * Math.sin(yaw),
    )
    camera.lookAt(center)

    gl.render(scene, camera)
    return gl.domElement.toDataURL('image/png')
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[thumbnails] ${entry.id} failed to render — placeholder instead:`, error)
    }
    return null
  } finally {
    disposeModel(scene)
  }
}

/** Render a console's thumbnail once, cached by id. Never rejects. */
export function renderThumbnail(entry: ConsoleEntry): Promise<string | null> {
  const pending = cache.get(entry.id)
  if (pending) return pending
  // Serialised so N visible rows never fire N concurrent model downloads.
  const next = queue.then(() => renderConsole(entry))
  queue = next.catch(() => null)
  cache.set(entry.id, next)
  return next
}
