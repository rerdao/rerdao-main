'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAddress } from '@sentre/senswap'
import classNames from 'classnames'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useOracles } from '@/hooks/pool.hook'
import { useMints } from '@/hooks/spl.hook'
import { usePrices } from '@/providers/mint.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useSenswap } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export type PoolOverviewProps = { poolAddress: string }

export default function PoolOverview({ poolAddress }: PoolOverviewProps) {
  const [loading, setLoading] = useState(false)
  const pool = usePoolByAddress(poolAddress)
  const mintAddresses = pool.mints.map((mint) => mint.toBase58())
  const prices = usePrices(mintAddresses)
  const mints = useMints(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const { getMintInfo } = useOracles()
  const senswap = useSenswap()
  const { push } = useRouter()
  const pushMessage = usePushMessage()

  const { poolMintInfos, totalValue } = useMemo(() => {
    if (!prices) return { poolMintInfos: [], totalValue: 0 }
    let totalValue = 0
    const poolMintInfos = pool.mints.map((mint, index) => {
      const mintAddress = mint.toBase58()
      const mintInfo = getMintInfo(pool, mint)
      const mintAmount = undecimalize(pool.reserves[index], decimals[index])
      const mintValue = Number(mintAmount) * (prices[index] || 0)
      totalValue += mintValue
      return {
        mintAddress,
        weight: mintInfo.normalizedWeight,
        amount: pool.reserves[index],
        value: mintValue,
      }
    })
    return { poolMintInfos, totalValue }
  }, [decimals, getMintInfo, pool, prices])

  const onFinalize = useCallback(async () => {
    try {
      setLoading(true)
      if (!isAddress(poolAddress)) throw new Error('Invalid pool address.')
      const { txId } = await senswap.finalizePool({ poolAddress })
      pushMessage(
        'alert-success',
        'Successfully finalize the pool. Click here to view details.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
      push(`/pools/pool-details?poolAddress=${poolAddress}`)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [senswap, poolAddress, push, pushMessage])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>TOKEN</th>
              <th>WEIGHT</th>
              <th>AMOUNT</th>
              <th>VALUE</th>
            </tr>
          </thead>
          <tbody>
            {poolMintInfos.map(({ mintAddress, weight, amount, value }) => (
              <tr className="hover" key={mintAddress}>
                <td>
                  <div className="flex gap-2 items-center">
                    <MintLogo
                      className="w-6 h-6 rounded-full"
                      mintAddress={mintAddress}
                    />
                    <MintSymbol mintAddress={mintAddress} />
                  </div>
                </td>
                <td>{numeric(weight).format('0,0.[0000]%')}</td>
                <td>
                  <MintAmount amount={amount} mintAddress={mintAddress} />
                </td>
                <td>{numeric(value).format('$0,0.[0000]')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-span-full card bg-base-200 rounded-3xl p-4 flex flex-row items-center justify-between">
        <p className="text-sm opacity-60">Total value</p>
        <h5>{numeric(totalValue).format('$0,0.[0000]')}</h5>
      </div>
      <button className="col-span-full btn btn-primary" onClick={onFinalize}>
        <span
          className={classNames('loading loading-sm loading-spinner', {
            hidden: !loading,
          })}
        />
        Confirm
      </button>
    </div>
  )
}
