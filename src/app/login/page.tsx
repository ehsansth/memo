import Link from 'next/link';

export default function LoginPage(){
  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold">Welcome to MemoryBuddy</h1>
      <p className="mt-2">Please sign in to continue.</p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-lg border px-4 py-2" href="/auth/login">
          Login
        </Link>
        <Link className="rounded-lg border px-4 py-2" href="/auth/login?screen_hint=signup">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
