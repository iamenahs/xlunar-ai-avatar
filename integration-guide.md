# XLunar AI Avatar - Integration Guide

This guide covers all the ways to integrate and customize the xlunar-ai-avatar component in your Next.js application.

**License:** MIT - Copyright (c) 2024 [VaultX.technology](https://vaultx.technology)

![Demo Default View](/public/docs/demo-default.png)

## Table of Contents

1. [Quick Start](#quick-start)
2. [Component Reference](#component-reference)
3. [Model/Skin Configuration](#modelskin-configuration)
4. [Pose & Gesture Customization](#pose--gesture-customization)
5. [Body Motions](#body-motions)
6. [Background & Environment](#background--environment)
7. [Camera Presets](#camera-presets)
8. [Animation System](#animation-system)
9. [Mouth Animation Configuration](#mouth-animation-configuration)
10. [Text-to-Speech Configuration](#text-to-speech-configuration)
11. [All Customization Options](#all-customization-options)
12. [API Reference](#api-reference)

---

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```tsx
import { AvatarStage, AvatarSpeechScene } from "@/lib/avatar";
import { useRef } from "react";

function MyApp() {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  return (
    <>
      <AvatarStage>
        <AvatarSpeechScene
          appearance={{ modelUrl: "/avatars/my-avatar.vrm" }}
          audioRef={audioRef}
        />
      </AvatarStage>
      <audio ref={audioRef} />
    </>
  );
}
```

---

## Component Reference

### `<AvatarSpeechScene>` - Complete Props

```tsx
interface AvatarSpeechSceneProps {
  /** Model appearance configuration */
  appearance: {
    modelUrl: string;           // URL to VRM/GLB model (required)
  };
  
  /** Avatar transform in 3D space */
  transform?: {
    position?: [number, number, number];  // Default: [0, 0, 0]
    rotation?: [number, number, number];  // Euler angles in radians
    scale?: number;                       // Default: 1
  };
  
  /** Reference to HTML audio element for amplitude analysis */
  audioRef: React.RefObject<HTMLAudioElement>;
  
  /** Mouth animation configuration */
  mouthConfig?: {
    morphTargetName?: string;   // VRM expression name, default: "aa"
    sensitivity?: number;       // Audio reactivity (1-5), default: 2.0
    smoothing?: number;         // Transition time in seconds, default: 0.15
    threshold?: number;         // Min audio level (0-1), default: 0.02
    maxOpen?: number;           // Max mouth open (0-1), default: 1.0
  };
  
  /** Static body pose */
  pose?: PosePreset | null;
  
  /** Hand gesture */
  handGesture?: HandGesture | null;
  
  /** Animated body gesture (one-shot or looping) */
  bodyGesture?: BodyGesture | null;
  
  /** Continuous body motion (breathing, sway, walking, etc.) */
  bodyMotion?: BodyMotion | null;  // Default: Natural Idle
  
  /** Callback when VRM model is loaded */
  onLoad?: (vrm: VRM) => void;
}
```

### `<AvatarStage>` - Complete Props

```tsx
interface AvatarStageProps {
  children: React.ReactNode;
  
  /** Stage/environment configuration */
  stage?: {
    backgroundColor?: string;              // Default: "#0a0a0a"
    ambientLightIntensity?: number;        // Default: 0.6
    directionalLightIntensity?: number;    // Default: 1.1
    directionalLightPosition?: [number, number, number];  // Default: [3, 4, 2]
    showGrid?: boolean;                    // Default: false
    environmentPreset?: string;            // "studio" | "sunset" | "forest" etc.
  };
  
  /** Camera configuration */
  camera?: {
    position?: [number, number, number];   // Default: [0, 1.4, 2.2]
    fov?: number;                          // Default: 32
    near?: number;                         // Default: 0.1
    far?: number;                          // Default: 100
    controlsTarget?: [number, number, number];  // OrbitControls target
    enableZoom?: boolean;                  // Default: true
    enablePan?: boolean;                   // Default: true
    enableRotate?: boolean;                // Default: true
  };
  
  className?: string;
}
```

---

## Model/Skin Configuration

### Available Preset Skins (11 options)

| ID | Name | Format | License | Description |
|----|------|--------|---------|-------------|
| `vrm1-sample` | VRM1 Sample Avatar | VRM | MIT | Official VRM1 sample from pixiv/three-vrm |
| `seed-san` | Seed-san | VRM | CC0 | Official VRM sample from VRM Consortium |
| `avatar-orion` | Avatar Orion | VRM | CC0 | VRoid-style character |
| `cryptovoxels` | Cryptovoxels Avatar | VRM | CC0 | Lightweight voxel-style avatar |
| `vroid-sample-a` | VRoid Sample A | GLB | CC0 | Pink-haired girl with frilly dress |
| `vroid-sample-b` | VRoid Sample B | GLB | CC0 | Girl with twin tails |
| `vroid-sample-c` | VRoid Sample C | GLB | CC0 | Boy with short hair |
| `vroid-sample-d` | VRoid Sample D | GLB | CC0 | Girl with long blonde hair |
| `local-vrm` | Local VRM Model | VRM | - | Uses `/public/avatars/custom.vrm` |
| `local-glb` | Local GLB Model | GLB | - | Uses `/public/avatars/custom.glb` |
| `custom` | Custom URL | Any | - | Enter any URL to a VRM or GLB model |

### Using a Preset Skin

```tsx
import { PRESET_SKINS, getSkinById } from "@/lib/avatar";

// Get all available skins
console.log(PRESET_SKINS);

// Get a specific skin by ID
const skin = getSkinById("vrm1-sample");

// Use in component
<AvatarSpeechScene
  appearance={{ modelUrl: skin.modelUrl }}
  transform={skin.defaultTransform}
  mouthConfig={skin.mouthConfig}
/>
```

### Creating a Custom Skin

```tsx
import { createCustomSkin } from "@/lib/avatar";

const mySkin = createCustomSkin({
  id: "my-character",
  name: "My Character",
  modelUrl: "/avatars/my-character.vrm",
  description: "Custom character model",
  license: "CC BY 4.0",
  attribution: "Created by me",
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
  },
  mouthConfig: {
    morphTargetName: "aa",
    sensitivity: 2.0,
    smoothing: 0.15,
  },
});
```

---

## Pose & Gesture Customization

![Pose Panel](/public/docs/pose-panel.png)

### Body Poses (8 presets)

| ID | Name | Description | Bone Rotations |
|----|------|-------------|----------------|
| `tpose` | T-Pose | Arms extended horizontally | `leftUpperArm: [0, 0, -90]`, `rightUpperArm: [0, 0, 90]` |
| `apose` | A-Pose | Arms at 45 degrees | `leftUpperArm: [0, 0, -45]`, `rightUpperArm: [0, 0, 45]` |
| `relaxed` | Relaxed Standing | Natural pose, arms at sides | `leftUpperArm: [20, 0, -70]`, `rightUpperArm: [20, 0, 70]` |
| `handsOnHips` | Hands on Hips | Confident pose | `leftUpperArm: [25, 40, -60]`, `rightUpperArm: [25, -40, 60]` |
| `armsCrossed` | Arms Crossed | Arms crossed in front | `leftUpperArm: [30, 50, -70]`, `rightUpperArm: [30, -50, 70]` |
| `thinking` | Thinking | Hand on chin | `rightUpperArm: [60, -30, 70]`, `head: [5, -10, 0]` |
| `presenting` | Presenting | One arm extended | `rightUpperArm: [0, 0, 60]` |
| `waving` | Waving | Arm raised | `rightUpperArm: [-30, 0, 120]` |

#### Example: Thinking Pose

![Thinking Pose](/public/docs/pose-thinking.png)

### Usage

```tsx
import {
  POSE_PRESETS,
  getPoseById,
  applyPoseToVRM,
  PoseController,
  createPoseController,
} from "@/lib/avatar";

// Get a pose by ID
const pose = getPoseById("thinking");

// Use in AvatarSpeechScene
<AvatarSpeechScene
  appearance={{ modelUrl: "/avatars/avatar.vrm" }}
  audioRef={audioRef}
  pose={pose}
/>

// Or apply manually with PoseController
const poseController = createPoseController();
poseController.init(vrm);
poseController.applyPose(pose);  // Smooth transition
```

### Pose Transition Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `transitionDuration` | `0.4s` | Time to transition between poses |
| `smoothTime` | `0.15s` | Smooth damping for bone movements |
| `easing` | `easeInOutCubic` | Easing function for transitions |

---

### Hand Gestures (12 presets)

| ID | Name | Finger Configuration |
|----|------|----------------------|
| `open` | Open Hand | All fingers extended (0) |
| `fist` | Fist | All fingers closed (1) |
| `pointing` | Pointing | Index: 0, others: 1 |
| `peace` | Peace Sign | Index + middle: 0, others: 1 |
| `thumbsUp` | Thumbs Up | Thumb: 0, others: 1 |
| `thumbsDown` | Thumbs Down | Thumb: 0, others: 1 |
| `ok` | OK Sign | Thumb + index: 0.7, others: 0 |
| `rock` | Rock Sign | Index + pinky: 0, others: 1 |
| `wave` | Wave | All fingers open with spread |
| `grab` | Grab | All fingers partially closed (0.5-0.7) |
| `pinch` | Pinch | Thumb + index: 0.8, others: 0.3 |
| `relaxed` | Relaxed | Natural curl (0.3-0.45) |

> **Note:** Hand gestures require models with detailed finger bone rigging. Some simplified models may not show visible finger movements.

```tsx
import { HAND_GESTURES, getHandGestureById } from "@/lib/avatar";

const gesture = getHandGestureById("peace");

<AvatarSpeechScene
  appearance={{ modelUrl: "/avatars/avatar.vrm" }}
  audioRef={audioRef}
  handGesture={gesture}
/>
```

---

### Body Gestures (7 animated presets)

| ID | Name | Duration | Loop | Keyframes |
|----|------|----------|------|-----------|
| `nod` | Nod | 600ms | No | 4 keyframes (head pitch) |
| `shake` | Head Shake | 800ms | No | 5 keyframes (head yaw) |
| `wave` | Wave Hello | 1200ms | No | 6 keyframes (arm motion) |
| `shrug` | Shrug | 800ms | No | 4 keyframes (shoulders) |
| `bow` | Bow | 1500ms | No | 4 keyframes (spine + head) |
| `clap` | Clap | 600ms | **Yes** | 3 keyframes (arms) |
| `celebrate` | Celebrate | 1000ms | No | 4 keyframes (arms up) |

```tsx
import { BODY_GESTURES, getBodyGestureById } from "@/lib/avatar";

const gesture = getBodyGestureById("wave");

// Play gesture (will automatically return to base pose after)
<AvatarSpeechScene
  appearance={{ modelUrl: "/avatars/avatar.vrm" }}
  audioRef={audioRef}
  bodyGesture={gesture}
/>
```

---

## Body Motions

### Available Motions (14 presets)

| ID | Name | Type | Speed | Intensity | Description |
|----|------|------|-------|-----------|-------------|
| `none` | None | custom | 0 | 0 | No motion |
| `breathingSubtle` | Subtle Breathing | breathing | 1.0 | 0.3 | Very light chest motion |
| `breathingNormal` | Normal Breathing | breathing | 1.0 | 0.6 | Natural breathing (14 breaths/min) |
| `breathingDeep` | Deep Breathing | breathing | 0.7 | 1.0 | Visible deep breaths |
| `swayGentle` | Gentle Sway | sway | 0.5 | 0.4 | Subtle side-to-side |
| `swayRhythmic` | Rhythmic Sway | sway | 0.8 | 0.7 | More pronounced swaying |
| `bounceSubtle` | Subtle Bounce | bounce | 1.5 | 0.3 | Light vertical bounce |
| `bounceEnergetic` | Energetic Bounce | bounce | 2.0 | 0.6 | Active bouncing |
| `floatDreamy` | Dreamy Float | float | 0.3 | 0.5 | Slow up/down motion |
| `idleNatural` | Natural Idle | custom | 1.0 | 0.5 | **Default**: Breathing + sway + micro-movements |
| `walkSlow` | Slow Walk | walk | 0.6 | 0.5 | Gentle walking in place |
| `walkNormal` | Normal Walk | walk | 1.0 | 0.7 | Natural walking pace |
| `walkBrisk` | Brisk Walk | walk | 1.5 | 1.0 | Energetic fast walking |
| `marchInPlace` | March | walk | 1.2 | 1.0 | Military-style marching |

### Motion Type Details

| Type | Affected Bones | Animation |
|------|----------------|-----------|
| `breathing` | spine, chest, shoulders | Asymmetric inhale (40%) / exhale (60%) |
| `sway` | spine, head | Organic oscillation with harmonics |
| `bounce` | position.y | Sinusoidal vertical movement |
| `float` | position.y | Slow sinusoidal floating |
| `walk` | legs, arms, spine, hips | Coordinated walking cycle |
| `custom` | All of above | Combined natural idle |

```tsx
import { BODY_MOTIONS, getBodyMotionById } from "@/lib/avatar";

const motion = getBodyMotionById("walkNormal");

<AvatarSpeechScene
  appearance={{ modelUrl: "/avatars/avatar.vrm" }}
  audioRef={audioRef}
  bodyMotion={motion}
/>
```

---

## Background & Environment

![Scene Panel](/public/docs/scene-panel.png)

### Background Presets (7 options)

| ID | Name | Color | Grid | Light Position |
|----|------|-------|------|----------------|
| `darkStudio` | Dark Studio | #0a0a0a | No | [3, 4, 2] |
| `lightStudio` | Light Studio | #f5f5f5 | Yes | [3, 4, 2] |
| `sunset` | Sunset | #1a0a15 | No | [5, 3, -2] |
| `forest` | Forest | #0a150a | No | [2, 5, 3] |
| `cityNight` | City Night | #0a0a1a | No | [0, 3, 5] |
| `photoStudio` | Photo Studio | #e0e0e0 | No | [3, 4, 2] |
| `gridFloor` | Grid Floor | #1a1a1a | Yes | [3, 4, 2] |

#### Sunset Background Example

![Sunset Background](/public/docs/background-sunset.png)

### Usage

```tsx
import { BACKGROUND_PRESETS, getBackgroundById } from "@/lib/avatar";

const bg = getBackgroundById("sunset");

<AvatarStage
  stage={{
    backgroundColor: bg.backgroundColor,
    ambientLightIntensity: bg.ambientLight,
    directionalLightIntensity: bg.directionalLight,
    directionalLightPosition: bg.lightPosition,
    showGrid: bg.showGrid,
    environmentPreset: bg.environmentPreset,
  }}
>
  {/* ... */}
</AvatarStage>
```

---

## Camera Presets

### Available Presets (5 options)

| ID | Name | Position | FOV | Target | Description |
|----|------|----------|-----|--------|-------------|
| `portrait` | Portrait | [0, 1.4, 2.2] | 32 | [0, 1.3, 0] | Classic portrait framing |
| `headshot` | Headshot | [0, 1.5, 1.0] | 28 | [0, 1.4, 0] | Close-up face shot |
| `fullBody` | Full Body | [0, 1.0, 4.0] | 35 | [0, 0.9, 0] | Show entire character |
| `sideView` | Side View | [2, 1.4, 1.5] | 32 | [0, 1.3, 0] | Profile angle |
| `lowAngle` | Low Angle | [0, 0.5, 2.5] | 32 | [0, 1.2, 0] | Dramatic low angle |

#### Headshot Camera Example

![Headshot Camera](/public/docs/camera-headshot.png)

### Usage

```tsx
import { CAMERA_PRESETS, getCameraById } from "@/lib/avatar";

const cam = getCameraById("headshot");

<AvatarStage
  camera={{
    position: cam.position,
    fov: cam.fov,
    controlsTarget: cam.target,
    enableZoom: true,
    enablePan: true,
  }}
>
  {/* ... */}
</AvatarStage>
```

---

## Animation System

The animation system uses **easing functions** and **spring physics** for smooth, natural motion.

### Available Easing Functions

```tsx
import {
  // Basic easing
  linear,
  easeInSine, easeOutSine, easeInOutSine,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInExpo, easeOutExpo, easeInOutExpo,
  
  // Advanced easing
  easeInBack, easeOutBack, easeInOutBack,  // Overshoot
  easeInElastic, easeOutElastic,           // Spring-like
  easeOutBounce,                           // Bouncing
  
  // Spring physics
  updateSpring,
  SPRING_PRESETS,  // default, gentle, snappy, bouncy, slow
  
  // Smoothing
  smoothDamp,           // Camera-like following
  exponentialSmooth,    // Simple smoothing
  
  // Animation curves
  breathingCurve,       // Anatomically correct (14 breaths/min)
  organicOscillation,   // Multi-harmonic for natural feel
  headMicroMovement,    // Subtle head motion
} from "@/lib/avatar";
```

### Spring Physics Configuration

```tsx
interface SpringConfig {
  stiffness: number;  // Higher = faster (default: 100)
  damping: number;    // Higher = less bounce (default: 10)
  mass: number;       // Higher = more inertia (default: 1)
}

// Preset springs
SPRING_PRESETS.default  // { stiffness: 100, damping: 10, mass: 1 }
SPRING_PRESETS.gentle   // { stiffness: 60, damping: 15, mass: 1 }
SPRING_PRESETS.snappy   // { stiffness: 300, damping: 20, mass: 1 }
SPRING_PRESETS.bouncy   // { stiffness: 180, damping: 12, mass: 1 }
SPRING_PRESETS.slow     // { stiffness: 40, damping: 8, mass: 1 }
```

---

## Mouth Animation Configuration

### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `morphTargetName` | `string` | `"aa"` | - | VRM expression name for mouth |
| `sensitivity` | `number` | `2.0` | 0.5-5.0 | Audio level multiplier |
| `smoothing` | `number` | `0.15` | 0.05-0.5 | Transition time (seconds) |
| `threshold` | `number` | `0.02` | 0-0.2 | Minimum audio level to animate |
| `maxOpen` | `number` | `1.0` | 0-1 | Maximum mouth open value |

### Tuning Guide

**For natural speech:**
```tsx
mouthConfig={{
  morphTargetName: "aa",
  sensitivity: 2.0,
  smoothing: 0.15,
  threshold: 0.02,
  maxOpen: 1.0,
}}
```

**For more reactive/exaggerated:**
```tsx
mouthConfig={{
  morphTargetName: "aa",
  sensitivity: 3.5,
  smoothing: 0.08,
  threshold: 0.01,
  maxOpen: 1.0,
}}
```

**For subtle/calm speech:**
```tsx
mouthConfig={{
  morphTargetName: "aa",
  sensitivity: 1.2,
  smoothing: 0.25,
  threshold: 0.05,
  maxOpen: 0.7,
}}
```

---

## Text-to-Speech Configuration

### Environment Variables

```bash
# TTS Provider (openai or proxy)
TTS_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_TTS_MODEL=gpt-4o-mini-tts  # or tts-1, tts-1-hd
OPENAI_TTS_VOICE=alloy           # Default voice

# Proxy Configuration (alternative)
TTS_PROXY_URL=https://your-tts-server.com/api/tts
TTS_PROXY_BEARER=your-bearer-token
```

### Available Voices (10 options)

| Voice | Description | Best For |
|-------|-------------|----------|
| alloy | Neutral, balanced | General purpose |
| ash | Warm, conversational | Friendly interactions |
| ballad | Expressive, storytelling | Narratives |
| coral | Clear, professional | Business |
| echo | Strong, confident | Announcements |
| fable | Friendly, approachable | Customer service |
| nova | Soft, gentle | Calm interactions |
| onyx | Deep, authoritative | Commands |
| sage | Wise, calm | Guidance |
| shimmer | Light, energetic | Upbeat content |

### Client Usage

```tsx
import { synthesizeToObjectUrl } from "@/lib/tts/client";

const handleSpeak = async () => {
  const audioUrl = await synthesizeToObjectUrl({
    text: "Hello world!",
    voice: "nova",     // Optional, default: "alloy"
    format: "mp3",     // "mp3" | "wav"
    speed: 1.0,        // 0.5 - 2.0
  });
  
  audioRef.current.src = audioUrl;
  await audioRef.current.play();
};
```

---

## All Customization Options

### Summary Table

| Category | Count | Options |
|----------|-------|---------|
| **Skins/Models** | 11 | VRM1 Sample, Seed-san, Avatar Orion, Cryptovoxels, VRoid A/B/C/D, Local VRM, Local GLB, Custom URL |
| **Body Poses** | 8 | T-Pose, A-Pose, Relaxed, Hands on Hips, Arms Crossed, Thinking, Presenting, Waving |
| **Hand Gestures** | 12 | Open, Fist, Pointing, Peace, Thumbs Up/Down, OK, Rock, Wave, Grab, Pinch, Relaxed |
| **Body Gestures** | 7 | Nod, Head Shake, Wave Hello, Shrug, Bow, Clap, Celebrate |
| **Body Motions** | 14 | None, 3 Breathing, 2 Sway, 2 Bounce, Float, Natural Idle, 4 Walking |
| **Backgrounds** | 7 | Dark/Light Studio, Sunset, Forest, City Night, Photo Studio, Grid Floor |
| **Camera Presets** | 5 | Portrait, Headshot, Full Body, Side View, Low Angle |
| **TTS Voices** | 10 | alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer |

**Total Customization Combinations:** 11 × 8 × 12 × 7 × 14 × 7 × 5 × 10 = **25,353,600+**

### Programmatic Access

```tsx
import {
  // All presets
  PRESET_SKINS,
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  
  // Helper functions
  getSkinById,
  getPoseById,
  getHandGestureById,
  getBodyGestureById,
  getBodyMotionById,
  getBackgroundById,
  getCameraById,
  
  // Convenience object with all options
  CUSTOMIZATION_OPTIONS,
} from "@/lib/avatar";

// CUSTOMIZATION_OPTIONS structure:
{
  poses: [{ id, name, description }, ...],
  handGestures: [{ id, name, description }, ...],
  bodyGestures: [{ id, name, description }, ...],
  bodyMotions: [{ id, name, description }, ...],
}
```

---

## API Reference

### Components

| Component | Description |
|-----------|-------------|
| `<AvatarStage>` | Canvas wrapper with lights, camera, controls |
| `<AvatarRenderer>` | Core VRM model renderer (low-level) |
| `<AvatarSpeechScene>` | Complete speech-enabled avatar scene |

### Hooks

| Hook | Description |
|------|-------------|
| `useAudioAnalyser` | Full audio analysis with state |
| `useAudioEnergy` | Simple energy getter for useFrame |

### Controllers

| Controller | Description |
|------------|-------------|
| `AnimationController` | Manages animation layers (mouth, idle, gesture) |
| `PoseController` | Manages poses, gestures, and body motions |

### Functions

| Function | Description |
|----------|-------------|
| `synthesizeToObjectUrl()` | Generate TTS audio blob URL |
| `getSkinById()` | Get skin preset by ID |
| `getPoseById()` | Get pose preset by ID |
| `getHandGestureById()` | Get hand gesture by ID |
| `getBodyGestureById()` | Get body gesture by ID |
| `getBodyMotionById()` | Get body motion by ID |
| `getBackgroundById()` | Get background preset by ID |
| `getCameraById()` | Get camera preset by ID |
| `createCustomSkin()` | Create custom skin configuration |

---

## Troubleshooting

### Model Not Loading
- Check if the URL is correct
- For local files, ensure they're in `/public/avatars/`
- Check browser console for CORS errors
- Verify model format (VRM, GLB, GLTF)

### Mouth Not Moving
- Ensure VRM model has expression morphs (especially "aa")
- Check `mouthConfig.morphTargetName` matches the model
- Verify audio is actually playing
- Increase `sensitivity` value

### Hand Gestures Not Visible
- Hand gestures require models with detailed finger bone rigging
- Many simplified models have static hands
- VRM models with full humanoid setup work best

### Jerky/Robotic Motion
- Check that `bodyMotion` is set (default: Natural Idle)
- Increase `smoothing` value
- Verify easing functions are being used

### Performance Issues
- Use GLB format with compressed textures (1k instead of 2k)
- Disable unused features (grid, environment preset)
- Reduce animation complexity

---

## License

**MIT License** - Copyright (c) 2024 [VaultX.technology](https://vaultx.technology)

See [LICENSE](./LICENSE) file for details.

### Third-Party Model Credits

| Model | License | Attribution |
|-------|---------|-------------|
| VRM1 Sample Avatar | MIT | pixiv/three-vrm |
| Seed-san | CC0 | VRM Consortium |
| Avatar Orion | CC0 | madjin/vrm-samples |
| Cryptovoxels | CC0 | madjin/vrm-samples |
| VRoid Samples A-D | CC0 | VRoid Studio by pixiv |
