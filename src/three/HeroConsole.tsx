import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Group } from 'three'
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

export function HeroConsole() {
  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const section = useScene((s) => s.section)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    heroGroupRef.current = groupRef.current
    return () => {
      heroGroupRef.current = null
    }
  }, [])

  /*
    LAYOUT effect: the very first painted frame of a newly chosen console is
    already in place — a plain effect would paint the fresh GLB at the origin
    for one frame before parking it at its spot.
  */
  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return
    g.position.set(...spec.consolePosition)
    g.rotation.set(...(spec.consoleRotation ?? [0, 0, 0]))
  }, [entry.id, spec.consolePosition, spec.consoleRotation])

  return (
    // The console stays MOUNTED the whole time — it owns the single useGLTF
    // instance, and unmounting would re-parse the GLB and pop back in on
    // return. `visible` is the only thing that changes: the Games section is
    // about the game boxes, never the console, so it is simply switched off
    // for as long as the user is there, rather than parked somewhere the
    // camera is merely supposed to not look. A moved-but-visible console can
    // still end up in frame (a wide shot, an orbit, a mid-transition camera);
    // an invisible one cannot, in any camera pose, ever.
    <group ref={groupRef} visible={section !== 'games'}>
      {/* Identity transform here — the ref'd group above carries the real
          pose, so the intro's teleport and this component's own idle-reset
          both write to one place, never to ConsoleModel's own internal
          group. */}
      <ConsoleModel entry={entry} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      {/* Local-space sibling of the model, on purpose — HardwareCallout
          anchors are authored in exactly this group's own coordinate frame,
          so mounting anywhere else would need to redo the transform here.
          Hidden along with the model above, since a callout pointing at
          nothing visible would read as a bug. */}
      <HardwareAnnotations entry={entry} />
    </group>
  )
}
