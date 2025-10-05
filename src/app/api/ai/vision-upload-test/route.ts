import { visionModel } from '@/lib/ai';

export const runtime = 'nodejs';

function toBase64(buf: ArrayBuffer) {
  return Buffer.from(buf).toString('base64');
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return new Response('file required', { status: 400 });

    const bytes = await file.arrayBuffer();
    const b64 = toBase64(bytes);

    const prompt = `Return strict JSON:
{"caption":"<<=18 words>","tags":["tag1","tag2","tag3","tag4","tag5"]}`;

    const res = await visionModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: b64, mimeType: file.type || 'image/jpeg' } }
        ]
      }]
    });

    const txt = res.response.text().trim();
    const jsonStr = txt.replace(/^```json|```$/g, '').trim();
    const data = JSON.parse(jsonStr);

    return Response.json({ ok: true, raw: txt, data });
  } catch (err) {
    console.error('vision-upload-test:', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
}
