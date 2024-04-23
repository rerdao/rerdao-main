'use client'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import BN from 'bn.js'

import {
  MintAmount,
  MintLogo,
  MintSymbol,
  useMintAmount,
} from '@/components/mint'

import { useOracles } from '@/hooks/pool.hook'
import { numeric } from '@/helpers/utils'
import { useLamports } from '@/providers/wallet.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'

type MintInputProps = {
  mintAddress: string
  amount: string
  onAmount: (val: string) => void
  weights: BN[]
  index: number
  suggestAmount: string
  visibleSuggest: boolean
}

export default function MintInput({
  mintAddress,
  amount = '',
  onAmount,
  weights,
  index,
  suggestAmount,
  visibleSuggest,
}: MintInputProps) {
  const [range, setRange] = useState('0')
  const { amount: mintAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }
  const lamports = useLamports()
  const tokenOrLamportsAmount = useMemo(() => {
    if (WRAPPED_SOL_MINT.toBase58() !== mintAddress) return mintAmount
    return mintAmount.add(new BN(lamports))
  }, [lamports, mintAddress, mintAmount])
  const balance = useMintAmount(mintAddress, tokenOrLamportsAmount)

  const { calcNormalizedWeight } = useOracles()
  const normalizedWeight = calcNormalizedWeight(weights, weights[index])

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      if (percentage > 0) onAmount(String(percentage * Number(balance)))
      setRange(e.target.value)
    },
    [balance, onAmount],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center justify-between">
        <div className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer">
          <MintLogo
            mintAddress={mintAddress}
            className="w-6 h-6 rounded-full"
          />
          <h5 className="text-sm">
            <MintSymbol mintAddress={mintAddress} />{' '}
            {numeric(normalizedWeight).format('0,0.[0000]%')}
          </h5>
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost flex-auto max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
        />
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-bold opacity-60">Available</p>
          <p>
            <MintAmount
              mintAddress={mintAddress}
              amount={tokenOrLamportsAmount}
            />
          </p>
        </div>
        {!visibleSuggest ? (
          <div className="flex-auto max-w-[112px]">
            <input
              type="range"
              min={0}
              max={100}
              step={50}
              className="range range-xs range-primary"
              value={range}
              onChange={onRange}
            />
            <div className="w-full flex flex-row justify-between px-1 text-[9px] opacity-60">
              <span>|</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAmount(suggestAmount)}
            className="btn btn-sm btn-ghost"
          >
            Apply suggestion
          </button>
        )}
      </div>
    </div>
  )
}
