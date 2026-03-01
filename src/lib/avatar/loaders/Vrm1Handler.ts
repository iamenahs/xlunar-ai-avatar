/**
 * VRM 1.0 Handler
 *
 * Handles models authored with the VRM 1.0 specification.
 *
 * Key characteristics:
 * ───────────────────
 * • The model faces +Z in glTF space (same as three.js camera default).
 * • @pixiv/three-vrm does NOT add any internal hip rotation during
 *   normalisation, so normalised bones map directly to glTF local space.
 * • `vrm.meta.metaVersion` is `'1'` (string).
 * • No scene-level pivot is needed — the mesh already faces the camera.
 * • Bone rotations in the authoring convention can be used as-is with no
 *   axis negation.
 *
 * Coordinate system:
 * ──────────────────
 *   +X → model's left
 *   +Y → up
 *   +Z → forward (towards camera)
 */

import type { VRM } from "@pixiv/three-vrm";
import type { VrmVersionHandler, VrmVersion } from "./VrmVersionHandler";
import * as THREE from "three";

export class Vrm1Handler implements VrmVersionHandler {
  readonly label: string = "VRM 1.0";
  readonly version: VrmVersion = "vrm1";

  detect(vrm: VRM, _fileUrl: string): boolean {
    const metaVersion = (vrm.meta as any)?.metaVersion;
    return metaVersion === "1" || metaVersion === 1;
  }

  /**
   * No scene transform needed — VRM 1.0 already faces the camera.
   */
  setupScene(sceneObj: THREE.Object3D): THREE.Object3D {
    return sceneObj;
  }

  /**
   * Identity transform — authoring convention matches device convention.
   */
  convertRotation(degrees: [number, number, number]): [number, number, number] {
    return degrees;
  }
}
