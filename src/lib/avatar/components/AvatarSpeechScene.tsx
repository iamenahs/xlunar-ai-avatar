"use client";

/**
 * AvatarSpeechScene Component
 * Combines AvatarRenderer with audio analysis for speech-driven animation
 * This is the main component for speech renderer use case
 */

import React, { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { VRM } from "@pixiv/three-vrm";

import { AvatarRenderer } from "./AvatarRenderer";
import { useAudioEnergy } from "../hooks/useAudioAnalyser";
import type { AvatarTransform, AppearanceConfig, MouthAnimationConfig } from "../types";
import type { PosePreset, HandGesture, BodyGesture, BodyMotion } from "../config/poses";

export interface AvatarSpeechSceneProps {
  /** Model appearance config */
  appearance: AppearanceConfig;
  /** Avatar transform */
  transform?: AvatarTransform;
  /** Reference to audio element for amplitude analysis */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** Mouth animation config */
  mouthConfig?: MouthAnimationConfig;
  /** Body pose preset */
  pose?: PosePreset | null;
  /** Hand gesture */
  handGesture?: HandGesture | null;
  /** Body gesture (animated) */
  bodyGesture?: BodyGesture | null;
  /** Body motion (continuous) */
  bodyMotion?: BodyMotion | null;
  /** Callback when VRM is loaded */
  onLoad?: (vrm: VRM) => void;
}

export function AvatarSpeechScene({
  appearance,
  transform,
  audioRef,
  mouthConfig,
  pose,
  handGesture,
  bodyGesture,
  bodyMotion,
  onLoad,
}: AvatarSpeechSceneProps) {
  const { ensureGraph, getEnergy } = useAudioEnergy(audioRef);
  const amplitudeRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Initialize audio graph on user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        await ensureGraph();
      } catch {
        // Will retry on next interaction
      }
    };

    // Try to initialize on mount
    initAudio();
  }, [ensureGraph]);

  // Track audio playback state and amplitude
  useFrame(() => {
    const audio = audioRef.current;
    isPlayingRef.current = !!audio && !audio.paused && !audio.ended;
    amplitudeRef.current = isPlayingRef.current ? getEnergy() : 0;
  });

  // Re-initialize audio graph when audio element is used
  const handleLoad = useCallback(
    async (vrm: VRM) => {
      await ensureGraph();
      onLoad?.(vrm);
    },
    [ensureGraph, onLoad]
  );

  return (
    <AvatarRendererWithAmplitude
      appearance={appearance}
      transform={transform}
      mouthConfig={mouthConfig}
      pose={pose}
      handGesture={handGesture}
      bodyGesture={bodyGesture}
      bodyMotion={bodyMotion}
      onLoad={handleLoad}
      amplitudeRef={amplitudeRef}
      isPlayingRef={isPlayingRef}
    />
  );
}

/**
 * Inner component that reads from refs in useFrame
 */
function AvatarRendererWithAmplitude({
  appearance,
  transform,
  mouthConfig,
  pose,
  handGesture,
  bodyGesture,
  bodyMotion,
  onLoad,
  amplitudeRef,
  isPlayingRef,
}: {
  appearance: AppearanceConfig;
  transform?: AvatarTransform;
  mouthConfig?: MouthAnimationConfig;
  pose?: PosePreset | null;
  handGesture?: HandGesture | null;
  bodyGesture?: BodyGesture | null;
  bodyMotion?: BodyMotion | null;
  onLoad?: (vrm: VRM) => void;
  amplitudeRef: React.RefObject<number>;
  isPlayingRef: React.RefObject<boolean>;
}) {
  const [state, setState] = React.useState({ amplitude: 0, isPlaying: false });

  useFrame(() => {
    // Only update state if values changed significantly
    const newAmplitude = amplitudeRef.current ?? 0;
    const newIsPlaying = isPlayingRef.current ?? false;

    if (
      Math.abs(newAmplitude - state.amplitude) > 0.01 ||
      newIsPlaying !== state.isPlaying
    ) {
      setState({ amplitude: newAmplitude, isPlaying: newIsPlaying });
    }
  });

  return (
    <AvatarRenderer
      appearance={appearance}
      transform={transform}
      mouthConfig={mouthConfig}
      pose={pose}
      handGesture={handGesture}
      bodyGesture={bodyGesture}
      bodyMotion={bodyMotion}
      onLoad={onLoad}
      amplitude={state.amplitude}
      isPlaying={state.isPlaying}
    />
  );
}
