import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/language-context'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Elite Chauffeur | Luxury Black Car Service',
  description: 'Experience uncompromising elegance with Elite Chauffeur. Premium black car service featuring an impeccable fleet, professional chauffeurs, and absolute punctuality.',
  keywords: ['luxury car service', 'black car', 'chauffeur', 'executive transport', 'limousine', 'premium transportation'],
  authors: [{ name: 'Elite Chauffeur' }],
  openGraph: {
    title: 'Elite Chauffeur | Luxury Black Car Service',
    description: 'Experience uncompromising elegance with Elite Chauffeur. Premium black car service.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
