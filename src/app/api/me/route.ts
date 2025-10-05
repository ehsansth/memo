export const runtime = 'nodejs';
import { requireUser } from '@/lib/guards';

export async function GET() {
  try {
    const u = await requireUser();
    return Response.json({ user: { id: u.id, name: u.email, role: u.role } });
  } catch {
    return Response.json({ user: null });
  }
}
