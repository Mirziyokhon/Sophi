import type { Metadata } from 'next'
import { Geist, Geist_Mono, Patrick_Hand } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

const _geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist"
});
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});
const _patrickHand = Patrick_Hand({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand"
});

export const metadata: Metadata = {
  title: 'Sophi - Transform Learning Materials into Personalized Videos',
  description: 'Transform any learning material into personalized animated videos tailored to your interests. AI-powered educational content creation.',
  icons: {
    icon: '📚',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} ${_patrickHand.variable} font-sans antialiased`}>
        {/* Aesthetic Background Elements */}
        <div className="illumination illumination-1" />
        <div className="illumination illumination-2" />
        <div className="illumination illumination-3" />
        <div className="futuristic-curves" />
        <div className="grain-overlay" />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <AppProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
