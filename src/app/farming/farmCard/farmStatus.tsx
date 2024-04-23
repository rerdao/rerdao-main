'use client'
import { useState } from 'react'
import { useInterval } from 'react-use'

import { Clock, Zap } from 'lucide-react'

import {
  useBoostingByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'

export type FarmStatusProps = {
  farmAddress: string
}

export default function FarmStatus({ farmAddress }: FarmStatusProps) {
  const [current, setCurrent] = useState(Date.now())
  const { startDate } = useFarmByAddress(farmAddress)
  const boosting = useBoostingByFarmAddress(farmAddress)

  useInterval(() => setCurrent(Date.now()), 1000)

  const start = startDate.toNumber() * 1000

  if (start > current)
    return (
      <div className="badge bg-lime-200 flex flex-row items-center gap-1">
        <Clock className="w-3 h-3 stroke-lime-700" />
        <p className="text-xs text-lime-700">Upcoming</p>
      </div>
    )
  if (boosting.length)
    return (
      <div className="badge bg-yellow-200 flex flex-row items-center gap-1">
        <Zap className="w-3 h-3 stroke-yellow-700 fill-yellow-700" />
        <p className="text-xs text-yellow-700">NFT Boosted</p>
      </div>
    )
  return null
}
