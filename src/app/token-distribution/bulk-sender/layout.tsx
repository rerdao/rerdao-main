import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { BulkSenderProvider } from '@/providers/bulkSender.provider'

export const metadata: Metadata = {
  title: 'Bulk Sender | Reverion',
  description: 'Bulk Sender for SPL Tokens on Solana',
}

export default function BulkSenderLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <BulkSenderProvider>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="max-w-[480px]">{children}</div>
      </div>
    </BulkSenderProvider>
  )
}
