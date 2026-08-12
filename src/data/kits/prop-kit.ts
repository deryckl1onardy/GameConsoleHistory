import type { DimensionsMm } from '@/types/console'

/**
 * The shared room kit.
 *
 * Furniture is authored once and instanced per diorama with a material variant.
 * A new console usually adds zero entries here — it rearranges these and changes
 * the light.
 *
 * Every prop declares real-world dimensions so the grey-box pass is already
 * correctly proportioned. When a real GLB arrives it drops into `model` and the
 * placeholder box disappears; nothing else changes.
 */
export type PropKitEntry = {
  id: string
  label: string
  dimensions: DimensionsMm
  /** Local origin: 'floor' sits on the ground, 'surface' rests on another prop. */
  anchor: 'floor' | 'surface' | 'wall'
  model?: string
  variants: Record<string, { color: string; roughness: number; metalness?: number }>
}

export const PROP_KIT: Record<string, PropKitEntry> = {
  sofa: {
    id: 'sofa',
    label: 'Three-seat sofa',
    dimensions: { width: 2000, height: 800, depth: 900 },
    anchor: 'floor',
    variants: {
      'plaid-brown': { color: '#7a5c3f', roughness: 0.92 },
      'corduroy-olive': { color: '#6b6a3c', roughness: 0.95 },
      'leather-black': { color: '#2b2723', roughness: 0.5 },
      'grey-modern': { color: '#8b8b8b', roughness: 0.88 },
    },
  },
  rug: {
    id: 'rug',
    label: 'Area rug',
    dimensions: { width: 2400, height: 14, depth: 1700 },
    anchor: 'floor',
    variants: {
      'shag-rust': { color: '#9c5b32', roughness: 1 },
      'berber-cream': { color: '#cbbda2', roughness: 1 },
      'geometric-90s': { color: '#4a6b7c', roughness: 1 },
    },
  },
  'tv-stand': {
    id: 'tv-stand',
    label: 'TV cabinet',
    dimensions: { width: 1100, height: 500, depth: 480 },
    anchor: 'floor',
    variants: {
      'oak-veneer': { color: '#8a6440', roughness: 0.7 },
      'black-lacquer': { color: '#1e1c1a', roughness: 0.35 },
      'ikea-white': { color: '#e4e2dd', roughness: 0.6 },
    },
  },
  shelf: {
    id: 'shelf',
    label: 'Bookshelf',
    dimensions: { width: 800, height: 1600, depth: 300 },
    anchor: 'floor',
    variants: {
      'oak-veneer': { color: '#8a6440', roughness: 0.7 },
      'black-lacquer': { color: '#1e1c1a', roughness: 0.35 },
    },
  },
  'side-table': {
    id: 'side-table',
    label: 'Side table',
    dimensions: { width: 450, height: 520, depth: 450 },
    anchor: 'floor',
    variants: {
      'oak-veneer': { color: '#8a6440', roughness: 0.7 },
      'glass-chrome': { color: '#b9c4c9', roughness: 0.15, metalness: 0.8 },
    },
  },
  lamp: {
    id: 'lamp',
    label: 'Table lamp',
    dimensions: { width: 280, height: 420, depth: 280 },
    anchor: 'surface',
    variants: {
      'brass-shade': { color: '#c9a227', roughness: 0.4, metalness: 0.6 },
      'white-shade': { color: '#efe7d5', roughness: 0.85 },
    },
  },
  plant: {
    id: 'plant',
    label: 'House plant',
    dimensions: { width: 500, height: 900, depth: 500 },
    anchor: 'floor',
    variants: {
      fern: { color: '#3f6b3a', roughness: 0.9 },
      'rubber-tree': { color: '#2f5230', roughness: 0.85 },
    },
  },
  poster: {
    id: 'poster',
    label: 'Wall poster',
    dimensions: { width: 600, height: 900, depth: 12 },
    anchor: 'wall',
    variants: {
      arcade: { color: '#b23a48', roughness: 0.8 },
      band: { color: '#2f3e5c', roughness: 0.8 },
    },
  },
  window: {
    id: 'window',
    label: 'Window',
    dimensions: { width: 1200, height: 1100, depth: 60 },
    anchor: 'wall',
    variants: {
      blinds: { color: '#ded6c4', roughness: 0.7 },
      curtains: { color: '#a9977b', roughness: 0.95 },
    },
  },
}

export function propKit(id: string): PropKitEntry | undefined {
  return PROP_KIT[id]
}
