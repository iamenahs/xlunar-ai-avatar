/**
 * VRM Version Handler Registry
 *
 * Factory module that detects the VRM version of a loaded model and
 * returns the appropriate handler. Handlers are tested in priority
 * order — more specific handlers (VRoid GLB) are checked first.
 *
 * Usage:
 *   const handler = detectVrmVersion(vrm, fileUrl);
 *   const sceneRoot = handler.setupScene(vrm.scene);
 *   const converted = handler.convertRotation([10, 0, -78]);
 */

export type { VrmVersionHandler, VrmVersion } from "./VrmVersionHandler";
export { Vrm1Handler } from "./Vrm1Handler";
export { Vrm0Handler } from "./Vrm0Handler";
export { VroidGlbHandler } from "./VroidGlbHandler";

import type { VRM } from "@pixiv/three-vrm";
import type { VrmVersionHandler } from "./VrmVersionHandler";
import { VroidGlbHandler } from "./VroidGlbHandler";
import { Vrm0Handler } from "./Vrm0Handler";
import { Vrm1Handler } from "./Vrm1Handler";

/**
 * Ordered list of handlers. More specific handlers come first so they
 * get a chance to match before the generic fallback.
 */
const HANDLERS: VrmVersionHandler[] = [
  new VroidGlbHandler(), // Check GLB-specific first
  new Vrm0Handler(),     // Then generic VRM 0.x
  new Vrm1Handler(),     // Then VRM 1.0
];

/**
 * Fallback handler for unknown VRM versions. Assumes VRM 1.0 behaviour
 * (no pivot, no rotation conversion) as a safe default.
 */
const FALLBACK_HANDLER: VrmVersionHandler = {
  label: "Unknown VRM version (assuming VRM 1.0 behaviour)",
  version: "unknown",
  detect: () => true,
  setupScene: (s) => s,
  convertRotation: (d) => d,
};

/**
 * Detect the VRM version and return the matching handler.
 *
 * @param vrm     – the parsed VRM object (may be null if model has no VRM extensions)
 * @param fileUrl – the original URL used to load the model
 * @returns the matching VrmVersionHandler
 */
export function detectVrmVersion(
  vrm: VRM | null | undefined,
  fileUrl: string,
): VrmVersionHandler {
  if (!vrm) return FALLBACK_HANDLER;

  for (const handler of HANDLERS) {
    if (handler.detect(vrm, fileUrl)) {
      return handler;
    }
  }

  return FALLBACK_HANDLER;
}
