'use client'
import { useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { MerkleDistributor } from '@sentre/utility'
import useSWR from 'swr'

import { MonitorDown, Send, Users } from 'lucide-react'
import HeroCard from '@/app/token-distribution/airdrop-vesting/heroCard'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useGetMerkleMetadata } from '@/hooks/airdrop.hook'
import { useDistributors, useMyDistributes } from '@/providers/airdrop.provider'
import { usePrices } from '@/providers/mint.provider'
import { useMints } from '@/hooks/spl.hook'

export default function Heros() {
  return (
    <div className="grid md:grid-cols-3 grid-col-1 gap-6">
      <TotalAirdrop />
      <TotalCampaign />
      <TotalRecipients />
    </div>
  )
}

const TotalCampaign = () => {
  const { airdrops } = useMyDistributes()
  return (
    <HeroCard
      Icon={Send}
      label="Total Campaigns"
      value={airdrops.length.toString()}
    />
  )
}

const TotalAirdrop = () => {
  const { airdrops } = useMyDistributes()
  const distributors = useDistributors()

  const mintAddresses = useMemo(() => {
    const result: string[] = []
    for (const address of airdrops) {
      const { mint } = distributors[address]
      result.push(mint.toBase58())
    }
    return result
  }, [distributors, airdrops])

  const mints = useMints(mintAddresses)
  const prices = usePrices(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const fetcher = useCallback(
    async ([prices, decimals]: [number[], number[]]) => {
      let usd = 0
      for (const index in airdrops) {
        const distributorAddress = airdrops[index]
        const { total } = distributors[distributorAddress]
        const numAmount = Number(undecimalize(total, decimals[index]))
        usd += numAmount * prices[index]
      }
      return usd
    },
    [distributors, airdrops],
  )

  const { data: totalUSD, isLoading } = useSWR(
    [prices, decimals, 'totalAirdrop'],
    fetcher,
  )

  return (
    <HeroCard
      Icon={MonitorDown}
      label="Total Airdrop"
      loading={isLoading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

const TotalRecipients = () => {
  const { airdrops } = useMyDistributes()
  const getMetadata = useGetMerkleMetadata()

  const { value: amountRecipient } = useAsync(async () => {
    const mapping: Record<string, string> = {}
    for (const address of airdrops) {
      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      root.receipients.forEach(({ authority }) => {
        mapping[authority.toBase58()] = address
      })
    }
    return Object.keys(mapping).length
  }, [airdrops])

  return (
    <HeroCard
      Icon={Users}
      label="Total Recipients"
      value={(amountRecipient || 0).toString()}
    />
  )
}
