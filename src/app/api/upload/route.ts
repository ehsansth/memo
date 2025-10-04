import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/guards';
import { uploadToBlob } from '@/lib/blob';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  const form = await req.formData();
  const file = form.get('file') as File;
  const patientId = form.get('patientId') as string;
  const title = (form.get('title') as string) || 'Memory';

  if (!file) return new Response('No file', { status: 400 });
  const ab = await file.arrayBuffer();
  const url = await uploadToBlob(Buffer.from(ab), file.name, file.type);

  const memory = await prisma.memory.create({
    data: {
      patientId,
      title,
      imageUrl: url
    }
  });

  return Response.json({ ok: true, memory });
}
