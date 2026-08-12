import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * No StrictMode.
 *
 * React 19's StrictMode double-invokes mount effects. react-three-fiber's root
 * does not survive that here: the canvas mounts, the renderer is constructed,
 * and then the second pass tears the root down without restarting the render
 * loop — leaving a live canvas that never draws a frame. The symptom is a black
 * viewport with a perfectly healthy scene graph, which is expensive to diagnose.
 *
 * Revisit if react-three-fiber ships a fix; the rest of the app is
 * StrictMode-safe.
 */
createRoot(document.getElementById('root')!).render(<App />)
