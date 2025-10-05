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
  } catch (err: any) {
    console.error('text-test error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), { status: 500 });
  }
}
 