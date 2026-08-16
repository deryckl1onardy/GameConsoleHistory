import * as THREE from 'three'
import { createSuperNintendoEntertainmentSystemConsoleModel } from './three/models/generated/createSnesConsoleModel'

/**
 * img2threejs capture harness — plain three.js, no React/R3F, no diorama.
 *
 * The gates in `forge/stage4_review/` (diagnose_render.py, divine_eye.py,
 * make_comparison_sheet.py, turntable_gate.py) score a render against the
 * reference PHOTO — flat neutral background, no room, no warm lighting. The
 * existing diorama scene (Scene.tsx) is unusable as evidence for that: it has
 * a TV stand behind the console, warm room lighting, and no clean silhouette.
 * This page exists purely to produce gate-able screenshots.
 *
 * URL params (all optional):
 *   yaw=35        camera azimuth in degrees, orbiting the model's own centroid.
 *                 yaw=0 looks at the front face (local -X). Positive yaw sweeps
 *                 toward +Z (the right side, in the model's own width axis).
 *   pitch=28      camera elevation in degrees above the horizon.
 *   distance=0.55 camera distance from the model's centroid, in metres.
 *   fov=35        vertical field of view in degrees.
 *   clay=1        map-stripped mode: flat unlit grey material, no shadows —
 *                 required by diagnose_render.py's --map-stripped-render for
 *                 the blockout pass.
 *   bg=f5f5f5     background hex (no '#'), default near-white to match the
 *                 primary reference photo's own backdrop.
 *
 * The four camera values above are seeded from solve_camera_pose.py's output
 * against `.img2threejs/refs/snes-quarter.png` (see object-sculpt-spec.json's
 * referenceCamera — solved:false, confidence 0.35, all fields agentFill).
 * That tool is explicit that its output is a *starting point*, not a solved
 * pose: "adjust by eye against the reference image" until silhouette and
 * landmark alignment match. That visual confirmation is the point of this
 * harness — nudge yaw/pitch/distance via the URL until the render's outline
 * overlays the photo, then treat those numbers as the confirmed camera.
 */

const params = new URLSearchParams(window.location.search)
const yawDeg = Number(params.get('yaw') ?? 35)
const pitchDeg = Number(params.get('pitch') ?? 28)
const distance = Number(params.get('distance') ?? 0.55)
const fovDeg = Number(params.get('fov') ?? 35)
// Camera roll, applied around the view axis after lookAt. A diff of the two
// silhouette masks (ref vs. render, both otherwise matched on scale/position)
// showed two parallelogram-ish shapes rotated relative to each other, not
// just offset — the reference photo was shot with the camera tilted, not
// level, which yaw/pitch/distance alone cannot reproduce.
const rollDeg = Number(params.get('roll') ?? 0)
const clay = params.get('clay') === '1'
const bg = `#${params.get('bg') ?? 'f5f5f5'}`
// Default to the primary reference's own resolution (1600x900, 16:9).
// diagnose_render.py's silhouette IoU/aspect/scale gate is NOT crop- or
// scale-invariant: it resamples both images onto the same fixed grid and
// compares bounding boxes directly, so a render at the wrong aspect ratio
// fails even when the actual 3D silhouette is correct — this cost a whole
// gate run (IoU 0.44) before the mismatch (canvas ~1.51:1 vs the reference's
// 1.78:1) was found. Pinning the buffer size, independent of the visible
// browser viewport, is what makes captures gate-comparable.
const renderWidth = Number(params.get('w') ?? 1600)
const renderHeight = Number(params.get('h') ?? 900)
// Pixel shift of the visible frame, via THREE.Camera.setViewOffset — a
// sensor-shift/tilt-shift-style pan that reframes the composition without
// moving the camera or changing its orbit angle. Orbit params (yaw/pitch/
// distance/fov) get the render's aspect ratio and scale close to the
// reference; this closes the remaining position offset between the two
// masks' bounding boxes (diagnose_render.py's silhouette IoU compares masks
// at fixed grid positions, so a correctly-shaped but off-center silhouette
// still scores low). Positive offsetX pans the frame right (the subject
// appears to shift left); positive offsetY pans down (subject shifts up).
const offsetX = Number(params.get('ox') ?? 0)
const offsetY = Number(params.get('oy') ?? 0)

const container = document.getElementById('app')!

const scene = new THREE.Scene()
scene.background = new THREE.Color(bg)

const camera = new THREE.PerspectiveCamera(fovDeg, renderWidth / renderHeight, 0.01, 10)

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
// `false` (updateStyle) keeps the CSS/display size independent of the drawing
// buffer, so the capture is always exactly renderWidth x renderHeight
// regardless of the actual browser viewport this harness is opened in.
renderer.setSize(renderWidth, renderHeight, false)
renderer.setPixelRatio(1)
renderer.shadowMap.enabled = !clay
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = clay ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
container.appendChild(renderer.domElement)

// --- model -------------------------------------------------------------
const model = createSuperNintendoEntertainmentSystemConsoleModel({
  castShadow: !clay,
  receiveShadow: !clay,
})

if (clay) {
  // Map-stripped: flat, unlit, uniform grey — proves the silhouette and form
  // read correctly independent of material/texture, per the blockout pass's
  // --map-stripped-render requirement.
  const clayMaterial = new THREE.MeshBasicMaterial({ color: 0xb0b0b0 })
  model.traverse((obj) => {
    if (obj instanceof THREE.Mesh) obj.material = clayMaterial
  })
}

scene.add(model)

// --- lighting (normal mode only; clay mode is fully unlit) -------------
// Matches object-sculpt-spec.json's lightingFromPhoto entries: a large soft
// key from upper-left-front, broad ambient fill, soft contact shadow.
if (!clay) {
  const key = new THREE.DirectionalLight(0xfff4e6, 2.2)
  key.position.set(-0.4, 0.6, 0.5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 0.05
  key.shadow.camera.far = 3
  key.shadow.radius = 4
  scene.add(key)

  const fill = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(fill)

  const groundGeo = new THREE.PlaneGeometry(4, 4)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.18 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = 0
  ground.receiveShadow = true
  scene.add(ground)
}

// --- camera: orbit the model's own bounding-box centroid ---------------
// See the module doc comment for the yaw/pitch convention. Computed from the
// real geometry rather than a hardcoded center, so this harness keeps working
// once meso/micro components (blocks, keys, ports) are added in a later pass.
const box = new THREE.Box3().setFromObject(model)
const target = box.getCenter(new THREE.Vector3())

function updateCamera() {
  const yaw = THREE.MathUtils.degToRad(yawDeg)
  const pitch = THREE.MathUtils.degToRad(pitchDeg)
  const horizontal = distance * Math.cos(pitch)
  camera.position.set(
    target.x - horizontal * Math.cos(yaw),
    target.y + distance * Math.sin(pitch),
    target.z + horizontal * Math.sin(yaw),
  )
  camera.lookAt(target)
  camera.rotateZ(THREE.MathUtils.degToRad(rollDeg))
  if (offsetX !== 0 || offsetY !== 0) {
    camera.setViewOffset(renderWidth, renderHeight, offsetX, offsetY, renderWidth, renderHeight)
  } else {
    camera.clearViewOffset()
  }
}
updateCamera()

// No window-resize handling: the drawing buffer is pinned to renderWidth x
// renderHeight for gate-comparable captures (see the const declarations
// above) and must not drift with the browser viewport.

function renderFrame() {
  renderer.render(scene, camera)
}
renderFrame()

// Reference-PBR albedo/roughness/normal/ao maps load asynchronously
// (THREE.TextureLoader), so the very first frame above renders before they
// arrive — every material reads as flat black until a second render fires.
// A capture tool taking a screenshot immediately after load would otherwise
// get that black frame nondeterministically. Render again once every texture
// this model uses has finished loading (or errored, so a broken URL doesn't
// hang the harness), and expose a promise so an external capture step can
// await real readiness instead of guessing a delay.
const loadingManager = THREE.DefaultLoadingManager
const texturesSettled = new Promise<void>((resolve) => {
  const prevOnLoad = loadingManager.onLoad
  loadingManager.onLoad = () => {
    prevOnLoad?.()
    renderFrame()
    resolve()
  }
})
window.__img2threejsReady = texturesSettled.then(() => {
  renderFrame()
})

// --- evidence surface ----------------------------------------------------
// Exposed for the browser tool to dump a parts manifest (check_part_coverage.py)
// and to confirm what actually loaded, without needing React devtools.
declare global {
  interface Window {
    /** Resolves once every texture (referencePbr maps, if any) has loaded and a fresh frame has been rendered. */
    __img2threejsReady: Promise<void>
    __img2threejs: {
      scene: THREE.Scene
      camera: THREE.PerspectiveCamera
      renderer: THREE.WebGLRenderer
      model: THREE.Group
      target: THREE.Vector3
      params: { yawDeg: number; pitchDeg: number; distance: number; fovDeg: number; clay: boolean }
      render: () => void
      dumpParts: () => { model: string; parts: { name: string }[]; unnamedMeshes: number }
    }
  }
}

window.__img2threejs = {
  scene,
  camera,
  renderer,
  model,
  target,
  params: { yawDeg, pitchDeg, distance, fovDeg, clay },
  render: renderFrame,
  dumpParts: () => {
    const parts: { name: string }[] = []
    let unnamedMeshes = 0
    model.traverse((obj) => {
      if (obj.userData?.sculptComponent) {
        parts.push({ name: obj.name })
      } else if (obj instanceof THREE.Mesh && !obj.name) {
        unnamedMeshes += 1
      }
    })
    return { model: 'createSuperNintendoEntertainmentSystemConsoleModel', parts, unnamedMeshes }
  },
}
