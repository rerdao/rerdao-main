'use client'
import { useMemo } from 'react'
import BN from 'bn.js'

import { numeric } from '@/helpers/utils'
import {
  precision,
  useFarmEmissionRate,
  useFarmTimePassed,
} from '@/hooks/farming.hook'
import { useTvl } from '@/hooks/tvl.hook'
import {
  useDebtByFarmAddress,
  useFarmByAddress,
  useRewardsByFarmAddress,
} from '@/providers/farming.provider'

export const useUserRewards = (
  farmAddress: string,
  delay: number | null = null,
) => {
  const { compensation, totalRewards: moTotalRewards } =
    useFarmByAddress(farmAddress)
  const { shares, debtAmount, pendingRewards } =
    useDebtByFarmAddress(farmAddress) || {}
  const rewardAccounts = useRewardsByFarmAddress(farmAddress)
  const emissionRate = useFarmEmissionRate(farmAddress)
  const timePassed = useFarmTimePassed(farmAddress, delay)

  const moRewards = useMemo(() => {
    if (!shares || !debtAmount || !pendingRewards) return undefined
    return timePassed
      .mul(emissionRate)
      .add(compensation)
      .mul(shares)
      .div(precision)
      .sub(debtAmount)
      .add(pendingRewards)
  }, [
    timePassed,
    emissionRate,
    compensation,
    shares,
    debtAmount,
    pendingRewards,
  ])

  const rewards = useMemo<Array<{ mintAddress: string; amount: BN }>>(() => {
    if (!moRewards || moTotalRewards.isZero()) return []
    return rewardAccounts.map(({ rewardMint, totalRewards }) => ({
      mintAddress: rewardMint.toBase58(),
      amount: moRewards.mul(totalRewards).div(moTotalRewards),
    }))
  }, [rewardAccounts, moTotalRewards, moRewards])

  return rewards
}

export type UserRewardProps = {
  farmAddress: string
  onClick?: () => void
}

export default function UserReward({
  farmAddress,
  onClick = () => {},
}: UserRewardProps) {
  const myRewards = useUserRewards(farmAddress)
  const reward = useTvl(myRewards)
  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Rewards</p>
      <p className="font-bold">{numeric(reward).format('$0.[0000]')}</p>
      {reward > 0 && (
        <button className="btn btn-xs btn-primary" onClick={onClick}>
          Harvest
        </button>
      )}
    </div>
  )
}
