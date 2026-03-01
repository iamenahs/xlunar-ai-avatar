/**
 * VRM Version Handler – Base Interface
 *
 * Defines the contract that every VRM-version-specific handler must implement.
 * Each handler encapsulates the quirks of its target format so that the rest
 * of the animation / rendering pipeline can remain version-agnostic.
 *
 * ┌──────────────┐
 * │ Detect(vrm)  │  → returns true when this handler matches the loaded model
 * ├──────────────┤
 * │ setupScene() │  → applies any required scene-graph transforms (e.g. pivot)
 * ├──────────────┤
 * │ convertRot() │  → maps authoring-convention Euler degrees to device convention
 * └──────────────┘
 *
 * Why do we need version-specific handlers?
 * ------------------------------------------
 * 1. VRM 0.x models face –Z in glTF space. @pixiv/three-vrm applies an
 *    internal 180° Y rotation on the hips bone to normalise the skeleton,
 *    but this inverts the X and Z axes for every descendant bone. The visual
 *    mesh still faces –Z though, so we must also add a scene-level pivot.
 *
 * 2. VRM 1.0 models face +Z natively and @pixiv/three-vrm does NOT add
 *    any internal hip rotation, so bones work as-authored.
 *
 * 3. VRoid Studio GLB exports embed VRM 0.x extensions inside a standard
 *    glTF container. @pixiv/three-vrm will parse them just like a .vrm file,
 *    but the file extension is .glb. These are functionally identical to
 *    VRM 0.x once loaded.
 */

import type { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Supported VRM format versions. */
export type VrmVersion = "vrm0" | "vrm1" | "vroid-glb" | "unknown";

/**
 * Every VRM version handler must implement this interface.
 */
export interface VrmVersionHandler {
  /** Human-readable label (for logging / debugging). */
  readonly label: string;

  /** The version enum this handler covers. */
  readonly version: VrmVersion;

  /**
   * Return `true` when this handler is the correct one for `vrm`.
   * Handlers are tested in priority order; the first match wins.
   */
  detect(vrm: VRM, fileUrl: string): boolean;

  /**
   * Apply any required scene-graph transforms (e.g. a 180° Y pivot for
   * VRM 0.x). Returns the node that should be added to the parent group.
   *
   * @param sceneObj – the loaded `vrm.scene` or `gltf.scene`
   * @returns the root node to insert into the scene graph
   */
  setupScene(sceneObj: THREE.Object3D): THREE.Object3D;

  /**
   * Convert bone rotation from the *authoring convention* (used in pose
   * presets / keyframes) to the *device convention* that the normalised
   * skeleton expects for this VRM version.
   *
   * @param degrees – `[x, y, z]` in the authoring convention
   * @returns `[x, y, z]` in the device convention
   */
  convertRotation(degrees: [number, number, number]): [number, number, number];
}
