'use client'
import { useMemo } from 'react'

import { numeric } from '@/helpers/utils'
import { useFarmLifetime } from '@/hooks/farming.hook'
import { useTvl } from '@/hooks/tvl.hook'
import {
  useFarmByAddress,
  useRewardsByFarmAddress,
} from '@/providers/farming.provider'

const YEAR = 365 * 24 * 60 * 60

export type FarmAprProps = {
  farmAddress: string
}

export default function FarmApr({ farmAddress }: FarmAprProps) {
  const { inputMint, totalShares } = useFarmByAddress(farmAddress)
  const inputMintAddress = useMemo(() => inputMint.toBase58(), [inputMint])
  const rewards = useRewardsByFarmAddress(farmAddress) || {}

  const lifetime = useFarmLifetime(farmAddress)
  const tvl = useTvl([{ mintAddress: inputMintAddress, amount: totalShares }])
  const totalReward = useTvl(
    rewards.map(({ rewardMint, totalRewards }) => ({
      mintAddress: rewardMint.toBase58(),
      amount: totalRewards,
    })),
  )
  const rewardPerYear = (totalReward * YEAR) / lifetime.toNumber()
  const apr = rewardPerYear / Math.max(tvl, 100)

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">APR</p>
      <p className="font-bold text-lime-500">
        {numeric(apr).format('0.[00]%')}
      </p>
    </div>
  )
}
