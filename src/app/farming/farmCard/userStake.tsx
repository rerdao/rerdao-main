'use client'
import BN from 'bn.js'

import { MintAmount } from '@/components/mint'

import {
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'

export type UserStakeProps = {
  farmAddress: string
}

export default function UserStake({ farmAddress }: UserStakeProps) {
  const { inputMint } = useFarmByAddress(farmAddress)
  const { shares } = useDebtByFarmAddress(farmAddress) || { shares: new BN(0) }

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Stakes</p>
      <p className="font-bold">
        <MintAmount mintAddress={inputMint.toBase58()} amount={shares} />
      </p>
    </div>
  )
}
