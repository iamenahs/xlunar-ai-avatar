/**
 * OpenAI TTS Provider
 * Uses OpenAI's Speech API (POST /v1/audio/speech)
 * Supports streaming audio output
 */

import type { ITtsProvider, TtsRequest, TtsResponse } from "./types";

function contentTypeFor(format: "mp3" | "wav"): string {
  return format === "mp3" ? "audio/mpeg" : "audio/wav";
}

export interface OpenAiConfig {
  apiKey: string;
  model: string;
  defaultVoice: string;
}

export class OpenAiTtsProvider implements ITtsProvider {
  private cfg: OpenAiConfig;

  constructor(cfg: OpenAiConfig) {
    this.cfg = cfg;
  }

  async synthesize(req: TtsRequest): Promise<TtsResponse> {
    const voice = req.voice || this.cfg.defaultVoice;

    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.cfg.model,
        voice,
        input: req.text,
        response_format: req.format,
        speed: req.speed ?? 1.0,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      throw new Error(
        `OpenAI TTS error (${upstream.status}): ${errText || upstream.statusText}`
      );
    }

    return {
      stream: upstream.body as ReadableStream<Uint8Array>,
      contentType: contentTypeFor(req.format),
    };
  }
}

