# Avatar Models Directory

This directory contains 3D avatar models for the XLunar AI Avatar platform.

**Project License:** MIT - Copyright (c) 2024 [VaultX Technology](https://vaultx.technology)

## Included Sample Models

| Model | Format | Size | License | Source |
|-------|--------|------|---------|--------|
| **VRM1 Sample Avatar** | VRM | 10.3 MB | MIT | [pixiv/three-vrm](https://github.com/pixiv/three-vrm) |
| **Seed-san** | VRM | 10.4 MB | CC0 | [VRM Consortium](https://github.com/vrm-c/vrm-specification) |
| **Avatar Orion** | VRM | 5.9 MB | CC0 | [madjin/vrm-samples](https://github.com/madjin/vrm-samples) |
| **Cryptovoxels** | VRM | 233 KB | CC0 | [madjin/vrm-samples](https://github.com/madjin/vrm-samples) |
| **VRoid Sample A** | GLB | 14.6 MB | CC0 | [VRoid Studio](https://vroid.com) |
| **VRoid Sample B** | GLB | 17.1 MB | CC0 | [VRoid Studio](https://vroid.com) |
| **VRoid Sample C** | GLB | 13.5 MB | CC0 | [VRoid Studio](https://vroid.com) |
| **VRoid Sample D** | GLB | 16.1 MB | CC0 | [VRoid Studio](https://vroid.com) |

### Model Descriptions

**VRM Models (Full pose/expression support):**
- **VRM1 Sample Avatar** - Official VRM1 sample model with proper humanoid bones and expressions
- **Seed-san** - Official VRM sample from VRM Consortium, futuristic style with robotic elements
- **Avatar Orion** - VRoid-style character, great for poses and animations
- **Cryptovoxels** - Lightweight voxel-style avatar, minimal but functional

**VRoid β Sample Models (CC0 - Public Domain):**
- **VRoid Sample A** - Pink-haired girl with frilly dress
- **VRoid Sample B** - Girl with twin tails
- **VRoid Sample C** - Boy with short hair
- **VRoid Sample D** - Girl with long blonde hair

These models are from [VRoid Studio's official samples](https://vroid.pixiv.help/hc/en-us/articles/4402614652569-Do-VRoid-Studio-s-sample-models-come-with-conditions-of-use) and are licensed under CC0 (public domain).

## Supported Formats

- **VRM** (.vrm) - Preferred for anime-style avatars with expressions and full humanoid bone support
- **GLB** (.glb) - Standard GLTF binary format (may have limited pose/animation support)
- **GLTF** (.gltf) - Standard GLTF format

## How to Add Custom Models

1. Download a model from sources like:
   - [VRoid Hub](https://hub.vroid.com) - VRM anime avatars
   - [Sketchfab](https://sketchfab.com) - Free GLB models
   - [Ready Player Me](https://readyplayer.me) - Custom avatars

2. Save the file to this folder, e.g.:
   - `my-avatar.vrm`
   - `custom.glb`

3. Reference it in your code:
```tsx
<AvatarSpeechScene
  appearance={{ modelUrl: "/avatars/my-avatar.vrm" }}
/>
```

Or use the "Custom URL" option in the demo to enter any model URL.

## VRoid Sample Models

The VRoid Studio sample models referenced at [VRoid Help](https://vroid.pixiv.help/hc/en-us/articles/4402614652569-Do-VRoid-Studio-s-sample-models-come-with-conditions-of-use) have specific conditions:

- **AvatarSample_A, B, C, D, E, F** - Available through VRoid Hub with specific usage conditions
- **β Ver AvatarSample 1-4** - CC0 licensed (public domain) ✅ Included in this project

To use additional VRoid Hub models:
1. Create a [VRoid Hub](https://hub.vroid.com) account
2. Download models that allow usage by non-registrants
3. Place the .vrm file in this folder

## Licensing

### Project License

This project is licensed under the **MIT License** - Copyright (c) 2024 [VaultX.technology](https://vaultx.technology)

### Model Licenses

Always check and comply with the license of any 3D model you use:

| License | Usage | Attribution |
|---------|-------|-------------|
| **CC0** | Any use, including commercial | Not required |
| **MIT** | Any use, including commercial | License notice required |
| **CC BY** | Any use, including commercial | Credit required |
| **CC BY-NC** | Non-commercial only | Credit required |

### Included Model Credits

| Model | License | Attribution |
|-------|---------|-------------|
| VRM1 Sample Avatar | MIT | pixiv/three-vrm |
| Seed-san | CC0 | VRM Consortium |
| Avatar Orion | CC0 | madjin/vrm-samples |
| Cryptovoxels | CC0 | madjin/vrm-samples |
| VRoid Samples A-D | CC0 | VRoid Studio by pixiv |

## Notes

- **VRM models** have full support for poses, gestures, and expressions
- **GLB models** may have limited animation support depending on bone structure
- **Hand gestures** require models with detailed finger bone rigging
- Larger models may take longer to load initially
