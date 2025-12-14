/**
 * Animation Controller
 * Orchestrates multiple animation layers with priority-based blending
 */

import { VRM } from '@pixiv/three-vrm';
import type { AnimationLayer, AnimationContext, MouthAnimationConfig } from '../types';
import { SpeechMouthLayer, IdleBodyLayer, GestureLayer } from './AnimationLayer';

export class AnimationController {
  private vrm: VRM | null = null;
  private layers: AnimationLayer[] = [];
  private elapsed = 0;
  private lastAmplitude = 0;
  private isPlaying = false;
  
  constructor() {
    // Layers will be initialized when VRM is loaded
  }
  
  /**
   * Initialize the controller with a VRM instance
   * Sets up default animation layers
   */
  init(vrm: VRM, mouthConfig?: MouthAnimationConfig): void {
    this.vrm = vrm;
    this.elapsed = 0;
    
    // Clear existing layers
    this.dispose();
    
    // Create default layers
    this.layers = [
      new IdleBodyLayer(),      // Priority 50 - base idle animations
      new SpeechMouthLayer(mouthConfig), // Priority 100 - mouth sync
      new GestureLayer(),       // Priority 150 - gestures override
    ];
    
    // Sort by priority (lower = processed first)
    this.layers.sort((a, b) => a.priority - b.priority);
    
    // Initialize all layers with VRM
    for (const layer of this.layers) {
      layer.init(vrm);
    }
  }
  
  /**
   * Add a custom animation layer
   */
  addLayer(layer: AnimationLayer): void {
    if (this.vrm) {
      layer.init(this.vrm);
    }
    this.layers.push(layer);
    this.layers.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Remove a layer by name
   */
  removeLayer(name: string): void {
    const index = this.layers.findIndex(l => l.name === name);
    if (index !== -1) {
      this.layers[index].dispose();
      this.layers.splice(index, 1);
    }
  }
  
  /**
   * Get a layer by name
   */
  getLayer<T extends AnimationLayer>(name: string): T | undefined {
    return this.layers.find(l => l.name === name) as T | undefined;
  }
  
  /**
   * Enable or disable a layer
   */
  setLayerEnabled(name: string, enabled: boolean): void {
    const layer = this.layers.find(l => l.name === name);
    if (layer) {
      layer.enabled = enabled;
    }
  }
  
  /**
   * Update animation state
   * Called every frame from useFrame hook
   */
  update(delta: number, amplitude: number, isPlaying: boolean, gesture?: string): void {
    if (!this.vrm) return;
    
    this.elapsed += delta;
    this.lastAmplitude = amplitude;
    this.isPlaying = isPlaying;
    
    // Create context for this frame
    const context: AnimationContext = {
      amplitude,
      delta,
      elapsed: this.elapsed,
      isPlaying,
      gesture,
    };
    
    // Update all enabled layers
    for (const layer of this.layers) {
      if (layer.enabled) {
        layer.update(delta, context);
      }
    }
    
    // Update VRM (required for expression changes to take effect)
    this.vrm.update(delta);
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    for (const layer of this.layers) {
      layer.dispose();
    }
    this.layers = [];
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return {
      elapsed: this.elapsed,
      amplitude: this.lastAmplitude,
      isPlaying: this.isPlaying,
      layers: this.layers.map(l => ({
        name: l.name,
        priority: l.priority,
        enabled: l.enabled,
      })),
    };
  }
}

// Singleton instance for simple use cases
let defaultController: AnimationController | null = null;

export function getAnimationController(): AnimationController {
  if (!defaultController) {
    defaultController = new AnimationController();
  }
  return defaultController;
}

export function createAnimationController(): AnimationController {
  return new AnimationController();
}

