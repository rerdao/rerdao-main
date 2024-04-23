'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'

import { shortenAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'

const FarmInfo = () => {
  const { back } = useRouter()
  const searchParams = useSearchParams()
  const farmAddress = searchParams.get('farmAddress')

  return (
    <div className="card bg-base-100 rounded-full p-2 flex flex-row items-center gap-2">
      <div className="flex-auto">
        <button className="btn btn-sm rounded-full" onClick={back}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      <span className="tooltip" data-tip="Farm Address">
        <p className="font-sm font-bold opacity-60 cursor-pointer">
          {shortenAddress(farmAddress || '')}
        </p>
      </span>
      <Clipboard
        content={farmAddress || ''}
        className="btn btn-sm btn-circle"
      />
      <NewWindow
        href={solscan(farmAddress || '')}
        className="btn btn-sm btn-circle"
      />
    </div>
  )
}

export default FarmInfo
