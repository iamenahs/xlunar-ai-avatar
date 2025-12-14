/**
 * Avatar Configuration - Public Exports
 */

// Skins, backgrounds, camera presets
export {
  PRESET_SKINS,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  getSkinById,
  getBackgroundById,
  getCameraById,
  createCustomSkin,
  isLocalModel,
  isVrmModel,
  isGlbModel,
} from './skins';

export type {
  AvatarSkin,
  BackgroundPreset,
  CameraPreset,
  ModelSource,
} from './skins';

// Poses, gestures, motions
export {
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
} from './poses';

export type {
  PosePreset,
  HandGesture,
  BodyGesture,
  BodyMotion,
} from './poses';
