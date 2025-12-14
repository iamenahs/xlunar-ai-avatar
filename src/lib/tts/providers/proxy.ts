/**
 * Proxy TTS Provider
 * Forwards TTS requests to a configured upstream endpoint
 * Useful for custom TTS services or self-hosted solutions
 */

import type { ITtsProvider, TtsRequest, TtsResponse } from "./types";

export interface ProxyConfig {
  url: string;
  bearerToken?: string;
}

export class ProxyTtsProvider implements ITtsProvider {
  private cfg: ProxyConfig;

  constructor(cfg: ProxyConfig) {
    this.cfg = cfg;
  }

  async synthesize(req: TtsRequest): Promise<TtsResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.cfg.bearerToken) {
      headers["Authorization"] = `Bearer ${this.cfg.bearerToken}`;
    }

    const upstream = await fetch(this.cfg.url, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      throw new Error(
        `Proxy TTS error (${upstream.status}): ${errText || upstream.statusText}`
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    return {
      stream: upstream.body as ReadableStream<Uint8Array>,
      contentType,
    };
  }
}

