/**
 * VRMA Animation Presets
 *
 * Defines available VRM animations (.vrma files) that can be played
 * on any VRM model. Animations are retargeted automatically through
 * the VRM humanoid bone system.
 *
 * Sources:
 *   - pixiv Inc. VRoid Project (Free, requires credit): VRoid Motion Pack 7 animations
 *     https://booth.pm/ja/items/5512385
 *     Credit: "Character animation credits to pixiv Inc.'s VRoid Project"
 *   - tk256ailab/vrm-viewer (MIT License): Angry, Clapping, Goodbye, Jump, LookAround
 *   - pixiv/three-vrm (MIT License): test
 *   - tfuru/vrma-loader-sample (MIT License): sample-mocopi
 *
 * To add new animations:
 *   1. Place the .vrma file in public/animations/
 *   2. Add an entry to ANIMATION_PRESETS below
 *   3. The animation will appear in the VRMA tab automatically
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
  category: "vroid" | "idle" | "greeting" | "emotion" | "action" | "pose" | "custom";
  /** Whether to loop by default */
  loop?: boolean;
}

export const ANIMATION_PRESETS: VrmaAnimationPreset[] = [
  // ============================================
  // VRoid Project Motion Pack (pixiv Inc.)
  // https://booth.pm/ja/items/5512385
  // ============================================
  {
    id: "vroid-show-full-body",
    name: "Show Full Body",
    url: "/animations/ShowFullBody.vrma",
    description: "Full body presentation animation",
    category: "vroid",
    loop: false,
  },
  {
    id: "vroid-greeting",
    name: "Greeting",
    url: "/animations/Greeting.vrma",
    description: "Greeting bow animation",
    category: "vroid",
    loop: false,
  },
  {
    id: "vroid-peace-sign",
    name: "Peace Sign",
    url: "/animations/PeaceSign.vrma",
    description: "V-sign pose animation",
    category: "vroid",
    loop: false,
  },
  {
    id: "vroid-shoot",
    name: "Shoot",
    url: "/animations/Shoot.vrma",
    description: "Shooting gesture animation",
    category: "vroid",
    loop: false,
  },
  {
    id: "vroid-spin",
    name: "Spin",
    url: "/animations/Spin.vrma",
    description: "Spinning around animation",
    category: "vroid",
    loop: true,
  },
  {
    id: "vroid-model-pose",
    name: "Model Pose",
    url: "/animations/ModelPose.vrma",
    description: "Fashion model pose animation",
    category: "vroid",
    loop: false,
  },
  {
    id: "vroid-squat",
    name: "Squat",
    url: "/animations/Squat.vrma",
    description: "Squat exercise animation",
    category: "vroid",
    loop: true,
  },

  // ============================================
  // vrm-viewer animations (MIT License)
  // https://github.com/tk256ailab/vrm-viewer
  // ============================================
  {
    id: "vrma-goodbye",
    name: "Goodbye Wave",
    url: "/animations/Goodbye.vrma",
    description: "Waving goodbye animation",
    category: "greeting",
    loop: true,
  },
  {
    id: "vrma-angry",
    name: "Angry",
    url: "/animations/Angry.vrma",
    description: "Angry expression with body language",
    category: "emotion",
    loop: true,
  },
  {
    id: "vrma-clapping",
    name: "Clapping",
    url: "/animations/Clapping.vrma",
    description: "Applause animation",
    category: "action",
    loop: true,
  },
  {
    id: "vrma-jump",
    name: "Jump",
    url: "/animations/Jump.vrma",
    description: "Jumping animation",
    category: "action",
    loop: true,
  },
  {
    id: "vrma-look-around",
    name: "Look Around",
    url: "/animations/LookAround.vrma",
    description: "Looking around curiously",
    category: "action",
    loop: true,
  },

  // ============================================
  // Other sources
  // ============================================
  {
    id: "vrma-mocopi",
    name: "Mocopi Idle",
    url: "/animations/sample-mocopi.vrma",
    description: "Motion capture idle animation from mocopi",
    category: "idle",
    loop: true,
  },
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
