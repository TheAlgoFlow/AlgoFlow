import type { Metadata } from 'next'
import Script from 'next/script'
import { Poppins } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/i18n/context'
import { Nav } from '@/components/organisms/Nav'

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AlgoFlow — Algorithms, Visualized',
  description: 'Interactive step-by-step visualizations for 25 algorithms. Free, open-source, built for CS students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
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
        <I18nProvider>
          <Nav />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
