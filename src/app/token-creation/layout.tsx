import { ReactNode } from 'react'
import type { Metadata } from 'next'

import Navigation from './navigation'

export const metadata: Metadata = {
  title: 'Token Creation | Reverion',
  description:
    'Token Creation: Start your SPL token standard and Token2022 on Solana. Powered by Reverion.',
}

export default function TokenCreationLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 justify-center gap-4">
      <div className="flex flex-row w-full justify-center">
        <Navigation />
      </div>
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px] sm:min-w-[240px] md:min-w-[360px]">
          {children}
        </div>
      </div>
    </div>
  )
}
