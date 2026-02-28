/**
 * Motion Sequence System
 *
 * Orchestrates complex multi-step motion combinations by driving the
 * PoseController and VRM expression manager. Each step can set a body
 * pose, hand gesture, facial expression, and body motion, with smooth
 * transitions handled by the existing PoseController infrastructure.
 */

import type { VRM, VRMExpressionPresetName } from "@pixiv/three-vrm";
import type { PosePreset } from "../config/poses";
import { smoothDamp } from "./easing";
import type { PoseController } from "./PoseController";

// ============================================================================
// Types
// ============================================================================

export interface ExpressionState {
  happy?: number;
  angry?: number;
  sad?: number;
  relaxed?: number;
  surprised?: number;
  neutral?: number;
}

export interface MotionStep {
  label?: string;
  duration: number;
  easing?: "linear" | "easeInOut" | "easeIn" | "easeOut" | "sharp" | "gentle";
  bones?: Record<string, [number, number, number]>;
  handGesture?: {
    hand: "left" | "right" | "both";
    fingers: { thumb?: number; index?: number; middle?: number; ring?: number; pinky?: number };
  };
  expression?: ExpressionState;
  bodyMotionId?: string;
  holdDuration?: number;
}

export interface MotionSequenceDefinition {
  id: string;
  name: string;
  description: string;
  category: "emotion" | "social" | "thinking" | "reaction" | "presentation" | "idle";
  steps: MotionStep[];
  loop?: boolean;
}

// ============================================================================
// MotionSequencePlayer
// ============================================================================

export class MotionSequencePlayer {
  private vrm: VRM | null = null;
  private poseController: PoseController | null = null;
  private sequence: MotionSequenceDefinition | null = null;
  private currentStepIndex = 0;
  private stepElapsed = 0;
  private isPlaying = false;
  private holdRemaining = 0;

  // Expression smooth states
  private exprTargets: Map<string, number> = new Map();
  private exprCurrent: Map<string, number> = new Map();
  private exprVelocities: Map<string, number> = new Map();

  private onComplete?: () => void;

  init(vrm: VRM, poseController: PoseController): void {
    this.vrm = vrm;
    this.poseController = poseController;
  }

  play(
    sequence: MotionSequenceDefinition,
    callbacks?: { onComplete?: () => void }
  ): void {
    if (!this.vrm || !this.poseController) return;

    this.sequence = sequence;
    this.currentStepIndex = 0;
    this.stepElapsed = 0;
    this.isPlaying = true;
    this.holdRemaining = 0;
    this.onComplete = callbacks?.onComplete;

    // Use snappier smooth time during sequences for responsive motion
    this.poseController.setSmoothTime(0.06);

    // Reset expression state
    this.exprTargets.clear();
    this.exprCurrent.clear();
    this.exprVelocities.clear();

    // Apply first step
    this.applyStep(0);
  }

  stop(): void {
    this.isPlaying = false;
    this.sequence = null;
    this.poseController?.resetSmoothTime();
    if (this.vrm?.expressionManager) {
      for (const key of this.exprTargets.keys()) {
        this.exprTargets.set(key, 0);
      }
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  getSequence(): MotionSequenceDefinition | null {
    return this.sequence;
  }

  getPoseController(): PoseController | null {
    return this.poseController;
  }

  private pendingPose: PosePreset | null = null;
  private pendingHandGesture: { id: string; name: string; description: string; hand: "left" | "right" | "both"; fingers: Record<string, number | undefined> } | null = null;
  private pendingTransitionDuration: number | null = null;

  getPendingPose(): PosePreset | null {
    const p = this.pendingPose;
    this.pendingPose = null;
    return p;
  }

  getPendingHandGesture(): { id: string; name: string; description: string; hand: "left" | "right" | "both"; fingers: Record<string, number | undefined> } | null {
    const g = this.pendingHandGesture;
    this.pendingHandGesture = null;
    return g;
  }

  getPendingTransitionDuration(): number | null {
    const d = this.pendingTransitionDuration;
    this.pendingTransitionDuration = null;
    return d;
  }

  private applyStep(stepIndex: number): void {
    if (!this.sequence || !this.poseController) return;
    const step = this.sequence.steps[stepIndex];
    if (!step) return;
    // Store pending pose for AvatarRenderer to apply (same code path as Pose tab)
    if (step.bones) {
      this.pendingPose = {
        id: `seq_${this.sequence.id}_step_${stepIndex}_${Date.now()}`,
        name: step.label || `Step ${stepIndex}`,
        description: "",
        bones: step.bones as PosePreset["bones"],
      };

      if (step.easing === "sharp") {
        this.pendingTransitionDuration = 0.15;
      } else if (step.easing === "gentle") {
        this.pendingTransitionDuration = 0.5;
      } else {
        this.pendingTransitionDuration = 0.3;
      }
    }

    // Store pending hand gesture
    if (step.handGesture) {
      this.pendingHandGesture = {
        id: `seq_hand_${stepIndex}`,
        name: "",
        description: "",
        hand: step.handGesture.hand,
        fingers: step.handGesture.fingers,
      };
    }

    // Set expression targets
    if (step.expression) {
      for (const [expr, value] of Object.entries(step.expression)) {
        if (value !== undefined) {
          this.exprTargets.set(expr, value);
          if (!this.exprCurrent.has(expr)) {
            this.exprCurrent.set(expr, 0);
            this.exprVelocities.set(expr, 0);
          }
        }
      }
    }
  }

  update(delta: number): void {
    if (!this.isPlaying || !this.vrm || !this.sequence) return;

    // Clamp delta to avoid huge jumps when tab is hidden
    const clampedDelta = Math.min(delta, 0.1);

    const steps = this.sequence.steps;
    if (this.currentStepIndex >= steps.length) {
      if (this.sequence.loop) {
        this.currentStepIndex = 0;
        this.stepElapsed = 0;
        this.holdRemaining = 0;
        this.applyStep(0);
      } else {
        this.isPlaying = false;
        this.poseController?.resetSmoothTime();
        this.onComplete?.();
        return;
      }
    }

    const currentStep = steps[this.currentStepIndex];
    const stepDurationSec = currentStep.duration / 1000;

    this.stepElapsed += clampedDelta;

    // Handle hold
    if (this.stepElapsed >= stepDurationSec && currentStep.holdDuration) {
      if (this.holdRemaining <= 0) {
        this.holdRemaining = currentStep.holdDuration / 1000;
      }
      this.holdRemaining -= clampedDelta;
      if (this.holdRemaining <= 0) {
        this.advanceStep();
      }
      this.updateExpressions(clampedDelta);
      return;
    }

    if (this.stepElapsed >= stepDurationSec) {
      this.advanceStep();
      this.updateExpressions(clampedDelta);
      return;
    }

    this.updateExpressions(clampedDelta);
  }

  private advanceStep(): void {
    this.currentStepIndex++;
    this.stepElapsed = 0;
    this.holdRemaining = 0;

    if (this.sequence && this.currentStepIndex < this.sequence.steps.length) {
      this.applyStep(this.currentStepIndex);
    }
  }

  private updateExpressions(delta: number): void {
    if (!this.vrm?.expressionManager) return;

    for (const [expr, target] of this.exprTargets) {
      const current = this.exprCurrent.get(expr) ?? 0;
      const vel = this.exprVelocities.get(expr) ?? 0;

      const vRef = { value: vel };
      const newVal = smoothDamp(current, target, vRef, 0.25, delta);
      this.exprCurrent.set(expr, newVal);
      this.exprVelocities.set(expr, vRef.value);

      try {
        this.vrm.expressionManager.setValue(
          expr as VRMExpressionPresetName,
          Math.max(0, Math.min(1, newVal))
        );
      } catch { /* expression not available */ }
    }
  }

  dispose(): void {
    this.vrm = null;
    this.poseController = null;
    this.sequence = null;
    this.isPlaying = false;
    this.exprTargets.clear();
    this.exprCurrent.clear();
    this.exprVelocities.clear();
  }
}
