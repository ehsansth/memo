'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Accept() {
  const sp = useSearchParams();
  const token = sp.get('token') || '';
  const returnTo = `/patient/complete?token=${encodeURIComponent(token)}`;
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Create Patient Account</h1>
      <p className="mt-2">Sign up (or log in), then we’ll link you to your caregiver.</p>
      <Link
        className="mt-4 inline-block border px-4 py-2 rounded-lg"
        href={`/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(returnTo)}`}
        prefetch={false}
      >
        Continue
      </Link>
    </main>
  );
}
