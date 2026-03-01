/**
 * Facial Expression Presets
 *
 * VRM models support standard expressions (blend shapes) through the
 * VRM Expression Manager. This file defines preset combinations for
 * easy expression control.
 *
 * Standard VRM Expressions:
 *   - Emotion: happy, angry, sad, relaxed, surprised
 *   - Mouth: aa, ih, ou, ee, oh (vowel shapes)
 *   - Eye: blink, blinkLeft, blinkRight
 *   - Look: lookUp, lookDown, lookLeft, lookRight
 *   - Other: neutral
 */

import type { VRMExpressionPresetName } from "@pixiv/three-vrm";

export interface ExpressionPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Category for UI grouping */
  category: "emotion" | "mouth" | "eye" | "custom";
  /** Expression values (0-1) */
  values: Partial<Record<VRMExpressionPresetName | string, number>>;
  /** Whether this is a toggle or momentary expression */
  toggle?: boolean;
}

export interface VisemeMapping {
  /** Phoneme or viseme name */
  phoneme: string;
  /** VRM expression values */
  values: Partial<Record<VRMExpressionPresetName | string, number>>;
}

// ============================================================================
// Emotion Presets
// ============================================================================

export const EMOTION_PRESETS: ExpressionPreset[] = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Default neutral expression",
    category: "emotion",
    values: {
      happy: 0,
      angry: 0,
      sad: 0,
      relaxed: 0,
      surprised: 0,
    },
    toggle: true,
  },
  {
    id: "happy",
    name: "Happy",
    description: "Joyful, smiling expression",
    category: "emotion",
    values: {
      happy: 0.8,
      relaxed: 0.2,
    },
    toggle: true,
  },
  {
    id: "very-happy",
    name: "Very Happy",
    description: "Extremely joyful expression",
    category: "emotion",
    values: {
      happy: 1.0,
      surprised: 0.2,
    },
    toggle: true,
  },
  {
    id: "sad",
    name: "Sad",
    description: "Sorrowful expression",
    category: "emotion",
    values: {
      sad: 0.7,
      relaxed: 0.3,
    },
    toggle: true,
  },
  {
    id: "angry",
    name: "Angry",
    description: "Frustrated, angry expression",
    category: "emotion",
    values: {
      angry: 0.8,
    },
    toggle: true,
  },
  {
    id: "surprised",
    name: "Surprised",
    description: "Shocked, surprised expression",
    category: "emotion",
    values: {
      surprised: 0.9,
    },
    toggle: true,
  },
  {
    id: "relaxed",
    name: "Relaxed",
    description: "Calm, peaceful expression",
    category: "emotion",
    values: {
      relaxed: 0.7,
      happy: 0.2,
    },
    toggle: true,
  },
  {
    id: "thinking",
    name: "Thinking",
    description: "Contemplative expression",
    category: "emotion",
    values: {
      relaxed: 0.4,
      lookUp: 0.3,
    },
    toggle: true,
  },
  {
    id: "shy",
    name: "Shy",
    description: "Bashful, embarrassed expression",
    category: "emotion",
    values: {
      happy: 0.3,
      sad: 0.2,
      relaxed: 0.4,
    },
    toggle: true,
  },
  {
    id: "determined",
    name: "Determined",
    description: "Focused, determined expression",
    category: "emotion",
    values: {
      angry: 0.3,
      relaxed: 0.2,
    },
    toggle: true,
  },
];

// ============================================================================
// Mouth Shape Presets (for manual control)
// ============================================================================

export const MOUTH_PRESETS: ExpressionPreset[] = [
  {
    id: "mouth-closed",
    name: "Closed",
    description: "Mouth closed",
    category: "mouth",
    values: {
      aa: 0,
      ih: 0,
      ou: 0,
      ee: 0,
      oh: 0,
    },
    toggle: true,
  },
  {
    id: "mouth-aa",
    name: "Aa",
    description: "Open mouth (ah sound)",
    category: "mouth",
    values: { aa: 0.8 },
    toggle: true,
  },
  {
    id: "mouth-ih",
    name: "Ih",
    description: "Wide mouth (ee sound)",
    category: "mouth",
    values: { ih: 0.8 },
    toggle: true,
  },
  {
    id: "mouth-ou",
    name: "Ou",
    description: "Rounded mouth (oh sound)",
    category: "mouth",
    values: { ou: 0.8 },
    toggle: true,
  },
  {
    id: "mouth-ee",
    name: "Ee",
    description: "Wide smile mouth",
    category: "mouth",
    values: { ee: 0.8 },
    toggle: true,
  },
  {
    id: "mouth-oh",
    name: "Oh",
    description: "Small rounded mouth",
    category: "mouth",
    values: { oh: 0.8 },
    toggle: true,
  },
];

// ============================================================================
// Eye Presets
// ============================================================================

export const EYE_PRESETS: ExpressionPreset[] = [
  {
    id: "eyes-open",
    name: "Open",
    description: "Eyes fully open",
    category: "eye",
    values: {
      blink: 0,
      blinkLeft: 0,
      blinkRight: 0,
    },
    toggle: true,
  },
  {
    id: "eyes-closed",
    name: "Closed",
    description: "Eyes closed",
    category: "eye",
    values: {
      blink: 1,
    },
    toggle: true,
  },
  {
    id: "eyes-half",
    name: "Half Closed",
    description: "Relaxed, half-lidded eyes",
    category: "eye",
    values: {
      blink: 0.4,
    },
    toggle: true,
  },
  {
    id: "wink-left",
    name: "Wink Left",
    description: "Wink with left eye",
    category: "eye",
    values: {
      blinkLeft: 1,
      blinkRight: 0,
    },
    toggle: true,
  },
  {
    id: "wink-right",
    name: "Wink Right",
    description: "Wink with right eye",
    category: "eye",
    values: {
      blinkLeft: 0,
      blinkRight: 1,
    },
    toggle: true,
  },
  {
    id: "look-up",
    name: "Look Up",
    description: "Eyes looking upward",
    category: "eye",
    values: {
      lookUp: 0.7,
    },
    toggle: true,
  },
  {
    id: "look-down",
    name: "Look Down",
    description: "Eyes looking downward",
    category: "eye",
    values: {
      lookDown: 0.7,
    },
    toggle: true,
  },
  {
    id: "look-left",
    name: "Look Left",
    description: "Eyes looking left",
    category: "eye",
    values: {
      lookLeft: 0.7,
    },
    toggle: true,
  },
  {
    id: "look-right",
    name: "Look Right",
    description: "Eyes looking right",
    category: "eye",
    values: {
      lookRight: 0.7,
    },
    toggle: true,
  },
];

// ============================================================================
// All Presets Combined
// ============================================================================

export const EXPRESSION_PRESETS: ExpressionPreset[] = [
  ...EMOTION_PRESETS,
  ...MOUTH_PRESETS,
  ...EYE_PRESETS,
];

// ============================================================================
// Viseme Mappings for Lip-Sync
// ============================================================================

/**
 * Viseme mappings for phoneme-based lip sync
 * Based on common viseme sets (Oculus/Meta style)
 */
export const VISEME_MAPPINGS: VisemeMapping[] = [
  { phoneme: "sil", values: { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 } }, // Silence
  { phoneme: "aa", values: { aa: 1.0 } }, // "father"
  { phoneme: "E", values: { ee: 0.7, ih: 0.3 } }, // "bed"
  { phoneme: "ih", values: { ih: 0.9 } }, // "bit"
  { phoneme: "oh", values: { oh: 0.9 } }, // "go"
  { phoneme: "ou", values: { ou: 0.9 } }, // "boot"
  { phoneme: "PP", values: { aa: 0, ih: 0, ou: 0 } }, // p, b, m (closed lips)
  { phoneme: "FF", values: { ih: 0.3 } }, // f, v (teeth on lip)
  { phoneme: "TH", values: { ih: 0.2, aa: 0.1 } }, // th
  { phoneme: "DD", values: { aa: 0.3, ih: 0.2 } }, // t, d
  { phoneme: "kk", values: { aa: 0.4 } }, // k, g
  { phoneme: "CH", values: { ih: 0.4, ou: 0.2 } }, // ch, j, sh
  { phoneme: "SS", values: { ih: 0.3 } }, // s, z
  { phoneme: "nn", values: { aa: 0.2, ih: 0.1 } }, // n
  { phoneme: "RR", values: { ou: 0.3, aa: 0.2 } }, // r
  { phoneme: "LL", values: { aa: 0.3, ih: 0.2 } }, // l
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getExpressionById(id: string): ExpressionPreset | undefined {
  return EXPRESSION_PRESETS.find((e) => e.id === id);
}

export function getExpressionsByCategory(
  category: ExpressionPreset["category"]
): ExpressionPreset[] {
  return EXPRESSION_PRESETS.filter((e) => e.category === category);
}

export function getVisemeForPhoneme(phoneme: string): VisemeMapping | undefined {
  return VISEME_MAPPINGS.find(
    (v) => v.phoneme.toLowerCase() === phoneme.toLowerCase()
  );
}

/**
 * Blend multiple expression presets together
 */
export function blendExpressions(
  expressions: Array<{ preset: ExpressionPreset; weight: number }>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const { preset, weight } of expressions) {
    for (const [key, value] of Object.entries(preset.values)) {
      if (typeof value === "number") {
        result[key] = (result[key] || 0) + value * weight;
      }
    }
  }

  // Clamp all values to 0-1
  for (const key of Object.keys(result)) {
    result[key] = Math.max(0, Math.min(1, result[key]));
  }

  return result;
}
