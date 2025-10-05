import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/guards';
import { uploadToBlob } from '@/lib/blob';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await requireRole(['CAREGIVER']);
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const title = (form.get('title') as string)?.trim() || 'Memory';
  const personName = (form.get('personName') as string)?.trim() || null;
  const eventName = (form.get('eventName') as string)?.trim() || null;
  const placeName = (form.get('placeName') as string)?.trim() || null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const imageUrl = await uploadToBlob(bytes, file.name, file.type || 'application/octet-stream');

  const memory = await prisma.memory.create({
    data: {
      userId: user.id,
      title,
      personName,
      eventName,
      placeName,
      imageUrl,
    },
  });

  return Response.json({ ok: true, memory });
}
