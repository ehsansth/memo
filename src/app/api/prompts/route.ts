import { NextRequest } from 'next/server';
import { textModel } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const { caption, tags } = await req.json();
  const persona = `Tone: warm, gentle, encouraging. Avoid "test" language. Offer 1 hint on request.`;
  const prompt = `
${persona}
Create 3 short recall prompts for a patient to remember this memory.
Memory:
- caption: ${caption || '(none)'}
- tags: ${Array.isArray(tags) ? tags.join(', ') : ''}

Rules:
- each prompt <= 18 words
- avoid leading questions about identity; start with setting/emotion/sensation
- simple vocabulary, friendly
Return as JSON: { "prompts": ["...", "...", "..."] }`;

  const r = await textModel.generateContent(prompt);
  const txt = r.response.text();
  const json = JSON.parse(txt);
  return Response.json(json);
}
