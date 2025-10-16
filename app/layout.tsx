'use client'

import type { Metadata } from 'next'
import './globals.css'
import { PrimeReactProvider } from 'primereact/api'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [konamiProgress, setKonamiProgress] = useState(0)
  const [showMascot, setShowMascot] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiProgress]) {
        const newProgress = konamiProgress + 1
        setKonamiProgress(newProgress)

        if (newProgress === konamiCode.length) {
          setShowMascot(true)
          setKonamiProgress(0)
          setTimeout(() => setShowMascot(false), 10000)
        }
      } else {
        setKonamiProgress(0)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [konamiProgress])

  const handleMascotClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount === 5) {
        alert('🎉 You found the secret! Here\'s a fun fact: This dashboard can handle thousands of feature flags!')
        return 0
      }
      return newCount
    })
  }

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : ''
  }

  return (
    <html lang="en">
      <head>
        <title>Feature Flag Removal Dashboard</title>
        <meta name="description" content="Automated feature flag analysis and removal with Devin" />
      </head>
      <body>
        <PrimeReactProvider>
          <div className="min-h-screen flex flex-column">
            {/* Navigation Bar */}
            <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              <div className="container mx-auto px-4">
                <div className="flex align-items-center justify-content-between" style={{ height: '70px' }}>
                  <div className="flex align-items-center gap-3">
                    <a href="/" className="flex align-items-center gap-2 text-white no-underline wiggle">
                      <i className="pi pi-flag-fill" style={{ fontSize: '1.8rem' }}></i>
                      <span className="font-bold" style={{ fontSize: '1.4rem' }}>FlagMaster</span>
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="/"
                      className={`px-4 py-2 rounded-lg text-white no-underline hover:bg-white hover:bg-opacity-20 transition-all ${isActive('/')}`}
                    >
                      <i className="pi pi-home mr-2"></i>
                      Home
                    </a>
                    <a
                      href="/connect"
                      className={`px-4 py-2 rounded-lg text-white no-underline hover:bg-white hover:bg-opacity-20 transition-all ${isActive('/connect')}`}
                    >
                      <i className="pi pi-link mr-2"></i>
                      Connect
                    </a>
                    <a
                      href="/flags"
                      className={`px-4 py-2 rounded-lg text-white no-underline hover:bg-white hover:bg-opacity-20 transition-all ${isActive('/flags')}`}
                    >
                      <i className="pi pi-list mr-2"></i>
                      Flags
                    </a>
                    <a
                      href="/reset"
                      className="px-4 py-2 rounded-lg text-white no-underline hover:bg-red-500 hover:bg-opacity-30 transition-all"
                      title="Clear local storage"
                    >
                      <i className="pi pi-refresh"></i>
                    </a>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4 mt-auto">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm">
                  <i className="pi pi-bolt mr-2"></i>
                  Powered by Devin AI & PrimeReact
                  <span className="ml-3 text-gray-400">|</span>
                  <span className="ml-3 text-gray-400 cursor-pointer hover:text-white" title="Try the Konami code!">
                    🎮 Easter eggs hidden
                  </span>
                </p>
              </div>
            </footer>

            {/* Easter Egg Mascot */}
            <div
              className={`easter-egg-mascot ${showMascot ? 'show' : ''}`}
              onClick={handleMascotClick}
              title="Click me 5 times!"
            >
              <div className="text-6xl float-animation">
                🚩
              </div>
            </div>
          </div>
        </PrimeReactProvider>
      </body>
    </html>
  )
}
