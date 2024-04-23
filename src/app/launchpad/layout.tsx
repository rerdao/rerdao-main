import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PoolProvider } from '@/providers/pools.provider'

export const metadata: Metadata = {
    title: 'RER Launchpad | Reverion',
    description:
        'The asymmetric pools (Balancer model) on Solana. Powered by Reverion.',
}

export default function LaunchpadLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 justify-center gap-4">
            <div className="w-full flex flex-col gap-4 items-center">
                <div role="tablist" className="tabs tabs-boxed rounded-box">
                    <a role="tab" className="tab tab-active !rounded-box">
                        Swap
                    </a>
                    <Link role="tab" className="tab !rounded-box" href="/pools">
                        Pools
                    </Link>
                </div>
                <div className="max-w-[360px]">
                    <PoolProvider>{children}</PoolProvider>
                </div>
            </div>
        </div>
    )
}
