import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TamboProviderWrapper } from '@/components/providers/TamboProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AI Business Intelligence Workspace',
    description:
        'Generative AI-powered business analytics with real-time component generation',
    keywords: ['AI', 'Business Intelligence', 'Analytics', 'Dashboard', 'Tambo AI'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
     return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full`}>
                <TamboProviderWrapper>
                    {children}
                </TamboProviderWrapper>
            </body>
        </html>
    )
}