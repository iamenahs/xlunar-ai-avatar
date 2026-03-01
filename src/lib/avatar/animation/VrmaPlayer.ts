/**
 * VRMA Animation Player
 *
 * Loads and plays VRM Animation (.vrma) files on VRM models.
 * Uses @pixiv/three-vrm-animation for parsing and Three.js
 * AnimationMixer for playback.
 *
 * VRMA (VRM Animation) is a cross-platform humanoid animation format:
 *   - Bone rotations are retargeted to the destination VRM automatically
 *   - Expression (blend shape) animations are supported
 *   - Gaze/LookAt animations are supported
 *   - Files use the .vrma extension and VRMC_vrm_animation glTF extension
 *
 * Usage:
 *   const player = new VrmaPlayer();
 *   player.init(vrm);
 *   await player.loadAnimation('/animations/greeting.vrma');
 *   player.play({ loop: true });
 *   // In animation loop:
 *   player.update(delta);
 */

import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  VRMAnimationLoaderPlugin,
  VRMAnimation,
  VRMLookAtQuaternionProxy,
  createVRMAnimationClip,
} from "@pixiv/three-vrm-animation";

export interface VrmaPlaybackOptions {
  /** Whether to loop the animation (default: true) */
  loop?: boolean;
  /** Playback speed multiplier (default: 1.0) */
  speed?: number;
  /** Crossfade duration in seconds when switching animations (default: 0.3) */
  crossfadeDuration?: number;
  /** Callback when non-looping animation finishes */
  onComplete?: () => void;
}

export interface LoadedVrmaAnimation {
  /** Display name */
  name: string;
  /** Source URL */
  url: string;
  /** Parsed VRMAnimation objects from the file */
  animations: VRMAnimation[];
  /** Three.js AnimationClips ready for playback (created per-VRM) */
  clips: THREE.AnimationClip[];
}

export class VrmaPlayer {
  private vrm: VRM | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private currentAction: THREE.AnimationAction | null = null;
  private loadedAnimations: Map<string, LoadedVrmaAnimation> = new Map();
  private loader: GLTFLoader;
  private isPlaying = false;

  constructor() {
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
  }

  /**
   * Initialize with a VRM model. Must be called before loading or playing.
   * If switching VRM models, call init again — clips will be regenerated.
   */
  init(vrm: VRM): void {
    this.dispose();
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    // Attach VRMLookAtQuaternionProxy if the VRM supports lookAt,
    // needed for gaze animations and to suppress console warnings
    if (vrm.lookAt) {
      const existing = vrm.scene.children.find(
        (c) => c.name === "lookAtQuaternionProxy",
      );
      if (!existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proxy = new VRMLookAtQuaternionProxy(vrm.lookAt as any);
        proxy.name = "lookAtQuaternionProxy";
        vrm.scene.add(proxy);
      }
    }

    this.mixer.addEventListener("finished", () => {
      this.isPlaying = false;
    });

    // Regenerate clips for any already-loaded animations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- version mismatch between @pixiv packages
    for (const [, anim] of this.loadedAnimations) {
      anim.clips = anim.animations.map((vrmAnim) =>
        createVRMAnimationClip(vrmAnim, vrm as any),
      );
    }
  }

  /**
   * Load a .vrma animation file. The parsed animation is cached so
   * subsequent calls with the same URL are instant.
   *
   * @param url  – URL to the .vrma file
   * @param name – optional display name (defaults to filename)
   * @returns the loaded animation descriptor
   */
  async loadAnimation(
    url: string,
    name?: string,
  ): Promise<LoadedVrmaAnimation> {
    if (this.loadedAnimations.has(url)) {
      return this.loadedAnimations.get(url)!;
    }

    const gltf = await this.loader.loadAsync(url);
    const vrmAnimations: VRMAnimation[] =
      (gltf.userData?.vrmAnimations as VRMAnimation[]) ?? [];

    if (vrmAnimations.length === 0) {
      throw new Error(`No VRM animations found in ${url}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clips = this.vrm
      ? vrmAnimations.map((a) => createVRMAnimationClip(a, this.vrm! as any))
      : [];

    const displayName =
      name ?? url.split("/").pop()?.replace(/\.vrma$/i, "") ?? "Animation";

    const loaded: LoadedVrmaAnimation = {
      name: displayName,
      url,
      animations: vrmAnimations,
      clips,
    };

    this.loadedAnimations.set(url, loaded);
    return loaded;
  }

  /**
   * Play a previously loaded animation (by URL) or the first loaded one.
   */
  play(urlOrOptions?: string | VrmaPlaybackOptions, options?: VrmaPlaybackOptions): void {
    if (!this.mixer) return;

    let url: string | undefined;
    let opts: VrmaPlaybackOptions;

    if (typeof urlOrOptions === "string") {
      url = urlOrOptions;
      opts = options ?? {};
    } else {
      opts = urlOrOptions ?? {};
    }

    const {
      loop = true,
      speed = 1.0,
      crossfadeDuration = 0.3,
      onComplete,
    } = opts;

    // Find the animation
    let loaded: LoadedVrmaAnimation | undefined;
    if (url) {
      loaded = this.loadedAnimations.get(url);
    } else {
      loaded = this.loadedAnimations.values().next().value as LoadedVrmaAnimation | undefined;
    }

    if (!loaded || loaded.clips.length === 0) return;

    const clip = loaded.clips[0];
    const newAction = this.mixer.clipAction(clip);

    newAction.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1,
    );
    newAction.clampWhenFinished = !loop;
    newAction.timeScale = speed;

    if (onComplete && !loop) {
      const handler = (e: { action: THREE.AnimationAction }) => {
        if (e.action === newAction) {
          this.mixer?.removeEventListener("finished", handler as any);
          onComplete();
        }
      };
      this.mixer.addEventListener("finished", handler as any);
    }

    if (this.currentAction && crossfadeDuration > 0) {
      newAction.reset();
      newAction.play();
      this.currentAction.crossFadeTo(newAction, crossfadeDuration, true);
    } else {
      newAction.reset();
      newAction.play();
    }

    this.currentAction = newAction;
    this.isPlaying = true;
  }

  /**
   * Stop the current animation with optional fade-out.
   */
  stop(fadeOutDuration = 0.3): void {
    if (this.currentAction) {
      this.currentAction.fadeOut(fadeOutDuration);
      setTimeout(() => {
        this.currentAction?.stop();
        this.currentAction = null;
        this.isPlaying = false;
      }, fadeOutDuration * 1000);
    }
  }

  /**
   * Pause / resume playback.
   */
  setPaused(paused: boolean): void {
    if (this.currentAction) {
      this.currentAction.paused = paused;
    }
  }

  /**
   * Call every frame to advance the animation.
   */
  update(delta: number): void {
    this.mixer?.update(delta);
  }

  /** Whether an animation is currently playing. */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /** List of all loaded animation descriptors. */
  getLoadedAnimations(): LoadedVrmaAnimation[] {
    return Array.from(this.loadedAnimations.values());
  }

  /** Clean up resources. */
  dispose(): void {
    this.stop(0);
    this.mixer?.stopAllAction();
    this.mixer = null;
    this.vrm = null;
    this.currentAction = null;
    this.isPlaying = false;
  }
}

/** Factory function */
export function createVrmaPlayer(): VrmaPlayer {
  return new VrmaPlayer();
}
