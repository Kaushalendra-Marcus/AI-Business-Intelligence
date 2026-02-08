'use client'

import { TamboProvider } from '@tambo-ai/react'
import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { registerTamboComponents } from '@/lib/tambo'

interface TamboProviderWrapperProps {
  children: ReactNode
}

export function TamboProviderWrapper({ children }: TamboProviderWrapperProps) {
  const tamboApiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || ''
  
  if (!tamboApiKey) {
    console.warn('⚠️ NEXT_PUBLIC_TAMBO_API_KEY not set')
    // For demo, you can use a placeholder but show warning
  }

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">AI Provider Error</div>}>
      <TamboProvider
        components={registerTamboComponents()}
        apiKey={tamboApiKey}
      >
        {children}
      </TamboProvider>
    </ErrorBoundary>
  )
}