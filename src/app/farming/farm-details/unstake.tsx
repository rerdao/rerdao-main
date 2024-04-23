'use client'
import { useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'

import { MintAmount, MintSymbol } from '@/components/mint'

import { precision, useUnstake } from '@/hooks/farming.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import {
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import { useMintByAddress } from '@/providers/mint.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'

export type UnstakeProps = {
  farmAddress: string
}

export default function Unstake({ farmAddress }: UnstakeProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const pushMessage = usePushMessage()
  const { inputMint } = useFarmByAddress(farmAddress)
  const { shares, leverage } = useDebtByFarmAddress(farmAddress) || {}
  const { decimals = 0 } = useMintByAddress(inputMint.toBase58()) || {}

  const max = useMemo(() => (!shares ? new BN(0) : shares), [shares])
  const ok = useMemo(() => {
    if (!amount) return false
    if (!shares || shares.isZero()) return false
    return true
  }, [amount, shares])

  const onMax = useCallback(
    () => setAmount(undecimalize(max, decimals)),
    [max, decimals],
  )
  const unstake = useUnstake(farmAddress, decimalize(amount, decimals))
  const onUnstake = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await unstake()
      pushMessage(
        'alert-success',
        'Successfully unstake. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [unstake, pushMessage])

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full">
        <div className="card bg-base-300 p-4 grid grid-cols-12 gap-2">
          <div className="col-span-full flex flex-row gap-1 items-center">
            <p className="text-sm opacity-60 flex-auto">Amount</p>
            <MintAmount
              mintAddress={inputMint?.toBase58() || ''}
              amount={max}
            />
            {leverage && !leverage.eq(precision) && (
              <span className="badge badge-primary">
                x{Number(undecimalize(leverage, 9))}
              </span>
            )}
            <p className="text-sm opacity-60 font-bold">
              <MintSymbol mintAddress={inputMint?.toBase58() || ''} />
            </p>
          </div>
          <div className="col-span-full flex flex-row items-center relative">
            <input
              type="number"
              name="amount"
              className="input input-ghost text-xl pr-[4.5rem] w-full"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className="btn btn-sm btn-ghost absolute right-2"
              onClick={onMax}
              disabled={max.isZero()}
            >
              MAX
            </button>
          </div>
        </div>
      </div>
      <button
        className="col-span-full btn btn-primary btn-sm"
        onClick={onUnstake}
        disabled={!ok || loading}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Unstake
      </button>
    </div>
  )
}
