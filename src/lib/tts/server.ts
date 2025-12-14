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
 * - OPENAI_API_KEY: Optional (can be provided via request)
 * - OPENAI_TTS_MODEL: Optional (default: "gpt-4o-mini-tts")
 * - OPENAI_TTS_VOICE: Optional (default: "alloy")
 * 
 * For Proxy:
 * - TTS_PROXY_URL: Required
 * - TTS_PROXY_BEARER: Optional bearer token
 * 
 * @param clientApiKey - Optional API key provided by the client (takes precedence)
 */
export function getTtsProvider(clientApiKey?: string): ITtsProvider {
  const providerType = (process.env.TTS_PROVIDER || "openai").toLowerCase();

  if (providerType === "proxy") {
    const url = mustEnv("TTS_PROXY_URL");
    const bearerToken = process.env.TTS_PROXY_BEARER;
    return new ProxyTtsProvider({ url, bearerToken });
  }

  // Default: OpenAI
  // Use client-provided API key first, then fall back to environment variable
  const apiKey = clientApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Please enter your API key in the settings or configure OPENAI_API_KEY environment variable.");
  }
  
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const defaultVoice = process.env.OPENAI_TTS_VOICE || "alloy";

  return new OpenAiTtsProvider({ apiKey, model, defaultVoice });
}

/**
 * @deprecated Use getTtsProvider instead
 */
export function getTtsProviderFromEnv(): ITtsProvider {
  return getTtsProvider();
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

