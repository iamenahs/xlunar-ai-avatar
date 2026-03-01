/**
 * VRoid Studio GLB Handler
 *
 * Handles GLB files exported from VRoid Studio (https://vroid.com).
 *
 * Key characteristics:
 * ───────────────────
 * • File extension is `.glb` (standard glTF Binary) but the file embeds
 *   VRM 0.x extensions (`VRMC_vrm`, `VRM` in extensionsUsed, etc.).
 * • @pixiv/three-vrm will parse these extensions via VRMLoaderPlugin,
 *   producing a fully functional VRM object identical to a `.vrm` load.
 * • Because the embedded format is VRM 0.x, all the same quirks apply:
 *   – model faces –Z → needs a scene pivot
 *   – internal 180° Y hip rotation → needs X/Z negation in bone rotations
 * • `vrm.meta.metaVersion` is typically `'0'` or `0`.
 *
 * Detection:
 * ──────────
 * We detect VRoid GLB by checking the file URL extension (.glb) in
 * combination with a valid VRM object being present. If the VRM meta
 * version is 0.x AND the file is .glb, this handler takes priority over
 * the generic Vrm0Handler.
 *
 * In practice this handler behaves identically to Vrm0Handler. It exists
 * as a separate class for:
 *   1. Clearer logging / debugging (you can see "VRoid GLB" in console).
 *   2. Future extensibility — VRoid Studio files may have extra metadata
 *      (e.g. outfit layers, physics springs) that we could leverage.
 *   3. Explicit documentation of support for the GLB container format.
 */

import type { VRM } from "@pixiv/three-vrm";
import type { VrmVersionHandler } from "./VrmVersionHandler";
import { Vrm0Handler } from "./Vrm0Handler";

export class VroidGlbHandler extends Vrm0Handler implements VrmVersionHandler {
  override readonly label = "VRoid GLB (VRM 0.x inside GLB container)";
  override readonly version = "vroid-glb" as const;

  /**
   * Matches when the file URL ends in .glb AND VRM extensions were parsed
   * (vrm object exists) AND the meta version is 0.x.
   */
  override detect(vrm: VRM, fileUrl: string): boolean {
    const isGlb = fileUrl.toLowerCase().endsWith(".glb");
    if (!isGlb) return false;

    const metaVersion = (vrm.meta as any)?.metaVersion;
    return metaVersion === "0" || metaVersion === 0;
  }
}
