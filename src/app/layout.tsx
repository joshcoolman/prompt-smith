import type { Metadata } from 'next'
import { IBM_Plex_Sans, Martel, Space_Mono } from 'next/font/google'
import { appMeta } from '#/app-meta'
import { ThemeInit } from '#/components/theme-init'
import { ThemeToggle } from '#/components/theme-toggle'
import '#/styles/index.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})
const martel = Martel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-martel',
  display: 'swap',
})
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: appMeta.name,
  description: appMeta.tagline,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${martel.variable} ${spaceMono.variable}`}
    >
      <body>
        <ThemeInit />
        <ThemeToggle />
        {children}
      </body>
    </html>
  )
}
