import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/i18n/context'
import { Nav } from '@/components/organisms/Nav'

export const metadata: Metadata = {
  title: 'DSA Visualizer',
  description: 'Interactive Data Structures & Algorithms visualizer for AEDS students',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <Nav />
          <main className="min-h-screen">{children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
