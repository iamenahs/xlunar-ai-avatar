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
  // === BASIC REFERENCE POSES ===
  {
    id: "tpose",
    name: "T-Pose",
    description: "Default T-pose with arms extended horizontally",
    bones: {
      leftUpperArm: [0, 0, 0],
      rightUpperArm: [0, 0, 0],
      leftLowerArm: [0, 0, 0],
      rightLowerArm: [0, 0, 0],
      spine: [0, 0, 0],
    },
  },
  {
    id: "apose",
    name: "A-Pose",
    description: "Relaxed A-pose with arms at 45 degrees from horizontal",
    bones: {
      leftUpperArm: [0, 0, -45],
      rightUpperArm: [0, 0, 45],
      leftLowerArm: [0, 0, 0],
      rightLowerArm: [0, 0, 0],
      spine: [0, 0, 0],
    },
  },

  // === STANDING POSES ===
  {
    id: "relaxed",
    name: "Relaxed Standing",
    description: "Natural standing pose with arms relaxed at sides",
    bones: {
      spine: [2, 0, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
      leftLowerArm: [0, 0, -5],
      rightLowerArm: [0, 0, 5],
    },
  },
  {
    id: "handsOnHips",
    name: "Hands on Hips",
    description: "Confident pose with hands on hips",
    bones: {
      spine: [0, 0, 0],
      leftUpperArm: [0, 35, -55],
      rightUpperArm: [0, -35, 55],
      leftLowerArm: [0, 0, -80],
      rightLowerArm: [0, 0, 80],
    },
  },
  {
    id: "armsCrossed",
    name: "Arms Crossed",
    description: "Arms crossed in front of chest",
    bones: {
      chest: [3, 0, 0],
      leftUpperArm: [-30, 50, -40],
      rightUpperArm: [-30, -50, 40],
      leftLowerArm: [0, 15, -125],
      rightLowerArm: [0, -15, 125],
    },
  },
  {
    id: "confident",
    name: "Confident",
    description: "Chest out, proud posture with hands behind back",
    bones: {
      spine: [-3, 0, 0],
      chest: [-4, 0, 0],
      head: [-3, 0, 0],
      leftUpperArm: [15, -30, -65],
      rightUpperArm: [15, 30, 65],
      leftLowerArm: [0, -40, -90],
      rightLowerArm: [0, 40, 90],
    },
  },
  {
    id: "atEase",
    name: "At Ease",
    description: "Military at-ease with hands clasped behind back",
    bones: {
      spine: [0, 0, 0],
      leftUpperArm: [10, -20, -70],
      rightUpperArm: [10, 20, 70],
      leftLowerArm: [0, -25, -85],
      rightLowerArm: [0, 25, 85],
      leftUpperLeg: [0, 0, -5],
      rightUpperLeg: [0, 0, 5],
    },
  },
  {
    id: "weightOnOneHip",
    name: "Weight on One Hip",
    description: "Casual stance with weight shifted to one side",
    bones: {
      spine: [2, 0, 5],
      chest: [0, 0, -3],
      head: [0, 5, -2],
      leftUpperArm: [0, 0, -75],
      rightUpperArm: [0, 0, 80],
      leftLowerArm: [0, 0, -8],
      rightLowerArm: [0, 0, 3],
    },
  },

  // === COMMUNICATION POSES ===
  {
    id: "thinking",
    name: "Thinking",
    description: "Hand on chin thinking pose",
    bones: {
      head: [10, -8, -3],
      spine: [3, 0, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [-55, -20, 25],
      leftLowerArm: [0, 0, -5],
      rightLowerArm: [0, -35, 140],
    },
  },
  {
    id: "presenting",
    name: "Presenting",
    description: "One arm extended forward in presenting gesture",
    bones: {
      spine: [0, -8, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [-50, 0, 15],
      leftLowerArm: [0, 0, -5],
      rightLowerArm: [0, 0, 20],
    },
  },
  {
    id: "waving",
    name: "Waving",
    description: "Arm raised above shoulder in waving position",
    bones: {
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-10, -15, -20],
      rightLowerArm: [-15, 0, 100],
    },
  },
  {
    id: "pointing",
    name: "Pointing Forward",
    description: "Right arm extended forward pointing at something",
    bones: {
      spine: [0, -5, 0],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-60, 0, 10],
      rightLowerArm: [0, 0, 5],
    },
  },
  {
    id: "pointingUp",
    name: "Pointing Up",
    description: "Right arm raised with index finger pointing upward (eureka moment)",
    bones: {
      head: [-5, 0, 0],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-30, 0, 15],
      rightLowerArm: [-10, 0, 110],
    },
  },
  {
    id: "explaining",
    name: "Explaining",
    description: "Both arms out in front, palms up, explaining something",
    bones: {
      spine: [2, 0, 0],
      chest: [-2, 0, 0],
      leftUpperArm: [-25, 30, -50],
      rightUpperArm: [-25, -30, 50],
      leftLowerArm: [0, 20, -40],
      rightLowerArm: [0, -20, 40],
    },
  },
  {
    id: "listening",
    name: "Listening",
    description: "Attentive pose with slight forward lean and head tilt",
    bones: {
      spine: [5, 0, 0],
      chest: [2, 0, 0],
      head: [5, 8, 3],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
      leftLowerArm: [0, 0, -5],
      rightLowerArm: [0, 0, 5],
    },
  },
  {
    id: "openArms",
    name: "Open Arms",
    description: "Welcoming pose with arms open wide",
    bones: {
      spine: [-2, 0, 0],
      chest: [-3, 0, 0],
      leftUpperArm: [0, 0, -40],
      rightUpperArm: [0, 0, 40],
      leftLowerArm: [0, 0, -15],
      rightLowerArm: [0, 0, 15],
    },
  },

  // === EMOTIONAL POSES ===
  {
    id: "shy",
    name: "Shy",
    description: "Hunched slightly with one arm holding the other",
    bones: {
      spine: [5, 0, 0],
      chest: [3, 0, 0],
      head: [8, -5, -3],
      leftUpperArm: [-10, 30, -55],
      rightUpperArm: [5, 0, 70],
      leftLowerArm: [0, 30, -90],
      rightLowerArm: [0, 0, 15],
    },
  },
  {
    id: "sad",
    name: "Sad",
    description: "Downcast posture with drooped shoulders and lowered head",
    bones: {
      spine: [8, 0, 0],
      chest: [5, 0, 0],
      head: [15, 0, 0],
      neck: [5, 0, 0],
      leftUpperArm: [5, 0, -80],
      rightUpperArm: [5, 0, 80],
      leftLowerArm: [0, 0, -3],
      rightLowerArm: [0, 0, 3],
    },
  },
  {
    id: "excited",
    name: "Excited",
    description: "Arms raised with fists pumped in excitement",
    bones: {
      spine: [-3, 0, 0],
      chest: [-3, 0, 0],
      head: [-5, 0, 0],
      leftUpperArm: [-10, 0, -15],
      rightUpperArm: [-10, 0, 15],
      leftLowerArm: [0, 0, -110],
      rightLowerArm: [0, 0, 110],
    },
  },
  {
    id: "confused",
    name: "Confused",
    description: "Head tilted with one hand partially raised in confusion",
    bones: {
      head: [3, 12, 8],
      spine: [2, 0, 0],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-15, -15, 50],
      rightLowerArm: [0, -10, 55],
    },
  },
  {
    id: "frustrated",
    name: "Frustrated",
    description: "Hands on temples in frustration",
    bones: {
      spine: [5, 0, 0],
      head: [10, 0, 0],
      leftUpperArm: [-45, 30, -20],
      rightUpperArm: [-45, -30, 20],
      leftLowerArm: [0, 40, -140],
      rightLowerArm: [0, -40, 140],
    },
  },
  {
    id: "surprised",
    name: "Surprised",
    description: "Leaning back with hands up in surprise",
    bones: {
      spine: [-4, 0, 0],
      chest: [-3, 0, 0],
      head: [-5, 0, 0],
      leftUpperArm: [-20, 20, -35],
      rightUpperArm: [-20, -20, 35],
      leftLowerArm: [0, 20, -60],
      rightLowerArm: [0, -20, 60],
    },
  },

  // === GREETING / SOCIAL POSES ===
  {
    id: "bow",
    name: "Bow",
    description: "Formal bow with torso tilted forward",
    bones: {
      spine: [25, 0, 0],
      chest: [5, 0, 0],
      head: [10, 0, 0],
      leftUpperArm: [5, 0, -75],
      rightUpperArm: [5, 0, 75],
    },
  },
  {
    id: "deepBow",
    name: "Deep Bow",
    description: "Deep respectful bow at 45 degrees",
    bones: {
      spine: [35, 0, 0],
      chest: [10, 0, 0],
      head: [10, 0, 0],
      leftUpperArm: [10, 0, -75],
      rightUpperArm: [10, 0, 75],
      leftLowerArm: [0, 0, -3],
      rightLowerArm: [0, 0, 3],
    },
  },
  {
    id: "namaste",
    name: "Namaste",
    description: "Hands pressed together in prayer/greeting at chest level",
    bones: {
      spine: [3, 0, 0],
      chest: [2, 0, 0],
      head: [5, 0, 0],
      leftUpperArm: [-30, 50, -45],
      rightUpperArm: [-30, -50, 45],
      leftLowerArm: [0, 35, -120],
      rightLowerArm: [0, -35, 120],
    },
  },
  {
    id: "salute",
    name: "Salute",
    description: "Right hand raised to forehead in salute",
    bones: {
      spine: [0, 0, 0],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-50, -20, 15],
      rightLowerArm: [0, -40, 140],
    },
  },
  {
    id: "surrender",
    name: "Surrender",
    description: "Both arms raised above head, palms forward",
    bones: {
      leftUpperArm: [0, 0, 15],
      rightUpperArm: [0, 0, -15],
      leftLowerArm: [0, 0, -20],
      rightLowerArm: [0, 0, 20],
    },
  },

  // === SITTING / RESTING POSES ===
  {
    id: "sitting",
    name: "Sitting",
    description: "Seated pose with thighs horizontal and knees bent 90 degrees",
    bones: {
      spine: [5, 0, 0],
      leftUpperArm: [0, 0, -75],
      rightUpperArm: [0, 0, 75],
      leftLowerArm: [0, 0, -15],
      rightLowerArm: [0, 0, 15],
      leftUpperLeg: [-90, 0, 0],
      rightUpperLeg: [-90, 0, 0],
      leftLowerLeg: [90, 0, 0],
      rightLowerLeg: [90, 0, 0],
    },
  },
  {
    id: "sittingRelaxed",
    name: "Sitting Relaxed",
    description: "Relaxed seated pose leaning back slightly",
    bones: {
      spine: [-3, 0, 2],
      chest: [0, 0, 0],
      head: [0, 5, 0],
      leftUpperArm: [0, 0, -72],
      rightUpperArm: [0, 0, 72],
      leftLowerArm: [0, 0, -20],
      rightLowerArm: [0, 0, 20],
      leftUpperLeg: [-85, 0, -5],
      rightUpperLeg: [-95, -10, 5],
      leftLowerLeg: [80, 0, 0],
      rightLowerLeg: [95, 0, 0],
    },
  },
  {
    id: "sittingThinking",
    name: "Sitting & Thinking",
    description: "Seated with elbow on knee and chin resting on hand",
    bones: {
      spine: [2, 0, 0],
      chest: [0, 0, 0],
      head: [5, -8, -3],
      leftUpperArm: [0, 0, -72],
      leftLowerArm: [0, 0, -15],
      rightUpperArm: [-55, -20, 25],
      rightLowerArm: [0, -35, 140],
      leftUpperLeg: [-90, 0, 0],
      rightUpperLeg: [-90, 0, 0],
      leftLowerLeg: [90, 0, 0],
      rightLowerLeg: [90, 0, 0],
    },
  },
  {
    id: "lounging",
    name: "Lounging",
    description: "Leaning back casually with legs stretched out",
    bones: {
      spine: [-8, 0, 3],
      chest: [-5, 0, 0],
      head: [-3, 5, 0],
      leftUpperArm: [0, -10, -70],
      rightUpperArm: [0, 10, 70],
      leftLowerArm: [0, 0, -25],
      rightLowerArm: [0, 0, 25],
      leftUpperLeg: [-60, 0, -5],
      rightUpperLeg: [-50, 0, 5],
      leftLowerLeg: [30, 0, 0],
      rightLowerLeg: [20, 0, 0],
    },
  },

  // === LOOKING POSES ===
  {
    id: "lookUp",
    name: "Looking Up",
    description: "Head tilted back looking upward (sky gazing)",
    bones: {
      head: [-20, 0, 0],
      neck: [-8, 0, 0],
      spine: [-3, 0, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
    },
  },
  {
    id: "lookDown",
    name: "Looking Down",
    description: "Head tilted forward looking at the ground",
    bones: {
      head: [20, 0, 0],
      neck: [8, 0, 0],
      spine: [3, 0, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
    },
  },
  {
    id: "lookLeft",
    name: "Looking Left",
    description: "Head turned to look over left shoulder",
    bones: {
      head: [0, 25, 0],
      neck: [0, 10, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
    },
  },
  {
    id: "lookRight",
    name: "Looking Right",
    description: "Head turned to look over right shoulder",
    bones: {
      head: [0, -25, 0],
      neck: [0, -10, 0],
      leftUpperArm: [0, 0, -78],
      rightUpperArm: [0, 0, 78],
    },
  },

  // === ACTIVITY POSES ===
  {
    id: "stretching",
    name: "Stretching",
    description: "Arms reaching up in a big stretch",
    bones: {
      spine: [-5, 0, 0],
      chest: [-5, 0, 0],
      head: [-8, 0, 0],
      leftUpperArm: [-5, 0, 15],
      rightUpperArm: [-5, 0, -15],
      leftLowerArm: [0, 0, -10],
      rightLowerArm: [0, 0, 10],
    },
  },
  {
    id: "typing",
    name: "Typing",
    description: "Hands positioned in front as if typing on a keyboard",
    bones: {
      spine: [5, 0, 0],
      chest: [2, 0, 0],
      head: [10, 0, 0],
      leftUpperArm: [-15, 25, -55],
      rightUpperArm: [-15, -25, 55],
      leftLowerArm: [0, 30, -80],
      rightLowerArm: [0, -30, 80],
    },
  },
  {
    id: "reading",
    name: "Reading",
    description: "Holding something at chest height and looking down at it",
    bones: {
      spine: [5, 0, 0],
      chest: [2, 0, 0],
      head: [15, 0, 0],
      leftUpperArm: [-20, 25, -50],
      rightUpperArm: [-20, -25, 50],
      leftLowerArm: [0, 25, -90],
      rightLowerArm: [0, -25, 90],
    },
  },
  {
    id: "phoneCall",
    name: "Phone Call",
    description: "Right hand held up to ear as if on a phone call",
    bones: {
      head: [3, -8, -3],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [-50, -15, 20],
      rightLowerArm: [0, -35, 145],
    },
  },
  {
    id: "sleeping",
    name: "Sleeping",
    description: "Head drooped forward and to the side as if dozing off",
    bones: {
      spine: [10, 0, 3],
      chest: [5, 0, 0],
      neck: [10, 5, 5],
      head: [20, 10, 8],
      leftUpperArm: [5, 0, -80],
      rightUpperArm: [5, 0, 80],
      leftLowerArm: [0, 0, -10],
      rightLowerArm: [0, 0, 10],
    },
  },

  // === FUN POSES ===
  {
    id: "dab",
    name: "Dab",
    description: "Classic dab pose with face in elbow crook",
    bones: {
      spine: [5, 10, 0],
      head: [10, 20, 0],
      leftUpperArm: [-60, 0, 20],
      leftLowerArm: [0, 0, -10],
      rightUpperArm: [-30, -40, 40],
      rightLowerArm: [0, -20, 110],
    },
  },
  {
    id: "flexing",
    name: "Flexing",
    description: "Double bicep flex showing off muscles",
    bones: {
      spine: [-2, 0, 0],
      chest: [-3, 0, 0],
      leftUpperArm: [-5, 0, -15],
      rightUpperArm: [-5, 0, 15],
      leftLowerArm: [0, 40, -120],
      rightLowerArm: [0, -40, 120],
    },
  },
  {
    id: "victory",
    name: "Victory",
    description: "One arm raised in a fist pump victory pose",
    bones: {
      spine: [-2, 5, 0],
      head: [-5, 0, 0],
      leftUpperArm: [0, 0, -78],
      leftLowerArm: [0, 0, -5],
      rightUpperArm: [0, 0, -20],
      rightLowerArm: [0, 0, 15],
    },
  },
  {
    id: "superhero",
    name: "Superhero",
    description: "Classic superhero power stance with fists on hips, chest out",
    bones: {
      spine: [-5, 0, 0],
      chest: [-5, 0, 0],
      head: [-5, 0, 0],
      leftUpperArm: [0, 35, -50],
      rightUpperArm: [0, -35, 50],
      leftLowerArm: [0, 0, -85],
      rightLowerArm: [0, 0, 85],
      leftUpperLeg: [0, 0, -8],
      rightUpperLeg: [0, 0, 8],
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
          rightUpperArm: [0, 0, 78],
          rightLowerArm: [0, 0, 5],
        },
      },
      {
        time: 0.2,
        bones: {
          rightUpperArm: [-20, 0, 30],
          rightLowerArm: [-10, 0, 25],
        },
      },
      {
        time: 0.4,
        bones: {
          rightUpperArm: [-20, 0, 30],
          rightLowerArm: [-10, 25, 25],
        },
      },
      {
        time: 0.6,
        bones: {
          rightUpperArm: [-20, 0, 30],
          rightLowerArm: [-10, -25, 25],
        },
      },
      {
        time: 0.8,
        bones: {
          rightUpperArm: [-20, 0, 30],
          rightLowerArm: [-10, 18, 25],
        },
      },
      {
        time: 1,
        bones: {
          rightUpperArm: [0, 0, 78],
          rightLowerArm: [0, 0, 5],
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
          leftUpperArm: [0, 0, -78],
          rightUpperArm: [0, 0, 78],
        },
      },
      {
        time: 0.3,
        bones: {
          leftUpperArm: [-10, 0, -55],
          rightUpperArm: [-10, 0, 55],
          leftLowerArm: [0, 0, -20],
          rightLowerArm: [0, 0, 20],
          head: [0, 0, 5],
        },
      },
      {
        time: 0.7,
        bones: {
          leftUpperArm: [-10, 0, -55],
          rightUpperArm: [-10, 0, 55],
          leftLowerArm: [0, 0, -20],
          rightLowerArm: [0, 0, 20],
          head: [0, 0, 5],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [0, 0, -78],
          rightUpperArm: [0, 0, 78],
          leftLowerArm: [0, 0, -5],
          rightLowerArm: [0, 0, 5],
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
      { time: 0, bones: { spine: [2, 0, 0], head: [0, 0, 0], leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78] } },
      { time: 0.3, bones: { spine: [25, 0, 0], head: [10, 0, 0], leftUpperArm: [5, 0, -75], rightUpperArm: [5, 0, 75] } },
      { time: 0.7, bones: { spine: [25, 0, 0], head: [10, 0, 0], leftUpperArm: [5, 0, -75], rightUpperArm: [5, 0, 75] } },
      { time: 1, bones: { spine: [2, 0, 0], head: [0, 0, 0], leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78] } },
    ],
  },
  {
    id: "clap",
    name: "Clap",
    description: "Clapping hands",
    duration: 450,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [-50, 40, -20],
          rightUpperArm: [-50, -40, 20],
          leftLowerArm: [0, 40, -95],
          rightLowerArm: [0, -40, 95],
        },
      },
      {
        time: 0.45,
        bones: {
          leftUpperArm: [-50, 55, -20],
          rightUpperArm: [-50, -55, 20],
          leftLowerArm: [0, 55, -115],
          rightLowerArm: [0, -55, 115],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [-50, 40, -20],
          rightUpperArm: [-50, -40, 20],
          leftLowerArm: [0, 40, -95],
          rightLowerArm: [0, -40, 95],
        },
      },
    ],
  },
  {
    id: "celebrate",
    name: "Celebrate",
    description: "Arms up celebration",
    duration: 1500,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [0, 0, -78],
          rightUpperArm: [0, 0, 78],
          head: [0, 0, 0],
        },
      },
      {
        time: 0.25,
        bones: {
          leftUpperArm: [-20, 0, 30],
          rightUpperArm: [-20, 0, -30],
          leftLowerArm: [0, 0, -40],
          rightLowerArm: [0, 0, 40],
          head: [-10, 0, 0],
          chest: [-3, 0, 0],
          spine: [-2, 0, 0],
        },
      },
      {
        time: 0.5,
        bones: {
          leftUpperArm: [-20, 10, 30],
          rightUpperArm: [-20, -10, -30],
          leftLowerArm: [0, 0, -40],
          rightLowerArm: [0, 0, 40],
          head: [-10, 5, 0],
          chest: [-3, 0, 0],
          spine: [-2, 0, 0],
        },
      },
      {
        time: 0.7,
        bones: {
          leftUpperArm: [-20, -10, 30],
          rightUpperArm: [-20, 10, -30],
          leftLowerArm: [0, 0, -40],
          rightLowerArm: [0, 0, 40],
          head: [-10, -5, 0],
          chest: [-3, 0, 0],
          spine: [-2, 0, 0],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [0, 0, -78],
          rightUpperArm: [0, 0, 78],
          leftLowerArm: [0, 0, -5],
          rightLowerArm: [0, 0, 5],
          head: [0, 0, 0],
          chest: [0, 0, 0],
          spine: [2, 0, 0],
        },
      },
    ],
  },
  {
    id: "doubleNod",
    name: "Double Nod",
    description: "Emphatic double nod to show strong agreement",
    duration: 900,
    loop: false,
    keyframes: [
      { time: 0, bones: { head: [0, 0, 0] } },
      { time: 0.2, bones: { head: [18, 0, 0] } },
      { time: 0.35, bones: { head: [-3, 0, 0] } },
      { time: 0.55, bones: { head: [18, 0, 0] } },
      { time: 0.7, bones: { head: [-3, 0, 0] } },
      { time: 1, bones: { head: [0, 0, 0] } },
    ],
  },
  {
    id: "headTiltCurious",
    name: "Curious Head Tilt",
    description: "Head tilts to the side with inquisitive expression",
    duration: 1200,
    loop: false,
    keyframes: [
      { time: 0, bones: { head: [0, 0, 0], neck: [0, 0, 0] } },
      { time: 0.3, bones: { head: [3, 8, 12], neck: [0, 3, 4] } },
      { time: 0.7, bones: { head: [3, 8, 12], neck: [0, 3, 4] } },
      { time: 1, bones: { head: [0, 0, 0], neck: [0, 0, 0] } },
    ],
  },
  {
    id: "excitedJump",
    name: "Excited Jump",
    description: "Jumping up with arms raised in excitement",
    duration: 1000,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          spine: [2, 0, 0], leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
          leftUpperLeg: [0, 0, 0], rightUpperLeg: [0, 0, 0],
        },
      },
      {
        time: 0.15,
        bones: {
          spine: [10, 0, 0],
          leftUpperLeg: [-20, 0, 0], rightUpperLeg: [-20, 0, 0],
          leftLowerLeg: [30, 0, 0], rightLowerLeg: [30, 0, 0],
          leftUpperArm: [0, 0, -70], rightUpperArm: [0, 0, 70],
        },
      },
      {
        time: 0.35,
        bones: {
          spine: [-8, 0, 0], head: [-10, 0, 0],
          leftUpperArm: [-25, 0, 25], rightUpperArm: [-25, 0, -25],
          leftLowerArm: [0, 0, -35], rightLowerArm: [0, 0, 35],
          leftUpperLeg: [5, 0, 0], rightUpperLeg: [5, 0, 0],
          leftLowerLeg: [-15, 0, 0], rightLowerLeg: [-15, 0, 0],
        },
      },
      {
        time: 0.55,
        bones: {
          spine: [-8, 0, 0], head: [-10, 5, 0],
          leftUpperArm: [-25, 8, 25], rightUpperArm: [-25, -8, -25],
          leftLowerArm: [0, 0, -35], rightLowerArm: [0, 0, 35],
          leftUpperLeg: [5, 0, 0], rightUpperLeg: [5, 0, 0],
          leftLowerLeg: [-10, 0, 0], rightLowerLeg: [-10, 0, 0],
        },
      },
      {
        time: 0.75,
        bones: {
          spine: [5, 0, 0],
          leftUpperArm: [0, 0, -60], rightUpperArm: [0, 0, 60],
          leftUpperLeg: [-10, 0, 0], rightUpperLeg: [-10, 0, 0],
          leftLowerLeg: [15, 0, 0], rightLowerLeg: [15, 0, 0],
        },
      },
      {
        time: 1,
        bones: {
          spine: [2, 0, 0], head: [0, 0, 0],
          leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
          leftLowerArm: [0, 0, -5], rightLowerArm: [0, 0, 5],
          leftUpperLeg: [0, 0, 0], rightUpperLeg: [0, 0, 0],
          leftLowerLeg: [0, 0, 0], rightLowerLeg: [0, 0, 0],
        },
      },
    ],
  },
  {
    id: "stretch",
    name: "Stretch",
    description: "Full body stretch reaching arms overhead",
    duration: 2000,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          spine: [2, 0, 0], leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
        },
      },
      {
        time: 0.3,
        bones: {
          spine: [-5, 0, 0], chest: [-5, 0, 0], head: [-8, 0, 0],
          leftUpperArm: [-5, 0, 15], rightUpperArm: [-5, 0, -15],
          leftLowerArm: [0, 0, -10], rightLowerArm: [0, 0, 10],
        },
      },
      {
        time: 0.6,
        bones: {
          spine: [-5, 3, 0], chest: [-5, 0, 0], head: [-5, 5, 3],
          leftUpperArm: [-5, 0, 15], rightUpperArm: [-5, 0, -15],
          leftLowerArm: [0, 0, -10], rightLowerArm: [0, 0, 10],
        },
      },
      {
        time: 0.8,
        bones: {
          spine: [-5, -3, 0], chest: [-5, 0, 0], head: [-5, -5, -3],
          leftUpperArm: [-5, 0, 15], rightUpperArm: [-5, 0, -15],
          leftLowerArm: [0, 0, -10], rightLowerArm: [0, 0, 10],
        },
      },
      {
        time: 1,
        bones: {
          spine: [2, 0, 0], chest: [0, 0, 0], head: [0, 0, 0],
          leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
          leftLowerArm: [0, 0, -5], rightLowerArm: [0, 0, 5],
        },
      },
    ],
  },
  {
    id: "yawn",
    name: "Yawn",
    description: "Yawning with hand covering mouth and stretching back",
    duration: 2500,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          head: [0, 0, 0], spine: [2, 0, 0],
          leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
        },
      },
      {
        time: 0.2,
        bones: {
          head: [-10, 5, 0], spine: [-3, 0, 0], chest: [-3, 0, 0],
          rightUpperArm: [-70, -25, -5], rightLowerArm: [0, -50, 130],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 0.5,
        bones: {
          head: [-15, 5, 0], spine: [-5, 0, 0], chest: [-5, 0, 0],
          rightUpperArm: [-75, -25, -10], rightLowerArm: [0, -55, 140],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 0.75,
        bones: {
          head: [-10, 5, 0], spine: [-3, 0, 0], chest: [-3, 0, 0],
          rightUpperArm: [-70, -25, -5], rightLowerArm: [0, -50, 130],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 1,
        bones: {
          head: [0, 0, 0], spine: [2, 0, 0], chest: [0, 0, 0],
          rightUpperArm: [0, 0, 78], rightLowerArm: [0, 0, 5],
          leftUpperArm: [0, 0, -78], leftLowerArm: [0, 0, -5],
        },
      },
    ],
  },
  {
    id: "facePalm",
    name: "Face Palm",
    description: "Hand to face in exasperation",
    duration: 1800,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          head: [0, 0, 0], leftUpperArm: [0, 0, -78], rightUpperArm: [0, 0, 78],
        },
      },
      {
        time: 0.3,
        bones: {
          head: [10, 5, 0], spine: [5, 0, 0],
          rightUpperArm: [-75, -25, -10], rightLowerArm: [0, -50, 135],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 0.55,
        bones: {
          head: [15, 5, 0], spine: [8, 0, 0],
          rightUpperArm: [-80, -25, -15], rightLowerArm: [0, -55, 140],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 1,
        bones: {
          head: [0, 0, 0], spine: [2, 0, 0],
          rightUpperArm: [0, 0, 78], rightLowerArm: [0, 0, 5],
          leftUpperArm: [0, 0, -78], leftLowerArm: [0, 0, -5],
        },
      },
    ],
  },
  {
    id: "beckoning",
    name: "Beckoning",
    description: "Hand motioning someone to come closer",
    duration: 1000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: {
          rightUpperArm: [-30, -15, 40], rightLowerArm: [0, -15, 70],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 0.3,
        bones: {
          rightUpperArm: [-30, -15, 40], rightLowerArm: [0, -15, 95],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 0.6,
        bones: {
          rightUpperArm: [-30, -15, 40], rightLowerArm: [0, -15, 70],
          leftUpperArm: [0, 0, -78],
        },
      },
      {
        time: 1,
        bones: {
          rightUpperArm: [-30, -15, 40], rightLowerArm: [0, -15, 95],
          leftUpperArm: [0, 0, -78],
        },
      },
    ],
  },
  {
    id: "dismissiveWave",
    name: "Dismissive Wave",
    description: "Casual hand wave to dismiss or say 'whatever'",
    duration: 1200,
    loop: false,
    keyframes: [
      {
        time: 0,
        bones: {
          rightUpperArm: [0, 0, 78], rightLowerArm: [0, 0, 5],
          leftUpperArm: [0, 0, -78], head: [0, 0, 0],
        },
      },
      {
        time: 0.15,
        bones: {
          rightUpperArm: [-30, -15, 10], rightLowerArm: [0, -15, 80],
          leftUpperArm: [0, 0, -78], head: [3, -12, 0],
        },
      },
      {
        time: 0.35,
        bones: {
          rightUpperArm: [-30, -15, 10], rightLowerArm: [0, 25, 80],
          leftUpperArm: [0, 0, -78], head: [3, -12, 0],
        },
      },
      {
        time: 0.55,
        bones: {
          rightUpperArm: [-30, -15, 10], rightLowerArm: [0, -20, 80],
          leftUpperArm: [0, 0, -78], head: [3, -12, 0],
        },
      },
      {
        time: 0.75,
        bones: {
          rightUpperArm: [-30, -15, 10], rightLowerArm: [0, 15, 80],
          leftUpperArm: [0, 0, -78], head: [3, -12, 0],
        },
      },
      {
        time: 1,
        bones: {
          rightUpperArm: [0, 0, 78], rightLowerArm: [0, 0, 5],
          leftUpperArm: [0, 0, -78], head: [0, 0, 0],
        },
      },
    ],
  },
  {
    id: "talkingGesture",
    name: "Talking Gesture",
    description: "Natural hand gestures while speaking",
    duration: 2000,
    loop: true,
    keyframes: [
      {
        time: 0,
        bones: {
          leftUpperArm: [-15, 20, -50], rightUpperArm: [-15, -20, 50],
          leftLowerArm: [0, 15, -45], rightLowerArm: [0, -15, 45],
        },
      },
      {
        time: 0.2,
        bones: {
          leftUpperArm: [-18, 25, -48], rightUpperArm: [-12, -18, 52],
          leftLowerArm: [0, 18, -50], rightLowerArm: [0, -12, 42],
          head: [0, -3, 0],
        },
      },
      {
        time: 0.45,
        bones: {
          leftUpperArm: [-12, 18, -52], rightUpperArm: [-20, -25, 48],
          leftLowerArm: [0, 12, -42], rightLowerArm: [0, -18, 52],
          head: [0, 3, 0],
        },
      },
      {
        time: 0.65,
        bones: {
          leftUpperArm: [-20, 22, -45], rightUpperArm: [-18, -22, 55],
          leftLowerArm: [0, 20, -55], rightLowerArm: [0, -15, 40],
          head: [2, -2, 0],
        },
      },
      {
        time: 0.85,
        bones: {
          leftUpperArm: [-14, 18, -53], rightUpperArm: [-14, -20, 48],
          leftLowerArm: [0, 14, -40], rightLowerArm: [0, -18, 50],
          head: [-1, 2, 0],
        },
      },
      {
        time: 1,
        bones: {
          leftUpperArm: [-15, 20, -50], rightUpperArm: [-15, -20, 50],
          leftLowerArm: [0, 15, -45], rightLowerArm: [0, -15, 45],
          head: [0, 0, 0],
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
  type: "breathing" | "sway" | "bounce" | "float" | "walk" | "fidget" | "nod" | "look" | "dance" | "custom";
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

  // === FIDGETING / IDLE VARIATIONS ===
  {
    id: "fidgetSubtle",
    name: "Subtle Fidget",
    description: "Weight shifting and minor restless movement",
    speed: 0.4,
    intensity: 0.4,
    type: "fidget",
    params: {
      bones: ["spine", "head", "leftUpperArm", "rightUpperArm"],
      amplitude: 2,
    },
  },
  {
    id: "fidgetNervous",
    name: "Nervous Fidget",
    description: "More pronounced nervous shifting and hand movement",
    speed: 0.7,
    intensity: 0.7,
    type: "fidget",
    params: {
      bones: ["spine", "head", "leftUpperArm", "rightUpperArm"],
      amplitude: 4,
    },
  },

  // === HEAD NODDING (LISTENING) ===
  {
    id: "listeningNod",
    name: "Listening Nod",
    description: "Gentle rhythmic nodding as if actively listening",
    speed: 0.5,
    intensity: 0.5,
    type: "nod",
    params: {
      amplitude: 5,
    },
  },
  {
    id: "agreeingNod",
    name: "Agreeing Nod",
    description: "More emphatic nodding showing strong agreement",
    speed: 0.8,
    intensity: 0.8,
    type: "nod",
    params: {
      amplitude: 8,
    },
  },

  // === LOOKING AROUND ===
  {
    id: "lookAroundSlow",
    name: "Slow Look Around",
    description: "Slowly scanning the environment left and right",
    speed: 0.3,
    intensity: 0.5,
    type: "look",
    params: {
      amplitude: 20,
    },
  },
  {
    id: "lookAroundAlert",
    name: "Alert Look Around",
    description: "Quick, alert scanning — looking for something",
    speed: 0.8,
    intensity: 0.8,
    type: "look",
    params: {
      amplitude: 30,
    },
  },

  // === DANCING ===
  {
    id: "danceSubtle",
    name: "Subtle Dance",
    description: "Gentle rhythmic body movement, like grooving to music",
    speed: 1.0,
    intensity: 0.4,
    type: "dance",
    params: {
      amplitude: 3,
    },
  },
  {
    id: "danceEnergetic",
    name: "Energetic Dance",
    description: "Full body rhythmic dancing with arm and hip movement",
    speed: 1.5,
    intensity: 0.8,
    type: "dance",
    params: {
      amplitude: 6,
    },
  },

  // === COMBINATION IDLE VARIANTS ===
  {
    id: "idleAttentive",
    name: "Attentive Idle",
    description: "Slight forward lean with active listening micro-movements",
    speed: 0.8,
    intensity: 0.4,
    type: "custom",
    params: {
      bones: ["spine", "chest", "head", "neck"],
      amplitude: 1.5,
    },
  },
  {
    id: "idleBored",
    name: "Bored Idle",
    description: "Slow heavy swaying with droopy posture",
    speed: 0.3,
    intensity: 0.6,
    type: "custom",
    params: {
      bones: ["spine", "head"],
      amplitude: 3,
    },
  },
  {
    id: "idleSleepy",
    name: "Sleepy Idle",
    description: "Very slow droopy motion with periodic head dips",
    speed: 0.2,
    intensity: 0.5,
    type: "custom",
    params: {
      bones: ["spine", "chest", "head", "neck"],
      amplitude: 4,
    },
  },
  {
    id: "idleExcited",
    name: "Excited Idle",
    description: "High energy bouncing with slight arm movement",
    speed: 2.0,
    intensity: 0.5,
    type: "bounce",
    params: {
      amplitude: 0.015,
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

