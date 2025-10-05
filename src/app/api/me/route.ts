export const runtime = 'nodejs';
import { requireUser } from '@/lib/guards';

export async function GET() {
  try {
    const u = await requireUser();
    return new Response(
      JSON.stringify({ user: { id: u.id, name: u.email, role: u.role } }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      },
    );
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  }
}
