import { useEffect, useLayoutEffect, useRef } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { MuseumLights } from './MuseumLights'
import { ShelfBay } from './ShelfBay'
import { MUSEUM_LAYOUT } from './layout'
import { APPROACH_TIMING } from './approach'

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

/** Gallery surfaces. A chosen warm-neutral plaster, never the UI-kit grey. */
const WALL_COLOR = '#eceae4'
const FLOOR_COLOR = '#dedbd4'
const CEILING_COLOR = '#f4f2ee'

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
    <mesh position={[0, centerY, z]} receiveShadow>
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

  return (
    <group>
      <MuseumLights />

      {/* Floor. The surface the whole hall reads its depth against. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, hall.floorY, shellCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[hall.width, shellLength]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.55} metalness={0} />
      </mesh>

      {/* Ceiling, which is what actually tells you this is an interior. */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, hall.height, shellCenterZ]}
      >
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.96} metalness={0} />
        <planeGeometry args={[hall.width, shellLength]} />
      </mesh>

      {/* Side walls. Rotated to face inward down the length of the hall. */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-halfWidth, hall.height / 2, shellCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[shellLength, hall.height]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.94} metalness={0} />
      </mesh>
      <mesh
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
          rotation={[Math.PI / 2, 0, 0]}
          position={[sideSign * hall.width * 0.24, hall.height - 0.02, shellCenterZ]}
        >
          <planeGeometry args={[0.26, shellLength - 1.2]} />
          <meshBasicMaterial color="#fffdf7" toneMapped={false} />
        </mesh>
      ))}

      {bays.map((bay) => (
        <ShelfBay key={bay.generation} bay={bay} />
      ))}
    </group>
  )
}
