import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { APPROACH_TIMING } from './museum/approach'

/**
 * A soft fake contact shadow under the console.
 *
 * The room has no floor (Diorama is lights only), so the console would float
 * with nothing grounding it. A real shadow catcher would need a surface and
 * a shadow pass sized per console; the classic fake is cheaper and reads
 * identically: a flat disc with a radial falloff, sitting just below the
 * console's base. The dark core hides inside the footprint, the soft edge
 * peeks out around it, and the whole thing rotates with the console's yaw
 * (a disc is rotation-invariant, so the room pose never fights it).
 *
 * The texture is drawn once on a canvas — no asset file, no fetch, and the
 * falloff curve lives in one gradient so it can be tuned in one place.
 */

/** How dark the shadow's core is (multiplies the gradient's own alpha). */
const CORE_OPACITY = 0.7

/** Ramp in/out on the same clocks as the room lights (Diorama.tsx). */
const IN_MS = APPROACH_TIMING.ARRIVE_MS
const OUT_MS = APPROACH_TIMING.RETREAT_FADE_MS

export function ContactShadow({
  position,
  radius,
}: {
  /** The console's base position — the shadow sits just beneath it. */
  position: [number, number, number]
  /** Shadow radius, sized off the console's footprint. */
  radius: number
}) {
  const approach = useScene((s) => s.approach)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  const texture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Black at the very centre, falling to transparent at the rim. The
      // core (inner ~55%) is the densest part; the outer edge is the soft
      // contact falloff that makes it read as ground contact, not a sticker.
      const g = ctx.createRadialGradient(
        size / 2, size / 2, size * 0.02,
        size / 2, size / 2, size / 2,
      )
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(0.5, 'rgba(0,0,0,0.6)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  /*
    Fade in over the arrival like the room lights — the shadow belongs to the
    room, so it must not snap on behind the handoff. Read once at mount (the
    Diorama trick): a direct room load (?screen=room) has approach === 'idle'
    and wants the shadow there immediately. LAYOUT effect so the zeroed state
    lands before the first paint.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    const m = matRef.current
    if (!m) return
    if (!cameFromApproach) {
      m.opacity = CORE_OPACITY
      return
    }
    m.opacity = 0
    const duration = useScene.getState().reducedMotion ? 0 : IN_MS / 1000
    gsap.to(m, { opacity: CORE_OPACITY, duration, ease: 'power2.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Retreat: fade the shadow out with the room, so nothing pops at the
  // teleport (the room has gone dark by then anyway).
  useEffect(() => {
    if (approach !== 'retreating') return
    const m = matRef.current
    if (!m) return
    const duration = useScene.getState().reducedMotion ? 0 : OUT_MS / 1000
    gsap.to(m, { opacity: 0, duration, ease: 'power2.in' })
  }, [approach])

  return (
    <mesh
      position={[position[0], position[1] - 0.001, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
        opacity={CORE_OPACITY}
      />
    </mesh>
  )
}
