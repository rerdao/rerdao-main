'use client'
import { useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'

import { MintAmount, MintSymbol } from '@/components/mint'
import BoostNft from './boost'
import BoostInfo from './boostInfo'

import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useStake } from '@/hooks/farming.hook'
import { useMintByAddress } from '@/providers/mint.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import {
  useBoostingByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'

export type StakeProps = {
  farmAddress: string
}

export default function Stake({ farmAddress }: StakeProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [nfts, setNfts] = useState<string[]>([])
  const pushMessage = usePushMessage()
  const { inputMint } = useFarmByAddress(farmAddress)
  const { decimals = 0 } = useMintByAddress(inputMint.toBase58()) || {}
  const { amount: balance } =
    useTokenAccountByMintAddress(inputMint.toBase58()) || {}
  const boosting = useBoostingByFarmAddress(farmAddress)

  const max = useMemo(() => (!balance ? new BN(0) : balance), [balance])
  const ok = useMemo(() => {
    if (!amount) return false
    return true
  }, [amount])

  const onMax = useCallback(
    () => setAmount(undecimalize(max, decimals)),
    [max, decimals],
  )

  const stake = useStake(farmAddress, decimalize(amount, decimals), nfts)
  const onStake = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await stake()
      pushMessage(
        'alert-success',
        'Successfully unstake. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
      setNfts([])
      setAmount('')
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [stake, pushMessage])

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

      {/* Boosting NFT */}
      {!!boosting.length && (
        <div className="col-span-full grid grid-cols-12">
          <div className="col-span-full">
            <BoostNft farmAddress={farmAddress} nfts={nfts} onNfts={setNfts} />
          </div>
          <div className="col-span-full mt-6">
            <BoostInfo
              nfts={nfts}
              amount={Number(amount) || 0}
              farmAddress={farmAddress}
            />
          </div>
        </div>
      )}

      <button
        className="col-span-full btn btn-primary btn-sm"
        onClick={onStake}
        disabled={!ok || loading}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Stake
      </button>
    </div>
  )
}
