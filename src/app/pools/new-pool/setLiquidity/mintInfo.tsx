'use client'
import { useMemo } from 'react'

import { MintSymbol } from '@/components/mint'

import { numeric } from '@/helpers/utils'

type MintInfoProps = {
  mintAddresses: string[]
  amounts: string[]
  prices?: number[]
}
export default function ListMintInfo({
  mintAddresses,
  amounts,
  prices,
}: MintInfoProps) {
  const totalValue = useMemo(() => {
    if (!prices) return 0
    let sum = 0
    amounts.forEach((amount, idx) => {
      const singleValue = Number(amount) * prices[idx]
      sum += singleValue
    })
    return sum
  }, [amounts, prices])

  return (
    <div className="grid grid-cols-12 gap-2">
      {mintAddresses.map((mintAddress, index) => (
        <div key={mintAddress} className="col-span-full">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <p className="text-sm opacity-60">
                <MintSymbol mintAddress={mintAddress} />
              </p>
              <p className="text-sm opacity-60">
                ({prices && numeric(prices[index]).format('$0,0.[0000]')})
              </p>
            </div>
            <p>
              (
              {prices &&
                numeric(prices[index] * Number(amounts[index])).format(
                  '$0,0.[0000]',
                )}
              )
            </p>
          </div>
        </div>
      ))}
      <div className="col-span-full flex justify-between items-center mt-2">
        <p className="text-sm opacity-60">Total value</p>
        <h5>{numeric(totalValue).format('$0,0.[0000]')}</h5>
      </div>
    </div>
  )
}
