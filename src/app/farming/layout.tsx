import { ReactNode } from 'react'
import type { Metadata } from 'next'

import FarmingProvider from '@/providers/farming.provider'

export const metadata: Metadata = {
  title: 'RER Farming | Reverion',
  description: 'Boost your TVL and NFT utility along each other.',
}

export default function FarmingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <FarmingProvider>
        <div className="max-w-[1024px] w-full h-full">{children}</div>
      </FarmingProvider>
    </div>
  )
}
