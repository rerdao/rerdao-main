'use client'
import { useEffect, useMemo, useState } from 'react'
import BN from 'bn.js'

import { useAllDebts, useAllFarms } from '@/providers/farming.provider'
import { numeric } from '@/helpers/utils'
import { useTvl } from '@/hooks/tvl.hook'
import { useUserRewards } from './farmCard/userReward'

const PseudoRewardInfo = ({
  farmAddress,
  onChange,
}: {
  farmAddress: string
  onChange: (value: Record<string, number>) => void
}) => {
  const rewards = useUserRewards(farmAddress)
  const value = useTvl(rewards)

  useEffect(() => {
    onChange({ [farmAddress]: value })
    return () => {
      onChange({ [farmAddress]: 0 })
    }
  }, [farmAddress, value, onChange])

  return null
}

export default function FarmingPanel() {
  const farms = useAllFarms()
  const debts = useAllDebts()
  const [rewards, setRewards] = useState<Record<string, number>>({})

  // TVL
  const mintAddressToAmount = useMemo(
    () =>
      Object.values(farms)
        .map(({ totalShares, inputMint }) => ({
          mintAddress: inputMint.toBase58(),
          amount: totalShares,
        }))
        .reduce<
          Array<{
            mintAddress: string
            amount: BN
          }>
        >((a, { mintAddress, amount }) => {
          const i = a.findIndex(({ mintAddress: addr }) => addr === mintAddress)
          if (i >= 0) a[i].amount = a[i].amount.add(amount)
          else a.push({ mintAddress, amount })
          return a
        }, []),
    [farms],
  )
  const tvl = useTvl(mintAddressToAmount)

  // User rewards
  const availableFarmAddresses = useMemo(
    () =>
      Object.keys(debts)
        .filter((debtAddress) => {
          const { debtAmount, pendingRewards } = debts[debtAddress]
          return !debtAmount.isZero() || !pendingRewards.isZero()
        })
        .map((debtAddress) => debts[debtAddress].farm.toBase58()),
    [debts],
  )
  const reward = Object.values(rewards).reduce((a, b) => a + b, 0)

  return (
    <div className="card w-full shadow-lg p-8 ring-1 ring-base-100 bg-gradient-to-br from-lime-200 to-teal-300 flex flex-row-reverse flex-wrap gap-x-2 gap-y-16 justify-center">
      <div className="w-48 relative -mb-4">
        <img
          className="w-full"
          src="/farming-illustration.png"
          alt="farming-illustration"
        />
        <img
          className="absolute -top-6 left-4 animate-bounce"
          src="/farming-coin-1.svg"
          alt="farming-coin-1"
        />
        <img
          style={{ animationDelay: '150ms' }}
          className="absolute -top-12 right-2 animate-bounce"
          src="/farming-coin-2.svg"
          alt="farming-coin-2"
        />
      </div>
      <div className="flex-auto flex flex-col gap-8 text-slate-800">
        <div className="flex flex-row gap-2">
          <h4>RER Farming</h4>
          <h5 className="opacity-60">v2</h5>
        </div>
        <div className="flex flex-row gap-2">
          <div className="">
            <p className="text-sm">TVL</p>
            <h5>{numeric(tvl).format('$0,0.[00]')}</h5>
          </div>
          <span className="divider divider-horizontal m-0" />
          <div className="">
            <p className="text-sm">Your Rewards</p>
            <h5>{numeric(reward).format('$0,0.[00]')}</h5>
            {availableFarmAddresses.map((availableFarmAddress) => (
              <PseudoRewardInfo
                key={availableFarmAddress}
                farmAddress={availableFarmAddress}
                onChange={(value) =>
                  setRewards((prev) => Object.assign(prev, value))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
