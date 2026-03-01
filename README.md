# xlunar-ai-avatar

An MVP-quality, open-source avatar "speech renderer" platform built with Next.js, React Three Fiber, and VRM.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Demo Site
https://xlunar-ai-avatar.vercel.app/

![Demo Default View](/public/docs/demo-default.png)

## Overview

This project provides a **reusable React component** for rendering 3D avatars with text-to-speech (TTS) and amplitude-based mouth animation. It's designed to be embedded into other Next.js applications.

**Core Features:**
- 🎭 VRM avatar rendering with React Three Fiber
- 🔊 TTS integration (OpenAI gpt-4o-mini-tts by default)
- 👄 Real-time mouth animation from audio amplitude with smooth easing
- 🤸 8 body poses, 12 hand gestures, 7 animated gestures, 14 body motions (including walking)
- 🎬 10 choreographed motion sequences across 5 categories
- 🎞️ VRMA animation support — retargetable animations that work across all VRM models
- 🎨 7 background presets, 5 camera presets
- 👥 45 pre-configured avatar models (34 VRoid Hub Collection + VRM samples + VRoid Beta samples)
- 🔌 Pluggable architecture with version-specific VRM handlers (VRM 0.x, VRM 1.0, VRoid GLB)

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

### With VRMA Animation

```tsx
<AvatarSpeechScene
  appearance={{ modelUrl: "/models/Hinase.vrm" }}
  audioRef={audioRef}
  vrmaUrl="/animations/my-animation.vrma"
  vrmaLoop={true}
/>
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
| **Motion Sequences** | 10 | Greeting, Thinking, Surprise, Applause, Presentation |

### Scene & Camera

![Scene Panel](/public/docs/scene-panel.png)

| Category | Count | Examples |
|----------|-------|----------|
| **Backgrounds** | 7 | Dark Studio, Sunset, Forest, City Night |
| **Camera Presets** | 5 | Portrait, Headshot, Full Body, Side View |

### VRMA Animations

VRM Animation (.vrma) files provide retargetable humanoid animations using the `VRMC_vrm_animation` glTF extension. Animations are automatically retargeted to any VRM model through the humanoid bone system.

**Bundled Presets (14):**

*VRoid Project Motion Pack (pixiv Inc.) — [BOOTH](https://booth.pm/ja/items/5512385)*
| Animation | Category | Description |
|-----------|----------|-------------|
| Show Full Body | pose | Full body presentation |
| Greeting | greeting | Greeting bow |
| Peace Sign | pose | V-sign pose |
| Shoot | action | Shooting gesture |
| Spin | action | Spinning around |
| Model Pose | pose | Fashion model pose |
| Squat | action | Squat exercise |

*vrm-viewer (MIT License) — [GitHub](https://github.com/tk256ailab/vrm-viewer)*
| Animation | Category | Description |
|-----------|----------|-------------|
| Goodbye Wave | greeting | Waving goodbye |
| Angry | emotion | Angry expression |
| Clapping | action | Applause |
| Jump | action | Jumping |
| Look Around | action | Looking around |

*Other Sources:*
| Animation | Category | Source |
|-----------|----------|--------|
| Mocopi Idle | idle | vrma-loader-sample (MIT) |
| Test Animation | action | pixiv/three-vrm (MIT) |

**Custom Animations:**
- Place `.vrma` files in `public/animations/`
- Add preset entries in `src/lib/avatar/config/animations.ts`
- Or load custom animations via URL at runtime

---

## Available Avatar Models

### VRoid Hub Collection (34 models)

All models sourced from [VRoid Hub](https://hub.vroid.com/en/users/98739617).

| Model | File |
|-------|------|
| Hinase | `Hinase.vrm` |
| Yukina | `Yukina.vrm` |
| Rii (Uniform) | `Rii_Uniform.vrm` |
| Rii | `Rii.vrm` |
| Uina | `Uina.vrm` |
| Ruika | `Ruika.vrm` |
| Yukana | `Yukana.vrm` |
| Yue | `Yue.vrm` |
| Moyu | `Moyu.vrm` |
| Noan | `Noan.vrm` |
| Yuduki | `Yuduki.vrm` |
| Hagumi | `Hagumi.vrm` |
| Rise | `Rise.vrm` |
| Kirina | `Kirina.vrm` |
| Konon | `Konon.vrm` |
| Meimi | `Meimi.vrm` |
| Rizu | `Rizu.vrm` |
| Hinari | `Hinari.vrm` |
| Kanade | `Kanade.vrm` |
| Saori | `Saori.vrm` |
| Aisa | `Aisa.vrm` |
| Yukako | `Yukako.vrm` |
| Memi | `Memi.vrm` |
| Nona | `Nona.vrm` |
| Eru | `Eru.vrm` |
| Momoa | `Momoa.vrm` |
| Ayasa | `Ayasa.vrm` |
| Kanami | `Kanami.vrm` |
| Yuyu | `Yuyu.vrm` |
| Miyuka | `Miyuka.vrm` |
| Rena | `Rena.vrm` |
| Irori | `Irori.vrm` |
| Kizuna | `Kizuna.vrm` |
| Yumeka | `Yumeka.vrm` |

### VRM Sample Models

| Model | Format | License | Source |
|-------|--------|---------|--------|
| VRM1 Sample Avatar | VRM 1.0 | MIT | pixiv/three-vrm |
| Seed-san | VRM 1.0 | CC0 | VRM Consortium |
| Avatar Orion | VRM | CC0 | madjin/vrm-samples |
| Cryptovoxels | VRM | CC0 | madjin/vrm-samples |

### VRoid Beta Samples

| Model | Format | Source |
|-------|--------|--------|
| VRoid Sample A | GLB | VRoid Studio |
| VRoid Sample B | GLB | VRoid Studio |
| VRoid Sample C | GLB | VRoid Studio |
| VRoid Sample D | GLB | VRoid Studio |

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
| `motionSequence` | `MotionSequenceDefinition` | `null` | Choreographed sequence |
| `vrmaUrl` | `string \| null` | `null` | VRMA animation URL |
| `vrmaLoop` | `boolean` | `true` | Loop VRMA animation |

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

### VRMA Animation System

The VrmaPlayer class provides full VRMA animation support:

```tsx
import { VrmaPlayer, createVrmaPlayer } from "@/lib/avatar";

const player = createVrmaPlayer();
player.init(vrm);
await player.loadAnimation("/animations/greeting.vrma");
player.play({ loop: true, speed: 1.0 });

// In animation loop:
player.update(delta);
```

Features:
- Automatic retargeting to any VRM model
- Looping and one-shot playback
- Crossfade between animations
- Expression (blend shape) animation support
- Gaze/LookAt animation support

---

## VRM Version Handling

The system automatically detects and handles different VRM formats through a pluggable handler architecture:

| Handler | VRM Version | Scene Setup | Rotation |
|---------|-------------|-------------|----------|
| `Vrm1Handler` | VRM 1.0 | Identity (no transform) | Identity |
| `Vrm0Handler` | VRM 0.x | 180° Y-axis pivot | Negate X/Z |
| `VroidGlbHandler` | VRoid GLB | Same as VRM 0.x | Same as VRM 0.x |

Custom handlers can be added by implementing the `VrmVersionHandler` interface:

```tsx
import { VrmVersionHandler } from "@/lib/avatar";
```

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
    │   │   ├── PoseController.ts
    │   │   ├── MotionSequence.ts
    │   │   └── VrmaPlayer.ts  # VRMA animation loading & playback
    │   ├── components/        # React components
    │   ├── config/
    │   │   ├── skins.ts       # 45 model presets with group support
    │   │   ├── poses.ts       # Poses, gestures, motions
    │   │   ├── sequences.ts   # Motion sequence definitions
    │   │   └── animations.ts  # VRMA animation presets
    │   ├── hooks/             # Custom hooks
    │   ├── loaders/           # VRM version handlers
    │   │   ├── VrmVersionHandler.ts  # Handler interface
    │   │   ├── Vrm0Handler.ts        # VRM 0.x support
    │   │   ├── Vrm1Handler.ts        # VRM 1.0 support
    │   │   └── VroidGlbHandler.ts    # VRoid GLB support
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
| Skins/Models | 45 |
| Body Poses | 8 |
| Hand Gestures | 12 |
| Body Gestures | 7 |
| Body Motions | 14 |
| Motion Sequences | 10 |
| VRMA Animations | 14 bundled (+custom) |
| Backgrounds | 7 |
| Camera Presets | 5 |
| TTS Voices | 10 |

---

## Future Extensions

The architecture supports:

- **Idle animations:** ✅ Implemented (breathing, blinking, sway)
- **Gesture layer:** ✅ Implemented (wave, nod, bow, etc.)
- **Smooth transitions:** ✅ Implemented (easing + spring physics)
- **Walking animations:** ✅ Implemented (multiple walking styles)
- **Motion sequences:** ✅ Implemented (choreographed multi-step animations)
- **VRMA animation:** ✅ Implemented (retargetable VRM animations)
- **VRM version handlers:** ✅ Implemented (VRM 0.x, 1.0, VRoid GLB)
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
- VRoid Hub Collection (34 models): キャラクター紹介サイト管理人 via [VRoid Hub](https://hub.vroid.com/en/users/98739617)

### Third-Party Animation Credits

- **VRoid Project Motion Pack (7 animations):** pixiv Inc.'s VRoid Project - [BOOTH](https://booth.pm/ja/items/5512385)
  - Credit: "Character animation credits to pixiv Inc.'s VRoid Project"
- vrm-viewer animations (5): tk256ailab/vrm-viewer (MIT)
- sample-mocopi: tfuru/vrma-loader-sample (MIT)
- test.vrma: pixiv/three-vrm (MIT)
