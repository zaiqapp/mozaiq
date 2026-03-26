import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { PaperShader } from '@/components/ui/paper-shader'
import { GlassFilter } from '@/components/ui/liquid-glass'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Mozaiq — Build beautiful dashboards in minutes',
  description: 'Drag-and-drop dashboard builder with AI generation. Open source.',
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#22d3ee',
    colorBackground: 'rgba(8,8,20,0.98)',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    colorInputBackground: 'rgba(255,255,255,0.06)',
    colorInputText: '#f9fafb',
    colorNeutral: '#9ca3af',
    borderRadius: '0.75rem',
    fontFamily: 'inherit',
  },
  elements: {
    // Outer modal box
    cardBox: { boxShadow: 'none' },
    // Main card — dark glass
    card: {
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow:
        'inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.03), 0 25px 50px rgba(0,0,0,0.6)',
    },
    // Header
    headerTitle: { color: '#f9fafb' },
    headerSubtitle: { color: '#9ca3af' },
    // Form labels & hints
    formFieldLabel: { color: '#d1d5db' },
    formFieldHintText: { color: '#9ca3af' },
    formFieldErrorText: { color: '#f87171' },
    // Inputs
    formFieldInput: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.09)',
      color: '#f9fafb',
    },
    // Primary button
    formButtonPrimary: {
      background: 'linear-gradient(to right, #22d3ee, #4f46e5)',
      color: '#ffffff',
    },
    // Social buttons
    socialButtonsBlockButton: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      color: '#f9fafb',
    },
    socialButtonsBlockButtonText: { color: '#f9fafb' },
    // "Last used" badge on social buttons
    badge: { color: '#9ca3af', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' },
    lastAuthenticationStrategyBadge: { color: '#9ca3af', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' },
    // OR divider
    dividerLine: { background: 'rgba(255,255,255,0.09)' },
    dividerText: { color: '#9ca3af' },
    // Footer
    footerActionText: { color: '#9ca3af' },
    footerActionLink: { color: '#22d3ee' },
    // Identity preview (email shown after step 1)
    identityPreviewText: { color: '#f9fafb' },
    identityPreviewEditButton: { color: '#22d3ee' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
          <PaperShader />
          <GlassFilter />
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
