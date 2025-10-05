// app/api/tts/route.ts
import { NextRequest } from "next/server";

/**
 * Server-side ElevenLabs TTS proxy (single voice for all users).
 * - Streams audio/mpeg back to the client for fast playback.
 * - Locks the voice on the server (clients cannot override).
 *
 * ENV required:
 *  - ELEVENLABS_API_KEY
 *  - ELEVENLABS_VOICE_ID
 */

export const runtime = "nodejs";           // we need Node for streaming fetch response
export const dynamic = "force-dynamic";    // don't cache; always generate fresh audio

const ELEVEN_BASE = "https://api.elevenlabs.io/v1/text-to-speech";

// Validate env once on module load
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!API_KEY) {
  console.warn("[/api/tts] Missing ELEVENLABS_API_KEY");
}
if (!VOICE_ID) {
  console.warn("[/api/tts] Missing ELEVENLABS_VOICE_ID");
}

// ...top of file unchanged

type TTSBody = {
    text?: string;
    model?: string;           // e.g., "eleven_turbo_v2" or "eleven_flash_v2_5"
    format?: string;          // e.g., "mp3_44100"
    speed?: number;           // 0.7–1.2 (1.0 = normal)
    stability?: number;       // 0.0–1.0
    similarity_boost?: number;// 0.0–1.0
    style?: number;           // 0.0–1.0 (expressiveness)
    use_speaker_boost?: boolean;
  };
  
  export async function POST(req: NextRequest) {
    try {
      const {
        text,
        model = "eleven_turbo_v2",
        format = "mp3_44100",
        speed = 0.9,                 // default a bit slower = calmer
        stability = 0.75,
        similarity_boost = 0.7,
        style = 0.1,
        use_speaker_boost = true
      } = (await req.json()) as TTSBody;
  
      if (!text || !text.trim()) return jsonError("Missing `text`", 400);
      if (!API_KEY || !VOICE_ID)   return jsonError("Server missing ElevenLabs config", 500);
  
      const upstream = await fetch(`${ELEVEN_BASE}/${VOICE_ID}/stream`, {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text,
          model_id: model,
          output_format: format,
          // speed directly controls speaking rate
          speed,                       // 0.7–1.2 per docs
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost
          }
        })
      });
  
      if (!upstream.ok || !upstream.body) {
        const errText = await safeText(upstream);
        return jsonError(`ElevenLabs error: ${errText || upstream.statusText}`, 502);
      }
  
      return new Response(upstream.body, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "TTS route failed";
      return jsonError(message, 500);
    }
  }
  

// Optional: simple GET for quick health checks
export async function GET() {
  const ok = Boolean(API_KEY && VOICE_ID);
  return new Response(
    JSON.stringify({
      ok,
      voiceConfigured: Boolean(VOICE_ID),
      ts: new Date().toISOString(),
    }),
    {
      status: ok ? 200 : 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
}

/* ----------------- helpers ----------------- */

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function safeText(r: Response) {
  try {
    return await r.text();
  } catch {
    return "";
  }
}
