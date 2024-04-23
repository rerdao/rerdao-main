'use client'
import { ChangeEvent, useCallback, useState } from 'react'
import BN from 'bn.js'

import {
  MintAmount,
  MintLogo,
  MintSymbol,
  useMintAmount,
} from '@/components/mint'

import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { usePoolByAddress } from '@/providers/pools.provider'

type MintInputProps = {
  poolAddress: string
  amountLp: string
  isSingle?: boolean
  onLpChange: (val: string) => void
}

export default function MintInput({
  poolAddress,
  amountLp = '',
  isSingle = false,
  onLpChange,
}: MintInputProps) {
  const [range, setRange] = useState('0')
  const pool = usePoolByAddress(poolAddress)
  const mintAddress = pool.mintLpt.toBase58()
  const { amount: mintAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }
  const balance = useMintAmount(mintAddress, mintAmount)

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      if (percentage > 0) onLpChange(String(percentage * Number(balance)))
      setRange(e.target.value)
    },
    [balance, onLpChange],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer">
          <MintLogo
            mintAddress={mintAddress}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-sm">
            <MintSymbol mintAddress={mintAddress} />
          </p>
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost flex-auto max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={amountLp}
          onChange={(e) => onLpChange(e.target.value)}
        />
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-bold opacity-60">Available</p>
          <p>
            <MintAmount mintAddress={mintAddress} amount={mintAmount} />
          </p>
        </div>
        {!isSingle ? (
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
            onClick={() => onLpChange(balance)}
            className="btn btn-sm btn-ghost"
          >
            Max
          </button>
        )}
      </div>
    </div>
  )
}
