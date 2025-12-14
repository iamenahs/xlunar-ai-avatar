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
import { AnimationController, createAnimationController } from "../animation/AnimationController";
import { PoseController, createPoseController } from "../animation/PoseController";

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
  /** Callback when VRM is loaded */
  onLoad?: (vrm: VRM) => void;
  /** Callback on load error */
  onError?: (error: Error) => void;
  /** Current audio amplitude (0-1) */
  amplitude?: number;
  /** Whether audio is playing */
  isPlaying?: boolean;
}

function isVrmUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".vrm");
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
  onLoad,
  amplitude = 0,
  isPlaying = false,
}: AvatarRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const poseControllerRef = useRef<PoseController | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const lastPoseRef = useRef<string | null>(null);
  const lastHandGestureRef = useRef<string | null>(null);
  const lastBodyGestureRef = useRef<string | null>(null);
  const lastBodyMotionRef = useRef<string | null>(null);

  // Load GLTF with VRM plugin
  const gltf = useLoader(
    GLTFLoader,
    appearance.modelUrl,
    (loader) => {
      // Register VRM plugin if it's a VRM file
      if (appearance.skinId === "vrm" || isVrmUrl(appearance.modelUrl)) {
        loader.register((parser) => new VRMLoaderPlugin(parser));
      }
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

    // Add to group
    group.add(sceneObj);

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

      // Reset pose tracking
      lastPoseRef.current = null;
      lastHandGestureRef.current = null;
      lastBodyGestureRef.current = null;
      lastBodyMotionRef.current = null;
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

  // Animation frame update
  useFrame((state, delta) => {
    // Update animation controller (for mouth sync)
    if (controllerRef.current) {
      controllerRef.current.update(delta, amplitude, isPlaying);
    }

    // Update pose controller (for body motion and gestures)
    if (poseControllerRef.current) {
      poseControllerRef.current.update(delta);
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
