'use client'
import BN from 'bn.js'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useRewardsByFarmAddress } from '@/providers/farming.provider'
import { useFarmLifetime } from '@/hooks/farming.hook'

export type FarmRewardProps = {
  farmAddress: string
}

export default function FarmReward({ farmAddress }: FarmRewardProps) {
  const rewards = useRewardsByFarmAddress(farmAddress)
  const lifetime = useFarmLifetime(farmAddress)

  return (
    <div className="grid grid-cols-12 gap-4">
      <p className="col-span-full mb-2">Farm Rewards</p>
      {rewards.map(({ rewardMint, totalRewards }) => (
        <div
          key={rewardMint.toBase58()}
          className="col-span-full grid grid-cols-12 gap-0"
        >
          <div className="col-span-full flex flex-row items-center gap-2">
            <MintLogo
              mintAddress={rewardMint.toBase58()}
              className="w-8 h-8 rounded-full bg-base-300"
            />
            <p className="font-bold opacity-60 flex-auto">
              <MintSymbol mintAddress={rewardMint.toBase58()} />
            </p>
            <p className="font-bold">
              <MintAmount
                amount={totalRewards}
                mintAddress={rewardMint.toBase58()}
              />
            </p>
          </div>
          <p className="col-span-full text-sm text-end opacity-60">
            <MintAmount
              amount={totalRewards.mul(new BN(24 * 60 * 60)).div(lifetime)}
              mintAddress={rewardMint.toBase58()}
            />{' '}
            <MintSymbol mintAddress={rewardMint.toBase58()} /> / Day
          </p>
        </div>
      ))}
    </div>
  )
}
