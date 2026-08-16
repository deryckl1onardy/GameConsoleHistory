import { useEffect, useLayoutEffect, useRef } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { MuseumLights } from './MuseumLights'
import { ShelfBay } from './ShelfBay'
import { MUSEUM_LAYOUT } from './layout'
import { SHELF_CONSTANTS } from './shelf-layout'
import { APPROACH_TIMING } from './approach'

/**
 * The Shelf of History: the collection as a wall of generation shelves in a
 * dark archive.
 *
 * Oldest at the top, reading downward through time. Everything about where
 * things sit comes from `shelf-layout.ts`, which derives it from each
 * console's real measured dimensions — so this component places nothing and
 * decides nothing, it only draws.
 */

/** Wall behind the shelving. Sized off the layout so it can never come up short. */
const WALL_PAD_X = 2.4
const WALL_PAD_Y = 1.6

/**
 * The back wall. Matte and very dark, but not black: it has to take the
 * key light so a lit bay reads as being IN a room rather than floating in
 * a void, while the unlit bays fall away into it.
 *
 * It is also the one thing that can HIDE the hero console during the
 * approach. At the handoff the hero teleports to the room position
 * (z ≈ -1.0), which is BEHIND this plane (z ≈ -0.26) — and the museum stays
 * mounted through the whole arrival so its lights can dim while the room's
 * ramp in. If the wall stayed opaque, the console would be invisible from
 * the handoff until the museum unmounts at idle: the "disappears, then
 * appears" the transition was supposed to have eliminated. So the wall
 * fades OUT over the arrival (in step with the museum going dark and the
 * room lighting up — the hero is progressively revealed as it is
 * progressively lit) and fades back in as the retreat remounts the hall.
 */
function MuseumWall({
  wallWidth,
  wallHeight,
  wallCenterY,
  wallZ,
}: {
  wallWidth: number
  wallHeight: number
  wallCenterY: number
  wallZ: number
}) {
  const approach = useScene((s) => s.approach)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  // Forward: fade the wall away over the arrival so the room-positioned hero
  // shows through it. Reverse: bring it back as the museum remounts — same
  // clock as the museum lights' own remount ramp (MuseumLights uses 0.45s).
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
    A remount after the retreat must come back FROM transparent: the wall
    was at opacity 0 when the museum unmounted at idle, so the first painted
    frame of the remount must not snap it to opaque. Read once at mount (the
    Diorama trick) — a fresh shelf load (?screen=shelf) has approach ===
    'idle' and wants the wall there, full opacity, immediately. LAYOUT effect
    so the zero lands before the first paint.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    const m = matRef.current
    if (!m || !cameFromApproach) return
    m.opacity = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <mesh position={[0, wallCenterY, wallZ]} receiveShadow>
      <planeGeometry args={[wallWidth, wallHeight]} />
      <meshStandardMaterial ref={matRef} color="#171310" roughness={0.95} metalness={0} transparent />
    </mesh>
  )
}

export function MuseumScene() {
  const { bays, extent } = MUSEUM_LAYOUT
  const hovered = useScene((s) => s.hoveredId !== null)
  useCursor(hovered)

  const wallWidth = (extent.maxX - extent.minX) + WALL_PAD_X * 2
  const wallHeight = (extent.maxY - extent.minY) + WALL_PAD_Y * 2
  const wallCenterY = (extent.maxY + extent.minY) / 2
  const wallZ = -Math.max(...bays.map((b) => b.boardDepth)) / 2 - 0.06

  return (
    <group>
      <MuseumLights />

      <MuseumWall
        wallWidth={wallWidth}
        wallHeight={wallHeight}
        wallCenterY={wallCenterY}
        wallZ={wallZ}
      />

      {/*
        Floor, well below the lowest board. Catches nothing but the falloff of
        the key light, which stops the bottom of the frame from being a hard
        black edge under the newest bay.
      */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SHELF_CONSTANTS.BOTTOM_BOARD_Y - 0.46, 0]}
        receiveShadow
      >
        <planeGeometry args={[wallWidth, 6]} />
        <meshStandardMaterial color="#14100e" roughness={0.98} metalness={0} />
      </mesh>

      {bays.map((bay) => (
        <ShelfBay key={bay.generation} bay={bay} />
      ))}
    </group>
  )
}
