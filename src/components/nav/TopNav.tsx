//memo/src/components/nav/TopNav.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/darkmode/theme-toggle'
import MuteToggle from '@/components/mute/mute-toggle'
import { Button } from "@/components/ui/button"
import { User } from 'lucide-react'

export default function TopNav() {
  const [user, setUser] = useState<{ name?: string; email?: string; role?: 'CAREGIVER' | 'PATIENT' } | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const abort = new AbortController()
    fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: abort.signal,
    })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))

    return () => abort.abort()
  }, [])

  return (
    <header>
      <div className="flex items-center justify-between py-3 px-8">
        {/* LEFT SIDE — LOGO */}
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-semibold">
            <Link href="/">memo</Link>
          </h1>
        </div>

        {/* CENTER — NAV LINKS */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-8 text-sm">
          <Link href="/">Home</Link>
          <Link
            href="/caregiver"
            title={user?.role === 'CAREGIVER' ? '' : 'Login as caregiver to access'}
          >
            Caregiver
          </Link>
          <Link
            href="/patient/quiz"
            title={user?.role === 'PATIENT' ? '' : 'Login as patient to access'}
          >
            Patient
          </Link>
        </nav>


        {/* RIGHT SIDE — USER INFO + TOGGLES */}
        {/* RIGHT SIDE — USER INFO + TOGGLES */}
        <div className="flex items-center gap-4 relative">
          {!user && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-md px-4 py-2 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                <Link href="/auth/login" prefetch={false}>
                  Login
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-md px-4 py-2 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                <Link href="/auth/login?screen_hint=signup" prefetch={false}>
                  Sign Up
                </Link>
              </Button>
            </>
          )}

          {user && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md px-4 py-2 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                asChild
              >
                <Link href="/auth/logout" prefetch={false}>
                  Logout
                </Link>
              </Button>

              {/* Profile Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(!showProfile)}
                className="hover:bg-neutral-200 dark:hover:bg-neutral-700"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Profile Popup */}
              {showProfile && user && (
                <div className="absolute top-12 right-0 w-72 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg shadow-md p-4 text-sm w-60">
                  <p className="font-medium mb-1">Profile</p>
                  <p className="text-gray-700 dark:text-gray-300 break-all">Email: {user.name ?? "Unknown"}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Role: {user.role ?? "Unknown"}</p>
                </div>
              )}
            </>
          )}
          
          <ThemeToggle />
        </div>
      </div>

      <Separator />
    </header>
  )
}
