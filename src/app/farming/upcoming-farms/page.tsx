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

export default function UpcomingFarms() {
  const farms = useAllFarms()
  const { nftBoosted } = useNftBoosted()

  const upcomingFarmAddresses = useMemo(
    () =>
      Object.keys(farms).filter((farmAddress) => {
        const { startDate } = farms[farmAddress]
        return startDate.toNumber() * 1000 > Date.now()
      }),
    [farms],
  )
  const sortedUpcomingFarmAddresses = useSortedFarmsByStartDate(
    upcomingFarmAddresses,
  )
  const filteredUpcomingFarmAddresses = useFilterFarmsByNFTBoosted(
    sortedUpcomingFarmAddresses,
    nftBoosted,
  )

  return (
    <CommonLayout>
      <div className="grid grid-cols-12 gap-4 @container">
        {filteredUpcomingFarmAddresses.map((farmAddress) => (
          <LazyLoad className="col-span-12 @2xl:col-span-6" key={farmAddress}>
            <FarmingCard farmAddress={farmAddress} />
          </LazyLoad>
        ))}
        {!filteredUpcomingFarmAddresses.length && (
          <div className="col-span-full justify-center p-4">
            <Empty />
          </div>
        )}
      </div>
    </CommonLayout>
  )
}
