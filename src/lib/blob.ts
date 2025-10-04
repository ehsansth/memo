import { put } from '@vercel/blob';
export async function uploadToBlob(bytes: Buffer, filename: string, contentType: string) {
  const { url } = await put(filename, bytes, { access: 'public', contentType });
  return url;
}
