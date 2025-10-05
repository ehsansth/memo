'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

export default function TopNav() {
  const [user, setUser] = useState<{name?:string; role?:'CAREGIVER'|'PATIENT'}|null>(null);

  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: abort.signal,
    })
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null));

    return () => abort.abort();
  }, []);

  return (
    <header>
      <div className="container mx-auto flex items-center justify-between py-3">
        <h1 className="text-lg font-semibold">MemoryBuddy</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Home</Link>
          <Link
            href="/caregiver"
            className={user?.role==='CAREGIVER' ? '' : 'opacity-60 pointer-events-none'}
            aria-disabled={user?.role !== 'CAREGIVER'}
            tabIndex={user?.role==='CAREGIVER' ? 0 : -1}
            title={user?.role==='CAREGIVER' ? '' : 'Login as caregiver to access'}
          >
            Caregiver
          </Link>
          <Link
            href="/patient/quiz"
            className={user?.role==='PATIENT' ? '' : 'opacity-60 pointer-events-none'}
            aria-disabled={user?.role !== 'PATIENT'}
            tabIndex={user?.role==='PATIENT' ? 0 : -1}
            title={user?.role==='PATIENT' ? '' : 'Login as patient to access'}
          >
            Patient
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link href="/auth/login" prefetch={false}>Login</Link>
              <Link href="/auth/login?screen_hint=signup" prefetch={false}>Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <span className="text-sm opacity-80">{user.name} ({user.role})</span>
              <Link href="/auth/logout" prefetch={false}>Logout</Link>
            </>
          )}
        </div>
      </div>
      <Separator />
    </header>
  );
}
