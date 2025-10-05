import { NextRequest } from 'next/server';
import { visionModel } from '@/lib/ai';
import { embedText } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  const { memoryId, imageUrl } = await req.json();
  if (!memoryId || !imageUrl) return new Response('bad request', { status: 400 });

  const prompt = `You are helping a caregiver create a gentle memory card. 
Return:
- one short, factual caption (<= 18 words)
- 5-8 lowercase tags (no '#', comma separated), include people/setting/emotion if visible. 
Avoid guessing identities.`;

  const result = await visionModel.generateContent([
    { text: prompt },
    { inlineData: { data: '', mimeType: 'application/octet-stream' } }, // not needed if URL supported
    { text: `Image URL: ${imageUrl}` }
  ]);

  const text = result.response.text();
  // simple parse: assume "Caption: ...\nTags: ...".
  const caption = (/caption:\s*(.+)/i.exec(text)?.[1] ?? '').trim();
  const tags = (/tags:\s*(.+)/i.exec(text)?.[1] ?? '')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  

  return Response.json({ ok: true, caption, tags });
}
