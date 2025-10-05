'use client';
import { useState } from 'react';

export default function NewPatientInvite() {
  const [link, setLink] = useState<string|null>(null);
  async function createInvite(){
    const r = await fetch('/api/caregiver/invites', { method: 'POST' }).then(r=>r.json());
    setLink(`${location.origin}/patient/accept?token=${r.token}`);
  }
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Invite a Patient</h1>
      <button onClick={createInvite} className="mt-4 border px-4 py-2 rounded-lg">Generate invite link</button>
      {link && <p className="mt-3 break-all">Share: <a className="underline" href={link}>{link}</a></p>}
    </main>
  );
}
