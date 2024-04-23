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
      <TotalVesting />
      <TotalCampaign />
      <TotalRecipients />
    </div>
  )
}

const TotalCampaign = () => {
  const { vesting } = useMyDistributes()
  return (
    <HeroCard
      Icon={Send}
      label="Total Campaigns"
      value={vesting.length.toString()}
    />
  )
}

const TotalVesting = () => {
  const { vesting } = useMyDistributes()
  const distributors = useDistributors()

  const mintAddresses = useMemo(() => {
    const result: string[] = []
    for (const address of vesting) {
      const { mint } = distributors[address]
      result.push(mint.toBase58())
    }
    return result
  }, [distributors, vesting])

  const mints = useMints(mintAddresses)
  const prices = usePrices(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const fetcher = useCallback(
    async ([prices, decimals]: [number[], number[]]) => {
      let usd = 0
      for (const index in vesting) {
        const distributorAddress = vesting[index]
        const { total } = distributors[distributorAddress]
        const numAmount = Number(undecimalize(total, decimals[index]))
        usd += numAmount * prices[index]
      }
      return usd
    },
    [distributors, vesting],
  )

  const { data: totalUSD, isLoading } = useSWR(
    [prices, decimals, 'totalVesting'],
    fetcher,
  )

  return (
    <HeroCard
      Icon={MonitorDown}
      label="Total Vesting"
      loading={isLoading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

const TotalRecipients = () => {
  const { vesting } = useMyDistributes()
  const getMetadata = useGetMerkleMetadata()

  const { value: amountRecipient } = useAsync(async () => {
    const mapping: Record<string, string> = {}
    for (const address of vesting) {
      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      root.receipients.forEach(({ authority }) => {
        mapping[authority.toBase58()] = address
      })
    }
    return Object.keys(mapping).length
  }, [vesting])

  return (
    <HeroCard
      Icon={Users}
      label="Total Recipients"
      value={(amountRecipient || 0).toString()}
    />
  )
}
