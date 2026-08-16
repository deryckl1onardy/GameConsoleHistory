import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * One-off measurement + visual-inspection harness — not part of the app.
 * Loads a GLB by URL param, reports its raw exported bounding box, and
 * renders it centred and auto-framed so orientation (which raw axis is
 * "up", which is the console's width vs depth) can actually be seen rather
 * than assumed — Sketchfab exports have no consistent convention here, and
 * guessing the axis mapping wrong silently produces a squashed/stretched
 * scale even when the arithmetic is right.
 *
 *   /measure.html?url=/models/consoles/n64.glb&yaw=30&pitch=20
 */

const params = new URLSearchParams(window.location.search)
const url = params.get('url')
const yawDeg = Number(params.get('yaw') ?? 35)
const pitchDeg = Number(params.get('pitch') ?? 25)
// Some bundled assets pack a detached controller/cartridge/cable into the
// same scene as the console. `hide` removes mesh(es) by their traversal
// index (0-based, matching perMesh[]'s order) from BOTH the render and the
// reported bbox, so the console-only footprint can be isolated by trial and
// error against the screenshot instead of guessed from names alone —
// generic exports name every mesh "defaultMaterial_N", carrying no part
// info at all.
const hideIndices = new Set((params.get('hide') ?? '').split(',').filter(Boolean).map(Number))
const out = document.getElementById('out')!

const renderWidth = 1200
const renderHeight = 900

if (!url) {
  out.textContent = 'missing ?url='
} else {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#e8e8ec')

  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(1, 1.5, 1)
  scene.add(key)
  const fill = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(fill)
  // Axis helper so up/width/depth are visually unambiguous: red=X, green=Y, blue=Z.
  // Sized once the model's own scale is known (see below) — a fixed size is
  // invisible against a huge model and dwarfs a tiny one.
  const axes = new THREE.AxesHelper(1)
  scene.add(axes)

  const camera = new THREE.PerspectiveCamera(40, renderWidth / renderHeight, 0.001, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(renderWidth, renderHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  document.body.appendChild(renderer.domElement)

  const loader = new GLTFLoader()
  loader.load(
    url,
    (gltf) => {
      const meshNames: string[] = []
      // Per-mesh bounding boxes (pre-centring, in the model's raw exported
      // space) — some of these bundled assets pack extra unrelated objects
      // (a detached controller + cable next to the console) into one scene,
      // and the whole-scene bbox includes them. This is what lets a bad
      // bbox be diagnosed and corrected to "console meshes only" without
      // re-rendering.
      const perMesh: { name: string; min: number[]; max: number[]; size: number[] }[] = []
      // THREE.Box3.setFromObject ignores `.visible` (it walks every
      // descendant's geometry regardless), so `hide` is applied by unioning
      // only the kept meshes' own boxes by hand, not by hiding + re-scanning
      // the scene.
      const box = new THREE.Box3()
      let index = 0
      gltf.scene.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          meshNames.push(o.name || '(unnamed)')
          const mb = new THREE.Box3().setFromObject(o)
          const ms = mb.getSize(new THREE.Vector3())
          perMesh.push({ name: o.name || '(unnamed)', min: mb.min.toArray(), max: mb.max.toArray(), size: ms.toArray() })
          if (hideIndices.has(index)) {
            o.visible = false
          } else {
            box.union(mb)
          }
          index += 1
        }
      })
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Centre the model at the origin so axis directions (not raw offsets)
      // are what the screenshot shows.
      gltf.scene.position.sub(center)
      scene.add(gltf.scene)

      const diagonal = size.length() || 1
      const distance = diagonal * 1.6
      // Raw exported scale varies wildly between these assets (unit-cube
      // normalized, centimetres, or something else entirely — see the
      // measurement notes), and a fixed 0.001-100 clip range only covers
      // meter-scale models. A model with size in the hundreds sat entirely
      // beyond a far=100 plane and rendered as a blank frame. Deriving
      // near/far from the model's own diagonal keeps it in view regardless
      // of what raw units it happens to be authored in.
      camera.near = Math.max(diagonal / 1000, 1e-6)
      camera.far = diagonal * 20
      camera.updateProjectionMatrix()
      axes.scale.setScalar(diagonal * 0.6)
      const yaw = THREE.MathUtils.degToRad(yawDeg)
      const pitch = THREE.MathUtils.degToRad(pitchDeg)
      const horizontal = distance * Math.cos(pitch)
      camera.position.set(horizontal * Math.cos(yaw), distance * Math.sin(pitch), horizontal * Math.sin(yaw))
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)

      const result = {
        url,
        min: box.min.toArray(),
        max: box.max.toArray(),
        size: size.toArray(),
        center: center.toArray(),
        meshCount: meshNames.length,
        meshNames: meshNames.slice(0, 40),
        perMesh,
      }
      out.textContent = JSON.stringify(result)
      ;(window as unknown as { __measureResult: unknown }).__measureResult = result
      ;(window as unknown as { __measureRenderer: THREE.WebGLRenderer }).__measureRenderer = renderer
    },
    undefined,
    (error) => {
      out.textContent = 'ERROR ' + String(error)
      ;(window as unknown as { __measureResult: unknown }).__measureResult = { url, error: String(error) }
    },
  )
}
