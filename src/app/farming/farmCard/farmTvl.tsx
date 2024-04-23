'use client'
import { useMemo } from 'react'

import { numeric } from '@/helpers/utils'
import { useTvl } from '@/hooks/tvl.hook'
import { useFarmByAddress } from '@/providers/farming.provider'

export type FarmTvlProps = {
  farmAddress: string
}

export default function FarmTvl({ farmAddress }: FarmTvlProps) {
  const { inputMint, totalShares } = useFarmByAddress(farmAddress)
  const inputMintAddress = useMemo(() => inputMint.toBase58(), [inputMint])
  const tvl = useTvl([{ mintAddress: inputMintAddress, amount: totalShares }])

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">TVL</p>
      <p className="font-bold">{numeric(tvl).format('$0,0.[00]')}</p>
    </div>
  )
}
