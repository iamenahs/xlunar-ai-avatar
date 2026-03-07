/**
 * Animation Layer Base Classes and Interfaces
 * Implements layered animation architecture for extensibility
 * 
 * Improvements:
 * - Better envelope following for mouth animation
 * - Smooth attack/release curves
 * - Natural-looking transitions
 */

import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import type { AnimationLayer, AnimationContext, MouthAnimationConfig } from '../types';
import { smoothDamp, easeOutQuad, easeInQuad } from './easing';
import * as THREE from 'three';

// ============================================================================
// Speech Mouth Layer (MVP) - Improved
// ============================================================================

/**
 * SpeechMouthLayer - Drives mouth morph targets from audio amplitude
 * 
 * Key improvements:
 * - Envelope follower with separate attack/release
 * - Smooth damp for natural motion
 * - Better peak detection
 */
export class SpeechMouthLayer implements AnimationLayer {
  name = 'speech-mouth';
  priority = 100;
  enabled = true;
  
  private vrm: VRM | null = null;
  private currentValue = 0;
  private velocity = 0;
  private peakValue = 0;
  private peakDecay = 0;
  private config: Required<MouthAnimationConfig>;
  
  constructor(config: MouthAnimationConfig = {}) {
    this.config = {
      morphTargetName: config.morphTargetName ?? 'aa',
      useJawBoneFallback: config.useJawBoneFallback ?? true,
      smoothing: config.smoothing ?? 0.15,        // Smooth time in seconds
      threshold: config.threshold ?? 0.02,
      maxOpen: config.maxOpen ?? 1.0,
      sensitivity: config.sensitivity ?? 2.0,
    };
  }
  
  init(vrm: VRM): void {
    this.vrm = vrm;
    this.currentValue = 0;
    this.velocity = 0;
    this.peakValue = 0;
    this.peakDecay = 0;
  }
  
  update(delta: number, context: AnimationContext): void {
    if (!this.vrm || !this.enabled) return;
    
    const { amplitude, isPlaying } = context;
    
    // Calculate target mouth value
    let targetValue = 0;
    
    if (isPlaying && amplitude > this.config.threshold) {
      // Apply threshold and sensitivity
      const normalized = (amplitude - this.config.threshold) / (1 - this.config.threshold);
      targetValue = Math.min(
        Math.pow(normalized, 0.8) * this.config.sensitivity, // Slight compression
        this.config.maxOpen
      );
      
      // Update peak for "attack" effect
      if (targetValue > this.peakValue) {
        this.peakValue = targetValue;
        this.peakDecay = 0;
      }
    }
    
    // Decay peak over time (creates natural "attack" envelope)
    this.peakDecay += delta * 3; // Decay rate
    this.peakValue = Math.max(targetValue, this.peakValue * Math.exp(-this.peakDecay));
    
    // Use different attack/release times for more natural speech
    let smoothTime: number;
    if (targetValue > this.currentValue) {
      // Attack - faster opening
      smoothTime = this.config.smoothing * 0.5;
    } else if (!isPlaying) {
      // Release when not playing - smooth close
      smoothTime = this.config.smoothing * 1.5;
    } else {
      // Normal following
      smoothTime = this.config.smoothing;
    }
    
    // Smooth damp to target
    const velocityRef = { value: this.velocity };
    this.currentValue = smoothDamp(
      this.currentValue,
      targetValue,
      velocityRef,
      smoothTime,
      delta
    );
    this.velocity = velocityRef.value;
    
    // Apply slight easing curve to the output for more natural look
    const easedValue = this.currentValue < 0.5 
      ? easeOutQuad(this.currentValue * 2) / 2
      : 0.5 + easeInQuad((this.currentValue - 0.5) * 2) / 2;
    
    // Apply to VRM expression
    this.applyMouthValue(easedValue);
  }
  
  private applyMouthValue(value: number): void {
    if (!this.vrm?.expressionManager) return;
    
    // Clamp value
    const clampedValue = Math.max(0, Math.min(1, value));
    
    // Try VRM expression first (standard VRM blendshapes)
    const expressionName = this.config.morphTargetName as VRMExpressionPresetName;
    
    try {
      // Set the expression value
      this.vrm.expressionManager.setValue(expressionName, clampedValue);
    } catch {
      // Fallback: try direct morph target access if VRM expression fails
      this.applyMorphTargetFallback(clampedValue);
    }
  }
  
  private applyMorphTargetFallback(value: number): void {
    if (!this.vrm) return;
    
    // Traverse the VRM scene to find mesh with morph targets
    this.vrm.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        const morphTargetDictionary = mesh.morphTargetDictionary;
        const morphTargetInfluences = mesh.morphTargetInfluences;
        
        if (morphTargetDictionary && morphTargetInfluences) {
          // Look for mouth-related morph targets
          const mouthTargets = ['mouth_open', 'mouthOpen', 'aa', 'A', 'vrc.v_aa'];
          
          for (const targetName of mouthTargets) {
            if (targetName in morphTargetDictionary) {
              const index = morphTargetDictionary[targetName];
              morphTargetInfluences[index] = value;
              return;
            }
          }
        }
      }
    });
  }
  
  dispose(): void {
    this.vrm = null;
    this.currentValue = 0;
    this.velocity = 0;
    this.peakValue = 0;
  }
}

// ============================================================================
// Idle Body Layer
// ============================================================================

/**
 * IdleBodyLayer - Subtle idle animations for lifelike presence
 * Handles blinking, subtle expression drift, and micro eye movements
 */
export class IdleBodyLayer implements AnimationLayer {
  name = 'idle-body';
  priority = 50;
  enabled = true;
  
  /** When true, auto-blink is paused (manual eye control active) */
  suppressBlink = false;
  /** When true, micro eye look is paused (manual eye control active) */
  suppressLook = false;
  /** When true, subtle expression drift is paused (manual expression active) */
  suppressExpression = false;
  
  private vrm: VRM | null = null;
  private elapsed = 0;
  
  // Blink state
  private nextBlinkTime = 0;
  private blinkProgress = 0;
  private isBlinking = false;
  private consecutiveBlinks = 0;
  private doDoubleBlink = false;
  
  // Subtle expression drift
  private expressionTarget = 0;
  private expressionCurrent = 0;
  private expressionVelocity = 0;
  private nextExpressionChange = 0;
  
  // Micro eye look
  private lookXTarget = 0;
  private lookYTarget = 0;
  private lookXCurrent = 0;
  private lookYCurrent = 0;
  private lookXVelocity = 0;
  private lookYVelocity = 0;
  private nextLookChange = 0;
  
  init(vrm: VRM): void {
    this.vrm = vrm;
    this.elapsed = 0;
    this.nextBlinkTime = this.getNextBlinkTime();
    this.blinkProgress = 0;
    this.isBlinking = false;
    this.consecutiveBlinks = 0;
    this.doDoubleBlink = false;
    this.expressionTarget = 0;
    this.expressionCurrent = 0;
    this.expressionVelocity = 0;
    this.nextExpressionChange = 2 + Math.random() * 3;
    this.lookXTarget = 0;
    this.lookYTarget = 0;
    this.lookXCurrent = 0;
    this.lookYCurrent = 0;
    this.lookXVelocity = 0;
    this.lookYVelocity = 0;
    this.nextLookChange = 0.5 + Math.random() * 2;
  }
  
  private getNextBlinkTime(): number {
    return this.elapsed + 2 + Math.random() * 4;
  }
  
  update(delta: number, _context: AnimationContext): void {
    if (!this.vrm || !this.enabled) return;
    
    this.elapsed += delta;
    
    if (!this.suppressBlink) this.updateBlink(delta);
    if (!this.suppressExpression) this.updateSubtleExpression(delta);
    if (!this.suppressLook) this.updateMicroLook(delta);
  }

  /**
   * Apply a manual look direction via the lookAt API.
   * Yaw: negative=left, positive=right. Pitch: negative=down, positive=up.
   */
  applyManualLook(yaw: number, pitch: number): void {
    if (!this.vrm?.lookAt) return;
    try {
      (this.vrm.lookAt as any).target = undefined;
      (this.vrm.lookAt as any).autoUpdate = false;
      this.vrm.lookAt.applier?.applyYawPitch(yaw, pitch);
    } catch {
      // LookAt not supported
    }
  }
  
  private updateBlink(delta: number): void {
    if (!this.vrm?.expressionManager) return;
    
    if (!this.isBlinking && this.elapsed >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.doDoubleBlink = Math.random() < 0.15;
      this.consecutiveBlinks = 0;
    }
    
    if (this.isBlinking) {
      const blinkDuration = 0.15;
      this.blinkProgress += delta / blinkDuration;
      
      let blinkValue: number;
      if (this.blinkProgress < 0.4) {
        blinkValue = easeInQuad(this.blinkProgress / 0.4);
      } else if (this.blinkProgress < 0.5) {
        blinkValue = 1;
      } else {
        blinkValue = 1 - easeOutQuad((this.blinkProgress - 0.5) / 0.5);
      }
      
      this.setBlinkExpression(Math.max(0, Math.min(1, blinkValue)));
      
      if (this.blinkProgress >= 1) {
        this.consecutiveBlinks++;
        if (this.doDoubleBlink && this.consecutiveBlinks < 2) {
          this.blinkProgress = 0;
        } else {
          this.isBlinking = false;
          this.nextBlinkTime = this.getNextBlinkTime();
          this.setBlinkExpression(0);
        }
      }
    }
  }
  
  private setBlinkExpression(value: number): void {
    if (!this.vrm?.expressionManager) return;
    try {
      this.vrm.expressionManager.setValue('blink' as VRMExpressionPresetName, value);
    } catch {
      try {
        this.vrm.expressionManager.setValue('blinkLeft' as VRMExpressionPresetName, value);
        this.vrm.expressionManager.setValue('blinkRight' as VRMExpressionPresetName, value);
      } catch {
        // No blink expression available
      }
    }
  }
  
  private updateSubtleExpression(delta: number): void {
    if (!this.vrm?.expressionManager) return;
    
    if (this.elapsed >= this.nextExpressionChange) {
      this.expressionTarget = Math.random() * 0.15;
      this.nextExpressionChange = this.elapsed + 4 + Math.random() * 6;
    }
    
    const velRef = { value: this.expressionVelocity };
    this.expressionCurrent = smoothDamp(
      this.expressionCurrent,
      this.expressionTarget,
      velRef,
      1.5,
      delta
    );
    this.expressionVelocity = velRef.value;
    
    try {
      this.vrm.expressionManager.setValue('happy' as VRMExpressionPresetName, this.expressionCurrent);
    } catch {
      // Expression not available
    }
  }
  
  private updateMicroLook(delta: number): void {
    if (!this.vrm?.lookAt) return;
    
    if (this.elapsed >= this.nextLookChange) {
      this.lookXTarget = (Math.random() - 0.5) * 6;
      this.lookYTarget = (Math.random() - 0.5) * 4;
      this.nextLookChange = this.elapsed + 1 + Math.random() * 3;
    }
    
    const velXRef = { value: this.lookXVelocity };
    const velYRef = { value: this.lookYVelocity };
    this.lookXCurrent = smoothDamp(this.lookXCurrent, this.lookXTarget, velXRef, 0.4, delta);
    this.lookYCurrent = smoothDamp(this.lookYCurrent, this.lookYTarget, velYRef, 0.4, delta);
    this.lookXVelocity = velXRef.value;
    this.lookYVelocity = velYRef.value;
    
    try {
      (this.vrm.lookAt as any).target = undefined;
      (this.vrm.lookAt as any).autoUpdate = false;
      this.vrm.lookAt.applier?.applyYawPitch(this.lookXCurrent, this.lookYCurrent);
    } catch {
      // LookAt not supported
    }
  }
  
  dispose(): void {
    this.vrm = null;
    this.elapsed = 0;
  }
}

// ============================================================================
// Gesture Layer
// ============================================================================

/**
 * GestureLayer - Handles gesture-triggered animations
 */
export class GestureLayer implements AnimationLayer {
  name = 'gesture';
  priority = 150;
  enabled = true;
  
  private vrm: VRM | null = null;
  private currentGesture: string | null = null;
  
  init(vrm: VRM): void {
    this.vrm = vrm;
  }
  
  update(_delta: number, context: AnimationContext): void {
    if (!this.vrm || !this.enabled) return;
    
    // Check for gesture triggers
    if (context.gesture && context.gesture !== this.currentGesture) {
      this.triggerGesture(context.gesture);
    }
  }
  
  private triggerGesture(gesture: string): void {
    this.currentGesture = gesture;
    // Gesture animation is handled by PoseController now
    // Gesture animation is handled by PoseController
  }
  
  dispose(): void {
    this.vrm = null;
    this.currentGesture = null;
  }
}
