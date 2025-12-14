/**
 * XLunar AI Avatar - Type Definitions
 * Core types for the avatar speech renderer platform
 */

import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';

// ============================================================================
// Avatar Configuration
// ============================================================================

/**
 * Transform configuration for the avatar
 */
export interface AvatarTransform {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

/**
 * Appearance configuration for avatar customization
 * Designed for future skin/material variant support
 */
export interface AppearanceConfig {
  modelUrl: string;
  skinId?: string;
  variant?: string;
  materialOverrides?: Record<string, MaterialOverride>;
}

export interface MaterialOverride {
  color?: string;
  texture?: string;
  metalness?: number;
  roughness?: number;
}

/**
 * Stage/scene configuration
 */
export interface StageConfig {
  backgroundColor?: string;
  ambientLightIntensity?: number;
  ambientLightColor?: string;
  directionalLightIntensity?: number;
  directionalLightPosition?: [number, number, number];
  directionalLightColor?: string;
  showGrid?: boolean;
  environmentPreset?: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
}

/**
 * Camera configuration
 */
export interface CameraConfig {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  enableControls?: boolean;
  controlsTarget?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
}

// ============================================================================
// Animation System
// ============================================================================

/**
 * Animation layer interface - base for all animation contributors
 */
export interface AnimationLayer {
  name: string;
  priority: number;
  enabled: boolean;
  
  /** Initialize the layer with VRM instance */
  init(vrm: VRM): void;
  
  /** Update animation state - called every frame */
  update(delta: number, context: AnimationContext): void;
  
  /** Clean up resources */
  dispose(): void;
}

/**
 * Context passed to animation layers each frame
 */
export interface AnimationContext {
  /** Current audio amplitude (0-1) */
  amplitude: number;
  
  /** Time since last frame */
  delta: number;
  
  /** Total elapsed time */
  elapsed: number;
  
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Optional gesture trigger */
  gesture?: string;
}

/**
 * Mouth animation configuration
 */
export interface MouthAnimationConfig {
  /** Morph target name for mouth open (VRM standard: "aa") */
  morphTargetName?: string;
  
  /** Fallback to jaw bone if morph target not found */
  useJawBoneFallback?: boolean;
  
  /** Smoothing factor for amplitude changes (0-1, higher = smoother) */
  smoothing?: number;
  
  /** Minimum amplitude threshold to trigger animation */
  threshold?: number;
  
  /** Maximum mouth open amount (0-1) */
  maxOpen?: number;
  
  /** Amplitude multiplier */
  sensitivity?: number;
}

// ============================================================================
// Audio System
// ============================================================================

/**
 * Audio analyser state
 */
export interface AudioAnalyserState {
  amplitude: number;
  isPlaying: boolean;
  isAnalyzing: boolean;
}

/**
 * Audio player configuration
 */
export interface AudioPlayerConfig {
  /** FFT size for frequency analysis */
  fftSize?: number;
  
  /** Smoothing time constant for amplitude */
  smoothingTimeConstant?: number;
}

// ============================================================================
// TTS System
// ============================================================================

/**
 * TTS request body
 */
export interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav';
  speed?: number;
}

/**
 * TTS provider interface - implement for each TTS service
 */
export interface TTSProvider {
  name: string;
  
  /** Generate speech audio from text */
  generateSpeech(request: TTSRequest): Promise<ArrayBuffer>;
  
  /** Check if provider is configured and available */
  isAvailable(): boolean;
  
  /** List available voices */
  getVoices?(): Promise<string[]>;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Main Avatar component props
 */
export interface AvatarProps {
  /** URL to VRM/GLB model */
  modelUrl: string;
  
  /** Transform overrides */
  transform?: AvatarTransform;
  
  /** Appearance configuration */
  appearance?: Partial<AppearanceConfig>;
  
  /** Animation configuration */
  mouthConfig?: MouthAnimationConfig;
  
  /** Audio amplitude input (0-1) - for external audio control */
  amplitude?: number;
  
  /** Whether animation is active */
  isAnimating?: boolean;
  
  /** Callback when VRM is loaded */
  onLoad?: (vrm: VRM) => void;
  
  /** Callback on load error */
  onError?: (error: Error) => void;
}

/**
 * Avatar Stage component props
 */
export interface AvatarStageProps {
  children: React.ReactNode;
  stage?: StageConfig;
  camera?: CameraConfig;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Complete Avatar Scene props (Stage + Avatar combined)
 */
export interface AvatarSceneProps extends Omit<AvatarProps, 'amplitude' | 'isAnimating'> {
  stage?: StageConfig;
  camera?: CameraConfig;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseAudioAnalyserReturn {
  amplitude: number;
  isPlaying: boolean;
  analyzeAudio: (audioElement: HTMLAudioElement) => void;
  stopAnalysis: () => void;
}

export interface UseAvatarSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isSpeaking: boolean;
  amplitude: number;
  error: string | null;
}

