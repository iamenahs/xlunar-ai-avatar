"use client";

/**
 * TTS Client Utilities
 * Browser-side helpers for calling the TTS API
 */

export interface SynthesizeParams {
  text: string;
  voice?: string;
  format?: "mp3" | "wav";
  speed?: number;
  /** Optional API key - if provided, will be sent to the server */
  apiKey?: string;
}

/**
 * Call the /api/tts endpoint and return an object URL for playback
 * 
 * @example
 * const url = await synthesizeToObjectUrl({ text: "Hello world" });
 * audioElement.src = url;
 * audioElement.play();
 */
export async function synthesizeToObjectUrl(
  params: SynthesizeParams
): Promise<string> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`TTS failed (${res.status}): ${msg}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Call the /api/tts endpoint and return raw audio blob
 */
export async function synthesizeToBlob(
  params: SynthesizeParams
): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`TTS failed (${res.status}): ${msg}`);
  }

  return res.blob();
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}

