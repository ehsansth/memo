// app/tts-test/page.tsx
"use client";
import { useState } from "react";

export default function TTSTestPage() {
  const [text, setText] = useState("Hello from our memory buddy!");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSpeak() {
    setLoading(true);
    setErr(null);
    setUrl(null);
    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) {
        const msg = await resp.text().catch(() => "");
        throw new Error(msg || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    } catch (e: any) {
      setErr(e?.message ?? "TTS failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">TTS Smoke Test</h1>
      <label className="block">
        <span className="text-sm">Text to speak</span>
        <textarea
          className="mt-1 w-full p-2 border rounded"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      <button
        onClick={handleSpeak}
        disabled={loading || !text.trim()}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        aria-busy={loading}
      >
        {loading ? "Generating…" : "Speak"}
      </button>

      {err && <p className="text-red-600">{err}</p>}

      {url && (
        <div className="space-y-2">
          <audio controls src={url} />
          <p className="text-xs text-gray-500">If audio doesn’t autoplay, press Play (browser policy).</p>
        </div>
      )}
    </main>
  );
}
