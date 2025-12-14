# xlunar-ai-avatar

An MVP-quality, open-source avatar "speech renderer" platform built with Next.js, React Three Fiber, and VRM.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Demo Site

![Demo Default View](/public/docs/demo-default.png)

## Overview

This project provides a **reusable React component** for rendering 3D avatars with text-to-speech (TTS) and amplitude-based mouth animation. It's designed to be embedded into other Next.js applications.

**Core Features:**
- 🎭 VRM avatar rendering with React Three Fiber
- 🔊 TTS integration (OpenAI gpt-4o-mini-tts by default)
- 👄 Real-time mouth animation from audio amplitude with smooth easing
- 🤸 8 body poses, 12 hand gestures, 7 animated gestures, 14 body motions (including walking)
- 🎨 7 background presets, 5 camera presets
- 👥 11 pre-configured avatar models (VRM & GLB)
- 🔌 Pluggable architecture for extensibility

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Integration

📖 **[Full Integration Guide](./integration-guide.md)** — Detailed documentation for developers

### Basic Usage

```tsx
import { useRef } from "react";
import { AvatarStage, AvatarSpeechScene } from "@/lib/avatar";

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

### With TTS

```tsx
import { synthesizeToObjectUrl } from "@/lib/tts/client";

const speak = async (text: string) => {
  const url = await synthesizeToObjectUrl({ text, voice: "alloy" });
  audioRef.current.src = url;
  await audioRef.current.play();
};
```

---

## Customization Options

### Poses & Gestures

![Pose Panel](/public/docs/pose-panel.png)

| Category | Count | Examples |
|----------|-------|----------|
| **Body Poses** | 8 | Relaxed Standing, Thinking, Presenting, Waving |
| **Hand Gestures** | 12 | Peace Sign, Thumbs Up, Pointing, OK Sign |
| **Body Gestures** | 7 | Nod, Wave Hello, Bow, Celebrate (animated) |
| **Body Motions** | 14 | Natural Idle, Breathing, Sway, Bounce, Walking |

#### Thinking Pose Example

![Thinking Pose](/public/docs/pose-thinking.png)

### Scene & Camera

![Scene Panel](/public/docs/scene-panel.png)

| Category | Count | Examples |
|----------|-------|----------|
| **Backgrounds** | 7 | Dark Studio, Sunset, Forest, City Night |
| **Camera Presets** | 5 | Portrait, Headshot, Full Body, Side View |

#### Headshot Camera with Sunset Background

![Headshot Camera](/public/docs/camera-headshot.png)

---

## Available Avatar Models

| Model | Format | License | Source |
|-------|--------|---------|--------|
| VRM1 Sample Avatar | VRM | MIT | pixiv/three-vrm |
| Seed-san | VRM | CC0 | VRM Consortium |
| Avatar Orion | VRM | CC0 | madjin/vrm-samples |
| Cryptovoxels | VRM | CC0 | madjin/vrm-samples |
| VRoid Sample A | GLB | CC0 | VRoid Studio |
| VRoid Sample B | GLB | CC0 | VRoid Studio |
| VRoid Sample C | GLB | CC0 | VRoid Studio |
| VRoid Sample D | GLB | CC0 | VRoid Studio |

Plus 3 customizable options (Local VRM, Local GLB, Custom URL).

---

## Key Parameters

### `<AvatarSpeechScene>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appearance.modelUrl` | `string` | Required | URL to VRM/GLB model |
| `transform.position` | `[x, y, z]` | `[0, 0, 0]` | Avatar position in 3D space |
| `transform.rotation` | `[x, y, z]` | `[0, 0, 0]` | Avatar rotation (radians) |
| `transform.scale` | `number` | `1` | Avatar scale |
| `audioRef` | `RefObject<HTMLAudioElement>` | Required | Reference to audio element |
| `mouthConfig.sensitivity` | `number` | `2.0` | Mouth open sensitivity |
| `mouthConfig.smoothing` | `number` | `0.15` | Animation smoothing (seconds) |
| `mouthConfig.threshold` | `number` | `0.02` | Minimum audio level |
| `mouthConfig.maxOpen` | `number` | `1.0` | Maximum mouth open value |
| `pose` | `PosePreset` | `null` | Body pose preset |
| `handGesture` | `HandGesture` | `null` | Hand gesture preset |
| `bodyGesture` | `BodyGesture` | `null` | Animated body gesture |
| `bodyMotion` | `BodyMotion` | `Natural Idle` | Continuous body motion |

### `<AvatarStage>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stage.backgroundColor` | `string` | `#0a0a0a` | Background color |
| `stage.ambientLightIntensity` | `number` | `0.6` | Ambient light strength |
| `stage.directionalLightIntensity` | `number` | `1.1` | Main light strength |
| `stage.showGrid` | `boolean` | `false` | Show floor grid |
| `camera.position` | `[x, y, z]` | `[0, 1.4, 2.2]` | Camera position |
| `camera.fov` | `number` | `32` | Field of view |
| `camera.enableZoom` | `boolean` | `true` | Allow zoom controls |
| `camera.enablePan` | `boolean` | `true` | Allow pan controls |

### Mouth Animation Config

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `morphTargetName` | `string` | `"aa"` | VRM expression name for mouth open |
| `sensitivity` | `number` | `2.0` | How reactive mouth is to audio (1-5) |
| `smoothing` | `number` | `0.15` | Smooth transition time in seconds |
| `threshold` | `number` | `0.02` | Minimum audio level to trigger animation |
| `maxOpen` | `number` | `1.0` | Maximum mouth open value (0-1) |

---

## Animation System

The animation system uses **easing functions** and **spring physics** for smooth, natural motion.

### Easing Functions Available

```tsx
import {
  easeInOutSine,    // Natural for breathing
  easeInOutCubic,   // Smooth transitions
  easeOutElastic,   // Bouncy effects
  smoothDamp,       // Camera-like following
  breathingCurve,   // Anatomically correct breathing
} from "@/lib/avatar";
```

### Body Motion Types

| Type | Description | Use Case |
|------|-------------|----------|
| `breathing` | Chest expansion/contraction | Idle state |
| `sway` | Side-to-side movement | Casual standing |
| `bounce` | Vertical bouncing | Energetic character |
| `float` | Slow up/down movement | Dreamy/ethereal |
| `walk` | Walking in place animation | Active character |
| `custom` | Combined breathing + sway + micro-movements | Natural idle (default) |

---

## Architecture

```
src/
├── app/
│   ├── api/tts/route.ts       # TTS API endpoint
│   └── page.tsx               # Demo page
├── components/
│   └── demo/                  # Demo UI components
└── lib/
    ├── avatar/
    │   ├── animation/
    │   │   ├── easing.ts      # 20+ easing functions + spring physics
    │   │   ├── AnimationController.ts
    │   │   ├── AnimationLayer.ts
    │   │   └── PoseController.ts
    │   ├── components/        # React components
    │   ├── config/            # Skins, backgrounds, camera, poses
    │   ├── hooks/             # Custom hooks
    │   └── types/             # TypeScript types
    └── tts/
        ├── providers/         # TTS provider implementations
        ├── client.ts          # Browser helpers
        └── server.ts          # Server utilities
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for TTS | Required |
| `OPENAI_TTS_MODEL` | TTS model to use | `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | Default voice | `alloy` |
| `NEXT_PUBLIC_DEFAULT_AVATAR_URL` | Default avatar URL | Sample VRM |

### Available Voices

`alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `nova`, `onyx`, `sage`, `shimmer`

---

## Total Customization Options

| Category | Count |
|----------|-------|
| Skins/Models | 11 |
| Body Poses | 8 |
| Hand Gestures | 12 |
| Body Gestures | 7 |
| Body Motions | 14 |
| Backgrounds | 7 |
| Camera Presets | 5 |
| TTS Voices | 10 |

**Total Unique Combinations:** 11 × 8 × 12 × 7 × 14 × 7 × 5 × 10 = **25,353,600+**

---

## Future Extensions

The architecture supports:

- **Idle animations:** ✅ Implemented (breathing, blinking, sway)
- **Gesture layer:** ✅ Implemented (wave, nod, bow, etc.)
- **Smooth transitions:** ✅ Implemented (easing + spring physics)
- **Walking animations:** ✅ Implemented (multiple walking styles)
- **Viseme lip-sync:** Phoneme-based animation (future)
- **Skin variants:** Material and texture variations (future)
- **Avatar switching:** Hot-swap models with transitions (future)

---

## License

MIT License - Copyright (c) 2024 [VaultX.technology](https://vaultx.technology)

See [LICENSE](./LICENSE) file for details.

### Third-Party Model Credits

- VRM1 Sample Avatar: pixiv/three-vrm (MIT)
- Seed-san: VRM Consortium (CC0)
- Avatar Orion: madjin/vrm-samples (CC0)
- Cryptovoxels: madjin/vrm-samples (CC0)
- VRoid Samples A-D: VRoid Studio by pixiv (CC0)
