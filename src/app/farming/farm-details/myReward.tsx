'use client'
import { useCallback, useMemo, useState } from 'react'

import {
  MintAmount,
  MintLogo,
  MintPrice,
  MintSymbol,
  MintValue,
} from '@/components/mint'
import Empty from '@/components/empty'

import { useUserRewards } from '../farmCard/userReward'
import { useHarvest } from '@/hooks/farming.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export type MyRewardProps = {
  farmAddress: string
}

export default function MyReward({ farmAddress }: MyRewardProps) {
  const rewards = useUserRewards(farmAddress, 1000)
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()

  const ok = useMemo(() => {
    for (const { amount } of rewards) if (!amount.isZero()) return true
    return false
  }, [rewards])

  const harvest = useHarvest(farmAddress)
  const onHarvest = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await harvest()
      pushMessage(
        'alert-success',
        'Successfully harvest. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [harvest, pushMessage])

  return (
    <div className="grid grid-cols-12 gap-4">
      <p className="col-span-full mb-2">My Rewards</p>
      {rewards.map(({ mintAddress, amount }) => (
        <div
          key={mintAddress}
          className="col-span-full grid grid-cols-12 gap-0"
        >
          <div className="col-span-full flex flex-row items-center gap-2">
            <MintLogo
              mintAddress={mintAddress}
              className="w-8 h-8 rounded-full bg-base-300"
            />
            <span className="flex flex-col gap-0 flex-auto">
              <p className="font-bold opacity-60">
                <MintSymbol mintAddress={mintAddress} />
              </p>
              <p className="opacity-60">
                <MintPrice mintAddress={mintAddress} />
              </p>
            </span>
            <span className="flex flex-col gap-0 items-end">
              <p className="font-bold">
                <MintAmount mintAddress={mintAddress} amount={amount} />
              </p>
              <p className="font-bold">
                <MintValue mintAddress={mintAddress} amount={amount} />
              </p>
            </span>
          </div>
        </div>
      ))}
      {!rewards.length && (
        <div className="col-span-full">
          <Empty />
        </div>
      )}
      <button
        className="col-span-full btn btn-primary btn-sm"
        onClick={onHarvest}
        disabled={!ok || loading}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Harvest
      </button>
    </div>
  )
}
