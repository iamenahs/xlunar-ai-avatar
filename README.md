# xlunar-ai-avatar

An MVP-quality, open-source avatar "speech renderer" platform built with Next.js, React Three Fiber, and VRM.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![VRM](https://img.shields.io/badge/VRM-1.0%20%7C%200.x-green)

## Live Demo

**https://xlunar-ai-avatar.vercel.app/**

---

---

## Features

| Feature | Description |
|---------|-------------|
| **45 Avatar Models** | 34 VRoid Hub characters + VRM samples + custom URL support |
| **14 VRMA Animations** | 7 from VRoid Project + 5 from vrm-viewer + 2 others |
| **Full Pose Control** | 8 poses, 12 hand gestures, 7 body gestures, 14 motions |
| **10 Motion Sequences** | Choreographed multi-step animations |
| **TTS Integration** | OpenAI gpt-4o-mini-tts with 10 voices |
| **Lip Sync** | Real-time mouth animation from audio amplitude |
| **Scene Control** | 7 backgrounds, 5 camera presets |
| **VRM Universal** | Supports VRM 0.x, 1.0, and VRoid GLB formats |

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Integration

### Basic Usage

```tsx
import { AvatarStage, AvatarSpeechScene } from "@/lib/avatar";

function MyApp() {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  return (
    <>
      <AvatarStage>
        <AvatarSpeechScene
          appearance={{ modelUrl: "/models/Hinase.vrm" }}
          audioRef={audioRef}
        />
      </AvatarStage>
      <audio ref={audioRef} />
    </>
  );
}
```

### With VRMA Animation

```tsx
<AvatarSpeechScene
  appearance={{ modelUrl: "/models/Hinase.vrm" }}
  audioRef={audioRef}
  vrmaUrl="/animations/Greeting.vrma"
  vrmaLoop={false}
/>
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

**Full documentation:** [integration-guide.md](./integration-guide.md)

---

## Available Models

### VRoid Hub Collection (34 models)

All models from [VRoid Hub](https://hub.vroid.com/en/users/98739617):

| Row 1 | Row 2 | Row 3 | Row 4 |
|-------|-------|-------|-------|
| Hinase | Yukina | Rii (Uniform) | Rii |
| Uina | Ruika | Yukana | Yue |
| Moyu | Noan | Yuduki | Hagumi |
| Rise | Kirina | Konon | Meimi |
| Rizu | Hinari | Kanade | Saori |
| Aisa | Yukako | Memi | Nona |
| Eru | Momoa | Ayasa | Kanami |
| Yuyu | Miyuka | Rena | Irori |
| Kizuna | Yumeka | | |

### Sample Models

| Model | Format | License |
|-------|--------|---------|
| VRM1 Sample Avatar | VRM 1.0 | MIT (pixiv/three-vrm) |
| Seed-san | VRM 1.0 | CC0 (VRM Consortium) |
| Avatar Orion | VRM | CC0 (madjin/vrm-samples) |
| Cryptovoxels | VRM | CC0 (madjin/vrm-samples) |
| VRoid Samples A-D | GLB | CC0 (VRoid Studio) |

---

## VRMA Animations

### VRoid Project Motion Pack (7)

From [BOOTH](https://booth.pm/ja/items/5512385) by pixiv Inc. - **Free, requires credit**

| Animation | Description |
|-----------|-------------|
| Show Full Body | Full body presentation |
| Greeting | Greeting bow |
| Peace Sign | V-sign pose |
| Shoot | Shooting gesture |
| Spin | Spinning around |
| Model Pose | Fashion model pose |
| Squat | Squat exercise |

**Credit:** "Character animation credits to pixiv Inc.'s VRoid Project"

### Community Animations (7)

| Animation | Source | License |
|-----------|--------|---------|
| Goodbye Wave | vrm-viewer | MIT |
| Angry | vrm-viewer | MIT |
| Clapping | vrm-viewer | MIT |
| Jump | vrm-viewer | MIT |
| Look Around | vrm-viewer | MIT |
| Mocopi Idle | vrma-loader-sample | MIT |
| Test Animation | pixiv/three-vrm | MIT |

### Adding Custom VRMA

1. Place `.vrma` file in `public/animations/`
2. Add entry to `src/lib/avatar/config/animations.ts`
3. Animation appears in VRMA tab automatically

---

## Customization Summary

| Category | Count |
|----------|-------|
| Avatar Models | 45 |
| VRMA Animations | 14 (+custom) |
| Body Poses | 8 |
| Hand Gestures | 12 |
| Body Gestures | 7 |
| Body Motions | 14 |
| Motion Sequences | 10 |
| Backgrounds | 7 |
| Camera Presets | 5 |
| TTS Voices | 10 |

---

## Architecture

```
src/lib/avatar/
├── animation/
│   ├── easing.ts           # 20+ easing functions
│   ├── VrmaPlayer.ts       # VRMA animation system
│   ├── PoseController.ts   # Pose/gesture control
│   └── MotionSequence.ts   # Choreographed sequences
├── components/
│   ├── AvatarStage.tsx     # 3D canvas container
│   └── AvatarSpeechScene.tsx # Main avatar component
├── config/
│   ├── skins.ts            # 45 model presets
│   ├── poses.ts            # Poses, gestures, motions
│   ├── animations.ts       # VRMA animation presets
│   └── sequences.ts        # Motion sequences
└── loaders/
    ├── Vrm0Handler.ts      # VRM 0.x support
    ├── Vrm1Handler.ts      # VRM 1.0 support
    └── VroidGlbHandler.ts  # VRoid GLB support
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_TTS_MODEL` | TTS model | `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | Default voice | `alloy` |

**Available voices:** alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer

---

## License

MIT License - Copyright (c) 2024 [VaultX.technology](https://vaultx.technology)

### Credits

**Models:**
- VRoid Hub Collection (34): キャラクター紹介サイト管理人 via [VRoid Hub](https://hub.vroid.com/en/users/98739617)
- VRM Samples: pixiv/three-vrm (MIT), VRM Consortium (CC0), madjin/vrm-samples (CC0)
- VRoid Beta Samples: VRoid Studio by pixiv (CC0)

**Animations:**
- VRoid Project Motion Pack (7): pixiv Inc.'s VRoid Project - [BOOTH](https://booth.pm/ja/items/5512385)
- vrm-viewer (5): tk256ailab/vrm-viewer (MIT)
- sample-mocopi: tfuru/vrma-loader-sample (MIT)
- test.vrma: pixiv/three-vrm (MIT)
