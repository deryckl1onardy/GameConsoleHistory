import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Group } from 'three'
import gsap from 'gsap'
import { useActiveConsole, useActiveDiorama, useScene } from '@/store/scene'
import { ConsoleModel } from './models/registry'
import { HardwareAnnotations } from './HardwareAnnotations'

/**
 * The one and only instance of the currently active console.
 *
 * `useGLTF` caches its parsed scene by URL, so the same console can never be
 * rendered by two components at once without either duplicating it or fighting
 * over a shared object's state. Only ONE thing may own it: this component,
 * mounted once directly under `<Canvas>`. `Diorama` never renders
 * `<ConsoleModel>` at all.
 *
 * Its transform is set imperatively, not derived reactively every render —
 * on purpose. Switching consoles changes `entry`, which re-runs the layout
 * effect below and parks the console at the diorama's `consolePosition`.
 */
export const heroGroupRef: { current: Group | null } = { current: null }

/**
 * Where the hero parks while the Games section is showing, as an offset from
 * spec.consolePosition. The spread sits to the console's right, so sliding
 * left and slightly down pushes the console clear of every games-frame — the
 * library shot frames the spread, the artifact shot frames one box, and the
 * console is off-frame in both. The shadow catcher stays at consolePosition
 * and reads as a neutral floor patch once the subject leaves it.
 */
const GAMES_OFFSET: [number, number, number] = [-1.6, -0.1, 0.3]

/** How long the slide in and out takes. */
const SLIDE_MS = 750

export function HeroConsole() {
  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const section = useScene((s) => s.section)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const groupRef = useRef<Group>(null)
  /** The one in-flight slide; killing it before a new one is the whole
   * discipline (rapid switching otherwise leaves two tweens fighting over
   * one transform — the same rule CameraRig.applyShot documents). */
  const slideTween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    heroGroupRef.current = groupRef.current
    return () => {
      heroGroupRef.current = null
    }
  }, [])

  /*
    LAYOUT effect: the very first painted frame of a newly chosen console is
    already in place — a plain effect would paint the fresh GLB at the origin
    for one frame before parking it at its spot. (The section slide lives in
    the plain effect below, so a brand-new console always enters parked, then
    slides only if the user is in Games when it arrives.)
  */
  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return
    g.position.set(...spec.consolePosition)
    g.rotation.set(...(spec.consoleRotation ?? [0, 0, 0]))
  }, [entry.id, spec.consolePosition, spec.consoleRotation])

  /*
    The section slide. Entering Games tweens the hero clear of frame so the
    games take the stage; returning to Console tweens it back to exactly
    spec.consolePosition. The console stays MOUNTED the whole time — it owns
    the single useGLTF instance, and unmounting would re-parse the GLB and
    pop on return. Gated on reducedMotion: snap instead of tween.
  */
  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    slideTween.current?.kill()
    slideTween.current = null
    const target =
      section === 'games'
        ? ([spec.consolePosition[0] + GAMES_OFFSET[0], spec.consolePosition[1] + GAMES_OFFSET[1], spec.consolePosition[2] + GAMES_OFFSET[2]] as [number, number, number])
        : spec.consolePosition
    if (reducedMotion) {
      g.position.set(...target)
      return
    }
    slideTween.current = gsap.to(g.position, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration: SLIDE_MS / 1000,
      ease: 'power3.inOut',
      onComplete: () => {
        slideTween.current = null
      },
    })
  }, [section, reducedMotion, spec.consolePosition])

  useEffect(
    () => () => {
      slideTween.current?.kill()
    },
    [],
  )

  return (
    <group ref={groupRef}>
      {/* Identity transform here — the ref'd group above carries the real
          pose, so the intro's teleport and this component's own idle-reset
          both write to one place, never to ConsoleModel's own internal
          group. */}
      <ConsoleModel entry={entry} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      {/* Local-space sibling of the model, on purpose — HardwareCallout
          anchors are authored in exactly this group's own coordinate frame,
          so mounting anywhere else would need to redo the transform here. */}
      <HardwareAnnotations entry={entry} />
    </group>
  )
}
