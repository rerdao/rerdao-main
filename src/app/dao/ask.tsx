'use client'
import { useCallback, useState } from 'react'

import TokenSelection from '@/components/tokenSelection'
import { MintLogo, MintSymbol } from '@/components/mint'
import { ChevronDown } from 'lucide-react'

import { useSwapStore } from '@/hooks/swap.hook'

export default function Ask() {
  const [open, setOpen] = useState(false)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const setAskMintAddress = useSwapStore(
    ({ setAskMintAddress }) => setAskMintAddress,
  )
  const askAmount = useSwapStore(({ askAmount }) => askAmount)

  const onAskMintAddress = useCallback(
    (mintAddress: string) => {
      if (askMintAddress !== mintAddress) {
        setAskMintAddress(mintAddress)
        setOpen(false)
      }
    },
    [askMintAddress, setAskMintAddress, setOpen],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div
          className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <MintLogo
            mintAddress={askMintAddress}
            className="w-8 h-8 rounded-full"
          />
          <h5 className="text-sm">
            <MintSymbol mintAddress={askMintAddress} />
          </h5>
          <ChevronDown className="h-4 w-4" />
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost w-full max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={askAmount}
          readOnly
        />
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={askMintAddress}
        onChange={onAskMintAddress}
      />
    </div>
  )
}
