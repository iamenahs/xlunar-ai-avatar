/**
 * Avatar Configuration - Public Exports
 */

// Skins, backgrounds, camera presets
export {
  PRESET_SKINS,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  getSkinById,
  getSkinsGrouped,
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

// Motion sequences
export {
  MOTION_SEQUENCES,
  getSequenceById,
  getSequencesByCategory,
} from './sequences';

// VRMA animation presets
export {
  ANIMATION_PRESETS,
  getAnimationById,
  getAnimationsByCategory,
} from './animations';

export type {
  VrmaAnimationPreset,
} from './animations';

// Facial expression presets
export {
  EXPRESSION_PRESETS,
  EMOTION_PRESETS,
  MOUTH_PRESETS,
  EYE_PRESETS,
  VISEME_MAPPINGS,
  getExpressionById,
  getExpressionsByCategory,
  getVisemeForPhoneme,
  blendExpressions,
} from './expressions';

export type {
  ExpressionPreset,
  VisemeMapping,
} from './expressions';

