/**
 * Predefined Motion Sequences
 *
 * Each sequence is a combination of timed steps that orchestrate
 * pose changes, facial expressions, and hand gestures into a
 * coherent animated behaviour.
 */

import type { MotionSequenceDefinition } from "../animation/MotionSequence";

// ============================================================================
// Relaxed base pose reference (degrees)
// ============================================================================

const RELAXED_BASE = {
  spine: [2, 0, 0] as [number, number, number],
  chest: [0, 0, 0] as [number, number, number],
  head: [0, 0, 0] as [number, number, number],
  leftUpperArm: [0, 0, -78] as [number, number, number],
  rightUpperArm: [0, 0, 78] as [number, number, number],
  leftLowerArm: [0, 0, -5] as [number, number, number],
  rightLowerArm: [0, 0, 5] as [number, number, number],
};

// ============================================================================
// Sequences
// ============================================================================

export const MOTION_SEQUENCES: MotionSequenceDefinition[] = [
  // ------------------------------------------------------------------
  // THINKING → EUREKA
  // ------------------------------------------------------------------
  {
    id: "thinkingEureka",
    name: "Thinking → Eureka!",
    description: "Hand on chin to think, then a sudden happy realization",
    category: "thinking",
    steps: [
      {
        label: "Raise hand toward chin",
        duration: 800,
        easing: "gentle",
        bones: {
          head: [5, -8, 0],
          rightUpperArm: [-40, -20, 55],
          rightLowerArm: [0, -25, 105],
          leftUpperArm: [0, 0, -70],
          leftLowerArm: [0, 0, -8],
          spine: [3, -3, 0],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.2, index: 0.6, middle: 0.7, ring: 0.8, pinky: 0.8 },
        },
        expression: { relaxed: 0.3, happy: 0 },
      },
      {
        label: "Ponder",
        duration: 400,
        easing: "gentle",
        holdDuration: 1400,
        bones: {
          head: [8, -12, -3],
          rightUpperArm: [-42, -22, 58],
          rightLowerArm: [0, -20, 110],
          spine: [4, -4, 0],
        },
        expression: { relaxed: 0.2, happy: 0 },
      },
      {
        label: "Eureka — head snaps up",
        duration: 350,
        easing: "sharp",
        bones: {
          head: [-8, 5, 0],
          rightUpperArm: [-15, 0, 50],
          rightLowerArm: [-10, 0, 30],
          leftUpperArm: [-5, 0, -55],
          leftLowerArm: [0, 0, -15],
          spine: [-2, 0, 0],
          chest: [-2, 0, 0],
        },
        expression: { happy: 0.8, surprised: 0.5, relaxed: 0 },
      },
      {
        label: "Celebrate — arms widen",
        duration: 600,
        easing: "easeOut",
        holdDuration: 600,
        bones: {
          head: [-5, 0, 0],
          rightUpperArm: [-10, 0, 40],
          rightLowerArm: [-5, 0, 20],
          leftUpperArm: [-10, 0, -40],
          leftLowerArm: [-5, 0, -20],
          spine: [-1, 0, 0],
          chest: [-2, 0, 0],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 1, surprised: 0.2, relaxed: 0 },
      },
      {
        label: "Return to relaxed",
        duration: 900,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.15, surprised: 0, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // FRIENDLY GREETING
  // ------------------------------------------------------------------
  {
    id: "friendlyGreeting",
    name: "Friendly Greeting",
    description: "Wave hello with a warm smile, then settle into relaxed stance",
    category: "social",
    steps: [
      {
        label: "Perk up — notice someone",
        duration: 400,
        easing: "sharp",
        bones: {
          head: [-3, 10, 0],
          spine: [-1, 3, 0],
          rightUpperArm: [0, 0, 50],
          rightLowerArm: [0, 0, 15],
        },
        expression: { happy: 0.4, surprised: 0.3 },
      },
      {
        label: "Raise hand to wave",
        duration: 500,
        easing: "easeOut",
        bones: {
          head: [-2, 8, 0],
          rightUpperArm: [-15, -15, -20],
          rightLowerArm: [-15, 0, 100],
          spine: [0, 2, 0],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.2, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 0.7, surprised: 0 },
      },
      {
        label: "Wave right",
        duration: 300,
        easing: "gentle",
        bones: {
          rightLowerArm: [-15, 25, 100],
        },
      },
      {
        label: "Wave left",
        duration: 300,
        easing: "gentle",
        bones: {
          rightLowerArm: [-15, -25, 100],
        },
      },
      {
        label: "Wave right again",
        duration: 300,
        easing: "gentle",
        bones: {
          rightLowerArm: [-15, 20, 100],
        },
      },
      {
        label: "Lower hand, warm smile",
        duration: 700,
        easing: "gentle",
        bones: { ...RELAXED_BASE, head: [0, 3, 0] },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.4, relaxed: 0.2 },
      },
      {
        label: "Settle",
        duration: 500,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        expression: { happy: 0.15, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // EXPLAINING AN IDEA
  // ------------------------------------------------------------------
  {
    id: "explainingIdea",
    name: "Explaining an Idea",
    description: "Gesture with hands while explaining a concept, shifting between points",
    category: "presentation",
    steps: [
      {
        label: "Lean in, raise hands",
        duration: 600,
        easing: "easeInOut",
        bones: {
          spine: [4, -4, 0],
          head: [3, -5, 0],
          rightUpperArm: [-15, -15, 50],
          rightLowerArm: [-10, 0, 35],
          leftUpperArm: [-15, 15, -50],
          leftLowerArm: [-10, 0, -35],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.2, index: 0, middle: 0.1, ring: 0.3, pinky: 0.4 },
        },
        expression: { happy: 0.2 },
      },
      {
        label: "First point — right hand gesture",
        duration: 500,
        easing: "easeOut",
        holdDuration: 400,
        bones: {
          head: [2, -8, 0],
          rightUpperArm: [-10, -12, 55],
          rightLowerArm: [-12, 0, 20],
          leftUpperArm: [-5, 10, -55],
          leftLowerArm: [-5, 0, -20],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.4, index: 0, middle: 0.8, ring: 0.9, pinky: 0.9 },
        },
        expression: { happy: 0.3 },
      },
      {
        label: "Second point — left hand gesture",
        duration: 500,
        easing: "easeOut",
        holdDuration: 400,
        bones: {
          head: [2, 8, 0],
          spine: [3, 3, 0],
          leftUpperArm: [-10, 12, -55],
          leftLowerArm: [-12, 0, -20],
          rightUpperArm: [-5, -10, 55],
          rightLowerArm: [-5, 0, 20],
        },
        handGesture: {
          hand: "left",
          fingers: { thumb: 0.4, index: 0, middle: 0.8, ring: 0.9, pinky: 0.9 },
        },
        expression: { happy: 0.35 },
      },
      {
        label: "Bring both hands together — conclusion",
        duration: 600,
        easing: "easeInOut",
        holdDuration: 500,
        bones: {
          head: [2, 0, 0],
          spine: [3, 0, 0],
          rightUpperArm: [-20, -25, 48],
          rightLowerArm: [0, -10, 50],
          leftUpperArm: [-20, 25, -48],
          leftLowerArm: [0, 10, -50],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.1, middle: 0.1, ring: 0.2, pinky: 0.3 },
        },
        expression: { happy: 0.5 },
      },
      {
        label: "Return to relaxed",
        duration: 800,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.15, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // SURPRISED REACTION
  // ------------------------------------------------------------------
  {
    id: "surprisedReaction",
    name: "Surprised Reaction",
    description: "Startled gasp, then curious lean-in, then amused recovery",
    category: "reaction",
    steps: [
      {
        label: "Startled — lean back, hands up",
        duration: 250,
        easing: "sharp",
        bones: {
          head: [-10, 0, 0],
          spine: [-5, 0, 0],
          chest: [-3, 0, 0],
          rightUpperArm: [-15, -8, 45],
          rightLowerArm: [-10, 0, 35],
          leftUpperArm: [-15, 8, -45],
          leftLowerArm: [-10, 0, -35],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { surprised: 0.9, happy: 0 },
      },
      {
        label: "Hold surprise",
        duration: 200,
        easing: "gentle",
        holdDuration: 500,
        expression: { surprised: 0.7 },
      },
      {
        label: "Curious lean-in",
        duration: 600,
        easing: "easeOut",
        holdDuration: 600,
        bones: {
          head: [5, -5, -2],
          spine: [5, -3, 0],
          rightUpperArm: [0, 0, 70],
          rightLowerArm: [0, 0, 8],
          leftUpperArm: [0, 0, -70],
          leftLowerArm: [0, 0, -8],
        },
        expression: { surprised: 0.2, happy: 0.3, relaxed: 0 },
      },
      {
        label: "Amused recovery — slight laugh",
        duration: 500,
        easing: "gentle",
        holdDuration: 400,
        bones: {
          head: [-3, 0, 3],
          spine: [0, 0, 0],
        },
        expression: { happy: 0.7, surprised: 0, relaxed: 0.1 },
      },
      {
        label: "Settle back",
        duration: 700,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        expression: { happy: 0.15, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // AGREEING / NODDING
  // ------------------------------------------------------------------
  {
    id: "agreeingNod",
    name: "Agreeing Nod",
    description: "Thoughtful nod then a thumbs-up to confirm",
    category: "social",
    steps: [
      {
        label: "Listen — slight tilt",
        duration: 400,
        easing: "gentle",
        bones: {
          head: [3, -5, -2],
          spine: [2, -2, 0],
        },
        expression: { relaxed: 0.3 },
      },
      {
        label: "Nod down",
        duration: 250,
        easing: "easeInOut",
        bones: {
          head: [15, -3, 0],
          neck: [3, 0, 0],
        },
        expression: { happy: 0.2, relaxed: 0.2 },
      },
      {
        label: "Nod up",
        duration: 250,
        easing: "easeInOut",
        bones: {
          head: [-3, -3, 0],
          neck: [-1, 0, 0],
        },
      },
      {
        label: "Second nod down",
        duration: 200,
        easing: "easeInOut",
        bones: {
          head: [12, 0, 0],
          neck: [2, 0, 0],
        },
      },
      {
        label: "Second nod up",
        duration: 200,
        easing: "easeInOut",
        bones: {
          head: [0, 0, 0],
          neck: [0, 0, 0],
        },
      },
      {
        label: "Thumbs up gesture",
        duration: 500,
        easing: "easeOut",
        holdDuration: 800,
        bones: {
          rightUpperArm: [-15, -10, 55],
          rightLowerArm: [-5, 0, 30],
          head: [0, -5, 0],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 },
        },
        expression: { happy: 0.6 },
      },
      {
        label: "Return to relaxed",
        duration: 700,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.15, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // SHY INTRODUCTION
  // ------------------------------------------------------------------
  {
    id: "shyIntroduction",
    name: "Shy Introduction",
    description: "Timid wave with a slight bow, gaining confidence",
    category: "social",
    steps: [
      {
        label: "Shy look down",
        duration: 500,
        easing: "gentle",
        bones: {
          head: [10, -8, -3],
          spine: [5, -2, 0],
          rightUpperArm: [0, 0, 72],
          rightLowerArm: [0, 0, 12],
          leftUpperArm: [0, 0, -72],
          leftLowerArm: [0, 0, -12],
        },
        expression: { relaxed: 0.4, happy: 0.1 },
      },
      {
        label: "Tentative small wave",
        duration: 400,
        easing: "gentle",
        bones: {
          rightUpperArm: [-12, 0, 40],
          rightLowerArm: [-8, 0, 22],
          head: [5, 0, 0],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.3, index: 0, middle: 0, ring: 0.1, pinky: 0.2 },
        },
        expression: { happy: 0.3, relaxed: 0.2 },
      },
      {
        label: "Small wiggle wave",
        duration: 250,
        easing: "gentle",
        bones: { rightLowerArm: [-8, 12, 22] },
      },
      {
        label: "Small wiggle back",
        duration: 250,
        easing: "gentle",
        bones: { rightLowerArm: [-8, -8, 22] },
      },
      {
        label: "Gain confidence — smile",
        duration: 500,
        easing: "easeOut",
        holdDuration: 500,
        bones: {
          head: [-2, 0, 0],
          spine: [1, 0, 0],
          rightUpperArm: [-15, 0, 30],
          rightLowerArm: [-8, 0, 20],
        },
        expression: { happy: 0.6, relaxed: 0 },
      },
      {
        label: "Settle back naturally",
        duration: 800,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.2, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // DISAPPOINTED SIGH
  // ------------------------------------------------------------------
  {
    id: "disappointedSigh",
    name: "Disappointed Sigh",
    description: "Slumped shoulders, sigh, then composing self",
    category: "emotion",
    steps: [
      {
        label: "Receive bad news — tense",
        duration: 300,
        easing: "sharp",
        bones: {
          head: [3, 0, 0],
          spine: [0, 0, 0],
          chest: [0, 0, 0],
        },
        expression: { sad: 0.3, happy: 0, surprised: 0.2 },
      },
      {
        label: "Shoulders drop, head down",
        duration: 700,
        easing: "gentle",
        holdDuration: 800,
        bones: {
          head: [15, -5, 0],
          spine: [8, 0, 0],
          chest: [3, 0, 0],
          leftUpperArm: [5, 0, -82],
          rightUpperArm: [5, 0, 82],
          leftLowerArm: [0, 0, -3],
          rightLowerArm: [0, 0, 3],
        },
        expression: { sad: 0.6, relaxed: 0.2, happy: 0 },
      },
      {
        label: "Deep breath in — chest rises",
        duration: 800,
        easing: "gentle",
        bones: {
          chest: [-2, 0, 0],
          spine: [5, 0, 0],
          head: [10, 0, 0],
        },
        expression: { sad: 0.4, relaxed: 0.3 },
      },
      {
        label: "Exhale — compose self",
        duration: 600,
        easing: "gentle",
        bones: {
          head: [3, 0, 0],
          spine: [3, 0, 0],
          chest: [0, 0, 0],
        },
        expression: { sad: 0.15, relaxed: 0.4 },
      },
      {
        label: "Straighten up",
        duration: 700,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        expression: { sad: 0, relaxed: 0.2, happy: 0.05 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // CONFIDENT PRESENTER
  // ------------------------------------------------------------------
  {
    id: "confidentPresenter",
    name: "Confident Presenter",
    description: "Open stance, sweeping gestures, commanding presence",
    category: "presentation",
    steps: [
      {
        label: "Take the stage — wide stance",
        duration: 600,
        easing: "easeOut",
        bones: {
          spine: [0, 0, 0],
          chest: [-2, 0, 0],
          head: [-3, 0, 0],
          rightUpperArm: [-5, -8, 60],
          rightLowerArm: [-5, 0, 15],
          leftUpperArm: [-5, 8, -60],
          leftLowerArm: [-5, 0, -15],
        },
        expression: { happy: 0.3, relaxed: 0.2 },
      },
      {
        label: "Sweep right — present point",
        duration: 600,
        easing: "easeInOut",
        holdDuration: 500,
        bones: {
          head: [-2, -12, 0],
          spine: [0, -5, 0],
          rightUpperArm: [-10, 0, 45],
          rightLowerArm: [-10, 0, 10],
          leftUpperArm: [0, 0, -65],
          leftLowerArm: [0, 0, -8],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 0.4 },
      },
      {
        label: "Sweep left — present point",
        duration: 600,
        easing: "easeInOut",
        holdDuration: 500,
        bones: {
          head: [-2, 12, 0],
          spine: [0, 5, 0],
          leftUpperArm: [-10, 0, -45],
          leftLowerArm: [-10, 0, -10],
          rightUpperArm: [0, 0, 65],
          rightLowerArm: [0, 0, 8],
        },
        handGesture: {
          hand: "left",
          fingers: { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 0.4 },
      },
      {
        label: "Center — open palms, call to action",
        duration: 600,
        easing: "easeInOut",
        holdDuration: 600,
        bones: {
          head: [-3, 0, 0],
          spine: [-1, 0, 0],
          rightUpperArm: [-10, -15, 55],
          rightLowerArm: [-8, 0, 22],
          leftUpperArm: [-10, 15, -55],
          leftLowerArm: [-8, 0, -22],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 0.6 },
      },
      {
        label: "Return to relaxed",
        duration: 800,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.2, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // EXCITED CELEBRATION
  // ------------------------------------------------------------------
  {
    id: "excitedCelebration",
    name: "Excited Celebration",
    description: "Jump for joy with fist pumps and a big smile",
    category: "emotion",
    steps: [
      {
        label: "Build anticipation — crouch slightly",
        duration: 400,
        easing: "easeIn",
        bones: {
          spine: [5, 0, 0],
          chest: [2, 0, 0],
          head: [3, 0, 0],
          leftUpperArm: [3, 0, -72],
          rightUpperArm: [3, 0, 72],
          leftLowerArm: [0, 0, -18],
          rightLowerArm: [0, 0, 18],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
        },
        expression: { happy: 0.3 },
      },
      {
        label: "Burst — arms up!",
        duration: 300,
        easing: "sharp",
        holdDuration: 600,
        bones: {
          spine: [-3, 0, 0],
          chest: [-4, 0, 0],
          head: [-8, 0, 0],
          rightUpperArm: [-15, 0, 10],
          rightLowerArm: [0, 0, 20],
          leftUpperArm: [-15, 0, -10],
          leftLowerArm: [0, 0, -20],
        },
        expression: { happy: 1, surprised: 0.3 },
      },
      {
        label: "Fist pump right",
        duration: 350,
        easing: "easeOut",
        bones: {
          rightUpperArm: [-20, 0, 20],
          rightLowerArm: [0, 0, 30],
          leftUpperArm: [-10, 0, -30],
          leftLowerArm: [0, 0, -25],
          head: [-5, -5, 0],
        },
        expression: { happy: 0.9, surprised: 0.1 },
      },
      {
        label: "Fist pump left",
        duration: 350,
        easing: "easeOut",
        bones: {
          leftUpperArm: [-20, 0, -20],
          leftLowerArm: [0, 0, -30],
          rightUpperArm: [-10, 0, 30],
          rightLowerArm: [0, 0, 25],
          head: [-5, 5, 0],
        },
        expression: { happy: 0.9 },
      },
      {
        label: "Happy settle",
        duration: 800,
        easing: "gentle",
        bones: { ...RELAXED_BASE, head: [-2, 0, 0] },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.5, surprised: 0 },
      },
      {
        label: "Final relax",
        duration: 600,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        expression: { happy: 0.15, relaxed: 0.1 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // CONFUSED HEAD SCRATCH
  // ------------------------------------------------------------------
  {
    id: "confusedScratch",
    name: "Confused Head Scratch",
    description: "Puzzled expression, scratch head, then shrug it off",
    category: "reaction",
    steps: [
      {
        label: "Puzzled look",
        duration: 400,
        easing: "easeOut",
        bones: {
          head: [3, 12, 5],
          spine: [1, 3, 0],
        },
        expression: { surprised: 0.3, relaxed: 0.2 },
      },
      {
        label: "Raise hand to head",
        duration: 600,
        easing: "easeInOut",
        bones: {
          head: [3, 8, 5],
          rightUpperArm: [-35, -12, 35],
          rightLowerArm: [-18, -25, 70],
        },
        handGesture: {
          hand: "right",
          fingers: { thumb: 0.2, index: 0.4, middle: 0.5, ring: 0.6, pinky: 0.7 },
        },
        expression: { surprised: 0.2 },
      },
      {
        label: "Scratch — small movement",
        duration: 300,
        easing: "gentle",
        bones: {
          rightLowerArm: [-20, -23, 72],
          head: [5, 10, 5],
        },
      },
      {
        label: "Scratch back",
        duration: 300,
        easing: "gentle",
        bones: {
          rightLowerArm: [-16, -27, 68],
          head: [2, 6, 5],
        },
      },
      {
        label: "Shrug it off",
        duration: 500,
        easing: "easeOut",
        holdDuration: 400,
        bones: {
          head: [0, 0, 3],
          rightUpperArm: [-8, 0, 55],
          rightLowerArm: [-5, 0, 25],
          leftUpperArm: [-8, 0, -55],
          leftLowerArm: [-5, 0, -25],
          spine: [0, 0, 2],
        },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
        },
        expression: { happy: 0.3, surprised: 0 },
      },
      {
        label: "Return to relaxed",
        duration: 700,
        easing: "gentle",
        bones: { ...RELAXED_BASE },
        handGesture: {
          hand: "both",
          fingers: { thumb: 0.3, index: 0.3, middle: 0.35, ring: 0.4, pinky: 0.45 },
        },
        expression: { happy: 0.1, relaxed: 0.1 },
      },
    ],
  },
];

// ============================================================================
// Helpers
// ============================================================================

export function getSequenceById(id: string): MotionSequenceDefinition | undefined {
  return MOTION_SEQUENCES.find((s) => s.id === id);
}

export function getSequencesByCategory(
  category: MotionSequenceDefinition["category"]
): MotionSequenceDefinition[] {
  return MOTION_SEQUENCES.filter((s) => s.category === category);
}
