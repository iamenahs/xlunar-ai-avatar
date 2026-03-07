/**
 * Avatar Controller Types
 *
 * Command, event, and state types for the programmable avatar control layer.
 * Designed for integration with LLMs, chatbots, postMessage, and any external system.
 */

import type { PosePreset, HandGesture, BodyGesture, BodyMotion } from "../config/poses";
import type { ExpressionPreset } from "../config/expressions";
import type { MotionSequenceDefinition } from "../animation/MotionSequence";

// ============================================================================
// Commands
// ============================================================================

export type AvatarCommand =
  | { type: "pose"; id: string; transition?: number }
  | { type: "hand-gesture"; id: string }
  | { type: "body-gesture"; id: string }
  | { type: "body-motion"; id: string }
  | { type: "expression"; id: string; intensity?: number }
  | { type: "vrma"; url: string; id?: string; loop?: boolean; speed?: number }
  | { type: "sequence"; id: string }
  | { type: "wait"; duration: number }
  | { type: "reset" }
  | { type: "reset-pose" }
  | { type: "reset-expression" }
  | { type: "stop-vrma" }
  | { type: "stop-sequence" }
  | {
      type: "raw-pose";
      bones: Record<string, [number, number, number]>;
      transition?: number;
    }
  | {
      type: "raw-expression";
      values: Record<string, number>;
    };

// ============================================================================
// Events
// ============================================================================

export type AvatarEventType =
  | "ready"
  | "command"
  | "state-change"
  | "sequence-complete"
  | "vrma-complete"
  | "queue-start"
  | "queue-complete"
  | "error";

export interface AvatarEventDetail {
  type: AvatarEventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

// ============================================================================
// State
// ============================================================================

export interface AvatarState {
  ready: boolean;
  pose: string | null;
  handGesture: string | null;
  bodyGesture: string | null;
  bodyMotion: string | null;
  expression: string | null;
  vrmaUrl: string | null;
  vrmaPlaying: boolean;
  sequenceId: string | null;
  sequencePlaying: boolean;
  queueLength: number;
  queueRunning: boolean;
}

// ============================================================================
// Controller internal references
// ============================================================================

export interface ControllerRefs {
  setPose: (pose: PosePreset | null) => void;
  setHandGesture: (gesture: HandGesture | null) => void;
  setBodyGesture: (gesture: BodyGesture | null) => void;
  setBodyMotion: (motion: BodyMotion | null) => void;
  setExpression: (expr: ExpressionPreset | null) => void;
  setVrma: (url: string | null, loop?: boolean) => void;
  setSequence: (seq: MotionSequenceDefinition | null) => void;
  setRawPose: (bones: Record<string, [number, number, number]>) => void;
  setRawExpression: (values: Record<string, number>) => void;
  getVrmaPlaying: () => boolean;
  getSequencePlaying: () => boolean;
}

// ============================================================================
// PostMessage protocol
// ============================================================================

export interface AvatarPostMessage {
  source: "xlunar-avatar";
  id?: string;
  command?: AvatarCommand;
  commands?: AvatarCommand[];
  getState?: boolean;
}

export interface AvatarPostMessageResponse {
  source: "xlunar-avatar-response";
  id?: string;
  state?: AvatarState;
  event?: AvatarEventDetail;
  error?: string;
}
