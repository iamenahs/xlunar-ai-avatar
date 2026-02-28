"use client";

/**
 * AvatarRenderer Component
 * Core VRM/GLTF model loader and renderer
 * Handles model loading, rig setup, and exposes control interface
 */

import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";

import type { AvatarTransform, AppearanceConfig, MouthAnimationConfig } from "../types";
import type { PosePreset, HandGesture, BodyGesture, BodyMotion } from "../config/poses";
import type { MotionSequenceDefinition } from "../animation/MotionSequence";
import { AnimationController, createAnimationController } from "../animation/AnimationController";
import { PoseController, createPoseController } from "../animation/PoseController";
import { MotionSequencePlayer } from "../animation/MotionSequence";

export interface AvatarRendererProps {
  /** Model appearance config (URL required) */
  appearance: AppearanceConfig;
  /** Avatar transform (position, rotation, scale) */
  transform?: AvatarTransform;
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
  /** Motion sequence to play */
  motionSequence?: MotionSequenceDefinition | null;
  /** Callback when a motion sequence completes */
  onSequenceComplete?: () => void;
  /** Callback when VRM is loaded */
  onLoad?: (vrm: VRM) => void;
  /** Callback on load error */
  onError?: (error: Error) => void;
  /** Current audio amplitude (0-1) */
  amplitude?: number;
  /** Whether audio is playing */
  isPlaying?: boolean;
}

/**
 * Inner avatar component that handles the actual loading and rendering
 */
function AvatarInner({
  appearance,
  transform,
  mouthConfig,
  pose,
  handGesture,
  bodyGesture,
  bodyMotion,
  motionSequence,
  onSequenceComplete,
  onLoad,
  amplitude = 0,
  isPlaying = false,
}: AvatarRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const poseControllerRef = useRef<PoseController | null>(null);
  const sequencePlayerRef = useRef<MotionSequencePlayer | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const lastPoseRef = useRef<string | null>(null);
  const lastHandGestureRef = useRef<string | null>(null);
  const lastBodyGestureRef = useRef<string | null>(null);
  const lastBodyMotionRef = useRef<string | null>(null);
  const lastSequenceRef = useRef<string | null>(null);

  // Load GLTF with VRM plugin (always register — VRoid GLBs contain VRM extensions)
  const gltf = useLoader(
    GLTFLoader,
    appearance.modelUrl,
    (loader) => {
      loader.register((parser) => new VRMLoaderPlugin(parser));
    }
  );

  // Extract VRM from loaded GLTF
  const vrm = (gltf as { userData?: { vrm?: VRM } })?.userData?.vrm;

  // Setup when model loads
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous content
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Get scene from VRM or raw GLTF
    const sceneObj = vrm?.scene ?? gltf.scene;
    if (!sceneObj) return;

    // VRM 0.x meshes face -Z in glTF space. Wrap the scene in a pivot that
    // rotates it 180° around Y so the character faces the camera. This does
    // NOT affect normalised-bone local axes, so pose data works identically
    // for VRM 0.x and 1.0 models.
    const isVrm0 = vrm && ((vrm.meta as any)?.metaVersion === '0' || (vrm.meta as any)?.metaVersion === 0);
    if (isVrm0) {
      const pivot = new THREE.Group();
      pivot.rotation.y = Math.PI;
      pivot.add(sceneObj);
      group.add(pivot);
    } else {
      group.add(sceneObj);
    }

    // Store VRM reference
    vrmRef.current = vrm ?? null;

    // Initialize animation controller
    if (vrm) {
      const controller = createAnimationController();
      controller.init(vrm, mouthConfig);
      controllerRef.current = controller;

      // Initialize pose controller
      const poseCtrl = createPoseController();
      poseCtrl.init(vrm);
      poseControllerRef.current = poseCtrl;

      // Initialize sequence player with pose controller
      const seqPlayer = new MotionSequencePlayer();
      seqPlayer.init(vrm, poseCtrl);
      sequencePlayerRef.current = seqPlayer;

      // Reset pose tracking
      lastPoseRef.current = null;
      lastHandGestureRef.current = null;
      lastBodyGestureRef.current = null;
      lastBodyMotionRef.current = null;
      lastSequenceRef.current = null;
    }

    // Notify parent
    if (vrm && onLoad) {
      onLoad(vrm);
    }

    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
      poseControllerRef.current?.dispose();
      poseControllerRef.current = null;
      sequencePlayerRef.current?.dispose();
      sequencePlayerRef.current = null;
    };
  }, [gltf, vrm, mouthConfig, onLoad]);

  // Apply pose when it changes
  useEffect(() => {
    const poseCtrl = poseControllerRef.current;
    if (!poseCtrl || !pose) return;
    
    if (pose.id !== lastPoseRef.current) {
      poseCtrl.applyPose(pose);
      lastPoseRef.current = pose.id;
    }
  }, [pose]);

  // Apply hand gesture when it changes
  useEffect(() => {
    const poseCtrl = poseControllerRef.current;
    if (!poseCtrl || !handGesture) return;
    
    if (handGesture.id !== lastHandGestureRef.current) {
      poseCtrl.applyHandGesture(handGesture);
      lastHandGestureRef.current = handGesture.id;
    }
  }, [handGesture]);

  // Apply body gesture when it changes
  useEffect(() => {
    const poseCtrl = poseControllerRef.current;
    if (!poseCtrl || !bodyGesture) return;
    
    if (bodyGesture.id !== lastBodyGestureRef.current) {
      poseCtrl.playBodyGesture(bodyGesture);
      lastBodyGestureRef.current = bodyGesture.id;
    }
  }, [bodyGesture]);

  // Apply body motion when it changes
  useEffect(() => {
    const poseCtrl = poseControllerRef.current;
    if (!poseCtrl || !bodyMotion) return;
    
    if (bodyMotion.id !== lastBodyMotionRef.current) {
      poseCtrl.setBodyMotion(bodyMotion);
      lastBodyMotionRef.current = bodyMotion.id;
    }
  }, [bodyMotion]);

  // Play motion sequence when it changes
  useEffect(() => {
    const seqPlayer = sequencePlayerRef.current;
    if (!seqPlayer) return;

    if (motionSequence && motionSequence.id !== lastSequenceRef.current) {
      lastSequenceRef.current = motionSequence.id;
      seqPlayer.play(motionSequence, {
        onComplete: () => {
          lastSequenceRef.current = null;
          onSequenceComplete?.();
        },
      });
    } else if (!motionSequence && lastSequenceRef.current) {
      seqPlayer.stop();
      lastSequenceRef.current = null;
    }
  }, [motionSequence, onSequenceComplete]);

  // Animation frame update
  useFrame((_state, delta) => {
    const seqPlaying = sequencePlayerRef.current?.getIsPlaying();

    // 1. Animation controller runs layers (mouth sync, idle, etc.)
    if (controllerRef.current) {
      controllerRef.current.setLayerEnabled('idle-body', !seqPlaying);
      controllerRef.current.update(delta, amplitude, isPlaying);
    }

    // 2. Sequence player advances steps (no longer calls poseController directly)
    if (seqPlaying && sequencePlayerRef.current) {
      sequencePlayerRef.current.update(delta);
      
      // Apply pending pose from sequence player using the SAME path as Pose tab
      const pendingDuration = sequencePlayerRef.current.getPendingTransitionDuration();
      if (pendingDuration !== null && poseControllerRef.current) {
        poseControllerRef.current.setTransitionDuration(pendingDuration);
      }
      const pendingPose = sequencePlayerRef.current.getPendingPose();
      if (pendingPose && poseControllerRef.current) {
        poseControllerRef.current.applyPose(pendingPose);
      }
      const pendingGesture = sequencePlayerRef.current.getPendingHandGesture();
      if (pendingGesture && poseControllerRef.current) {
        poseControllerRef.current.applyHandGesture(pendingGesture as any);
      }
    }

    // 3. PoseController computes and writes to normalized bones
    if (poseControllerRef.current) {
      poseControllerRef.current.update(delta);
    }

    // 4. vrm.update() transfers normalized bones to output skeleton
    //    Must run AFTER PoseController so bone writes are picked up
    if (vrmRef.current) {
      vrmRef.current.update(delta);
    }
  });

  // Apply transform
  const pos = transform?.position ?? [0, 0, 0];
  const rot = transform?.rotation ?? [0, 0, 0];
  const scl = transform?.scale ?? 1;

  return (
    <group
      ref={groupRef}
      position={pos}
      rotation={rot}
      scale={typeof scl === "number" ? [scl, scl, scl] : scl}
    />
  );
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

/**
 * Main AvatarRenderer with Suspense boundary
 */
export function AvatarRenderer(props: AvatarRendererProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AvatarInner {...props} />
    </Suspense>
  );
}

/**
 * Convenience export for the complete speech scene
 */
export { AvatarRenderer as Avatar };
