/**
 * PostMessage Bridge
 *
 * Enables controlling the avatar from an iframe parent, another window,
 * or any system that can send window.postMessage events.
 *
 * Protocol:
 * - Send to avatar:   { source: "xlunar-avatar", command: {...} }
 * - Send batch:       { source: "xlunar-avatar", commands: [{...}, ...] }
 * - Query state:      { source: "xlunar-avatar", getState: true }
 * - Response/event:   { source: "xlunar-avatar-response", ... }
 *
 * @example From parent window:
 * ```js
 * const iframe = document.getElementById('avatar-iframe');
 * iframe.contentWindow.postMessage({
 *   source: 'xlunar-avatar',
 *   command: { type: 'pose', id: 'relaxed' }
 * }, '*');
 *
 * // Listen for responses
 * window.addEventListener('message', (e) => {
 *   if (e.data?.source === 'xlunar-avatar-response') {
 *     console.log(e.data);
 *   }
 * });
 * ```
 */

import type { AvatarController } from "./AvatarController";
import type {
  AvatarPostMessage,
  AvatarPostMessageResponse,
} from "./types";

export class PostMessageBridge {
  private controller: AvatarController;
  private origin: string;
  private unsubEvents: (() => void) | null = null;

  /**
   * @param controller - The AvatarController to bridge
   * @param allowedOrigin - Origin to accept messages from ('*' for any)
   */
  constructor(controller: AvatarController, allowedOrigin = "*") {
    this.controller = controller;
    this.origin = allowedOrigin;
    this.handleMessage = this.handleMessage.bind(this);
  }

  /**
   * Start listening for postMessage events.
   * Also forwards controller events back to the parent.
   */
  start(): void {
    window.addEventListener("message", this.handleMessage);

    this.unsubEvents = this.controller.on("*", (detail) => {
      this.send({ source: "xlunar-avatar-response", event: detail });
    });
  }

  /**
   * Stop listening for postMessage events.
   */
  stop(): void {
    window.removeEventListener("message", this.handleMessage);
    this.unsubEvents?.();
    this.unsubEvents = null;
  }

  private handleMessage(event: MessageEvent): void {
    if (this.origin !== "*" && event.origin !== this.origin) return;

    const data = event.data as AvatarPostMessage;
    if (!data || data.source !== "xlunar-avatar") return;

    // State query
    if (data.getState) {
      this.send({
        source: "xlunar-avatar-response",
        id: data.id,
        state: this.controller.getState(),
      });
      return;
    }

    // Single command
    if (data.command) {
      try {
        this.controller.execute(data.command);
        this.send({
          source: "xlunar-avatar-response",
          id: data.id,
          state: this.controller.getState(),
        });
      } catch (err) {
        this.send({
          source: "xlunar-avatar-response",
          id: data.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
      return;
    }

    // Batch/queue commands
    if (data.commands) {
      const hasWaits = data.commands.some((c) => c.type === "wait");
      if (hasWaits) {
        this.controller.queue(data.commands).then(() => {
          this.send({
            source: "xlunar-avatar-response",
            id: data.id,
            state: this.controller.getState(),
          });
        });
      } else {
        this.controller.batch(data.commands);
        this.send({
          source: "xlunar-avatar-response",
          id: data.id,
          state: this.controller.getState(),
        });
      }
    }
  }

  private send(data: AvatarPostMessageResponse): void {
    const target = window.parent !== window ? window.parent : window;
    target.postMessage(data, this.origin);
  }
}
