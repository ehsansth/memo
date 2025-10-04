import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// text (LLM prompts)
export const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// vision (captioning)
export const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
