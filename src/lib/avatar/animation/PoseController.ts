/**
 * Pose Controller
 * Handles applying poses, gestures, and body motions to VRM models
 * 
 * Key improvements over basic implementation:
 * - Smooth transitions between poses using easing functions
 * - Proper base pose tracking with offset-based continuous motion
 * - Anatomically correct breathing frequencies (12-20 breaths/minute)
 * - Spring-based physics for natural settling
 * - No rotation accumulation bugs
 */

import type { VRM, VRMHumanBoneName, VRMPose } from "@pixiv/three-vrm";
import * as THREE from "three";
import type {
  PosePreset,
  HandGesture,
  BodyGesture,
  BodyMotion,
} from "../config/poses";
import { degToRad } from "../config/poses";
import {
  easeInOutCubic,
  easeInOutSine,
  breathingCurve,
  organicOscillation,
  headMicroMovement,
  smoothDamp,
  type SmoothDampState,
  type EasingFunction,
} from "./easing";
import { detectVrmVersion, type VrmVersionHandler } from "../loaders";

// VRM Bone name mapping
const BONE_MAP: Record<string, VRMHumanBoneName> = {
  spine: "spine",
  chest: "chest",
  neck: "neck",
  head: "head",
  leftUpperArm: "leftUpperArm",
  leftLowerArm: "leftLowerArm",
  leftHand: "leftHand",
  rightUpperArm: "rightUpperArm",
  rightLowerArm: "rightLowerArm",
  rightHand: "rightHand",
  leftUpperLeg: "leftUpperLeg",
  leftLowerLeg: "leftLowerLeg",
  leftFoot: "leftFoot",
  rightUpperLeg: "rightUpperLeg",
  rightLowerLeg: "rightLowerLeg",
  rightFoot: "rightFoot",
  hips: "hips",
};

// ============================================================================
// Types
// ============================================================================

interface BoneRotation {
  x: number;
  y: number;
  z: number;
}

interface BoneState {
  current: BoneRotation;
  target: BoneRotation;
  velocity: { x: number; y: number; z: number };
}

interface PoseTransition {
  fromPose: Record<string, [number, number, number]>;
  toPose: Record<string, [number, number, number]>;
  startTime: number;
  duration: number;
  easing: EasingFunction;
}

// ============================================================================
// Default Natural Pose (not T-pose!)
// ============================================================================

const DEFAULT_RELAXED_POSE: Record<string, [number, number, number]> = {
  // Arms hanging naturally at sides, perpendicular to ground
  // Z brings arm down from T-pose horizontal; X=0 avoids pushing arms behind body
  leftUpperArm: [0, 0, -78],
  rightUpperArm: [0, 0, 78],
  leftLowerArm: [0, 0, -5],
  rightLowerArm: [0, 0, 5],
  spine: [2, 0, 0],
  chest: [0, 0, 0],
  neck: [0, 0, 0],
  head: [0, 0, 0],
};

// ============================================================================
// PoseController Class
// ============================================================================

export class PoseController {
  private vrm: VRM | null = null;
  private versionHandler: VrmVersionHandler | null = null;
  
  // Base pose (the static pose before motion offsets)
  private basePose: Record<string, [number, number, number]> = { ...DEFAULT_RELAXED_POSE };
  
  // Bone states for smooth interpolation
  private boneStates: Map<string, BoneState> = new Map();
  
  // Pose transition state
  private poseTransition: PoseTransition | null = null;
  
  // Current motion settings
  private currentMotion: BodyMotion | null = null;
  
  // Gesture animation state
  private gestureAnimation: {
    gesture: BodyGesture;
    startTime: number;
    isPlaying: boolean;
  } | null = null;
  
  // Time tracking
  private motionTime = 0;
  private elapsedTime = 0;
  
  // Position for bounce/float effects
  private basePosition: [number, number, number] = [0, 0, 0];
  private currentPositionY = 0;
  private positionVelocityY = 0;
  
  // Configuration
  private transitionDuration = 0.4; // seconds for pose transitions
  private smoothTime = 0.15; // seconds for smooth damp
  private defaultSmoothTime = 0.15;

  /**
   * Initialize with a VRM model.
   * @param vrm     – the loaded VRM object
   * @param fileUrl – used to detect VRM version for rotation conversion
   */
  init(vrm: VRM, fileUrl?: string): void {
    this.vrm = vrm;
    this.versionHandler = detectVrmVersion(vrm, fileUrl ?? "");
    this.motionTime = 0;
    this.elapsedTime = 0;
    this.boneStates.clear();
    this.poseTransition = null;
    this.currentPositionY = 0;
    this.positionVelocityY = 0;
    
    // Reset the normalized skeleton to identity (T-pose)
    if (vrm.humanoid) {
      vrm.humanoid.setNormalizedPose({});
    }
    
    // Initialize bone states from current VRM pose
    this.initializeBoneStates();
    
    // Apply default relaxed pose immediately (no transition on init)
    this.applyPoseImmediate(DEFAULT_RELAXED_POSE);
  }

  /**
   * Convert rotation from authoring convention to device convention.
   * VRM 0.x needs X and Z negated due to the internal 180° Y hip rotation.
   * VRM 1.0 uses values as-is.
   */
  private convertRotation(degrees: [number, number, number]): [number, number, number] {
    return this.versionHandler?.convertRotation(degrees) ?? degrees;
  }
  
  /**
   * Initialize bone states from VRM normalized bones.
   * VRM normalized bones always start at identity (T-pose), so we
   * reset everything to zero and let applyPoseImmediate set the relaxed pose.
   */
  private initializeBoneStates(): void {
    if (!this.vrm?.humanoid) return;
    
    for (const [boneName, vrmBoneName] of Object.entries(BONE_MAP)) {
      try {
        const bone = this.vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
        if (bone) {
          this.boneStates.set(boneName, {
            current: { x: 0, y: 0, z: 0 },
            target: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
          });
        }
      } catch {
        // Bone not found in this model
      }
    }
  }

  /**
   * Set the base position for the avatar
   */
  setBasePosition(position: [number, number, number]): void {
    this.basePosition = position;
  }

  /**
   * Set transition duration for pose changes
   */
  setTransitionDuration(duration: number): void {
    this.transitionDuration = duration;
  }

  /**
   * Set smooth damp time (lower = snappier response)
   */
  setSmoothTime(time: number): void {
    this.smoothTime = time;
  }

  /**
   * Reset smooth time to default
   */
  resetSmoothTime(): void {
    this.smoothTime = this.defaultSmoothTime;
  }

  /**
   * Apply a pose immediately (no transition)
   */
  private applyPoseImmediate(pose: Record<string, [number, number, number]>): void {
    if (!this.vrm?.humanoid) return;
    
    const vrmPose: VRMPose = {};
    const euler = new THREE.Euler();
    const quat = new THREE.Quaternion();
    
    for (const [boneName, rotation] of Object.entries(pose)) {
      const vrmBoneName = BONE_MAP[boneName];
      if (!vrmBoneName) continue;
      
      const converted = this.convertRotation(rotation);
      const rx = degToRad(converted[0]);
      const ry = degToRad(converted[1]);
      const rz = degToRad(converted[2]);
      
      const state = this.boneStates.get(boneName);
      if (state) {
        state.current.x = rx;
        state.current.y = ry;
        state.current.z = rz;
        state.target = { ...state.current };
        state.velocity = { x: 0, y: 0, z: 0 };
      }
      
      euler.set(rx, ry, rz);
      quat.setFromEuler(euler);
      vrmPose[vrmBoneName] = {
        rotation: [quat.x, quat.y, quat.z, quat.w] as [number, number, number, number],
      };
    }
    
    this.vrm.humanoid.setNormalizedPose(vrmPose);
    this.basePose = { ...pose };
  }

  /**
   * Apply a pose preset with smooth transition
   */
  applyPose(pose: PosePreset): void {
    if (!this.vrm?.humanoid) return;
    
    // Both fromPose and toPose are in VRM normalized convention (degrees)
    const fromPose: Record<string, [number, number, number]> = {};
    for (const boneName of Object.keys({ ...this.basePose, ...pose.bones })) {
      const state = this.boneStates.get(boneName);
      if (state) {
        fromPose[boneName] = [
          state.current.x / (Math.PI / 180),
          state.current.y / (Math.PI / 180),
          state.current.z / (Math.PI / 180),
        ];
      } else {
        fromPose[boneName] = this.basePose[boneName] || [0, 0, 0];
      }
    }
    
    const toPose = { ...this.basePose, ...pose.bones };
    
    this.poseTransition = {
      fromPose,
      toPose,
      startTime: this.elapsedTime,
      duration: this.transitionDuration,
      easing: easeInOutCubic,
    };
    
    this.basePose = { ...this.basePose, ...pose.bones };
  }

  /**
   * Apply a hand gesture by manipulating finger bones
   * VRM finger bones: thumb (proximal, intermediate, distal), index, middle, ring, little
   */
  applyHandGesture(gesture: HandGesture): void {
    if (!this.vrm?.humanoid) return;

    const { hand, fingers } = gesture;
    
    // Apply to left hand if gesture targets left or both hands
    if (hand === "left" || hand === "both") {
      this.applyFingerPose("left", fingers);
    }
    
    // Apply to right hand if gesture targets right or both hands
    if (hand === "right" || hand === "both") {
      this.applyFingerPose("right", fingers);
    }
  }

  /**
   * Apply finger curl values to a specific hand
   * @param side - "left" or "right"
   * @param fingers - Object with curl values (0=open, 1=closed) for each finger
   */
  private applyFingerPose(
    side: "left" | "right",
    fingers: { thumb?: number; index?: number; middle?: number; ring?: number; pinky?: number }
  ): void {
    if (!this.vrm?.humanoid) return;

    const humanoid = this.vrm.humanoid;
    const prefix = side === "left" ? "left" : "right";
    const capPrefix = side === "left" ? "Left" : "Right";
    
    // Maximum curl angle in radians (about 90 degrees)
    const maxCurl = Math.PI / 2;
    
    // VRM Humanoid finger bone names
    // Thumb has: Metacarpal, Proximal, Distal (3 bones, no Intermediate)
    // Other fingers have: Proximal, Intermediate, Distal (3 bones)
    const fingerBones: Record<string, { bones: string[]; isThumb: boolean }> = {
      thumb: {
        bones: [
          `${prefix}ThumbMetacarpal`,
          `${prefix}ThumbProximal`,
          `${prefix}ThumbDistal`,
        ],
        isThumb: true,
      },
      index: {
        bones: [
          `${prefix}IndexProximal`,
          `${prefix}IndexIntermediate`,
          `${prefix}IndexDistal`,
        ],
        isThumb: false,
      },
      middle: {
        bones: [
          `${prefix}MiddleProximal`,
          `${prefix}MiddleIntermediate`,
          `${prefix}MiddleDistal`,
        ],
        isThumb: false,
      },
      ring: {
        bones: [
          `${prefix}RingProximal`,
          `${prefix}RingIntermediate`,
          `${prefix}RingDistal`,
        ],
        isThumb: false,
      },
      pinky: {
        bones: [
          `${prefix}LittleProximal`,
          `${prefix}LittleIntermediate`,
          `${prefix}LittleDistal`,
        ],
        isThumb: false,
      },
    };

    // Apply curl to each finger
    for (const [fingerName, curl] of Object.entries(fingers)) {
      if (curl === undefined) continue;
      
      const fingerConfig = fingerBones[fingerName];
      if (!fingerConfig) continue;

      const { bones, isThumb } = fingerConfig;
      
      // Distribute curl across the joints
      // First joint gets most curl, last gets least
      const curlDistribution = isThumb 
        ? [0.3, 0.4, 0.3]  // Thumb: metacarpal, proximal, distal
        : [0.5, 0.35, 0.15]; // Other fingers: proximal, intermediate, distal
      
      // VRM 0.x negates X and Z axes due to internal 180° Y hip rotation
      const isVrm0 = this.versionHandler?.version === "vrm0" || this.versionHandler?.version === "vroid-glb";
      const xSign = isVrm0 ? 1 : -1;
      const zSign = isVrm0 ? -1 : 1;

      for (let i = 0; i < bones.length; i++) {
        const boneName = bones[i];
        try {
          const bone = humanoid.getNormalizedBoneNode(boneName as any);
          if (bone) {
            const jointCurl = curl * maxCurl * curlDistribution[i] * 2.5;
            
            if (isThumb) {
              if (i === 0) {
                bone.rotation.y = side === "left" ? jointCurl * 0.5 : -jointCurl * 0.5;
                bone.rotation.z = (side === "left" ? jointCurl * 0.3 : -jointCurl * 0.3) * zSign;
              } else {
                bone.rotation.z = (side === "left" ? jointCurl * 0.8 : -jointCurl * 0.8) * zSign;
              }
            } else {
              bone.rotation.x = xSign * jointCurl;
            }
          }
        } catch {
          // Bone not available in this model
        }
      }
    }
  }

  /**
   * Play a body gesture animation
   */
  playBodyGesture(gesture: BodyGesture): void {
    this.gestureAnimation = {
      gesture,
      startTime: this.elapsedTime * 1000, // Convert to ms
      isPlaying: true,
    };
  }

  /**
   * Stop the current body gesture
   */
  stopBodyGesture(): void {
    this.gestureAnimation = null;
  }

  /**
   * Set the body motion
   */
  setBodyMotion(motion: BodyMotion): void {
    this.currentMotion = motion;
  }

  /**
   * Update animations - call this every frame
   */
  update(delta: number): void {
    if (!this.vrm?.humanoid) return;

    this.motionTime += delta;
    this.elapsedTime += delta;

    // 1. Update pose transition (if any)
    this.updatePoseTransition();

    // 2. Update gesture animation
    this.updateGestureAnimation();

    // 3. Apply continuous body motion as OFFSETS to base pose
    this.updateBodyMotion(delta);
    
    // 4. Apply final bone rotations with smooth damping
    this.applyBoneRotations(delta);
  }

  /**
   * Update pose transition
   */
  private updatePoseTransition(): void {
    if (!this.poseTransition || !this.vrm?.humanoid) return;
    
    const { fromPose, toPose, startTime, duration, easing } = this.poseTransition;
    
    const elapsed = this.elapsedTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    // Interpolate all bones
    for (const [boneName, toRotation] of Object.entries(toPose)) {
      const fromRotation = fromPose[boneName] || [0, 0, 0];
      const state = this.boneStates.get(boneName);
      
      if (state) {
        const interpolated: [number, number, number] = [
          fromRotation[0] + (toRotation[0] - fromRotation[0]) * easedProgress,
          fromRotation[1] + (toRotation[1] - fromRotation[1]) * easedProgress,
          fromRotation[2] + (toRotation[2] - fromRotation[2]) * easedProgress,
        ];
        const converted = this.convertRotation(interpolated);
        state.target.x = degToRad(converted[0]);
        state.target.y = degToRad(converted[1]);
        state.target.z = degToRad(converted[2]);
      }
    }
    
    // Clear transition when complete
    if (progress >= 1) {
      this.poseTransition = null;
    }
  }

  /**
   * Update gesture animation
   */
  private updateGestureAnimation(): void {
    if (!this.gestureAnimation || !this.vrm?.humanoid) return;

    const { gesture, startTime, isPlaying } = this.gestureAnimation;
    if (!isPlaying) return;

    const elapsed = this.elapsedTime * 1000 - startTime;
    let progress = elapsed / gesture.duration;

    if (progress >= 1) {
      if (gesture.loop) {
        this.gestureAnimation.startTime = this.elapsedTime * 1000;
        progress = 0;
      } else {
        this.gestureAnimation = null;
        return;
      }
    }

    // Find keyframes to interpolate between
    const keyframes = gesture.keyframes;
    let prevKeyframe = keyframes[0];
    let nextKeyframe = keyframes[1] || keyframes[0];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].time && progress < keyframes[i + 1].time) {
        prevKeyframe = keyframes[i];
        nextKeyframe = keyframes[i + 1];
        break;
      }
    }

    // Calculate interpolation factor with easing
    const keyframeDuration = nextKeyframe.time - prevKeyframe.time;
    const rawT = keyframeDuration > 0 
      ? (progress - prevKeyframe.time) / keyframeDuration 
      : 0;
    const t = easeInOutSine(rawT); // Apply easing to keyframe transitions

    // Apply interpolated bone rotations
    for (const [boneName, targetRotation] of Object.entries(nextKeyframe.bones)) {
      if (!targetRotation) continue;
      
      const prevRotation = prevKeyframe.bones[boneName as keyof typeof prevKeyframe.bones] || [0, 0, 0];
      const state = this.boneStates.get(boneName);
      
      if (state) {
        const interpolated: [number, number, number] = [
          prevRotation[0] + (targetRotation[0] - prevRotation[0]) * t,
          prevRotation[1] + (targetRotation[1] - prevRotation[1]) * t,
          prevRotation[2] + (targetRotation[2] - prevRotation[2]) * t,
        ];
        const converted = this.convertRotation(interpolated);
        state.target.x = degToRad(converted[0]);
        state.target.y = degToRad(converted[1]);
        state.target.z = degToRad(converted[2]);
      }
    }
  }

  /**
   * Update continuous body motion - applies as OFFSETS to base pose
   * This is the key fix: we don't overwrite, we offset
   */
  private updateBodyMotion(delta: number): void {
    if (!this.currentMotion || !this.vrm?.humanoid) return;
    
    const { type, speed, intensity, params } = this.currentMotion;
    if (intensity === 0 || type === "custom" && !params) return;

    // Don't apply motion during gesture animation
    if (this.gestureAnimation?.isPlaying) return;

    const time = this.motionTime * speed;
    const amplitude = (params?.amplitude || 2) * intensity;

    // Calculate motion offsets (in degrees, will be converted to radians when applied)
    const offsets: Record<string, [number, number, number]> = {};

    switch (type) {
      case "breathing":
        this.calculateBreathingOffsets(time, amplitude, offsets);
        break;
      case "sway":
        this.calculateSwayOffsets(time, amplitude, offsets);
        break;
      case "bounce":
        this.updateBouncePosition(time, amplitude, delta);
        return;
      case "float":
        this.updateFloatPosition(time, amplitude, delta);
        return;
      case "walk":
        this.calculateWalkingOffsets(time, params || {}, intensity, offsets);
        break;
      case "fidget":
        this.calculateFidgetOffsets(time, amplitude, intensity, offsets);
        break;
      case "nod":
        this.calculateNodOffsets(time, amplitude, offsets);
        break;
      case "look":
        this.calculateLookAroundOffsets(time, amplitude, offsets);
        break;
      case "dance":
        this.calculateDanceOffsets(time, amplitude, intensity, offsets);
        break;
      case "custom":
        this.calculateBreathingOffsets(time, amplitude * 0.6, offsets);
        this.calculateSwayOffsets(time * 0.7, amplitude * 0.3, offsets);
        this.calculateHeadMicroMovement(time, intensity, offsets);
        break;
    }

    for (const [boneName, offset] of Object.entries(offsets)) {
      const basePoseRotation = this.basePose[boneName] || [0, 0, 0];
      const state = this.boneStates.get(boneName);
      
      if (state && !this.poseTransition) {
        const combined: [number, number, number] = [
          basePoseRotation[0] + offset[0],
          basePoseRotation[1] + offset[1],
          basePoseRotation[2] + offset[2],
        ];
        const converted = this.convertRotation(combined);
        state.target.x = degToRad(converted[0]);
        state.target.y = degToRad(converted[1]);
        state.target.z = degToRad(converted[2]);
      }
    }
  }

  /**
   * Calculate breathing motion offsets
   * Uses anatomically correct breathing rate: 12-20 breaths per minute
   */
  private calculateBreathingOffsets(
    time: number,
    amplitude: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    // Breathing at natural rate (14 breaths per minute by default)
    const breathValue = breathingCurve(time, 14);
    
    // Chest expands forward and up, spine follows slightly
    offsets.chest = [
      breathValue * amplitude * 1.2,
      0,
      0
    ];
    offsets.spine = [
      breathValue * amplitude * 0.6,
      0,
      0
    ];
    
    // Subtle shoulder rise during inhale
    offsets.leftUpperArm = [
      0,
      0,
      -breathValue * amplitude * 0.25
    ];
    offsets.rightUpperArm = [
      0,
      0,
      breathValue * amplitude * 0.25
    ];
  }

  /**
   * Calculate sway motion offsets
   */
  private calculateSwayOffsets(
    time: number,
    amplitude: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    // Organic oscillation for natural sway (much slower than before)
    const swayValue = organicOscillation(time, 0.15); // ~0.15 Hz = very slow sway
    
    offsets.spine = offsets.spine || [0, 0, 0];
    offsets.spine[2] += swayValue * amplitude; // Z-axis sway
    
    // Head follows with slight delay feel
    offsets.head = offsets.head || [0, 0, 0];
    offsets.head[2] += swayValue * amplitude * 0.3;
    offsets.head[1] += swayValue * amplitude * 0.2; // Slight yaw
  }

  /**
   * Calculate natural head micro-movements
   */
  private calculateHeadMicroMovement(
    time: number,
    intensity: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const movement = headMicroMovement(time);
    
    offsets.head = offsets.head || [0, 0, 0];
    offsets.head[0] += movement.pitch * intensity; // Pitch
    offsets.head[1] += movement.yaw * intensity;   // Yaw
    offsets.head[2] += movement.roll * intensity;  // Roll
    
    // Neck follows head subtly
    offsets.neck = offsets.neck || [0, 0, 0];
    offsets.neck[0] += movement.pitch * intensity * 0.3;
    offsets.neck[1] += movement.yaw * intensity * 0.2;
  }

  /**
   * Calculate walking animation offsets
   * Creates a natural walking-in-place cycle with leg movement, arm swing, and body bob
   */
  private calculateWalkingOffsets(
    time: number,
    params: { strideLength?: number; armSwing?: number; amplitude?: number },
    intensity: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const strideLength = (params.strideLength || 25) * intensity;
    const armSwing = (params.armSwing || 30) * intensity;
    const bodyBob = (params.amplitude || 3) * intensity;
    
    // Walking cycle frequency (one full step cycle)
    const walkCycle = time * Math.PI * 2; // Full cycle per second at speed 1.0
    
    // Primary leg motion - sinusoidal for smooth movement
    const legPhase = Math.sin(walkCycle);
    const legPhaseOffset = Math.sin(walkCycle + Math.PI); // Opposite leg
    
    // Add secondary bounce for more natural knee lift
    const kneePhase = Math.max(0, Math.sin(walkCycle)) * 0.5;
    const kneePhaseOffset = Math.max(0, Math.sin(walkCycle + Math.PI)) * 0.5;
    
    // === LEG MOVEMENT ===
    // Upper legs (hips) - forward/backward swing
    offsets.leftUpperLeg = [
      legPhase * strideLength,  // Forward/back swing (X rotation)
      0,                         // No side rotation
      0,                         // No twist
    ];
    offsets.rightUpperLeg = [
      legPhaseOffset * strideLength,  // Opposite phase
      0,
      0,
    ];
    
    // Lower legs (knees) - bend during swing
    // Knee bends more when leg is swinging forward
    const leftKneeBend = Math.max(0, legPhase) * strideLength * 0.8 + kneePhase * 20;
    const rightKneeBend = Math.max(0, legPhaseOffset) * strideLength * 0.8 + kneePhaseOffset * 20;
    
    offsets.leftLowerLeg = [
      leftKneeBend,   // Knee bend
      0,
      0,
    ];
    offsets.rightLowerLeg = [
      rightKneeBend,  // Knee bend
      0,
      0,
    ];
    
    // === ARM SWING (opposite to legs for natural walking) ===
    // Arms swing opposite to the leg on the same side
    offsets.leftUpperArm = [
      -legPhaseOffset * armSwing * 0.6,  // Opposite to left leg
      0,
      0,
    ];
    offsets.rightUpperArm = [
      -legPhase * armSwing * 0.6,        // Opposite to right leg
      0,
      0,
    ];
    
    // Forearms - slight natural bend during swing
    offsets.leftLowerArm = [
      Math.max(0, -legPhaseOffset) * armSwing * 0.3,
      0,
      0,
    ];
    offsets.rightLowerArm = [
      Math.max(0, -legPhase) * armSwing * 0.3,
      0,
      0,
    ];
    
    // === BODY BOB AND SWAY ===
    // Body bobs up slightly when leg passes under (double the frequency)
    const doubleBounce = Math.abs(Math.sin(walkCycle * 2));
    
    // Spine - slight forward lean and side-to-side sway
    offsets.spine = [
      bodyBob * 0.5,                        // Slight forward lean
      legPhase * bodyBob * 0.3,             // Side sway (rotate towards stepping leg)
      legPhase * bodyBob * 0.2,             // Slight side tilt
    ];
    
    // Chest follows spine
    offsets.chest = [
      doubleBounce * bodyBob * 0.2,         // Subtle forward bob
      -legPhase * bodyBob * 0.2,            // Counter-rotate for natural twist
      0,
    ];
    
    // Head stays relatively stable but has subtle movement
    offsets.head = [
      -doubleBounce * bodyBob * 0.1,        // Counter the body bob slightly
      legPhase * bodyBob * 0.1,             // Minimal sway
      0,
    ];
    
    // Neck provides transition between chest and head
    offsets.neck = [
      0,
      -legPhase * bodyBob * 0.15,           // Counter-rotate
      0,
    ];
    
    // Hips rock side to side
    offsets.hips = [
      0,
      legPhase * bodyBob * 0.5,             // Hip sway
      legPhase * bodyBob * 0.3,             // Hip tilt
    ];
  }

  /**
   * Calculate fidgeting offsets — weight shifting, minor restlessness
   * Uses multiple out-of-phase oscillations for organic randomness
   */
  private calculateFidgetOffsets(
    time: number,
    amplitude: number,
    intensity: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const slow1 = organicOscillation(time, 0.12);
    const slow2 = organicOscillation(time * 1.3 + 1.7, 0.09);
    const fast1 = Math.sin(time * 2.1) * 0.3;

    offsets.spine = [
      slow1 * amplitude * 0.3,
      slow2 * amplitude * 0.2,
      slow1 * amplitude * 0.5,
    ];

    offsets.head = [
      slow2 * amplitude * 0.4 + fast1 * intensity,
      slow1 * amplitude * 0.3,
      slow2 * amplitude * 0.2,
    ];

    const armShift = slow1 * amplitude * 0.15;
    offsets.leftUpperArm = [armShift, 0, -armShift * 0.5];
    offsets.rightUpperArm = [-armShift, 0, armShift * 0.5];

    this.calculateBreathingOffsets(time, amplitude * 0.4, offsets);
  }

  /**
   * Calculate rhythmic nodding offsets — for active listening
   */
  private calculateNodOffsets(
    time: number,
    amplitude: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const nodBase = Math.sin(time * Math.PI * 2 * 0.7);
    const nodSmooth = nodBase * 0.7 + Math.sin(time * Math.PI * 2 * 1.4) * 0.3;

    offsets.head = [
      nodSmooth * amplitude,
      Math.sin(time * 0.4) * amplitude * 0.1,
      0,
    ];
    offsets.neck = [
      nodSmooth * amplitude * 0.3,
      0,
      0,
    ];

    this.calculateBreathingOffsets(time, amplitude * 0.3, offsets);
  }

  /**
   * Calculate look-around offsets — scanning the environment
   */
  private calculateLookAroundOffsets(
    time: number,
    amplitude: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const yaw = organicOscillation(time, 0.15) * amplitude;
    const pitch = organicOscillation(time * 0.7 + 2.0, 0.1) * amplitude * 0.3;
    const neckFollow = 0.4;

    offsets.head = [pitch, yaw, 0];
    offsets.neck = [pitch * neckFollow, yaw * neckFollow, 0];

    const bodyFollow = 0.15;
    offsets.spine = [0, yaw * bodyFollow, 0];

    this.calculateBreathingOffsets(time, amplitude * 0.15, offsets);
  }

  /**
   * Calculate dance offsets — rhythmic body movement
   * Combines hip sway, shoulder bounce, and arm movement
   */
  private calculateDanceOffsets(
    time: number,
    amplitude: number,
    intensity: number,
    offsets: Record<string, [number, number, number]>
  ): void {
    const beat = time * Math.PI * 2;
    const hipSway = Math.sin(beat) * amplitude;
    const bounce = Math.abs(Math.sin(beat * 2)) * amplitude * 0.5;
    const shoulderRock = Math.sin(beat + 0.5) * amplitude * 0.4;

    offsets.spine = [
      bounce * 0.3,
      hipSway * 0.3,
      hipSway * 0.5,
    ];

    offsets.chest = [
      -bounce * 0.2,
      -hipSway * 0.2,
      shoulderRock,
    ];

    offsets.head = [
      -bounce * 0.15,
      hipSway * 0.15,
      0,
    ];

    const armBounce = bounce * intensity;
    offsets.leftUpperArm = [
      -armBounce * 3,
      0,
      Math.sin(beat + 1.0) * amplitude * 0.8,
    ];
    offsets.rightUpperArm = [
      -armBounce * 3,
      0,
      -Math.sin(beat + 1.0) * amplitude * 0.8,
    ];

    offsets.leftLowerArm = [0, 0, Math.sin(beat * 2) * amplitude * 0.3 * intensity];
    offsets.rightLowerArm = [0, 0, -Math.sin(beat * 2) * amplitude * 0.3 * intensity];

    offsets.hips = [
      0,
      hipSway * 0.4,
      hipSway * 0.3,
    ];
  }

  /**
   * Update bounce position using smooth damp
   */
  private updateBouncePosition(time: number, amplitude: number, delta: number): void {
    if (!this.vrm?.scene) return;
    
    // Calculate target bounce position
    const bounceValue = Math.abs(Math.sin(time * Math.PI * 2)) * amplitude;
    const targetY = this.basePosition[1] + bounceValue;
    
    // Smooth damp to target
    const velocityRef = { value: this.positionVelocityY };
    this.currentPositionY = smoothDamp(
      this.currentPositionY,
      targetY,
      velocityRef,
      0.08, // Fast but smooth
      delta
    );
    this.positionVelocityY = velocityRef.value;
    
    this.vrm.scene.position.y = this.currentPositionY;
  }

  /**
   * Update float position using smooth damp
   */
  private updateFloatPosition(time: number, amplitude: number, delta: number): void {
    if (!this.vrm?.scene) return;
    
    // Slower, dreamier float
    const floatValue = Math.sin(time * Math.PI * 0.5) * amplitude;
    const targetY = this.basePosition[1] + floatValue;
    
    const velocityRef = { value: this.positionVelocityY };
    this.currentPositionY = smoothDamp(
      this.currentPositionY,
      targetY,
      velocityRef,
      0.3, // Slow, dreamy
      delta
    );
    this.positionVelocityY = velocityRef.value;
    
    this.vrm.scene.position.y = this.currentPositionY;
  }

  /**
   * Apply final bone rotations with smooth damping.
   * Uses vrm.humanoid.setNormalizedPose() with quaternions for correct
   * bone transform transfer to the output (raw) skeleton.
   */
  private applyBoneRotations(delta: number): void {
    if (!this.vrm?.humanoid) return;
    
    const pose: VRMPose = {};
    const euler = new THREE.Euler();
    const quat = new THREE.Quaternion();
    
    for (const [boneName, state] of this.boneStates) {
      const vrmBoneName = BONE_MAP[boneName];
      if (!vrmBoneName) continue;
      
      const velX = { value: state.velocity.x };
      const velY = { value: state.velocity.y };
      const velZ = { value: state.velocity.z };
      
      state.current.x = smoothDamp(state.current.x, state.target.x, velX, this.smoothTime, delta);
      state.current.y = smoothDamp(state.current.y, state.target.y, velY, this.smoothTime, delta);
      state.current.z = smoothDamp(state.current.z, state.target.z, velZ, this.smoothTime, delta);
      
      state.velocity.x = velX.value;
      state.velocity.y = velY.value;
      state.velocity.z = velZ.value;
      
      euler.set(state.current.x, state.current.y, state.current.z);
      quat.setFromEuler(euler);
      
      pose[vrmBoneName] = {
        rotation: [quat.x, quat.y, quat.z, quat.w] as [number, number, number, number],
      };
    }
    
    this.vrm.humanoid.setNormalizedPose(pose);
  }

  /**
   * Get current pose state (for debugging)
   */
  getCurrentPose(): Record<string, [number, number, number]> {
    const pose: Record<string, [number, number, number]> = {};
    for (const [boneName, state] of this.boneStates) {
      pose[boneName] = [
        state.current.x / (Math.PI / 180),
        state.current.y / (Math.PI / 180),
        state.current.z / (Math.PI / 180),
      ];
    }
    return pose;
  }

  /**
   * Dispose the controller
   */
  dispose(): void {
    this.vrm = null;
    this.versionHandler = null;
    this.basePose = { ...DEFAULT_RELAXED_POSE };
    this.currentMotion = null;
    this.gestureAnimation = null;
    this.boneStates.clear();
    this.poseTransition = null;
  }
}

// Factory function
export function createPoseController(): PoseController {
  return new PoseController();
}
