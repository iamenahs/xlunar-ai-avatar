/**
 * Expression Controller
 *
 * Manages facial expressions for VRM models with smooth transitions
 * and the ability to blend multiple expressions together.
 */

import type { VRM, VRMExpressionPresetName } from "@pixiv/three-vrm";
import type { ExpressionPreset } from "../config/expressions";
import { smoothDamp } from "./easing";

interface ExpressionState {
  target: number;
  current: number;
  velocity: number;
}

export class ExpressionController {
  private vrm: VRM | null = null;
  private states: Map<string, ExpressionState> = new Map();
  private activePreset: ExpressionPreset | null = null;
  private transitionTime = 0.3; // Smooth transition time in seconds

  /**
   * Initialize with a VRM model
   */
  init(vrm: VRM): void {
    this.vrm = vrm;
    this.states.clear();
    this.activePreset = null;
  }

  /**
   * Set the transition time for expression changes
   */
  setTransitionTime(seconds: number): void {
    this.transitionTime = Math.max(0.05, seconds);
  }

  /**
   * Apply an expression preset
   */
  setExpression(preset: ExpressionPreset | null): void {
    this.activePreset = preset;

    if (!preset) {
      // Reset all expressions to 0
      for (const [name, state] of this.states) {
        state.target = 0;
      }
      return;
    }

    // Set target values for all expressions in the preset
    for (const [name, value] of Object.entries(preset.values)) {
      if (typeof value === "number") {
        this.setExpressionValue(name, value);
      }
    }

    // Reset any expressions not in this preset to 0
    for (const [exprName, state] of this.states) {
      if (!(exprName in preset.values)) {
        state.target = 0;
      }
    }
  }

  /**
   * Set a single expression value (0-1)
   */
  setExpressionValue(name: string, value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value));

    if (!this.states.has(name)) {
      this.states.set(name, {
        target: clampedValue,
        current: 0,
        velocity: 0,
      });
    } else {
      const state = this.states.get(name)!;
      state.target = clampedValue;
    }
  }

  /**
   * Get current expression value
   */
  getExpressionValue(name: string): number {
    return this.states.get(name)?.current ?? 0;
  }

  /**
   * Update expressions with smooth transitions
   * Call this every frame
   */
  update(delta: number): void {
    if (!this.vrm?.expressionManager) return;

    const clampedDelta = Math.min(delta, 0.1); // Prevent large jumps

    for (const [name, state] of this.states) {
      // Skip if already at target
      if (Math.abs(state.current - state.target) < 0.001) {
        state.current = state.target;
        state.velocity = 0;
      } else {
        // Smooth interpolation
        const velocityRef = { value: state.velocity };
        state.current = smoothDamp(
          state.current,
          state.target,
          velocityRef,
          this.transitionTime,
          clampedDelta
        );
        state.velocity = velocityRef.value;
      }

      // Apply to VRM
      this.applyExpression(name, state.current);
    }
  }

  /**
   * Apply expression value to VRM
   */
  private applyExpression(name: string, value: number): void {
    if (!this.vrm?.expressionManager) return;

    try {
      this.vrm.expressionManager.setValue(
        name as VRMExpressionPresetName,
        value
      );
    } catch {
      // Expression not available on this model
    }
  }

  /**
   * Immediately set expression without transition
   */
  setExpressionImmediate(preset: ExpressionPreset | null): void {
    this.activePreset = preset;

    // Reset all to 0 first
    for (const [, state] of this.states) {
      state.target = 0;
      state.current = 0;
      state.velocity = 0;
    }

    if (preset) {
      for (const [name, value] of Object.entries(preset.values)) {
        if (typeof value === "number") {
          if (!this.states.has(name)) {
            this.states.set(name, {
              target: value,
              current: value,
              velocity: 0,
            });
          } else {
            const state = this.states.get(name)!;
            state.target = value;
            state.current = value;
            state.velocity = 0;
          }
          this.applyExpression(name, value);
        }
      }
    }
  }

  /**
   * Blend multiple expressions together
   */
  blendExpressions(
    presets: Array<{ preset: ExpressionPreset; weight: number }>
  ): void {
    // Reset all targets to 0
    for (const [, state] of this.states) {
      state.target = 0;
    }

    // Accumulate weighted values
    for (const { preset, weight } of presets) {
      for (const [name, value] of Object.entries(preset.values)) {
        if (typeof value === "number") {
          if (!this.states.has(name)) {
            this.states.set(name, {
              target: value * weight,
              current: 0,
              velocity: 0,
            });
          } else {
            this.states.get(name)!.target += value * weight;
          }
        }
      }
    }

    // Clamp all targets to 0-1
    for (const [, state] of this.states) {
      state.target = Math.max(0, Math.min(1, state.target));
    }
  }

  /**
   * Get the currently active preset
   */
  getActivePreset(): ExpressionPreset | null {
    return this.activePreset;
  }

  /**
   * Reset all expressions to neutral
   */
  reset(): void {
    for (const [, state] of this.states) {
      state.target = 0;
    }
    this.activePreset = null;
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.vrm = null;
    this.states.clear();
    this.activePreset = null;
  }
}

/**
 * Factory function to create an ExpressionController
 */
export function createExpressionController(): ExpressionController {
  return new ExpressionController();
}
