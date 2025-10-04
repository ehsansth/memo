import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/** returns Float32Array */
export async function embedImage(base64: string) {
  // gemini image embedding (uses multimodal embedding model under the hood)
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }); // text emb
  // quick hack: also embed caption later; for now just return null and rely on caption emb
  return null;
}

export async function embedText(text: string) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const r = await model.embedContent(text);
  return Float32Array.from(r.embedding.values);
}
