/**
 * TTS Provider Types
 * Defines the interface for pluggable TTS providers
 */

export type TtsFormat = "mp3" | "wav";

export interface TtsRequest {
  text: string;
  voice?: string;
  format: TtsFormat;
  speed?: number;
}

export interface TtsResponse {
  stream: ReadableStream<Uint8Array>;
  contentType: string;
}

/**
 * TTS Provider Interface
 * Implement this for each TTS service (OpenAI, ElevenLabs, etc.)
 */
export interface ITtsProvider {
  /**
   * Synthesize text to speech
   * Returns a streaming response for efficient delivery
   */
  synthesize(req: TtsRequest): Promise<TtsResponse>;
}

