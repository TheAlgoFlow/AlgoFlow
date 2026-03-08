import type { Metadata } from 'next'
import Script from 'next/script'
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/i18n/context'
import { ThemeProvider } from '@/i18n/theme-context'
import { SidebarProvider } from '@/i18n/sidebar-context'
import { Nav } from '@/components/organisms/Nav'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
})

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AlgoFlow — Algorithms, Visualized',
  description: 'Interactive step-by-step visualizations for 25 algorithms. Free, open-source, built for CS students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G397DGSNC6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G397DGSNC6');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <SidebarProvider>
              <Nav />
              <main>
                {children}
              </main>
            </SidebarProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
