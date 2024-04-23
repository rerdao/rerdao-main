import { ReactNode } from 'react'
import type { Metadata } from 'next'

import AirdropProvider from '@/providers/airdrop.provider'

export const metadata: Metadata = {
  title: 'Token Distribution | Reverion',
  description:
    'Token Distribution: Build your effective airdrop, vesting, bulk sender campaigns. Powered by Solana/',
}

export default function TokenDistributionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AirdropProvider>
      <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 ">
        {children}
      </div>
    </AirdropProvider>
  )
}
