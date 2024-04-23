'use client'
import { ReactNode, useMemo } from 'react'
import { BN } from 'bn.js'
import classNames from 'classnames'

import { MintAmount } from '@/components/mint'

import { numeric } from '@/helpers/utils'
import { useTvl } from '@/hooks/tvl.hook'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useApy } from '@/hooks/pool.hook'

const HeroCard = ({
  label,
  content,
  loading = false,
  bg,
}: {
  label: string
  content: string | ReactNode
  bg: string
  loading?: boolean
}) => {
  return (
    <div
      className="card px-6 py-4 rounded-box flex flex-col gap-2 border border-base-300 !bg-base-100"
      style={{ background: `url(${bg})`, backgroundSize: 'cover' }}
    >
      <p className="opacity-60 text-sm">{label}</p>
      <h5
        className={classNames({
          'loading loading-bars loading-xs': loading,
        })}
      >
        {content}
      </h5>
    </div>
  )
}

export default function Heros({ poolAddress }: { poolAddress: string }) {
  const pool = usePoolByAddress(poolAddress)
  const { amount } = useTokenAccountByMintAddress(pool.mintLpt.toBase58()) || {
    amount: new BN(0),
  }

  const poolReserves = useMemo(
    () =>
      pool.reserves.map((reserve, i) => ({
        mintAddress: pool.mints[i].toBase58(),
        amount: reserve,
      })),
    [pool],
  )
  const tvl = useTvl(poolReserves)
  const apy = useApy(poolAddress)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <HeroCard
        bg="/pool-tvl.svg"
        label="TVL"
        content={numeric(tvl).format('0,0.[00]$')}
      />
      <HeroCard
        label="APY"
        content={numeric(apy).format('0,0.[00]a%')}
        bg="/pool-apy.svg"
      />
      <HeroCard
        label="My Contribution"
        content={
          <div className="flex items-center gap-2">
            <MintAmount amount={amount} mintAddress={pool.mintLpt.toBase58()} />
            <p className="opacity-60">LP</p>
          </div>
        }
        bg="/pool-lp.svg"
      />
    </div>
  )
}
