'use client'
import { useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import useSWR from 'swr'

import { ArrowUpRightFromCircle } from 'lucide-react'
import HeroCard from '../heroCard'

import { useDistributors } from '@/providers/airdrop.provider'
import { usePrices } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useMints } from '@/hooks/spl.hook'

export default function TotalDistribution() {
  const { publicKey } = useWallet()
  const distributors = useDistributors()

  const myDistributors = useMemo(() => {
    if (!publicKey || !distributors) return []
    return Object.values(distributors).filter(({ authority }) =>
      authority.equals(publicKey),
    )
  }, [distributors, publicKey])

  const mintAddresses = useMemo(
    () => myDistributors.map(({ mint }) => mint.toBase58()),
    [myDistributors],
  )

  const mints = useMints(mintAddresses)
  const prices = usePrices(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const fetcher = useCallback(
    async ([prices, decimals]: [number[], number[]]) => {
      if (!prices) return 0
      let usd = 0
      for (const idx in myDistributors) {
        const { total } = myDistributors[idx]
        const numAmount = Number(undecimalize(total, decimals[idx]))
        usd += numAmount * prices[idx]
      }
      return usd
    },
    [myDistributors],
  )

  const { data: totalUSD, isLoading } = useSWR(
    [prices, decimals, 'totalDistribution'],
    fetcher,
  )

  return (
    <HeroCard
      Icon={ArrowUpRightFromCircle}
      label="Total Distribution"
      loading={isLoading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}
