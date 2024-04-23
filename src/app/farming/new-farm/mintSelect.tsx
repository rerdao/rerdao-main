'use client'
import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import TokenSelection from '@/components/tokenSelection'

type MintSelectProps = {
  mintAddress: string
  onMintAddress: (mintAddress: string) => void
}

export default function MintSelect({
  mintAddress,
  onMintAddress,
}: MintSelectProps) {
  const [open, setOpen] = useState(false)

  const onChangeMintChange = (mintAddress: string) => {
    onMintAddress(mintAddress)
    setOpen(false)
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Input</p>
      <div
        onClick={() => setOpen(true)}
        className="card rounded-xl bg-base-200 px-3 py-2 flex flex-row gap-2 items-center cursor-pointer"
      >
        <MintLogo className="w-6 h-6 rounded-full" mintAddress={mintAddress} />
        <p className="font-bold">
          {mintAddress ? (
            <MintSymbol mintAddress={mintAddress} />
          ) : (
            'Select LP token'
          )}
        </p>
        <ChevronDown size={16} />
      </div>
      <TokenSelection
        open={open}
        mintAddress={mintAddress}
        onChange={onChangeMintChange}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}
