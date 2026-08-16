import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Group } from 'three'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { MuseumLights } from './MuseumLights'
import { ShelfBay } from './ShelfBay'
import { MUSEUM_LAYOUT } from './layout'
import { STAGE_ANCHOR, getHallOffset } from './hall-glide'
import { SHELF_CONSTANTS } from './shelf-layout'
import { APPROACH_TIMING } from './approach'
import { MUSEUM_SHELL_LAYER } from './layers'

/**
 * The Shelf of History: the collection as a gallery hall you walk down.
 *
 * Oldest station nearest the entrance, receding into the hall through time.
 * Everything about where things sit comes from `shelf-layout.ts`, which
 * derives it from each console's real measured dimensions — so this component
 * places nothing and decides nothing, it only draws.
 *
 * What it draws that it did not before is a ROOM. The previous version was one
 * dark plane behind the shelves and one below them, which gave the collection
 * nothing to sit in: no floor receding, no walls, no ceiling, no far end. That
 * absence is most of why the screen never felt like a museum, however the
 * shelves themselves were lit.
 */

/*
  Gallery surfaces — and the values are doing structural work, not decoration.

  Two failure modes were live in the first pass. The whole hall was pitched
  warm, which walked it straight into cream-and-bone territory: the reflexive
  "tasteful premium" background that reads as a default rather than a choice.
  And floor, walls and plinths sat within a few percent of each other, so the
  room had no tonal structure at all — every plane the same value is a fog,
  however carefully it is lit.

  So: a properly NEUTRAL gallery (this is a modern white room, not a warm
  archive — the warmth is the era room's job, and the contrast between them is
  the point of the transition), with three separated values. Floor darkest, a
  real pale polished concrete; walls near-white plaster; plinths brighter than
  the walls, because they are lit from directly above and should read as the
  brightest thing in the room apart from the light slots themselves. That
  ordering is what gives the hall a floor to stand on and a depth to read.

  Deliberately not the cool blue-grey UI-kit neutral either (the #f3f4f6
  family): these are neutral-to-faintly-green, the cast real plaster and
  concrete actually have.
*/
const WALL_COLOR = '#eeeeea'
const FLOOR_COLOR = '#c3c4c0'
const CEILING_COLOR = '#f7f7f4'

/** Ref callback that moves a mesh onto the shell-only layer, once, on mount.
 *  See layers.ts for why the shell needs its own layer at all. */
function onShellMesh(o: THREE.Object3D | null) {
  o?.layers.set(MUSEUM_SHELL_LAYER)
}

/**
 * The far wall closing the hall.
 *
 * It is also the one thing that can HIDE the hero console during the approach.
 * At the handoff the hero teleports to the room position, which may sit beyond
 * this plane — and the museum stays mounted through the whole arrival so its
 * lights can dim while the room's ramp in. If the wall stayed opaque, the
 * console could be invisible from the handoff until the museum unmounts at
 * idle: the "disappears, then appears" the transition was built to eliminate.
 * So the wall fades OUT over the arrival (in step with the hall going dark and
 * the room lighting up — the hero is progressively revealed as it is
 * progressively lit) and fades back in as the retreat remounts the hall.
 */
function FarWall({
  width,
  height,
  centerY,
  z,
}: {
  width: number
  height: number
  centerY: number
  z: number
}) {
  const approach = useScene((s) => s.approach)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useEffect(() => {
    const m = matRef.current
    if (!m) return
    if (approach === 'arriving') {
      const duration = reducedMotion ? 0 : APPROACH_TIMING.ARRIVE_MS / 1000
      gsap.to(m, { opacity: 0, duration, ease: 'power2.inOut' })
    } else if (approach === 'retreating') {
      const duration = reducedMotion ? 0 : 0.45
      gsap.to(m, { opacity: 1, duration, ease: 'power2.out' })
    }
  }, [approach, reducedMotion])

  /*
    A remount after the retreat must come back FROM transparent: the wall was
    at opacity 0 when the museum unmounted at idle, so the first painted frame
    of the remount must not snap it to opaque. Read once at mount (the Diorama
    trick) — a fresh shelf load has approach === 'idle' and wants the wall
    there, full opacity, immediately. LAYOUT effect so the zero lands before
    the first paint.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    const m = matRef.current
    if (!m || !cameFromApproach) return
    m.opacity = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <mesh ref={onShellMesh} position={[0, centerY, z]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        ref={matRef}
        color={WALL_COLOR}
        roughness={0.94}
        metalness={0}
        transparent
      />
    </mesh>
  )
}

/**
 * The inlaid line and its ticks — a shade off the floor, never a drawn stroke.
 *
 * Close to the concrete on purpose. A strong value against the floor reads as
 * a stripe PAINTED on it; an inlay is a change of material, which is a small
 * shift in tone and a larger one in how it takes the light — hence low
 * contrast but a little metalness.
 */
const INLAY_COLOR = '#b3b4b0'

/**
 * The year-line: a metal strip inlaid into the gallery floor, threading the
 * stations.
 *
 * This is the hall's signature, and the reason it is a *timeline* rather than
 * a corridor. Walking the hall is already moving through history; the line
 * makes that legible instead of implied — it physically connects each
 * generation to the run of years, and it gives the large empty floor a job.
 *
 * The stations now recede along a SHALLOW DIAGONAL (see shelf-layout.ts), so
 * the line is that diagonal: one continuous strip running from the first
 * station's centre to the last's, with a small perpendicular tick at each
 * station marking its place on the run. The old design — a straight centre
 * line with ticks reaching out to the plinths — broke under the diagonal:
 * a plinth sitting almost ON the line made the reach negative, clamping every
 * tick to the same stub. The line through the stations cannot break, because
 * it is defined BY the stations.
 *
 * It is architecture, not ornament: a real inlay set into a real floor, a
 * shade darker than the concrete so it reads as a change of material and not
 * as a line drawn on top. It runs UNDER the plinths — an inlay is cut into
 * the floor, and the plinths stand on it.
 */
function YearLine({ bays }: { bays: typeof MUSEUM_LAYOUT.bays }) {
  const first = bays[0].boardCenter
  const last = bays[bays.length - 1].boardCenter
  const dx = last[0] - first[0]
  const dz = last[2] - first[2]
  const length = Math.hypot(dx, dz)
  // Rotation around Y that swings a Z-aligned plane onto the diagonal.
  const angle = Math.atan2(dx, dz)

  return (
    <group>
      {/* The line itself: the diagonal the stations sit on. */}
      <mesh
        rotation={[-Math.PI / 2, angle, 0]}
        position={[(first[0] + last[0]) / 2, 0.001, (first[2] + last[2]) / 2]}
      >
        <planeGeometry args={[0.042, length]} />
        <meshStandardMaterial color={INLAY_COLOR} roughness={0.42} metalness={0.3} />
      </mesh>

      {/* A perpendicular tick where each station sits on the line. */}
      {bays.map((bay) => (
        <mesh
          key={bay.generation}
          rotation={[-Math.PI / 2, angle + Math.PI / 2, 0]}
          position={[bay.boardCenter[0], 0.001, bay.boardCenter[2]]}
        >
          <planeGeometry args={[0.02, 0.16]} />
          <meshStandardMaterial color={INLAY_COLOR} roughness={0.42} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The stage: a permanent pedestal at STAGE_ANCHOR, world-fixed (OUTSIDE the
 * glided hall group), where every focused console presents itself.
 *
 * The hall glides a focused console to the stage on its own plinth, and the
 * presenting step (Phase 6) carries it forward off that plinth onto this
 * pedestal — so the pedestal is the destination surface the step needs
 * under it, built in the hall's own plinth language (chamfered lip, tapered
 * body, floor reveal) so it reads as furniture of the same room.
 */
function StagePedestal() {
  const { PLINTH_TOP } = SHELF_CONSTANTS
  const [x, , z] = STAGE_ANCHOR
  const length = 1.9
  const depth = 1.3
  const chamfer = 0.02
  const bodyHeight = PLINTH_TOP - chamfer

  return (
    <group>
      <mesh position={[x, PLINTH_TOP - chamfer / 2, z]} receiveShadow castShadow>
        <boxGeometry args={[length, chamfer, depth]} />
        <meshStandardMaterial color="#fbfbf9" roughness={0.62} metalness={0} />
      </mesh>
      <mesh position={[x, bodyHeight / 2, z]} receiveShadow castShadow>
        <boxGeometry args={[length - 0.06, bodyHeight, depth - 0.06]} />
        <meshStandardMaterial color="#f1f1ee" roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[x, 0.0175, z]} receiveShadow>
        <boxGeometry args={[length - 0.09, 0.035, depth - 0.09]} />
        <meshStandardMaterial color="#a3a4a0" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}

/**
 * The hall group CameraRig glides — the whole museum as one movable object.
 * The camera is bolted down while browsing, so the collection presents
 * itself by sliding this group in 2-D until the focused console stands on
 * the stage (see hall-glide.ts). Module ref, in the same spirit as
 * `heroGroupRef`: the tween is imperative, and both the hero (via
 * shelfWorldPose) and the hit-testing (ShelfBay's world→local X) need the
 * CURRENT offset between renders.
 */
export const hallGroupRef: { current: Group | null } = { current: null }

export function MuseumScene() {
  const { bays, hall } = MUSEUM_LAYOUT
  const hovered = useScene((s) => s.hoveredId !== null)
  useCursor(hovered)

  const hallLength = Math.abs(hall.farZ - hall.entranceZ)
  // Run the shell a little past the entrance too, so the camera can stand at
  // z = 0 and still be inside a room rather than at its edge.
  const shellLength = hallLength + 8
  const shellCenterZ = hall.entranceZ + 4 - shellLength / 2
  const halfWidth = hall.width / 2

  /*
    The hall REMOUNTS fresh at 'retreating' (see useSceneMounts), and a first
    frame at offset zero would paint the hall un-glided while the hero — which
    lives outside the group — is already standing at the glided spot. Restore
    the group's position from the module's live offset the moment it mounts,
    so the very first painted frame is the right one.
  */
  useLayoutEffect(() => {
    const g = hallGroupRef.current
    if (!g) return
    const offset = getHallOffset()
    g.position.set(offset[0], offset[1], offset[2])
  }, [])

  return (
    <>
      {/*
        The lights and the stage pedestal live OUTSIDE the glided group on
        purpose: the stage is the one world-fixed point the hall brings
        consoles TO, so the rig that lights it and the pedestal that receives
        it must not slide away when the hall moves (see MuseumLights).
      */}
      <MuseumLights />
      <StagePedestal />

      <group ref={hallGroupRef}>
      {/* Floor. The surface the whole hall reads its depth against. */}
      <mesh
        ref={onShellMesh}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, hall.floorY, shellCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[hall.width, shellLength]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.55} metalness={0} />
      </mesh>

      {/* Ceiling, which is what actually tells you this is an interior. */}
      <mesh
        ref={onShellMesh}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, hall.height, shellCenterZ]}
      >
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.96} metalness={0} />
        <planeGeometry args={[hall.width, shellLength]} />
      </mesh>

      {/* Side walls. Rotated to face inward down the length of the hall. */}
      <mesh
        ref={onShellMesh}
        rotation={[0, Math.PI / 2, 0]}
        position={[-halfWidth, hall.height / 2, shellCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[shellLength, hall.height]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.94} metalness={0} />
      </mesh>
      <mesh
        ref={onShellMesh}
        rotation={[0, -Math.PI / 2, 0]}
        position={[halfWidth, hall.height / 2, shellCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[shellLength, hall.height]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.94} metalness={0} />
      </mesh>

      <FarWall
        width={hall.width}
        height={hall.height}
        centerY={hall.height / 2}
        z={hall.farZ}
      />

      {/*
        Ceiling light slots — two continuous recessed strips running the length
        of the hall. These are the single strongest "modern gallery" cue there
        is, and they do real work beyond looking right: they give the ceiling a
        direction, they put a highlight along every plinth's chamfered lip, and
        they converge toward the vanishing point, which is what makes the hall
        read as long. Unlit and emissive rather than actual lights — eight
        real area lights would cost far more than they show.
      */}
      {[-1, 1].map((sideSign) => (
        <mesh
          key={sideSign}
          ref={onShellMesh}
          rotation={[Math.PI / 2, 0, 0]}
          position={[sideSign * hall.width * 0.24, hall.height - 0.02, shellCenterZ]}
        >
          <planeGeometry args={[0.26, shellLength - 1.2]} />
          <meshBasicMaterial color="#fffdf7" toneMapped={false} />
        </mesh>
      ))}

      <YearLine bays={bays} />

      {bays.map((bay) => (
        <ShelfBay key={bay.generation} bay={bay} />
      ))}
      </group>
    </>
  )
}
