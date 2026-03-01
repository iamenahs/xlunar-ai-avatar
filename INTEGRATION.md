# Integration Guide

This guide explains how to integrate xlunar-ai-avatar into your own Next.js or React application.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [Facial Expressions](#facial-expressions)
- [Poses & Gestures](#poses--gestures)
- [VRMA Animations](#vrma-animations)
- [Motion Sequences](#motion-sequences)
- [Text-to-Speech](#text-to-speech)
- [Custom Styling](#custom-styling)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Method 1: Copy Library (Recommended)

Copy the avatar library folder into your project:

```bash
# From xlunar-ai-avatar root
cp -r src/lib/avatar /path/to/your-project/src/lib/

# If you need TTS support
cp -r src/lib/tts /path/to/your-project/src/lib/
```

Install required dependencies:

```bash
npm install @pixiv/three-vrm @pixiv/three-vrm-animation @react-three/fiber @react-three/drei three
```

Optional dependencies:

```bash
# For TTS
npm install openai

# TypeScript types
npm install -D @types/three
```

### Method 2: Git Submodule

```bash
git submodule add https://github.com/vaultx-technology/xlunar-ai-avatar.git lib/xlunar-avatar
```

Then import from `./lib/xlunar-avatar/src/lib/avatar`.

---

## Quick Start

### Minimal Example

```tsx
"use client";

import { useRef } from "react";
import { AvatarStage, AvatarSpeechScene } from "@/lib/avatar";

export default function AvatarDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <AvatarStage>
        <AvatarSpeechScene
          appearance={{ modelUrl: "/models/avatar.vrm" }}
          audioRef={audioRef}
        />
      </AvatarStage>
      <audio ref={audioRef} />
    </div>
  );
}
```

### Full Featured Example

```tsx
"use client";

import { useRef, useState } from "react";
import {
  AvatarStage,
  AvatarSpeechScene,
  getExpressionById,
  getPoseById,
  getHandGestureById,
  EMOTION_PRESETS,
  POSE_PRESETS,
} from "@/lib/avatar";

export default function FullDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [expression, setExpression] = useState("neutral");
  const [pose, setPose] = useState("idle");
  const [vrmaUrl, setVrmaUrl] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Avatar Viewport */}
      <div style={{ flex: 1 }}>
        <AvatarStage
          stage={{ backgroundColor: "#1a1a2e" }}
          camera={{ position: [0, 1.5, 2.5], fov: 35 }}
        >
          <AvatarSpeechScene
            appearance={{ modelUrl: "/models/avatar.vrm" }}
            audioRef={audioRef}
            expression={getExpressionById(expression)}
            pose={getPoseById(pose)}
            vrmaUrl={vrmaUrl}
            vrmaLoop={false}
          />
        </AvatarStage>
      </div>

      {/* Controls */}
      <div style={{ width: 300, padding: 20 }}>
        <h3>Expressions</h3>
        {EMOTION_PRESETS.map((e) => (
          <button key={e.id} onClick={() => setExpression(e.id)}>
            {e.name}
          </button>
        ))}

        <h3>Poses</h3>
        {POSE_PRESETS.map((p) => (
          <button key={p.id} onClick={() => setPose(p.id)}>
            {p.name}
          </button>
        ))}

        <h3>Animations</h3>
        <button onClick={() => setVrmaUrl("/animations/Greeting.vrma")}>
          Greeting
        </button>
        <button onClick={() => setVrmaUrl(null)}>Stop</button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
```

---

## Components

### AvatarStage

Container component that sets up the 3D canvas with lighting and camera.

```tsx
import { AvatarStage } from "@/lib/avatar";

<AvatarStage
  stage={{
    backgroundColor: "#0a0a0a",
    showGrid: false,
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 0.8,
    directionalLightPosition: [5, 5, 5],
    environmentPreset: "city",
  }}
  camera={{
    position: [0, 1.5, 3],
    fov: 35,
    controlsTarget: [0, 1, 0],
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
  }}
>
  {/* Avatar components go here */}
</AvatarStage>
```

### AvatarSpeechScene

Main avatar component with audio-driven lip sync.

```tsx
import { AvatarSpeechScene } from "@/lib/avatar";

<AvatarSpeechScene
  // Required
  appearance={{ modelUrl: "/path/to/model.vrm" }}
  audioRef={audioRef}

  // Transform
  transform={{
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
  }}

  // Mouth animation config
  mouthConfig={{
    threshold: 0.01,
    sensitivity: 2.0,
    smoothing: 0.3,
    maxOpen: 1.0,
  }}

  // Pose & gestures
  pose={posePreset}
  handGesture={handGesturePreset}
  bodyGesture={bodyGesturePreset}
  bodyMotion={bodyMotionPreset}

  // Expressions
  expression={expressionPreset}

  // VRMA animation
  vrmaUrl="/animations/animation.vrma"
  vrmaLoop={true}

  // Motion sequence
  motionSequence={sequenceDefinition}
  onSequenceComplete={() => console.log("Sequence done")}

  // Callbacks
  onLoad={(vrm) => console.log("VRM loaded", vrm)}
/>
```

### AvatarRenderer

Lower-level component for custom Three.js setups (bring your own Canvas).

```tsx
import { Canvas } from "@react-three/fiber";
import { AvatarRenderer } from "@/lib/avatar";

<Canvas>
  <ambientLight intensity={0.5} />
  <directionalLight position={[5, 5, 5]} />
  <AvatarRenderer
    appearance={{ modelUrl: "/models/avatar.vrm" }}
    amplitude={0.5}  // Manual mouth control (0-1)
    isPlaying={true}
    pose={pose}
    expression={expression}
  />
</Canvas>
```

---

## Facial Expressions

Control facial blend shapes using VRM's expressionManager.

### Available Presets

```tsx
import {
  EMOTION_PRESETS,   // 10 emotion expressions
  MOUTH_PRESETS,     // 6 mouth shapes
  EYE_PRESETS,       // 9 eye controls
  EXPRESSION_PRESETS, // All 25 combined
  getExpressionById,
  getExpressionsByCategory,
} from "@/lib/avatar";

// Get by ID
const happy = getExpressionById("happy");
const wink = getExpressionById("wink-left");

// Get by category
const emotions = getExpressionsByCategory("emotion");
const mouthShapes = getExpressionsByCategory("mouth");
const eyeControls = getExpressionsByCategory("eye");
```

### Expression List

| Category | ID | Name |
|----------|-----|------|
| emotion | neutral | Neutral |
| emotion | happy | Happy |
| emotion | very-happy | Very Happy |
| emotion | sad | Sad |
| emotion | angry | Angry |
| emotion | surprised | Surprised |
| emotion | relaxed | Relaxed |
| emotion | thinking | Thinking |
| emotion | shy | Shy |
| emotion | determined | Determined |
| mouth | mouth-closed | Closed |
| mouth | mouth-aa | Aa |
| mouth | mouth-ih | Ih |
| mouth | mouth-ou | Ou |
| mouth | mouth-ee | Ee |
| mouth | mouth-oh | Oh |
| eye | eyes-open | Open |
| eye | eyes-closed | Closed |
| eye | eyes-half | Half Closed |
| eye | wink-left | Wink Left |
| eye | wink-right | Wink Right |
| eye | look-up | Look Up |
| eye | look-down | Look Down |
| eye | look-left | Look Left |
| eye | look-right | Look Right |

### Custom Expressions

```tsx
import type { ExpressionPreset } from "@/lib/avatar";

const customExpression: ExpressionPreset = {
  id: "custom-smirk",
  name: "Smirk",
  category: "custom",
  values: {
    happy: 0.3,
    relaxed: 0.2,
    blinkLeft: 0.2,
  },
};

<AvatarSpeechScene expression={customExpression} />
```

### Programmatic Control

```tsx
import { createExpressionController } from "@/lib/avatar";

// In your component
const exprController = createExpressionController();

// Initialize with VRM (after load)
exprController.init(vrm);

// Set expression with smooth transition
exprController.setExpression(getExpressionById("happy"));

// Set individual values
exprController.setExpressionValue("happy", 0.8);
exprController.setExpressionValue("blink", 0.5);

// Blend multiple expressions
exprController.blendExpressions([
  { preset: happyPreset, weight: 0.6 },
  { preset: surprisedPreset, weight: 0.4 },
]);

// Update in animation loop
exprController.update(deltaTime);
```

---

## Poses & Gestures

### Available Presets

```tsx
import {
  POSE_PRESETS,      // 8 body poses
  HAND_GESTURES,     // 12 hand gestures
  BODY_GESTURES,     // 7 body gestures (animated)
  BODY_MOTIONS,      // 14 continuous motions
  getPoseById,
  getHandGestureById,
  getBodyGestureById,
  getBodyMotionById,
} from "@/lib/avatar";
```

### Body Poses

| ID | Name | Description |
|----|------|-------------|
| idle | Idle | Natural standing |
| relaxed | Relaxed | Casual stance |
| presenting | Presenting | Open arms |
| thinking | Thinking | Hand on chin |
| confident | Confident | Power pose |
| arms-crossed | Arms Crossed | Defensive |
| hands-on-hips | Hands on Hips | Assertive |
| attention | Attention | Formal |

### Hand Gestures

| ID | Name |
|----|------|
| open | Open Hands |
| peace-sign | Peace Sign |
| thumbs-up | Thumbs Up |
| pointing | Pointing |
| ok-sign | OK Sign |
| fist | Fist |
| wave | Wave |
| thinking | Thinking |
| heart | Heart |
| rock | Rock |
| pinch | Pinch |
| grab | Grab |

### Usage

```tsx
<AvatarSpeechScene
  pose={getPoseById("relaxed")}
  handGesture={getHandGestureById("peace-sign")}
  bodyGesture={getBodyGestureById("nod")}
  bodyMotion={getBodyMotionById("breathing")}
/>
```

---

## VRMA Animations

VRMA (VRM Animation) files provide full-body skeletal animations that automatically retarget to any VRM model.

### Playing Animations

```tsx
<AvatarSpeechScene
  vrmaUrl="/animations/Greeting.vrma"
  vrmaLoop={false}  // true for looping
/>
```

### Bundled Animations

| Animation | Source | License |
|-----------|--------|---------|
| ShowFullBody.vrma | VRoid Project | Credit Required |
| Greeting.vrma | VRoid Project | Credit Required |
| PeaceSign.vrma | VRoid Project | Credit Required |
| Shoot.vrma | VRoid Project | Credit Required |
| Spin.vrma | VRoid Project | Credit Required |
| ModelPose.vrma | VRoid Project | Credit Required |
| Squat.vrma | VRoid Project | Credit Required |
| goodbye_wave.vrma | vrm-viewer | MIT |
| angry_anim.vrma | vrm-viewer | MIT |
| clapping.vrma | vrm-viewer | MIT |
| jump.vrma | vrm-viewer | MIT |
| look_around.vrma | vrm-viewer | MIT |
| sample-mocopi.vrma | vrma-loader-sample | MIT |
| test.vrma | pixiv/three-vrm | MIT |

### Programmatic Control

```tsx
import { createVrmaPlayer } from "@/lib/avatar";

const player = createVrmaPlayer();
player.init(vrm);

// Load and play
await player.loadAnimation("/animations/Greeting.vrma");
player.play("/animations/Greeting.vrma", { loop: false });

// Control
player.pause();
player.resume();
player.stop();

// Check state
const isPlaying = player.getIsPlaying();
```

---

## Motion Sequences

Choreographed multi-step animations combining poses, gestures, and expressions.

```tsx
import { MOTION_SEQUENCES, getSequenceById } from "@/lib/avatar";

<AvatarSpeechScene
  motionSequence={getSequenceById("greeting-wave")}
  onSequenceComplete={() => console.log("Done!")}
/>
```

### Available Sequences

| Category | Sequences |
|----------|-----------|
| Emotion | happy-bounce, sad-sigh |
| Social | greeting-wave, farewell-wave |
| Thinking | pondering, confused-reaction |
| Reaction | surprised-gasp, celebration |
| Presentation | present-item, point-explain |

---

## Text-to-Speech

### Server Setup

Create an API route for TTS:

```tsx
// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { text, voice = "alloy" } = await request.json();

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: text,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return new NextResponse(buffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
```

### Client Usage

```tsx
// Utility function
async function speak(text: string, voice = "alloy"): Promise<string> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// In component
const handleSpeak = async () => {
  const url = await speak("Hello world!", "nova");
  audioRef.current!.src = url;
  await audioRef.current!.play();
};
```

### Available Voices

alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer

---

## Custom Styling

### Backgrounds

```tsx
import { BACKGROUND_PRESETS, getBackgroundById } from "@/lib/avatar";

<AvatarStage
  stage={{
    backgroundColor: "#1a1a2e",
    showGrid: false,
    environmentPreset: "sunset", // HDR environment
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 0.8,
  }}
>
```

### Camera Presets

```tsx
import { CAMERA_PRESETS, getCameraById } from "@/lib/avatar";

const closeup = getCameraById("close-up");

<AvatarStage
  camera={{
    position: closeup.position,
    fov: closeup.fov,
    controlsTarget: closeup.target,
  }}
>
```

---

## Advanced Usage

### Direct VRM Access

```tsx
const handleLoad = (vrm: VRM) => {
  // Access expression manager
  vrm.expressionManager?.setValue("happy", 0.8);

  // Access bones
  const head = vrm.humanoid?.getNormalizedBoneNode("head");

  // Access scene
  vrm.scene.traverse((obj) => {
    // Custom material modifications
  });
};

<AvatarSpeechScene onLoad={handleLoad} />
```

### Custom Animation Layers

```tsx
import { AnimationController, createAnimationController } from "@/lib/avatar";

const controller = createAnimationController();
controller.init(vrm);

// Disable specific layers
controller.setLayerEnabled("idle-body", false);

// Update manually
controller.update(deltaTime, amplitude, isPlaying);
```

### Easing Functions

```tsx
import {
  easeInOutQuad,
  smoothDamp,
  organicOscillation,
  breathingCurve,
} from "@/lib/avatar";

// Use in custom animations
const value = easeInOutQuad(progress);
const breathing = breathingCurve(time, 4); // 4 second cycle
```

---

## API Reference

### Main Exports

```tsx
// Components
export { AvatarStage, AvatarRenderer, AvatarSpeechScene } from "@/lib/avatar";

// Expression System
export {
  EXPRESSION_PRESETS,
  EMOTION_PRESETS,
  MOUTH_PRESETS,
  EYE_PRESETS,
  getExpressionById,
  createExpressionController,
} from "@/lib/avatar";

// Poses
export {
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  getPoseById,
  getHandGestureById,
} from "@/lib/avatar";

// Animations
export {
  ANIMATION_PRESETS,
  getAnimationById,
  createVrmaPlayer,
} from "@/lib/avatar";

// Sequences
export {
  MOTION_SEQUENCES,
  getSequenceById,
} from "@/lib/avatar";

// Scene
export {
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  PRESET_SKINS,
} from "@/lib/avatar";

// Types
export type {
  ExpressionPreset,
  PosePreset,
  VrmaAnimationPreset,
  AvatarSpeechSceneProps,
} from "@/lib/avatar";
```

---

## Troubleshooting

### Model Not Loading

- Ensure the model URL is correct and accessible
- Check browser console for CORS errors
- VRM files must be served with correct MIME type

### Expressions Not Working

- Not all VRM models have all expressions
- Check model's available expressions with `vrm.expressionManager?.expressions`
- Use fallback expressions if specific ones unavailable

### Audio Not Playing

- Audio autoplay is blocked by browsers until user interaction
- Ensure audioRef is properly connected
- Check that audio source URL is valid

### Performance Issues

- Use lower-poly models for better performance
- Disable unnecessary animation layers
- Use `React.memo` for static UI components
- Consider using `AvatarRenderer` directly for more control

### TypeScript Errors

Ensure you have the proper types installed:

```bash
npm install -D @types/three
```

---

## Support

- [GitHub Issues](https://github.com/vaultx-technology/xlunar-ai-avatar/issues)
- [Live Demo](https://xlunar-ai-avatar.vercel.app/)
- [VRM Documentation](https://vrm.dev/en/)
