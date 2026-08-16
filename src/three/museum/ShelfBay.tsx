import { Suspense, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useScene } from '@/store/scene'
import { ArtifactLabel } from './ArtifactLabel'
import { ArtifactSlot } from './ArtifactSlot'
import { SHELF_CONSTANTS, artifactAtX, type ShelfBay as Bay } from './shelf-layout'

/**
 * One generation's board and the artifacts on it.
 *
 * The board is only as long as its contents need (shelf-layout.ts), so a
 * generation with one built console reads as a plinth given to a significant
 * object rather than a mostly-empty rack. Five of eight bays are in that
 * position today.
 *
 * The board's own front edge is chamfered rather than square. A plain box
 * catches the key light as one flat band across the front; the chamfer splits
 * that into a bright lip and a darker face, which is what actually reads as a
 * machined shelf rather than a rectangle.
 */

const { BOARD_THICKNESS } = SHELF_CONSTANTS
/** How far the lip stands proud of the board face. */
const LIP = 0.012
/** Width of the current-console marker inlaid in the lip — see CurrentMarker. */
const MARKER_WIDTH = 0.044

/**
 * The hit surface for hover, as a sibling of the models rather than an
 * ancestor. R3F only raycasts objects that carry handlers and their
 * descendants — putting the handler on one plane per bay means the museum
 * raycasts 2 triangles per bay under the pointer, not 180k triangles of
 * console geometry, and console meshes never need their own listeners.
 *
 * VERTICAL, facing the camera — not lying flat on the board. A flat plane at
 * the board's own height is a hair-thin Z-band in world space, and at this
 * museum's fairly shallow camera angle (bayShot's direction is mostly +Z with
 * only a mild vertical component) a ray can cross straight through a
 * console's visible silhouette without ever crossing that exact Y at all,
 * missing the plane while looking, on screen, like it is dead centre on the
 * console. Verified by hand: casting a real ray at a console's on-screen
 * centre landed at board height 0.07-0.1m outside the flat plane's Z extent.
 * A plane standing in the XY frame (its default orientation — no rotation
 * needed) and spanning the artifact's real screen-space height/width catches
 * the ray anywhere across the visible object instead of one exact slice
 * through it.
 *
 * Invisible via a fully transparent material rather than `visible={false}` —
 * three.js's own Raycaster does not check `Object3D.visible`, so either would
 * work, but an explicit zero-opacity material states the intent (a real,
 * present hit surface) rather than relying on an implementation detail of
 * how invisible objects happen to still raycast.
 */
function BayHitPlane({ bay }: { bay: Bay }) {
  const setHovered = useScene((s) => s.setHovered)
  const selectArtifact = useScene((s) => s.selectArtifact)
  // Avoids dispatching a store update on every pixel of pointer movement —
  // only the artifact actually under the cursor changing triggers a commit.
  const lastId = useRef<string | null>(null)

  const resolve = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const id = artifactAtX(bay, e.point.x)?.id ?? null
    if (id === lastId.current) return
    lastId.current = id
    setHovered(id)
  }

  const clear = () => {
    if (lastId.current === null) return
    lastId.current = null
    setHovered(null)
  }

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Mid-transition clicks are ignored rather than queued: selectArtifact
    // sets `approach` unconditionally, and firing it while a flight is
    // already under way would strand CameraRig's choreography between two
    // destinations. `useScene.getState()` here (not the reactive `approach`
    // prop this component doesn't even hold) so the check is against the
    // truth at click time, not whatever the last render happened to close
    // over.
    if (useScene.getState().approach !== 'idle') return
    const id = artifactAtX(bay, e.point.x)?.id
    if (id) selectArtifact(id)
  }

  const height = bay.tallest + SHELF_CONSTANTS.HEADROOM

  return (
    <mesh
      // Front-of-board, roughly mid-console height — where the eye and the
      // pointer both actually land on a shelved object.
      position={[0, bay.boardY + height / 2 - SHELF_CONSTANTS.BOARD_THICKNESS / 2, bay.boardDepth / 2]}
      onPointerMove={resolve}
      onPointerLeave={clear}
      onClick={click}
    >
      <planeGeometry args={[bay.boardLength, height]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

/**
 * The "you are here" marker — grand plan §13.
 *
 * The active console is not missing from its slot (HeroConsole draws it in
 * exactly the same place), so the shelf needs something else to say which
 * artifact you are currently looking at, and which one you just came back
 * from after a retreat.
 *
 * A museum marks its current exhibit with an engraved plate set into the
 * shelf, so that is what this is: a slim brass inlay in the board's own front
 * lip, directly under the artifact. Deliberately NOT a glow, a ring, a pulse
 * or a floating pip — it is a physical object lit by the room's own key light,
 * which means it dims and brightens with the hall through the whole approach
 * choreography for free, with no opacity handling of its own.
 *
 * Sized off the lip rather than a fixed number so it stays proportional to the
 * shelf, and set a hair proud of the lip's own face so the two never z-fight.
 */
function CurrentMarker({ bay, x }: { bay: Bay; x: number }) {
  const halfDepth = bay.boardDepth / 2
  return (
    <mesh
      position={[
        x,
        bay.boardY - BOARD_THICKNESS - LIP / 2,
        halfDepth - LIP / 2 + LIP * 0.14,
      ]}
    >
      <boxGeometry args={[MARKER_WIDTH, LIP * 1.15, LIP]} />
      {/* Aged brass: warm, slightly metallic, low roughness so the key light
          picks out a highlight along it without it ever reading as emissive. */}
      <meshStandardMaterial color="#b08a4a" roughness={0.34} metalness={0.62} />
    </mesh>
  )
}

export function ShelfBay({ bay }: { bay: Bay }) {
  const halfDepth = bay.boardDepth / 2
  // The active console is drawn by HeroConsole, not here — see its own file
  // header for why exactly one component may ever render a given console's
  // GLB. Its LABEL still renders normally below; only the model is skipped,
  // so the slot reads identically whether the model happens to be drawn by
  // this bay or by the hero sitting in the same spot.
  const consoleId = useScene((s) => s.consoleId)
  // Undefined on every bay except the one holding the active console.
  const current = bay.artifacts.find((a) => a.id === consoleId)

  return (
    <group>
      {/* Board. Its TOP surface is boardY — artifacts rest exactly on it. */}
      <mesh position={[0, bay.boardY - BOARD_THICKNESS / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[bay.boardLength, BOARD_THICKNESS, bay.boardDepth]} />
        <meshStandardMaterial color="#332a22" roughness={0.78} metalness={0.04} />
      </mesh>

      {/* Front lip: a thin brighter edge that catches the key light. */}
      <mesh position={[0, bay.boardY - BOARD_THICKNESS - LIP / 2, halfDepth - LIP / 2]}>
        <boxGeometry args={[bay.boardLength, LIP, LIP]} />
        <meshStandardMaterial color="#5c4c3d" roughness={0.5} metalness={0.14} />
      </mesh>

      <BayHitPlane bay={bay} />

      {/*
        Per-artifact Suspense. ConsoleModel already wraps its own loader
        (GltfModel.tsx), so a console can never reach this boundary — it exists
        so any future non-GLB suspender can only ever blank one bay, never the
        whole museum.
      */}
      {bay.artifacts
        .filter((a) => a.id !== consoleId)
        .map((a) => (
          <Suspense key={a.id} fallback={null}>
            <ArtifactSlot artifact={a} />
          </Suspense>
        ))}

      {bay.artifacts.map((a) => (
        <ArtifactLabel key={a.id} artifact={a} bay={bay} />
      ))}

      {/* Only the bay actually holding the active console draws one. */}
      {current ? <CurrentMarker bay={bay} x={current.position[0]} /> : null}
    </group>
  )
}
