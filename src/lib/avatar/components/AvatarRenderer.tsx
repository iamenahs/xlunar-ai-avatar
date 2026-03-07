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
import { VRMLoaderPlugin, VRM, VRMUtils } from "@pixiv/three-vrm";

import type { AvatarTransform, AppearanceConfig, MouthAnimationConfig } from "../types";
import type { PosePreset, HandGesture, BodyGesture, BodyMotion } from "../config/poses";
import type { MotionSequenceDefinition } from "../animation/MotionSequence";
import type { ExpressionPreset } from "../config/expressions";
import { AnimationController, createAnimationController } from "../animation/AnimationController";
import { PoseController, createPoseController } from "../animation/PoseController";
import { MotionSequencePlayer } from "../animation/MotionSequence";
import { VrmaPlayer, createVrmaPlayer } from "../animation/VrmaPlayer";
import { ExpressionController, createExpressionController } from "../animation/ExpressionController";
import { detectVrmVersion } from "../loaders";
import type { AvatarController } from "../controller/AvatarController";

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
  /** VRMA animation URL to play (null/undefined = stop) */
  vrmaUrl?: string | null;
  /** Whether to loop the VRMA animation */
  vrmaLoop?: boolean;
  /** Facial expression preset */
  expression?: ExpressionPreset | null;
  /** Callback when VRM is loaded */
  onLoad?: (vrm: VRM) => void;
  /** Callback on load error */
  onError?: (error: Error) => void;
  /** Current audio amplitude (0-1) */
  amplitude?: number;
  /** Whether audio is playing */
  isPlaying?: boolean;
  /** Optional AvatarController for programmatic control */
  controller?: AvatarController;
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
  vrmaUrl,
  vrmaLoop = true,
  expression,
  onLoad,
  amplitude = 0,
  isPlaying = false,
  controller,
}: AvatarRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const poseControllerRef = useRef<PoseController | null>(null);
  const sequencePlayerRef = useRef<MotionSequencePlayer | null>(null);
  const vrmaPlayerRef = useRef<VrmaPlayer | null>(null);
  const expressionControllerRef = useRef<ExpressionController | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const lastPoseRef = useRef<string | null>(null);
  const lastHandGestureRef = useRef<string | null>(null);
  const lastBodyGestureRef = useRef<string | null>(null);
  const lastBodyMotionRef = useRef<string | null>(null);
  const lastSequenceRef = useRef<string | null>(null);
  const lastVrmaUrlRef = useRef<string | null>(null);
  const lastExpressionRef = useRef<string | null>(null);

  // Load GLTF with VRM plugin (always register — VRoid GLBs contain VRM extensions)
  const gltf = useLoader(
    GLTFLoader,
    appearance.modelUrl,
    (loader) => {
      loader.register((parser) => new VRMLoaderPlugin(parser, { autoUpdateHumanBones: true }));
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

    // Optimize VRM: combine skeletons so mesh deformation follows humanoid bones
    if (vrm) {
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
    }

    // Detect VRM version and apply version-specific scene setup
    const handler = detectVrmVersion(vrm, appearance.modelUrl);
    const sceneRoot = handler.setupScene(sceneObj);
    group.add(sceneRoot);

    // Store VRM reference
    vrmRef.current = vrm ?? null;

    // Initialize animation controller
    if (vrm) {
      const animCtrl = createAnimationController();
      animCtrl.init(vrm, mouthConfig);
      controllerRef.current = animCtrl;

      // Initialize pose controller (pass fileUrl for GLB detection)
      const poseCtrl = createPoseController();
      poseCtrl.init(vrm, appearance.modelUrl);
      poseControllerRef.current = poseCtrl;

      // Initialize sequence player with pose controller
      const seqPlayer = new MotionSequencePlayer();
      seqPlayer.init(vrm, poseCtrl);
      sequencePlayerRef.current = seqPlayer;

      // Initialize VRMA player
      const vrmaPlayer = createVrmaPlayer();
      vrmaPlayer.init(vrm);
      vrmaPlayerRef.current = vrmaPlayer;

      // Initialize expression controller
      const exprController = createExpressionController();
      exprController.init(vrm);
      expressionControllerRef.current = exprController;

      // Reset pose tracking
      lastPoseRef.current = null;
      lastHandGestureRef.current = null;
      lastBodyGestureRef.current = null;
      lastBodyMotionRef.current = null;
      lastSequenceRef.current = null;
      lastVrmaUrlRef.current = null;
      lastExpressionRef.current = null;

      // Register with AvatarController if provided
      if (controller) {
        controller._register({
          setPose: (p) => { if (poseCtrl && p) poseCtrl.applyPose(p); },
          setHandGesture: (g) => { if (poseCtrl && g) poseCtrl.applyHandGesture(g); },
          setBodyGesture: (g) => { if (poseCtrl && g) poseCtrl.playBodyGesture(g); },
          setBodyMotion: (m) => { if (poseCtrl && m) poseCtrl.setBodyMotion(m); },
          setExpression: (e) => { if (exprController) exprController.setExpression(e); },
          setVrma: (url, loop) => {
            if (!vrmaPlayer) return;
            if (url) {
              vrmaPlayer.loadAnimation(url).then(() => {
                vrmaPlayer.play(url, { loop: loop ?? true });
              }).catch((err) => console.error("Failed to load VRMA:", err));
            } else {
              vrmaPlayer.stop();
            }
          },
          setSequence: (seq) => {
            if (!seqPlayer) return;
            if (seq) {
              seqPlayer.play(seq, {
                onComplete: () => controller._onSequenceComplete(),
              });
            } else {
              seqPlayer.stop();
            }
          },
          setRawPose: (bones) => {
            if (!poseCtrl) return;
            poseCtrl.applyPose({
              id: "_raw",
              name: "Raw Pose",
              description: "LLM-generated pose",
              bones,
            });
          },
          setRawExpression: (values) => {
            if (!exprController) return;
            for (const [name, state] of Object.entries(values)) {
              if (typeof state === "number") {
                exprController.setExpressionValue(name, state);
              }
            }
          },
          getVrmaPlaying: () => vrmaPlayer?.getIsPlaying() ?? false,
          getSequencePlaying: () => seqPlayer?.getIsPlaying() ?? false,
        });
      }
    }

    // Notify parent
    if (vrm && onLoad) {
      onLoad(vrm);
    }

    return () => {
      controller?._unregister();
      controllerRef.current?.dispose();
      controllerRef.current = null;
      poseControllerRef.current?.dispose();
      poseControllerRef.current = null;
      sequencePlayerRef.current?.dispose();
      sequencePlayerRef.current = null;
      vrmaPlayerRef.current?.dispose();
      vrmaPlayerRef.current = null;
    };
  }, [gltf, vrm, mouthConfig, onLoad, controller]);

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

  // Load and play/stop VRMA animation when URL changes
  useEffect(() => {
    const player = vrmaPlayerRef.current;
    if (!player) return;

    if (vrmaUrl && vrmaUrl !== lastVrmaUrlRef.current) {
      lastVrmaUrlRef.current = vrmaUrl;
      player.loadAnimation(vrmaUrl).then(() => {
        player.play(vrmaUrl, { loop: vrmaLoop });
      }).catch((err) => {
        console.error("Failed to load VRMA animation:", err);
      });
    } else if (!vrmaUrl && lastVrmaUrlRef.current) {
      player.stop();
      lastVrmaUrlRef.current = null;
    }
  }, [vrmaUrl, vrmaLoop]);

  // Apply expression when expression prop changes
  useEffect(() => {
    const exprController = expressionControllerRef.current;
    const animCtrlInstance = controllerRef.current;
    if (!exprController) return;

    const exprId = expression?.id ?? null;
    if (exprId !== lastExpressionRef.current) {
      lastExpressionRef.current = exprId;

      const idleLayer = animCtrlInstance?.getLayer<import('../animation/AnimationLayer').IdleBodyLayer>('idle-body');

      if (expression) {
        const vals = expression.values;
        const lookKeys = ['lookUp', 'lookDown', 'lookLeft', 'lookRight'];
        const hasLook = lookKeys.some(k => k in vals);
        const hasBlink = 'blink' in vals || 'blinkLeft' in vals || 'blinkRight' in vals;

        if (idleLayer) {
          idleLayer.suppressLook = hasLook;
          idleLayer.suppressBlink = hasBlink;
          idleLayer.suppressExpression = !!expression;
        }

        // Pass all expression values (including look directions) to the
        // ExpressionController. Look direction expressions depend on whether
        // the model has morph target bindings for lookUp/Down/Left/Right;
        // they work on models that support them and are silently ignored on others.
        exprController.setExpression(expression);
      } else {
        if (idleLayer) {
          idleLayer.suppressLook = false;
          idleLayer.suppressBlink = false;
          idleLayer.suppressExpression = false;
        }
        exprController.setExpression(null);
      }
    }
  }, [expression]);

  // Animation frame update
  useFrame((_state, delta) => {
    const seqPlaying = sequencePlayerRef.current?.getIsPlaying();
    const vrmaPlaying = vrmaPlayerRef.current?.getIsPlaying();

    // 1. Animation controller runs layers (mouth sync, idle, etc.)
    //    Disable idle body when a VRMA or sequence is playing
    if (controllerRef.current) {
      controllerRef.current.setLayerEnabled('idle-body', !seqPlaying && !vrmaPlaying);
      controllerRef.current.update(delta, amplitude, isPlaying);
    }

    // 1.5. Expression controller updates (smooth transitions between expressions)
    if (expressionControllerRef.current) {
      expressionControllerRef.current.update(delta);
    }

    // 2. VRMA player update (drives AnimationMixer internally)
    //    When a VRMA is active, it fully controls bone transforms
    if (vrmaPlaying && vrmaPlayerRef.current) {
      vrmaPlayerRef.current.update(delta);
    }

    // 3. Sequence player advances steps
    if (!vrmaPlaying && seqPlaying && sequencePlayerRef.current) {
      sequencePlayerRef.current.update(delta);
      
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

    // 4. PoseController computes and writes to normalized bones
    //    Skip when VRMA is driving bones to avoid conflicts
    if (!vrmaPlaying && poseControllerRef.current) {
      poseControllerRef.current.update(delta);
    }

    // 5. vrm.update() transfers normalized bones, applies lookAt, and updates expressions
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
