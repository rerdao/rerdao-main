'use client'
import { ChangeEvent, useCallback, useState } from 'react'
import BN from 'bn.js'

import TokenSelection from '@/components/tokenSelection'
import {
  MintAmount,
  MintLogo,
  MintSymbol,
  useMintAmount,
} from '@/components/mint'
import { ChevronDown } from 'lucide-react'

import { useSwapStore } from '@/hooks/swap.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'

export default function Bid() {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState('0')
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const setBidMintAddress = useSwapStore(
    ({ setBidMintAddress }) => setBidMintAddress,
  )
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const setBidAmount = useSwapStore(({ setBidAmount }) => setBidAmount)
  const { amount } = useTokenAccountByMintAddress(bidMintAddress) || {
    amount: new BN(0),
  }
  const balance = useMintAmount(bidMintAddress, amount)

  const onBidMintAddress = useCallback(
    (mintAddress: string) => {
      if (bidMintAddress !== mintAddress) {
        setBidMintAddress(mintAddress)
        setOpen(false)
      }
    },
    [bidMintAddress, setBidMintAddress, setOpen],
  )
  const onBidAmount = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBidAmount(e.target.value)
      setRange('0')
    },
    [setBidAmount],
  )

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      if (percentage > 0) setBidAmount(String(percentage * Number(balance)))
      setRange(e.target.value)
    },
    [balance, setBidAmount],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div
          className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <MintLogo
            mintAddress={bidMintAddress}
            className="w-8 h-8 rounded-full"
          />
          <h5 className="text-sm">
            <MintSymbol mintAddress={bidMintAddress} />
          </h5>
          <ChevronDown className="h-4 w-4" />
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost w-full max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={bidAmount}
          onChange={onBidAmount}
        />
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-bold opacity-60">Available</p>
          <p>
            <MintAmount mintAddress={bidMintAddress} amount={amount} />
          </p>
        </div>
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
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={bidMintAddress}
        onChange={onBidMintAddress}
      />
    </div>
  )
}
