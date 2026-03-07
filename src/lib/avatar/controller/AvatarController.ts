/**
 * AvatarController - Unified Programmable Avatar Control Layer
 *
 * Provides a command-based imperative API for controlling the avatar.
 * Designed for integration with LLMs, chatbots, and external systems.
 *
 * Supports:
 * - Individual commands (pose, gesture, expression, VRMA, sequence)
 * - Batch commands (multiple simultaneous changes)
 * - Queued commands (sequential execution with timing)
 * - Event subscription for state changes
 * - State queries
 *
 * @example
 * ```ts
 * const controller = new AvatarController();
 * controller.on('ready', () => {
 *   controller.execute({ type: 'pose', id: 'relaxed' });
 *   controller.execute({ type: 'expression', id: 'happy' });
 * });
 *
 * // Sequential choreography
 * await controller.queue([
 *   { type: 'pose', id: 'waving' },
 *   { type: 'expression', id: 'happy' },
 *   { type: 'wait', duration: 2000 },
 *   { type: 'body-gesture', id: 'nod' },
 *   { type: 'wait', duration: 1000 },
 *   { type: 'reset' },
 * ]);
 * ```
 */

import {
  getPoseById,
  getHandGestureById,
  getBodyGestureById,
  getBodyMotionById,
} from "../config/poses";
import { getExpressionById } from "../config/expressions";
import { getAnimationById } from "../config/animations";
import { getSequenceById } from "../config";

import type {
  AvatarCommand,
  AvatarEventType,
  AvatarEventDetail,
  AvatarState,
  ControllerRefs,
} from "./types";

type EventCallback = (detail: AvatarEventDetail) => void;

export class AvatarController {
  private refs: ControllerRefs | null = null;
  private listeners = new Map<AvatarEventType | "*", Set<EventCallback>>();
  private state: AvatarState;
  private commandQueue: AvatarCommand[] = [];
  private queueRunning = false;
  private queueAbort: AbortController | null = null;
  private eventLog: AvatarEventDetail[] = [];
  private maxLogSize = 200;

  constructor() {
    this.state = {
      ready: false,
      pose: null,
      handGesture: null,
      bodyGesture: null,
      bodyMotion: null,
      expression: null,
      vrmaUrl: null,
      vrmaPlaying: false,
      sequenceId: null,
      sequencePlaying: false,
      queueLength: 0,
      queueRunning: false,
    };
  }

  // ==========================================================================
  // Registration (called by AvatarRenderer)
  // ==========================================================================

  /** @internal Called by AvatarRenderer when controllers are ready */
  _register(refs: ControllerRefs): void {
    this.refs = refs;
    this.state.ready = true;
    this.emit("ready", { ready: true });
  }

  /** @internal Called by AvatarRenderer on unmount */
  _unregister(): void {
    this.refs = null;
    this.state.ready = false;
    this.abortQueue();
  }

  // ==========================================================================
  // Command Execution
  // ==========================================================================

  /**
   * Execute a single command immediately.
   * For 'wait' commands, returns a promise that resolves after the duration.
   */
  execute(command: AvatarCommand): void | Promise<void> {
    if (!this.refs && command.type !== "wait") {
      this.emit("error", { message: "Controller not ready", command });
      return;
    }

    this.emit("command", { command });

    try {
      switch (command.type) {
        case "pose": {
          const pose = getPoseById(command.id);
          if (!pose) {
            this.emit("error", { message: `Unknown pose: ${command.id}`, command });
            return;
          }
          this.refs!.setPose(pose);
          this.updateState({ pose: command.id });
          break;
        }

        case "hand-gesture": {
          const gesture = getHandGestureById(command.id);
          if (!gesture) {
            this.emit("error", { message: `Unknown hand gesture: ${command.id}`, command });
            return;
          }
          this.refs!.setHandGesture(gesture);
          this.updateState({ handGesture: command.id });
          break;
        }

        case "body-gesture": {
          const gesture = getBodyGestureById(command.id);
          if (!gesture) {
            this.emit("error", { message: `Unknown body gesture: ${command.id}`, command });
            return;
          }
          this.refs!.setBodyGesture(gesture);
          this.updateState({ bodyGesture: command.id });
          break;
        }

        case "body-motion": {
          const motion = getBodyMotionById(command.id);
          if (!motion) {
            this.emit("error", { message: `Unknown body motion: ${command.id}`, command });
            return;
          }
          this.refs!.setBodyMotion(motion);
          this.updateState({ bodyMotion: command.id });
          break;
        }

        case "expression": {
          const expr = getExpressionById(command.id);
          if (!expr) {
            this.emit("error", { message: `Unknown expression: ${command.id}`, command });
            return;
          }
          this.refs!.setExpression(expr);
          this.updateState({ expression: command.id });
          break;
        }

        case "vrma": {
          let url = command.url;
          if (command.id) {
            const preset = getAnimationById(command.id);
            if (preset) url = preset.url;
          }
          this.refs!.setVrma(url, command.loop ?? true);
          this.updateState({ vrmaUrl: url, vrmaPlaying: true });
          break;
        }

        case "sequence": {
          const seq = getSequenceById(command.id);
          if (!seq) {
            this.emit("error", { message: `Unknown sequence: ${command.id}`, command });
            return;
          }
          this.refs!.setSequence(seq);
          this.updateState({ sequenceId: command.id, sequencePlaying: true });
          break;
        }

        case "wait": {
          return new Promise<void>((resolve) => {
            setTimeout(resolve, command.duration);
          });
        }

        case "reset":
          this.refs!.setPose(null);
          this.refs!.setHandGesture(null);
          this.refs!.setExpression(null);
          this.refs!.setVrma(null);
          this.refs!.setSequence(null);
          this.updateState({
            pose: null,
            handGesture: null,
            expression: null,
            vrmaUrl: null,
            vrmaPlaying: false,
            sequenceId: null,
            sequencePlaying: false,
          });
          break;

        case "reset-pose":
          this.refs!.setPose(null);
          this.refs!.setHandGesture(null);
          this.updateState({ pose: null, handGesture: null });
          break;

        case "reset-expression":
          this.refs!.setExpression(null);
          this.updateState({ expression: null });
          break;

        case "stop-vrma":
          this.refs!.setVrma(null);
          this.updateState({ vrmaUrl: null, vrmaPlaying: false });
          break;

        case "stop-sequence":
          this.refs!.setSequence(null);
          this.updateState({ sequenceId: null, sequencePlaying: false });
          break;

        case "raw-pose": {
          this.refs!.setRawPose(command.bones);
          const boneNames = Object.keys(command.bones).join(", ");
          this.updateState({ pose: `raw(${boneNames})` });
          break;
        }

        case "raw-expression": {
          this.refs!.setRawExpression(command.values);
          const exprNames = Object.keys(command.values).join(", ");
          this.updateState({ expression: `raw(${exprNames})` });
          break;
        }

        default:
          this.emit("error", { message: `Unknown command type: ${(command as AvatarCommand).type}`, command });
      }
    } catch (err) {
      this.emit("error", {
        message: err instanceof Error ? err.message : String(err),
        command,
      });
    }
  }

  /**
   * Execute multiple commands simultaneously (no waiting between them).
   */
  batch(commands: AvatarCommand[]): void {
    for (const cmd of commands) {
      if (cmd.type !== "wait") {
        this.execute(cmd);
      }
    }
  }

  /**
   * Execute commands sequentially, respecting 'wait' commands for timing.
   * Returns a promise that resolves when all commands complete.
   * Can be aborted with abortQueue().
   */
  async queue(commands: AvatarCommand[]): Promise<void> {
    this.abortQueue();

    this.commandQueue = [...commands];
    this.queueRunning = true;
    this.queueAbort = new AbortController();
    const signal = this.queueAbort.signal;

    this.updateState({ queueLength: commands.length, queueRunning: true });
    this.emit("queue-start", { length: commands.length });

    try {
      for (let i = 0; i < commands.length; i++) {
        if (signal.aborted) break;

        const cmd = commands[i];
        const result = this.execute(cmd);

        if (result instanceof Promise) {
          await Promise.race([
            result,
            new Promise<void>((_, reject) => {
              signal.addEventListener("abort", () => reject(new Error("Queue aborted")), { once: true });
            }),
          ]);
        }

        this.updateState({ queueLength: commands.length - i - 1 });
      }
    } catch {
      // Queue was aborted
    } finally {
      this.queueRunning = false;
      this.commandQueue = [];
      this.queueAbort = null;
      this.updateState({ queueLength: 0, queueRunning: false });
      this.emit("queue-complete", {});
    }
  }

  /**
   * Abort the currently running command queue.
   */
  abortQueue(): void {
    if (this.queueAbort) {
      this.queueAbort.abort();
      this.queueAbort = null;
    }
    this.queueRunning = false;
    this.commandQueue = [];
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  setPose(id: string): void { this.execute({ type: "pose", id }); }
  setHandGesture(id: string): void { this.execute({ type: "hand-gesture", id }); }
  setBodyGesture(id: string): void { this.execute({ type: "body-gesture", id }); }
  setBodyMotion(id: string): void { this.execute({ type: "body-motion", id }); }
  setExpression(id: string): void { this.execute({ type: "expression", id }); }
  playVrma(url: string, loop = true): void { this.execute({ type: "vrma", url, loop }); }
  stopVrma(): void { this.execute({ type: "stop-vrma" }); }
  playSequence(id: string): void { this.execute({ type: "sequence", id }); }
  stopSequence(): void { this.execute({ type: "stop-sequence" }); }
  reset(): void { this.execute({ type: "reset" }); }

  /**
   * Set raw bone rotations directly (for LLM-generated poses).
   * Bone values are [x, y, z] in degrees.
   *
   * Available bones: spine, chest, neck, head,
   * leftUpperArm, leftLowerArm, rightUpperArm, rightLowerArm,
   * leftUpperLeg, leftLowerLeg, rightUpperLeg, rightLowerLeg, hips
   *
   * Axis convention (upper arms):
   *   X: negative = pitch forward, positive = pitch backward
   *   Y: left arm positive = outward twist, right arm negative = outward twist
   *   Z: 0 = horizontal (T-pose), left arm -90 = at side, right arm +90 = at side
   */
  setRawPose(bones: Record<string, [number, number, number]>): void {
    this.execute({ type: "raw-pose", bones });
  }

  /**
   * Set raw expression blend shape values (for LLM-generated expressions).
   * Values are 0-1. Common names: happy, sad, angry, surprised, relaxed,
   * aa, ih, ou, ee, oh, blink, blinkLeft, blinkRight, lookUp, lookDown, lookLeft, lookRight
   */
  setRawExpression(values: Record<string, number>): void {
    this.execute({ type: "raw-expression", values });
  }

  // ==========================================================================
  // State
  // ==========================================================================

  getState(): Readonly<AvatarState> {
    return { ...this.state };
  }

  isReady(): boolean {
    return this.state.ready;
  }

  getEventLog(): readonly AvatarEventDetail[] {
    return this.eventLog;
  }

  /** Called by DemoPageClient when props change externally (from other tabs) */
  _syncState(partial: Partial<AvatarState>): void {
    Object.assign(this.state, partial);
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event: AvatarEventType | "*", callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: AvatarEventType | "*", callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(type: AvatarEventType, data?: Record<string, unknown>): void {
    const detail: AvatarEventDetail = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.eventLog.push(detail);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      for (const cb of typeListeners) cb(detail);
    }

    const wildcardListeners = this.listeners.get("*");
    if (wildcardListeners) {
      for (const cb of wildcardListeners) cb(detail);
    }
  }

  private updateState(partial: Partial<AvatarState>): void {
    Object.assign(this.state, partial);
    this.emit("state-change", { state: { ...this.state } });
  }

  // ==========================================================================
  // Notification from renderer (sequence/vrma complete)
  // ==========================================================================

  /** @internal Called when a motion sequence completes */
  _onSequenceComplete(): void {
    this.updateState({ sequenceId: null, sequencePlaying: false });
    this.emit("sequence-complete", {});
  }

  /** @internal Called when a VRMA animation completes */
  _onVrmaComplete(): void {
    this.updateState({ vrmaPlaying: false });
    this.emit("vrma-complete", {});
  }

  // ==========================================================================
  // Disposal
  // ==========================================================================

  dispose(): void {
    this.abortQueue();
    this.listeners.clear();
    this.eventLog = [];
    this.refs = null;
    this.state.ready = false;
  }
}
