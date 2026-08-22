# Sega Master System 3D Model Investigation

## Summary
The `public/models/consoles/master-system.glb` file is modified in the working tree compared to HEAD.

- Working tree size: 406,288 bytes
- HEAD size: 406,388 bytes
- Difference: -100 bytes
- MD5 working tree: ba72378dc30a5dd2000f38bf098df24e
- MD5 HEAD: b9ed1a6e43e90fd4d5f642ad02046ac1

The glTF JSON chunk is 6,680 bytes in the working tree vs 6,780 bytes in HEAD.

## Structural parity
- Mesh count: 4 meshes in both versions
- Node count: 14 nodes in both versions
- Vertices: 8,385 vertices in both versions
- Mesh names unchanged: sms_lid_0, metalbits_0/1/2

## Material change detected
The JSON chunk uses KHR_materials_pbrSpecularGlossiness extension.

Working tree diffuseFactor:
- Material 0 (Material): [1.0, 1.0, 1.0, 1.0]
- Material 1 (Metal.001): [1.0, 1.0, 1.0, 1.0]
- Material 3: [1.0, 1.0, 1.0, 1.0]

HEAD diffuseFactor:
- Material 0: [0.0, 0.0, 0.0, 1.0]
- Material 1: [0.0052, 0.0047, 0.0047, 1.0]
- Material 3: [0.218, 0.0064, 0.0064, 1.0]

The diffuseFactor has been set to pure white (1.0) in the working tree, whereas HEAD used near-black / dark values.

## Registry behavior
src/data/consoles/master-system.ts:
  model: '/models/consoles/master-system.glb'

src/three/models/gltf-transforms.ts:
  master-system: { scale: 0.08311 }

src/three/models/registry.tsx ConsoleModel uses GltfOrFallback with known=true for master-system, so the loader skips HEAD probe and attempts to load the GLB directly.

GltfErrorBoundary will fall back to Block only on a load/parse error. The JSON parses successfully, binary chunk is intact, PNG signature present at offset ~355680, bin length 399580 unchanged.

## Likely visual impact
The diffuseFactor change from dark values to [1,1,1,1] removes the original material tinting and, with the specular-glossiness extension in use, causes the meshes to render with flat white shading. In practice this reads as a featureless grey/white box rather than the detailed textured console.

## Recommended verification
1. Open the app and navigate to the Master System entry.
2. Check browser console for `[GltfModel]` warnings from GltfErrorBoundary / useUrlExists.
3. If the model loads but appears flat white/grey, the material diffuseFactor change is the cause.
4. If a fallback Block/LoadingVolume is shown, check console for load errors.

## Decision point
The working tree modification is intentional per git status. Do not revert unilaterally per user constraints. A restore/replacement decision should be made by the user after outcome-based verification.

Files inspected:
- src/data/consoles/master-system.ts
- src/three/models/registry.tsx
- src/three/models/GltfModel.tsx
- src/three/models/gltf-transforms.ts
- public/models/consoles/master-system.glb
