'use client'
import { useMemo } from 'react'
import BN from 'bn.js'

import { usePoolByAddress } from '@/providers/pools.provider'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useMints } from '@/hooks/spl.hook'
import { decimalize } from '@/helpers/decimals'
import { LPT_DECIMALS } from '@/hooks/pool.hook'

type TokenReceiveProps = {
  poolAddress: string
  lptAmount: string
}
export default function TokenReceive({
  poolAddress,
  lptAmount,
}: TokenReceiveProps) {
  const pool = usePoolByAddress(poolAddress)
  const [mintLpt] = useMints([pool.mintLpt.toBase58()])

  const amountsReceive = useMemo(() => {
    let amounts: BN[] = new Array(pool.reserves.length).fill(new BN(0))
    if (!mintLpt?.supply || !lptAmount) return amounts

    const lp = decimalize(lptAmount, LPT_DECIMALS).toNumber()
    const lpt_rate = lp / Number(mintLpt.supply)
    amounts = pool.reserves.map((reserve) => new BN(lpt_rate * Number(reserve)))

    return amounts
  }, [lptAmount, mintLpt, pool.reserves])

  return (
    <div className="grid grid-cols-12 gap-3  max-h-48 overflow-y-auto overflow-x-hidden no-scrollbar">
      <p className="col-span-full text-sm opacity-60">You will receive</p>
      {pool.mints.map((mint, i) => (
        <div
          key={mint.toBase58()}
          className="col-span-full flex gap-3 items-center"
        >
          <div className="flex-auto flex gap-2 items-center ">
            <MintLogo
              className="h-6 w-6 rounded-full"
              mintAddress={mint.toBase58()}
            />
            <p className="opacity-60">
              <MintSymbol mintAddress={mint.toBase58()} />
            </p>
          </div>
          <MintAmount
            mintAddress={mint.toBase58()}
            amount={amountsReceive[i]}
          />
        </div>
      ))}
    </div>
  )
}
