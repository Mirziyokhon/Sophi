import type { Metadata } from 'next'
import { Libre_Baskerville, Geist_Mono, Patrick_Hand } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

const _libreBaskerville = Libre_Baskerville({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville"
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
      <body className={`${_libreBaskerville.variable} ${_geistMono.variable} ${_patrickHand.variable} font-sans antialiased`}>
        <ThemeProvider
          forcedTheme="dark"
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              {children}
              <Toaster position="top-center" richColors />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
