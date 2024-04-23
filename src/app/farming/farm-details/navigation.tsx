'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'

import { shortenAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'

export default function FarmDetailsNavigation() {
  const { back } = useRouter()
  const searchParams = useSearchParams()
  const farmAddress = searchParams.get('farmAddress')

  return (
    <div className="flex flex-row items-center gap-1">
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
      <div className="flex flex-row items-center gap-0">
        <Clipboard content={farmAddress || ''} />
        <NewWindow href={solscan(farmAddress || '')} />
      </div>
    </div>
  )
}
