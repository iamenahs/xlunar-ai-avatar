/**
 * VRM 0.x Handler
 *
 * Handles models authored with the VRM 0.0 / 0.x specification.
 *
 * Key characteristics:
 * ───────────────────
 * • The model faces –Z in glTF space (opposite of the camera default).
 * • @pixiv/three-vrm applies an internal 180° Y rotation to the hips bone
 *   during normalisation. This makes the normalised skeleton consistent
 *   with VRM 1.0, but the visual mesh still faces –Z.
 * • `vrm.meta.metaVersion` is `'0'` or `0` (may be string or number).
 * • A scene-level pivot (180° Y rotation) is needed to flip the mesh so
 *   the character faces the camera.
 * • The internal hip rotation inverts the X and Z axes for all descendant
 *   bones, so we must negate those axes when mapping from the authoring
 *   convention to the device convention.
 *
 * Why negate X and Z?
 * ───────────────────
 * When you rotate a frame 180° about Y:
 *   • X axis → –X
 *   • Y axis →  Y  (unchanged)
 *   • Z axis → –Z
 *
 * So a positive X rotation authored for a +Z-facing model becomes a
 * negative X rotation in the normalised (internally-flipped) skeleton.
 * The same applies to Z. Y is unchanged because the flip is about Y.
 *
 * Coordinate system (after scene pivot):
 * ──────────────────────────────────────
 *   Visual: model faces camera (+Z), but normalised bones still expect
 *   rotations with the flipped X/Z convention.
 */

import type { VRM } from "@pixiv/three-vrm";
import type { VrmVersionHandler, VrmVersion } from "./VrmVersionHandler";
import * as THREE from "three";

export class Vrm0Handler implements VrmVersionHandler {
  readonly label: string = "VRM 0.x";
  readonly version: VrmVersion = "vrm0";

  detect(vrm: VRM, _fileUrl: string): boolean {
    const metaVersion = (vrm.meta as any)?.metaVersion;
    return metaVersion === "0" || metaVersion === 0;
  }

  /**
   * Wraps the scene in a pivot group rotated 180° about Y so the model
   * faces the camera. The pivot does NOT affect normalised bone local
   * axes — those are handled by `convertRotation`.
   */
  setupScene(sceneObj: THREE.Object3D): THREE.Object3D {
    const pivot = new THREE.Group();
    pivot.rotation.y = Math.PI;
    pivot.add(sceneObj);
    return pivot;
  }

  /**
   * Negate X and Z to compensate for the internal 180° Y hip rotation
   * that @pixiv/three-vrm applies during normalisation.
   */
  convertRotation(degrees: [number, number, number]): [number, number, number] {
    return [-degrees[0], degrees[1], -degrees[2]];
  }
}
