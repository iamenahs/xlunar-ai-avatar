/**
 * VRMA Animation Presets
 *
 * Defines available VRM animations (.vrma files) that can be played
 * on any VRM model. Animations are retargeted automatically through
 * the VRM humanoid bone system.
 *
 * To add new animations:
 *   1. Place the .vrma file in public/animations/
 *   2. Add an entry to ANIMATION_PRESETS below
 *   3. The animation will appear in the Animations tab automatically
 */

export interface VrmaAnimationPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Path to the .vrma file (relative to public/) */
  url: string;
  /** Optional description */
  description?: string;
  /** Category for UI grouping */
  category: "idle" | "greeting" | "emotion" | "action" | "custom";
  /** Whether to loop by default */
  loop?: boolean;
}

export const ANIMATION_PRESETS: VrmaAnimationPreset[] = [
  {
    id: "vrma-test",
    name: "Test Animation",
    url: "/animations/test.vrma",
    description: "Sample VRMA animation from three-vrm project",
    category: "action",
    loop: true,
  },
];

export function getAnimationById(id: string): VrmaAnimationPreset | undefined {
  return ANIMATION_PRESETS.find((a) => a.id === id);
}

export function getAnimationsByCategory(
  category: VrmaAnimationPreset["category"],
): VrmaAnimationPreset[] {
  return ANIMATION_PRESETS.filter((a) => a.category === category);
}
