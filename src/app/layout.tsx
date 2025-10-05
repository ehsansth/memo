import "./globals.css"
import { ThemeProvider } from "next-themes"
import TopNav from "@/components/nav/TopNav"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Memo",
  description: "AI-assisted memory reinforcement",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNav />
          <main className="container mx-auto p-4">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
