/**
 * TTS Server Utilities
 * Provider selection and configuration via environment variables
 */

import type { ITtsProvider, TtsFormat } from "./providers/types";
import { OpenAiTtsProvider } from "./providers/openai";
import { ProxyTtsProvider } from "./providers/proxy";

/**
 * Get the configured TTS provider based on environment variables
 * 
 * Environment variables:
 * - TTS_PROVIDER: "openai" (default) or "proxy"
 * 
 * For OpenAI:
 * - OPENAI_API_KEY: Required
 * - OPENAI_TTS_MODEL: Optional (default: "tts-1")
 * - OPENAI_TTS_VOICE: Optional (default: "alloy")
 * 
 * For Proxy:
 * - TTS_PROXY_URL: Required
 * - TTS_PROXY_BEARER: Optional bearer token
 */
export function getTtsProviderFromEnv(): ITtsProvider {
  const provider = (process.env.TTS_PROVIDER || "openai").toLowerCase();

  if (provider === "proxy") {
    const url = mustEnv("TTS_PROXY_URL");
    const bearerToken = process.env.TTS_PROXY_BEARER;
    return new ProxyTtsProvider({ url, bearerToken });
  }

  // Default: OpenAI
  const apiKey = mustEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const defaultVoice = process.env.OPENAI_TTS_VOICE || "alloy";

  return new OpenAiTtsProvider({ apiKey, model, defaultVoice });
}

/**
 * Normalize format string to valid TtsFormat
 */
export function normalizeFormat(v?: string): TtsFormat {
  return v === "wav" ? "wav" : "mp3";
}

/**
 * Get required environment variable or throw
 */
function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

