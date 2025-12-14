/**
 * Pose, Gesture, and Motion Configuration
 * 
 * Defines all possible customization options for avatar poses, hand gestures,
 * body gestures, and body motions.
 */

import type { VRM } from "@pixiv/three-vrm";

// ============================================================================
// POSE PRESETS
// ============================================================================

/**
 * Body pose preset configuration
 * Defines the rotation of major bones for static poses
 */
export interface PosePreset {
  id: string;
  name: string;
  description: string;
  /** Bone rotations in Euler angles (degrees) */
  bones: {
    spine?: [number, number, number];
    chest?: [number, number, number];
    neck?: [number, number, number];
    head?: [number, number, number];
    leftUpperArm?: [number, number, number];
    leftLowerArm?: [number, number, number];
    rightUpperArm?: [number, number, number];
    rightLowerArm?: [number, number, number];
    leftUpperLeg?: [number, number, number];
    leftLowerLeg?: [number, number, number];
    rightUpperLeg?: [number, number, number];
    rightLowerLeg?: [number, number, number];
  };
}

export const POSE_PRESETS: PosePreset[] = [
  {
    id: "tpose",
    name: "T-Pose",
    description: "Default T-pose with arms extended horizontally",
    bones: {
      leftUpperArm: [0, 0, -90],
      rightUpperArm: [0, 0, 90],
      leftLowerArm: [0, 0, 0],
      rightLowerArm: [0, 0, 0],
    },
  },
  {
    id: "apose",
    name: "A-Pose",
    description: "Relaxed A-pose with arms at 45 degrees",
    bones: {
      leftUpperArm: [0, 0, -45],
      rightUpperArm: [0, 0, 45],
      leftLowerArm: [0, 0, 0],
      rightLowerArm: [0, 0, 0],
    },
  },
  {
    id: "relaxed",
    name: "Relaxed Standing",
    description: "Natural standing pose with arms relaxed at sides",
    bones: {
      spine: [2, 0, 0],
      leftUpperArm: [20, 0, -70],
      rightUpperArm: [20, 0, 70],
      leftLowerArm: [0, 0, -15],
      rightLowerArm: [0, 0, 15],
    },
  },
  {
    id: "handsOnHips",
    name: "Hands on Hips",
    description: "Confident pose with hands on hips",
    bones: {
      spine: [0, 0, 0],
      leftUpperArm: [25, 40, -60],
      rightUpperArm: [25, -40, 60],
      leftLowerArm: [0, 0, -90],
      rightLowerArm: [0, 0, 90],
    },
  },
  {
    id: "armsCrossed",
    name: "Arms Crossed",
    description: "Arms crossed in front of chest",
    bones: {
      spine: [0, 0, 0],
      leftUpperArm: [30, 50, -70],
      rightUpperArm: [30, -50, 70],
      leftLowerArm: [0, 30, -100],
      rightLowerArm: [0, -30, 100],
    },
  },
  {
    id: "thinking",
    name: "Thinking",
    description: "Hand on chin thinking pose",
    bones: {
      head: [5, -10, 0],
      leftUpperArm: [15, 0, -25],
      rightUpperArm: [60, -30, 70],
      leftLowerArm: [-5, 0, -15],
      rightLowerArm: [0, -20, 120],
    },
  },
  {
    id: "presenting",
    name: "Presenting",
    description: "One arm extended presenting gesture",
    bones: {
      spine: [0, -5, 0],
      leftUpperArm: [15, 0, -25],
      rightUpperArm: [0, 0, 60],
      leftLowerArm: [-5, 0, -15],
      rightLowerArm: [-15, 0, 15],
    },
  },
  {
    id: "waving",
    name: "Waving",
    description: "Arm raised in waving position",
    bones: {
      rightUpperArm: [-30, 0, 120],
      rightLowerArm: [-15, 0, 30],
    },
  },
];

// ============================================================================
// HAND GESTURE PRESETS
// ============================================================================

/**
 * Hand gesture configuration
 * Defines finger positions for VRM hand poses
 */
export interface HandGesture {
  id: string;
  name: string;
  description: string;
  /** Which hand (left, right, or both) */
  hand: "left" | "right" | "both";
  /** Finger curl values (0 = open, 1 = fully curled) */
  fingers: {
    thumb?: number;
    index?: number;
    middle?: number;
    ring?: number;
    pinky?: number;
  };
  /** Finger spread (for supported models) */
  spread?: number;
}

export const HAND_GESTURES: HandGesture[] = [
  {
    id: "open",
    name: "Open Hand",
    description: "All fingers extended",
    hand: "both",
    fingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
  },
  {
    id: "fist",
    name: "Fist",
    description: "All fingers closed",
    hand: "both",
    fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
  },
  {
    id: "pointing",
    name: "Pointing",
    description: "Index finger extended, others closed",
    hand: "right",
    fingers: { thumb: 0.5, index: 0, middle: 1, ring: 1, pinky: 1 },
  },
  {
    id: "peace",
    name: "Peace Sign",
    description: "Index and middle fingers extended (V)",
    hand: "right",
    fingers: { thumb: 0.8, index: 0, middle: 0, ring: 1, pinky: 1 },
  },
  {
    id: "thumbsUp",
    name: "Thumbs Up",
    description: "Thumb extended, others closed",
    hand: "right",
    fingers: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 },
  },
  {
    id: "thumbsDown",
    name: "Thumbs Down",
    description: "Thumb down, others closed",
    hand: "right",
    fingers: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 },
  },
  {
    id: "ok",
    name: "OK Sign",
    description: "Thumb and index forming circle",
    hand: "right",
    fingers: { thumb: 0.7, index: 0.7, middle: 0, ring: 0, pinky: 0 },
  },
  {
    id: "rock",
    name: "Rock Sign",
    description: "Index and pinky extended (metal horns)",
    hand: "right",
    fingers: { thumb: 0.5, index: 0, middle: 1, ring: 1, pinky: 0 },
  },
  {
    id: "wave",
    name: "Wave",
    description: "Hand open ready for waving",
    hand: "right",
    fingers: { thumb: 0.2, index: 0, middle: 0, ring: 0, pinky: 0 },
    spread: 0.3,
  },
  {
    id: "grab",
    name: "Grab",
    description: "Partially closed grabbing gesture",
    hand: "both",
    fingers: { thumb: 0.5, index: 0.6, middle: 0.6, ring: 0.7, pinky: 0.7 },
  },
  {
    id: "pinch",
    name: "Pinch",
    description: "Thumb and index pinching",
    hand: "right",
    fingers: { thumb: 0.8, index: 0.8, middle: 0.3, ring: 0.3, pinky: 0.3 },
  },
  {
    id: "relaxed",
    name: "Relaxed",
    description: "Natural relaxed hand position",
    hand: "both",
    fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
  },
];

// ============================================================================
// BODY GESTURE PRESETS (Animated)
// ============================================================================

/**
 * Body gesture configuration
 * Defines animated gestures with keyframes
 */
export interface BodyGesture {
  id: string;
  name: string;
  description: string;
  /** Duration in milliseconds */
  duration: number;
  /** Whether the gesture loops */
  loop: boolean;
  /** Keyframes for the animation */
  keyframes: {
    time: number; // 0 to 1
    bones: PosePreset["bones"];
  }[];
}

export const BODY_GESTURES: BodyGesture[] = [
  {
    id: "nod",
    name: "Nod",
    description: "Head nodding yes",
    duration: 600,
    loop: false,
    keyframes: [
      { time: 0, bones: { head: [0, 0, 0] } },
      { time: 0.3, bones: { head: [15, 0, 0] } },
      { time: 0.6, bones: { head: [-5, 0, 0] } },
      { time: 1, bones: { head: [0, 0, 0] } },
    ],
  },
  {
    id: "shake",
    name: "Head Shake",
    description: "Head shaking no",
    duration: 800,
    loop: false,
    keyframes: [
      { time: 0, bones: { head: [0, 0, 0] } },
      { time: 0.25, bones: { head: [0, 20, 0] } },
      { time: 0.5, bones: { head: [0, -20, 0] } },
      { time: 0.75, bones: { head: [0, 10, 0] } },
      { time: 1, bones: { head: [0, 0, 0] } },
    ],
  },
  {
    id: "wave",
    name: "Wave Hello",
    description: "Waving hand gesture",
    duration: 1200,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          rightUpperArm: [0, 0, 90],
          rightLowerArm: [0, 0, 0],
        },
      },
      {
        time: 0.2,
        bones: {
          rightUpperArm: [-30, 0, 120],
          rightLowerArm: [-15, 0, 30],
        },
      },
      {
        time: 0.4,
        bones: {
          rightUpperArm: [-30, 0, 120],
          rightLowerArm: [-15, 30, 30],
        },
      },
      {
        time: 0.6,
        bones: {
          rightUpperArm: [-30, 0, 120],
          rightLowerArm: [-15, -30, 30],
        },
      },
      {
        time: 0.8,
        bones: {
          rightUpperArm: [-30, 0, 120],
          rightLowerArm: [-15, 20, 30],
        },
      },
      {
        time: 1,
        bones: {
          rightUpperArm: [0, 0, 90],
          rightLowerArm: [0, 0, 0],
        },
      },
    ],
  },
  {
    id: "shrug",
    name: "Shrug",
    description: "Shoulder shrug gesture",
    duration: 800,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [0, 0, -45],
          rightUpperArm: [0, 0, 45],
        },
      },
      {
        time: 0.3,
        bones: {
          leftUpperArm: [-20, 0, -60],
          rightUpperArm: [-20, 0, 60],
          head: [0, 0, 5],
        },
      },
      {
        time: 0.7,
        bones: {
          leftUpperArm: [-20, 0, -60],
          rightUpperArm: [-20, 0, 60],
          head: [0, 0, 5],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [0, 0, -45],
          rightUpperArm: [0, 0, 45],
          head: [0, 0, 0],
        },
      },
    ],
  },
  {
    id: "bow",
    name: "Bow",
    description: "Bowing gesture",
    duration: 1500,
    loop: false,
    keyframes: [
      { time: 0, bones: { spine: [0, 0, 0], head: [0, 0, 0] } },
      { time: 0.3, bones: { spine: [30, 0, 0], head: [15, 0, 0] } },
      { time: 0.7, bones: { spine: [30, 0, 0], head: [15, 0, 0] } },
      { time: 1, bones: { spine: [0, 0, 0], head: [0, 0, 0] } },
    ],
  },
  {
    id: "clap",
    name: "Clap",
    description: "Clapping hands",
    duration: 600,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [30, 40, -50],
          rightUpperArm: [30, -40, 50],
          leftLowerArm: [0, 20, -70],
          rightLowerArm: [0, -20, 70],
        },
      },
      {
        time: 0.5,
        bones: {
          leftUpperArm: [30, 40, -50],
          rightUpperArm: [30, -40, 50],
          leftLowerArm: [0, 40, -90],
          rightLowerArm: [0, -40, 90],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [30, 40, -50],
          rightUpperArm: [30, -40, 50],
          leftLowerArm: [0, 20, -70],
          rightLowerArm: [0, -20, 70],
        },
      },
    ],
  },
  {
    id: "celebrate",
    name: "Celebrate",
    description: "Arms up celebration",
    duration: 1000,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [0, 0, -45],
          rightUpperArm: [0, 0, 45],
        },
      },
      {
        time: 0.4,
        bones: {
          leftUpperArm: [-60, 0, -150],
          rightUpperArm: [-60, 0, 150],
          leftLowerArm: [0, 0, -30],
          rightLowerArm: [0, 0, 30],
        },
      },
      {
        time: 0.7,
        bones: {
          leftUpperArm: [-60, 10, -150],
          rightUpperArm: [-60, -10, 150],
          leftLowerArm: [0, 0, -30],
          rightLowerArm: [0, 0, 30],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [0, 0, -45],
          rightUpperArm: [0, 0, 45],
        },
      },
    ],
  },
];

// ============================================================================
// BODY MOTION PRESETS (Continuous)
// ============================================================================

/**
 * Body motion configuration
 * Defines continuous/looping body animations
 */
export interface BodyMotion {
  id: string;
  name: string;
  description: string;
  /** Animation speed multiplier */
  speed: number;
  /** Intensity (0-1) */
  intensity: number;
  /** Motion type for the animation system */
  type: "breathing" | "sway" | "bounce" | "float" | "walk" | "custom";
  /** Custom parameters */
  params?: {
    /** Bones affected */
    bones?: string[];
    /** Amplitude in degrees */
    amplitude?: number;
    /** Phase offset */
    phase?: number;
    /** Stride length for walk (affects leg amplitude) */
    strideLength?: number;
    /** Arm swing amount for walk */
    armSwing?: number;
  };
}

export const BODY_MOTIONS: BodyMotion[] = [
  {
    id: "none",
    name: "None",
    description: "No body motion",
    speed: 0,
    intensity: 0,
    type: "custom",
  },
  {
    id: "breathingSubtle",
    name: "Subtle Breathing",
    description: "Very light breathing motion",
    speed: 1,
    intensity: 0.3,
    type: "breathing",
    params: {
      bones: ["spine", "chest"],
      amplitude: 1,
    },
  },
  {
    id: "breathingNormal",
    name: "Normal Breathing",
    description: "Natural breathing motion",
    speed: 1,
    intensity: 0.6,
    type: "breathing",
    params: {
      bones: ["spine", "chest"],
      amplitude: 2,
    },
  },
  {
    id: "breathingDeep",
    name: "Deep Breathing",
    description: "Visible deep breathing",
    speed: 0.7,
    intensity: 1.0,
    type: "breathing",
    params: {
      bones: ["spine", "chest"],
      amplitude: 4,
    },
  },
  {
    id: "swayGentle",
    name: "Gentle Sway",
    description: "Subtle side-to-side sway",
    speed: 0.5,
    intensity: 0.4,
    type: "sway",
    params: {
      bones: ["spine"],
      amplitude: 2,
    },
  },
  {
    id: "swayRhythmic",
    name: "Rhythmic Sway",
    description: "More pronounced rhythmic swaying",
    speed: 0.8,
    intensity: 0.7,
    type: "sway",
    params: {
      bones: ["spine", "head"],
      amplitude: 4,
    },
  },
  {
    id: "bounceSubtle",
    name: "Subtle Bounce",
    description: "Light bouncing motion",
    speed: 1.5,
    intensity: 0.3,
    type: "bounce",
    params: {
      amplitude: 0.01,
    },
  },
  {
    id: "bounceEnergetic",
    name: "Energetic Bounce",
    description: "More energetic bouncing",
    speed: 2,
    intensity: 0.6,
    type: "bounce",
    params: {
      amplitude: 0.02,
    },
  },
  {
    id: "floatDreamy",
    name: "Dreamy Float",
    description: "Slow floating motion",
    speed: 0.3,
    intensity: 0.5,
    type: "float",
    params: {
      amplitude: 0.03,
    },
  },
  {
    id: "idleNatural",
    name: "Natural Idle",
    description: "Combined breathing + subtle sway",
    speed: 1,
    intensity: 0.5,
    type: "custom",
    params: {
      bones: ["spine", "chest", "head"],
      amplitude: 2,
    },
  },
  {
    id: "walkSlow",
    name: "Slow Walk",
    description: "Gentle walking in place",
    speed: 0.6,
    intensity: 0.5,
    type: "walk",
    params: {
      strideLength: 15,
      armSwing: 20,
      amplitude: 2,
    },
  },
  {
    id: "walkNormal",
    name: "Normal Walk",
    description: "Natural walking pace in place",
    speed: 1.0,
    intensity: 0.7,
    type: "walk",
    params: {
      strideLength: 25,
      armSwing: 30,
      amplitude: 3,
    },
  },
  {
    id: "walkBrisk",
    name: "Brisk Walk",
    description: "Energetic fast walking in place",
    speed: 1.5,
    intensity: 1.0,
    type: "walk",
    params: {
      strideLength: 35,
      armSwing: 45,
      amplitude: 4,
    },
  },
  {
    id: "marchInPlace",
    name: "March",
    description: "Military-style marching in place",
    speed: 1.2,
    intensity: 1.0,
    type: "walk",
    params: {
      strideLength: 50,
      armSwing: 60,
      amplitude: 5,
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPoseById(id: string): PosePreset | undefined {
  return POSE_PRESETS.find((p) => p.id === id);
}

export function getHandGestureById(id: string): HandGesture | undefined {
  return HAND_GESTURES.find((g) => g.id === id);
}

export function getBodyGestureById(id: string): BodyGesture | undefined {
  return BODY_GESTURES.find((g) => g.id === id);
}

export function getBodyMotionById(id: string): BodyMotion | undefined {
  return BODY_MOTIONS.find((m) => m.id === id);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Apply a pose preset to a VRM model
 */
export function applyPoseToVRM(vrm: VRM, pose: PosePreset): void {
  const humanoid = vrm.humanoid;
  if (!humanoid) return;

  const boneMapping: Record<string, string> = {
    spine: "spine",
    chest: "chest",
    neck: "neck",
    head: "head",
    leftUpperArm: "leftUpperArm",
    leftLowerArm: "leftLowerArm",
    rightUpperArm: "rightUpperArm",
    rightLowerArm: "rightLowerArm",
    leftUpperLeg: "leftUpperLeg",
    leftLowerLeg: "leftLowerLeg",
    rightUpperLeg: "rightUpperLeg",
    rightLowerLeg: "rightLowerLeg",
  };

  for (const [boneName, rotation] of Object.entries(pose.bones)) {
    if (!rotation) continue;
    
    const vrmBoneName = boneMapping[boneName];
    if (!vrmBoneName) continue;
    
    const bone = humanoid.getNormalizedBoneNode(vrmBoneName as any);
    if (bone) {
      bone.rotation.set(
        degToRad(rotation[0]),
        degToRad(rotation[1]),
        degToRad(rotation[2])
      );
    }
  }
}

// ============================================================================
// ALL CUSTOMIZATION OPTIONS SUMMARY
// ============================================================================

export const CUSTOMIZATION_OPTIONS = {
  poses: POSE_PRESETS.map((p) => ({ id: p.id, name: p.name, description: p.description })),
  handGestures: HAND_GESTURES.map((g) => ({ id: g.id, name: g.name, description: g.description })),
  bodyGestures: BODY_GESTURES.map((g) => ({ id: g.id, name: g.name, description: g.description })),
  bodyMotions: BODY_MOTIONS.map((m) => ({ id: m.id, name: m.name, description: m.description })),
};

