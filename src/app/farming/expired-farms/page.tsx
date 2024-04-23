'use client'
import { useMemo } from 'react'

import LazyLoad from 'react-lazy-load'
import Empty from '@/components/empty'
import FarmingCard from '../farmCard'
import CommonLayout from '../commonLayout'

import { useAllFarms, useNftBoosted } from '@/providers/farming.provider'
import {
  useFilterFarmsByNFTBoosted,
  useSortedFarmsByStartDate,
} from '@/hooks/farming.hook'

export default function ExpiredFarms() {
  const farms = useAllFarms()
  const { nftBoosted } = useNftBoosted()

  const expiredFarmAddresses = useMemo(
    () =>
      Object.keys(farms).filter((farmAddress) => {
        const { endDate } = farms[farmAddress]
        return endDate.toNumber() * 1000 < Date.now()
      }),
    [farms],
  )
  const sortedActiveFarmAddresses =
    useSortedFarmsByStartDate(expiredFarmAddresses)
  const filteredActiveFarmAddresses = useFilterFarmsByNFTBoosted(
    sortedActiveFarmAddresses,
    nftBoosted,
  )

  return (
    <CommonLayout>
      <div className="grid grid-cols-12 gap-4">
        {filteredActiveFarmAddresses.map((farmAddress) => (
          <LazyLoad className="col-span-full @2xl:col-span-6" key={farmAddress}>
            <FarmingCard farmAddress={farmAddress} />
          </LazyLoad>
        ))}
        {!filteredActiveFarmAddresses.length && (
          <div className="col-span-full justify-center p-4">
            <Empty />
          </div>
        )}
      </div>
    </CommonLayout>
  )
}
