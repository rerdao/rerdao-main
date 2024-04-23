'use client'
import { useState } from 'react'

import { MintLogo, MintSymbol } from '@/components/mint'
import { ChevronDown, Lock, Trash2, Unlock } from 'lucide-react'
import TokenSelection from '@/components/tokenSelection'

import { MintSetup } from '@/hooks/pool.hook'

type MintInputProps = {
  setupData: MintSetup
  onChange: (name: keyof MintSetup, value: string | boolean) => void
  onDelete: () => void
}

export default function MintInput({
  setupData,
  onChange,
  onDelete,
}: MintInputProps) {
  const [open, setOpen] = useState(false)

  const { mintAddress, weight, isLocked } = setupData

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-auto">
        <div
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border cursor-pointer rounded-3xl py-1 px-2 bg-base-200"
        >
          <MintLogo
            mintAddress={mintAddress}
            className="w-8 h-8 rounded-full"
          />
          <p className="font-bold">
            {mintAddress ? <MintSymbol mintAddress={mintAddress} /> : 'TOKN'}
          </p>
          <ChevronDown size={16} />
        </div>
        <TokenSelection
          open={open}
          onCancel={() => setOpen(false)}
          mintAddress={mintAddress}
          onChange={(mintAddress) => onChange('mintAddress', mintAddress)}
        />
      </div>
      <div className="flex gap-2 items-center">
        <input
          value={weight}
          type="number"
          placeholder="0"
          className="input bg-base-200 input-ghost w-full flex-auto rounded-full focus:outline-none text-right text-xl"
          onChange={(e) => onChange('weight', e.target.value)}
          disabled={isLocked}
        />
        <button
          onClick={() => onChange('isLocked', !isLocked)}
          className="btn btn-ghost btn-square btn-sm"
        >
          {!isLocked ? <Unlock size={16} /> : <Lock size={16} />}
        </button>
        <button onClick={onDelete} className="btn btn-ghost btn-square btn-sm">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
