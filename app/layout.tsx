import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Feature Flag Removal Dashboard',
  description: 'Automated feature flag analysis and removal with Devin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/connect" className="hover:underline">Connect</a>
            <a href="/flags" className="hover:underline">Flags</a>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
