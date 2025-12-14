/**
 * XLunar AI Avatar - Main Entry Point
 * 
 * This module provides a 3D avatar speech renderer platform
 * that can be embedded into other Next.js applications.
 * 
 * @example Basic usage with speech scene:
 * ```tsx
 * import { AvatarStage, AvatarSpeechScene } from "@/lib/avatar";
 * 
 * function MyApp() {
 *   const audioRef = useRef<HTMLAudioElement>(null);
 *   
 *   return (
 *     <AvatarStage>
 *       <AvatarSpeechScene
 *         appearance={{ modelUrl: "/avatars/my-avatar.vrm" }}
 *         audioRef={audioRef}
 *       />
 *     </AvatarStage>
 *   );
 * }
 * ```
 * 
 * @example Using just the renderer (bring your own Canvas):
 * ```tsx
 * import { Canvas } from "@react-three/fiber";
 * import { AvatarRenderer } from "@/lib/avatar";
 * 
 * function MyApp() {
 *   return (
 *     <Canvas>
 *       <ambientLight />
 *       <AvatarRenderer
 *         appearance={{ modelUrl: "/avatars/my-avatar.vrm" }}
 *         amplitude={0.5}
 *         isPlaying={true}
 *       />
 *     </Canvas>
 *   );
 * }
 * ```
 */

// Components
export {
  AvatarStage,
  AvatarRenderer,
  Avatar,
  AvatarSpeechScene,
} from "./components";

export type {
  AvatarStageProps,
  AvatarRendererProps,
  AvatarSpeechSceneProps,
} from "./components";

// Hooks
export { useAudioAnalyser, useAudioEnergy } from "./hooks";
export type { UseAudioAnalyserReturn } from "./hooks";

// Types
export type {
  AvatarTransform,
  AppearanceConfig,
  MaterialOverride,
  StageConfig,
  CameraConfig,
  AnimationLayer,
  AnimationContext,
  MouthAnimationConfig,
  AudioAnalyserState,
  AudioPlayerConfig,
  TTSRequest,
  TTSProvider,
  AvatarProps,
  AvatarStageProps as StageProps,
  AvatarSceneProps,
  UseAvatarSpeechReturn,
} from "./types";

// Animation system
export {
  AnimationController,
  createAnimationController,
  getAnimationController,
} from "./animation/AnimationController";

export {
  SpeechMouthLayer,
  IdleBodyLayer,
  GestureLayer,
} from "./animation/AnimationLayer";

// Configuration and presets
export {
  // Skins, backgrounds, cameras
  PRESET_SKINS,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  getSkinById,
  getBackgroundById,
  getCameraById,
  createCustomSkin,
  // Poses, gestures, motions
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  CUSTOMIZATION_OPTIONS,
  getPoseById,
  getHandGestureById,
  getBodyGestureById,
  getBodyMotionById,
  applyPoseToVRM,
  degToRad,
} from "./config";

export type {
  AvatarSkin,
  BackgroundPreset,
  CameraPreset,
  PosePreset,
  HandGesture,
  BodyGesture,
  BodyMotion,
} from "./config";

// Pose Controller
export {
  PoseController,
  createPoseController,
} from "./animation/PoseController";

// Easing utilities (for custom animations)
export {
  // Basic easing functions
  linear,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeOutBounce,
  // Spring physics
  updateSpring,
  isSpringSettled,
  SPRING_PRESETS,
  // Smoothing utilities
  smoothDamp,
  exponentialSmooth,
  // Interpolation
  interpolate,
  interpolateVec3,
  // Oscillation
  organicOscillation,
  breathingCurve,
  headMicroMovement,
  // Pose transitions
  evaluatePoseTransition,
} from "./animation/easing";

export type {
  EasingFunction,
  SpringConfig,
  SpringState,
  SmoothDampState,
  PoseTransition,
} from "./animation/easing";

