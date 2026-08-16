import { Suspense, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useScene } from '@/store/scene'
import { ArtifactLabel } from './ArtifactLabel'
import { ArtifactSlot } from './ArtifactSlot'
import { SHELF_CONSTANTS, artifactAtX, type ShelfBay as Bay } from './shelf-layout'

/**
 * One generation's station: a plinth standing on the hall floor, carrying that
 * generation's consoles.
 *
 * The plinth is only as long as its contents need (shelf-layout.ts), so a
 * generation with one console reads as a pedestal given to a significant
 * object rather than a mostly-empty rack.
 *
 * Its silhouette is the point. A plain box would be a box; this has a
 * chamfered top edge that catches the ceiling light as a bright lip, a body
 * that tapers very slightly toward the floor, and a recessed shadow gap at the
 * base so it reads as *standing on* the floor rather than pasted onto it.
 * Those three cuts are what make it read as a made object.
 */

const { PLINTH_TOP } = SHELF_CONSTANTS
/** Height of the chamfered lip around the plinth's top edge. */
const CHAMFER = 0.02
/** How far the body is inset under the top, per side — the taper. */
const TAPER = 0.03
/** Height of the recessed reveal at the floor. */
const REVEAL = 0.035
/** How far the reveal is inset, per side. */
const REVEAL_INSET = 0.045
/** Width of the current-console marker inlaid in the top lip — see CurrentMarker. */
const MARKER_WIDTH = 0.044

/** Gallery plinth white — a chosen warm-neutral plaster, not a UI-kit grey. */
const PLINTH_TOP_COLOR = '#f2efe9'
const PLINTH_BODY_COLOR = '#e8e4dc'
const PLINTH_REVEAL_COLOR = '#b9b3a8'

/**
 * The hit surface for hover, as a sibling of the models rather than an
 * ancestor. R3F only raycasts objects that carry handlers and their
 * descendants — putting the handler on one plane per station means the museum
 * raycasts 2 triangles per station under the pointer, not 180k triangles of
 * console geometry, and console meshes never need their own listeners.
 *
 * VERTICAL, facing the camera — not lying flat on the plinth. A flat plane at
 * the plinth's own height is a hair-thin Z-band in world space, and at this
 * museum's fairly shallow camera angle a ray can cross straight through a
 * console's visible silhouette without ever crossing that exact Y at all,
 * missing the plane while looking, on screen, like it is dead centre on the
 * console. A plane standing in the XY frame spanning the artifact's real
 * screen-space height/width catches the ray anywhere across the visible object
 * instead of one exact slice through it.
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

  const height = bay.tallest + 0.22

  return (
    <mesh
      // Front of the plinth, roughly mid-console height — where the eye and
      // the pointer both actually land on a displayed object.
      position={[
        bay.boardCenter[0],
        bay.boardY + height / 2,
        bay.boardCenter[2] + bay.boardDepth / 2,
      ]}
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
 * exactly the same place), so the hall needs something else to say which
 * artifact you are currently looking at, and which one you just came back
 * from after a retreat.
 *
 * A museum marks its current exhibit with an engraved plate set into the
 * plinth, so that is what this is: a slim brass inlay in the plinth's own top
 * lip, directly in front of the artifact. Deliberately NOT a glow, a ring, a
 * pulse or a floating pip — it is a physical object lit by the hall's own
 * light, which means it dims and brightens with the room through the whole
 * approach choreography for free, with no opacity handling of its own.
 *
 * Brass against a white plinth rather than against dark wood now, so it reads
 * as an inlaid plate rather than a bright mark — the one warm metal note in
 * an otherwise cool, bright hall.
 */
function CurrentMarker({ bay, x }: { bay: Bay; x: number }) {
  return (
    <mesh
      position={[
        x,
        bay.boardY + 0.0012,
        bay.boardCenter[2] + bay.boardDepth / 2 - CHAMFER * 1.6,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[MARKER_WIDTH, CHAMFER * 0.9]} />
      <meshStandardMaterial color="#b08a4a" roughness={0.34} metalness={0.62} />
    </mesh>
  )
}

export function ShelfBay({ bay }: { bay: Bay }) {
  // The active console is drawn by HeroConsole, not here — see its own file
  // header for why exactly one component may ever render a given console's
  // GLB. Its LABEL still renders normally below; only the model is skipped,
  // so the slot reads identically whether the model happens to be drawn by
  // this station or by the hero sitting in the same spot.
  const consoleId = useScene((s) => s.consoleId)
  // Undefined on every station except the one holding the active console.
  const current = bay.artifacts.find((a) => a.id === consoleId)

  const [cx, , cz] = bay.boardCenter
  const bodyHeight = PLINTH_TOP - CHAMFER - REVEAL

  return (
    <group>
      {/*
        Top slab. Its TOP surface is boardY — artifacts rest exactly on it —
        and its chamfered edge is what catches the ceiling light as a bright
        lip, the detail that separates a plinth from a crate.
      */}
      <mesh position={[cx, bay.boardY - CHAMFER / 2, cz]} receiveShadow castShadow>
        <boxGeometry args={[bay.boardLength, CHAMFER, bay.boardDepth]} />
        <meshStandardMaterial color={PLINTH_TOP_COLOR} roughness={0.62} metalness={0} />
      </mesh>

      {/* Body, inset under the top so the slab reads as overhanging it. */}
      <mesh
        position={[cx, REVEAL + bodyHeight / 2, cz]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[bay.boardLength - TAPER * 2, bodyHeight, bay.boardDepth - TAPER * 2]}
        />
        <meshStandardMaterial color={PLINTH_BODY_COLOR} roughness={0.7} metalness={0} />
      </mesh>

      {/*
        The reveal: a darker, further-inset block at the floor. Reads as a
        shadow gap, which is what makes the plinth sit ON the floor instead of
        being pasted to it — the same trick a skirting detail plays.
      */}
      <mesh position={[cx, REVEAL / 2, cz]} receiveShadow>
        <boxGeometry
          args={[
            bay.boardLength - REVEAL_INSET * 2,
            REVEAL,
            bay.boardDepth - REVEAL_INSET * 2,
          ]}
        />
        <meshStandardMaterial color={PLINTH_REVEAL_COLOR} roughness={0.9} metalness={0} />
      </mesh>

      <BayHitPlane bay={bay} />

      {/*
        Per-artifact Suspense. ConsoleModel already wraps its own loader
        (GltfModel.tsx), so a console can never reach this boundary — it exists
        so any future non-GLB suspender can only ever blank one station, never
        the whole museum.
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

      {/* Only the station actually holding the active console draws one. */}
      {current ? <CurrentMarker bay={bay} x={current.position[0]} /> : null}
    </group>
  )
}
