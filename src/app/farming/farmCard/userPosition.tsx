'use client'
import { useMemo } from 'react'
import BN from 'bn.js'

import { numeric } from '@/helpers/utils'
import {
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'

export const useUserPosition = (farmAddress: string) => {
  const { totalShares } = useFarmByAddress(farmAddress)
  const { shares } = useDebtByFarmAddress(farmAddress) || { shares: new BN(0) }
  const position = useMemo(
    () =>
      totalShares.isZero()
        ? 0
        : shares
            .mul(new BN(10 ** 9))
            .div(totalShares)
            .toNumber() /
          10 ** 9,
    [shares, totalShares],
  )
  return position
}

export type UserPositionProps = {
  farmAddress: string
}

export default function UserPosition({ farmAddress }: UserPositionProps) {
  const position = useUserPosition(farmAddress)
  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Position</p>
      <p className="font-bold">{numeric(position).format('%0.[00]')}</p>
    </div>
  )
}
