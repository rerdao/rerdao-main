'use client'
import { useRouter } from 'next/navigation'

import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'
import { ArrowLeft } from 'lucide-react'

import { solscan } from '@/helpers/explorers'
import { usePoolByAddress } from '@/providers/pools.provider'
import { shortenAddress } from '@/helpers/utils'

export type PoolInfoProps = {
  poolAddress: string
}

export default function PoolInfo({ poolAddress }: PoolInfoProps) {
  const { push } = useRouter()
  const { mintLpt } = usePoolByAddress(poolAddress)

  return (
    <div className="card bg-base-100 rounded-3xl p-2 flex md:flex-row items-center gap-2 flex-col">
      <div className="flex-auto">
        <button
          onClick={() => push('/pools')}
          className="btn btn-sm rounded-full"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="flex flex-row gap-2 items-center">
        {/* Pool Address Info */}
        <div className="flex flex-row gap-2 items-center">
          <span className="tooltip" data-tip="Pool Address">
            <p className="text-sm font-bold opacity-60 cursor-pointer">
              {shortenAddress(poolAddress || '')}
            </p>
          </span>
          <Clipboard
            content={poolAddress || ''}
            className="btn btn-sm btn-circle"
          />
          <NewWindow
            href={solscan(poolAddress || '')}
            className="btn btn-sm btn-circle"
          />
        </div>
        <span className="divider divider-horizontal m-0" />
        {/* Mint LPT Info */}
        <div className="flex flex-row gap-2 items-center">
          <span className="tooltip" data-tip="LP Token Address">
            <p className="text-sm font-bold opacity-60 cursor-pointer">
              {shortenAddress(mintLpt.toBase58() || '')}
            </p>
          </span>
          <Clipboard
            content={mintLpt.toBase58() || ''}
            className="btn btn-sm btn-circle"
          />
          <NewWindow
            href={solscan(mintLpt.toBase58() || '')}
            className="btn btn-sm btn-circle"
          />
        </div>
      </div>
    </div>
  )
}
