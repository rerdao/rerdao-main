'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PRECISION, PoolData } from '@sentre/senswap'
import BN from 'bn.js'
import { useWallet } from '@solana/wallet-adapter-react'

import { Eye } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import LazyLoad from 'react-lazy-load'

import { numeric } from '@/helpers/utils'
import { useOracles, useVol24h } from '@/hooks/pool.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { usePoolTvl } from '@/providers/stat.provider'

export type PoolRowProps = {
  index: number
  pool: PoolData & { address: string }
}

export default function PoolRow({
  index,
  pool: { address, mintLpt, fee, mints, weights, authority },
}: PoolRowProps) {
  const { push } = useRouter()
  const { publicKey } = useWallet()
  const { calcNormalizedWeight } = useOracles()
  const { amount } = useTokenAccountByMintAddress(mintLpt.toBase58()) || {
    amount: new BN(0),
  }
  const tvl = usePoolTvl(address)
  const { vol24h } = useVol24h(address)

  const isOwner = useMemo(() => {
    if (!publicKey || !authority) return false
    return authority.equals(publicKey)
  }, [publicKey, authority])

  const ws = useMemo(() => {
    return weights.map((weight) => calcNormalizedWeight(weights, weight))
  }, [calcNormalizedWeight, weights])

  return (
    <tr
      className="cursor-pointer hover:!bg-base-300 group"
      key={address}
      onClick={() => push(`/pools/pool-details?poolAddress=${address}`)}
    >
      <th>
        <button className="btn btn-sm btn-circle">
          <Eye className="hidden group-hover:block w-4 h-4" />
          <p className="block group-hover:hidden opacity-60">{index}</p>
        </button>
      </th>
      <td className="avatar-group -space-x-4 rtl:space-x-reverse">
        {mints.map((mint) => (
          <LazyLoad key={mint.toBase58()} height={32}>
            <MintLogo
              className="w-8 h-8 rounded-full bg-base-300"
              mintAddress={mint.toBase58()}
            />
          </LazyLoad>
        ))}
      </td>
      <td>
        <span
          className="tooltip"
          data-tip={ws.map((w) => numeric(w).format('%0.[00]')).join(' / ')}
        >
          <MintSymbol mintAddress={mintLpt.toBase58()} />
        </span>
      </td>
      <td>{numeric(tvl).format('$0,0.[00]')}</td>
      <td>{numeric(vol24h).format('$0,0.[00]')}</td>
      <td>{numeric(fee.toNumber() / PRECISION).format('%0.[0000]')}</td>
      <td>
        <MintAmount amount={amount} mintAddress={mintLpt.toBase58()} /> LP
      </td>
      <td>
        <input
          type="checkbox"
          className="checkbox checkbox-accent"
          checked={isOwner}
          readOnly
        />
      </td>
    </tr>
  )
}
