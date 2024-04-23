'use client'
import { Fragment, useMemo } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { usePoolByAddress } from '@/providers/pools.provider'
import { undecimalize } from '@/helpers/decimals'
import { useOracles } from '@/hooks/pool.hook'
import { useMintStore } from '@/providers/mint.provider'
import { numeric } from '@/helpers/utils'

const COLORS = [
  '#ff6961',
  '#ffb480',
  '#f8f38d',
  '#42d6a4',
  '#08cad1',
  '#59adf6',
  '#9d94ff',
  '#c780e8',
]

export default function PoolWeights({ poolAddress }: { poolAddress: string }) {
  const poolData = usePoolByAddress(poolAddress)
  const { getMintInfo } = useOracles()
  const metadata = useMintStore(({ metadata }) => Object.values(metadata))

  const poolWeights = useMemo(() => {
    if (!poolData) return []
    const newData = poolData.mints.map((mint) => {
      const { normalizedWeight, reserve } = getMintInfo(poolData, mint)
      const { decimals, symbol } = metadata.find(
        ({ address }) => mint.toBase58() === address,
      ) || { decimals: 0, symbol: mint.toBase58().substring(0, 4) }

      return {
        symbol,
        tokenAmount: undecimalize(reserve, decimals) || '0',
        weight: normalizedWeight,
      }
    })
    return newData
  }, [getMintInfo, metadata, poolData])

  return (
    <div className="card rounded-box p-6 bg-base-100 border border-base-300 flex flex-col ">
      <p>Pool Weights</p>
      <div className="flex items-center justify-center h-[306px]">
        <ResponsiveContainer className="w-full h-full">
          <PieChart margin={{ top: 20, left: 20, right: 20 }}>
            <Pie
              data={poolWeights}
              className="cursor-pointer"
              dataKey="weight"
              nameKey="symbol"
              fill="#8884d8"
              label={({ name }) => name}
            >
              {poolWeights.map(({ symbol }, i) => (
                <Cell key={symbol} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return <Fragment />
                const [
                  {
                    payload: { symbol, tokenAmount, weight },
                  },
                ] = payload
                return (
                  <div className="card rounded-box p-4 bg-base-100 border-2 border-base-300 flex flex-col">
                    <p className="font-bold">
                      {numeric(tokenAmount).format('0,0.[0000]')} {symbol}
                    </p>
                    <p className="font-bold">
                      {numeric(weight).format('%0.[0000]')}
                    </p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
