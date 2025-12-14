/**
 * Avatar Skins Configuration
 * 
 * This file contains preset avatar skins/models that can be used.
 * Users can add their own skins by extending this configuration.
 * 
 * IMPORTANT: All models must be VRM format and have proper licensing
 * for your use case. Check the license before using any model.
 */

export interface AvatarSkin {
  /** Unique identifier for the skin */
  id: string;
  /** Display name */
  name: string;
  /** Model URL (VRM file) */
  modelUrl: string;
  /** Optional thumbnail URL */
  thumbnailUrl?: string;
  /** Description */
  description?: string;
  /** License information */
  license?: string;
  /** Attribution/credit */
  attribution?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Default transform for this model */
  defaultTransform?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
  };
  /** Mouth animation configuration override */
  mouthConfig?: {
    morphTargetName?: string;
    sensitivity?: number;
    smoothing?: number;
    threshold?: number;
    maxOpen?: number;
  };
}

/**
 * Model source types
 * - "url": Remote URL (https://)
 * - "local": Local file in /public folder (e.g., /avatars/model.vrm)
 * - "blob": Blob URL from file upload
 */
export type ModelSource = "url" | "local" | "blob";

/**
 * Preset avatar skins
 * These are publicly available VRM models for demo purposes
 * 
 * LOCAL FILE SUPPORT:
 * To use a local model, place your VRM/GLB file in the /public/avatars/ folder
 * and reference it with a path like "/avatars/your-model.vrm"
 * 
 * EXAMPLE:
 * 1. Download a model (e.g., from Sketchfab, VRoid Hub)
 * 2. Place it in: /public/avatars/my-avatar.glb
 * 3. Reference it as: modelUrl: "/avatars/my-avatar.glb"
 */
export const PRESET_SKINS: AvatarSkin[] = [
  // ============================================================================
  // VRM SAMPLE MODELS (from official sources)
  // ============================================================================
  {
    id: "vrm1-sample",
    name: "VRM1 Sample Avatar",
    modelUrl: "/avatars/VRM1_Constraint_Twist_Sample.vrm",
    description: "Official VRM1 sample model from pixiv/three-vrm repository",
    license: "MIT",
    attribution: "pixiv/three-vrm (https://github.com/pixiv/three-vrm)",
    tags: ["vrm1", "sample", "anime", "official"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "seed-san",
    name: "Seed-san",
    modelUrl: "/avatars/Seed-san.vrm",
    description: "Official VRM sample model from VRM Consortium",
    license: "CC0",
    attribution: "VRM Consortium (https://github.com/vrm-c/vrm-specification)",
    tags: ["vrm", "sample", "anime", "official", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "avatar-orion",
    name: "Avatar Orion",
    modelUrl: "/avatars/Avatar_Orion.vrm",
    description: "VRoid character model - great for poses and animations",
    license: "CC0",
    attribution: "madjin/vrm-samples (https://github.com/madjin/vrm-samples)",
    tags: ["vrm", "sample", "anime", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "cryptovoxels",
    name: "Cryptovoxels Avatar",
    modelUrl: "/avatars/cryptovoxels.vrm",
    description: "Voxel-style avatar - lightweight and stylized",
    license: "CC0",
    attribution: "madjin/vrm-samples (https://github.com/madjin/vrm-samples)",
    tags: ["vrm", "sample", "voxel", "cc0", "stylized"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 1.5,
      smoothing: 0.3,
    },
  },
  // ============================================================================
  // VROID BETA SAMPLE MODELS (CC0 - Public Domain)
  // https://vroid.pixiv.help/hc/en-us/articles/4402614652569
  // ============================================================================
  {
    id: "vroid-sample-a",
    name: "VRoid Sample A",
    modelUrl: "/avatars/VRoid_Sample_A.glb",
    description: "VRoid Studio β sample model - Girl with brown hair",
    license: "CC0",
    attribution: "VRoid Studio by pixiv (https://vroid.com)",
    tags: ["vroid", "sample", "anime", "girl", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "vroid-sample-b",
    name: "VRoid Sample B",
    modelUrl: "/avatars/VRoid_Sample_B.glb",
    description: "VRoid Studio β sample model - Girl with twin tails",
    license: "CC0",
    attribution: "VRoid Studio by pixiv (https://vroid.com)",
    tags: ["vroid", "sample", "anime", "girl", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "vroid-sample-c",
    name: "VRoid Sample C",
    modelUrl: "/avatars/VRoid_Sample_C.glb",
    description: "VRoid Studio β sample model - Boy with short hair",
    license: "CC0",
    attribution: "VRoid Studio by pixiv (https://vroid.com)",
    tags: ["vroid", "sample", "anime", "boy", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  {
    id: "vroid-sample-d",
    name: "VRoid Sample D",
    modelUrl: "/avatars/VRoid_Sample_D.glb",
    description: "VRoid Studio β sample model - Girl with long blonde hair",
    license: "CC0",
    attribution: "VRoid Studio by pixiv (https://vroid.com)",
    tags: ["vroid", "sample", "anime", "girl", "cc0"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: {
      morphTargetName: "aa",
      sensitivity: 2.0,
      smoothing: 0.3,
    },
  },
  // ============================================================================
  // CUSTOM / LOCAL OPTIONS
  // ============================================================================
  {
    id: "local-vrm",
    name: "Local VRM Model",
    modelUrl: "/avatars/custom.vrm",
    description: "Place your VRM file at /public/avatars/custom.vrm",
    tags: ["local", "custom", "vrm"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
  },
  {
    id: "local-glb",
    name: "Local GLB Model",
    modelUrl: "/avatars/custom.glb",
    description: "Place your GLB file at /public/avatars/custom.glb",
    tags: ["local", "custom", "glb"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
  },
  {
    id: "custom",
    name: "Custom URL",
    modelUrl: "",
    description: "Enter any URL to a VRM or GLB model",
    tags: ["custom"],
    defaultTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
  },
];

/**
 * Check if a model URL is a local file
 */
export function isLocalModel(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

/**
 * Check if a model URL is a VRM file
 */
export function isVrmModel(url: string): boolean {
  return url.toLowerCase().endsWith(".vrm");
}

/**
 * Check if a model URL is a GLB/GLTF file
 */
export function isGlbModel(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith(".glb") || lower.endsWith(".gltf");
}

/**
 * Background/Environment presets
 */
export interface BackgroundPreset {
  id: string;
  name: string;
  /** Background color (CSS color string) */
  backgroundColor: string;
  /** Optional environment preset from drei */
  environmentPreset?: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
  /** Ambient light intensity */
  ambientLight: number;
  /** Directional light intensity */
  directionalLight: number;
  /** Directional light position */
  lightPosition: [number, number, number];
  /** Show grid */
  showGrid: boolean;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "dark",
    name: "Dark Studio",
    backgroundColor: "#0f0f0f",
    ambientLight: 0.7,
    directionalLight: 1.2,
    lightPosition: [5, 5, 5],
    showGrid: false,
  },
  {
    id: "light",
    name: "Light Studio",
    backgroundColor: "#f5f5f5",
    ambientLight: 0.8,
    directionalLight: 1.0,
    lightPosition: [3, 4, 2],
    showGrid: false,
  },
  {
    id: "sunset",
    name: "Sunset",
    backgroundColor: "#1a1520",
    environmentPreset: "sunset",
    ambientLight: 0.4,
    directionalLight: 0.8,
    lightPosition: [10, 5, -5],
    showGrid: false,
  },
  {
    id: "forest",
    name: "Forest",
    backgroundColor: "#0a150a",
    environmentPreset: "forest",
    ambientLight: 0.5,
    directionalLight: 0.7,
    lightPosition: [5, 10, 5],
    showGrid: false,
  },
  {
    id: "city",
    name: "City Night",
    backgroundColor: "#0a0a15",
    environmentPreset: "city",
    ambientLight: 0.3,
    directionalLight: 0.6,
    lightPosition: [5, 8, 3],
    showGrid: false,
  },
  {
    id: "studio",
    name: "Photo Studio",
    backgroundColor: "#1a1a1a",
    environmentPreset: "studio",
    ambientLight: 0.6,
    directionalLight: 1.5,
    lightPosition: [3, 5, 3],
    showGrid: false,
  },
  {
    id: "grid",
    name: "Grid Floor",
    backgroundColor: "#0a0a0a",
    ambientLight: 0.6,
    directionalLight: 1.0,
    lightPosition: [5, 5, 5],
    showGrid: true,
  },
];

/**
 * Camera presets
 */
export interface CameraPreset {
  id: string;
  name: string;
  position: [number, number, number];
  fov: number;
  target: [number, number, number];
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: "portrait",
    name: "Portrait",
    position: [0, 1.4, 2.0],
    fov: 35,
    target: [0, 1.2, 0],
  },
  {
    id: "headshot",
    name: "Headshot",
    position: [0, 1.5, 1.2],
    fov: 30,
    target: [0, 1.4, 0],
  },
  {
    id: "fullbody",
    name: "Full Body",
    position: [0, 1.0, 3.5],
    fov: 40,
    target: [0, 0.8, 0],
  },
  {
    id: "side",
    name: "Side View",
    position: [2.0, 1.2, 1.5],
    fov: 35,
    target: [0, 1.0, 0],
  },
  {
    id: "low",
    name: "Low Angle",
    position: [0, 0.5, 2.5],
    fov: 45,
    target: [0, 1.2, 0],
  },
];

/**
 * Get a skin by ID
 */
export function getSkinById(id: string): AvatarSkin | undefined {
  return PRESET_SKINS.find(skin => skin.id === id);
}

/**
 * Get a background preset by ID
 */
export function getBackgroundById(id: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find(bg => bg.id === id);
}

/**
 * Get a camera preset by ID
 */
export function getCameraById(id: string): CameraPreset | undefined {
  return CAMERA_PRESETS.find(cam => cam.id === id);
}

/**
 * Create a custom skin configuration
 */
export function createCustomSkin(modelUrl: string, options?: Partial<Omit<AvatarSkin, 'id' | 'modelUrl'>>): AvatarSkin {
  return {
    id: 'custom-' + Date.now(),
    name: options?.name || 'Custom Avatar',
    modelUrl,
    description: options?.description || 'Custom VRM model',
    tags: ['custom', ...(options?.tags || [])],
    defaultTransform: options?.defaultTransform || {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    },
    mouthConfig: options?.mouthConfig,
  };
}

