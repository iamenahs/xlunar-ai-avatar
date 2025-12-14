/**
 * TTS API Route
 * POST /api/tts
 * 
 * Body: { text: string, voice?: string, format?: "mp3"|"wav", speed?: number }
 * Returns: Audio stream with appropriate Content-Type
 */

import { z } from "zod";
import { getTtsProviderFromEnv, normalizeFormat } from "@/lib/tts/server";

// Use Edge runtime for efficient streaming passthrough
export const runtime = "edge";

const BodySchema = z.object({
  text: z.string().min(1, "Text is required").max(4096, "Text too long"),
  voice: z.string().optional(),
  format: z.enum(["mp3", "wav"]).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const provider = getTtsProviderFromEnv();
    const format = normalizeFormat(body.format);

    const result = await provider.synthesize({
      text: body.text,
      voice: body.voice,
      format,
      speed: body.speed,
    });

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[TTS API Error]", err);
    
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("Missing required") ? 500 : 400;
    
    return new Response(message, {
      status,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

