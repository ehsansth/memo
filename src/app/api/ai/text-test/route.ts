import { NextRequest } from 'next/server';
import { textModel } from '@/lib/ai';

export const runtime = 'nodejs'; // keep key server-side

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const r = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt || 'Say hello in one sentence.' }]}],
    });
    const out = r.response.text();
    return Response.json({ ok: true, out });
  } catch (err) {
    console.error('text-test error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
}
