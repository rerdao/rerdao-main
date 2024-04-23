'use client'
import { useWallet } from '@solana/wallet-adapter-react'

import LazyLoad from 'react-lazy-load'
import Empty from '@/components/empty'
import FarmCard from '../farmCard'
import CommonLayout from '../commonLayout'

import {
  useAllDebts,
  useAllFarms,
  useNftBoosted,
} from '@/providers/farming.provider'
import { useMemo } from 'react'
import {
  useFilterFarmsByNFTBoosted,
  useSortedFarmsByStartDate,
} from '@/hooks/farming.hook'

export default function MyFarms() {
  const { publicKey } = useWallet()
  const farms = useAllFarms()
  const debts = useAllDebts()
  const { nftBoosted } = useNftBoosted()

  const stakedFarms = useMemo(
    () => Object.values(debts).map(({ farm }) => farm.toBase58()),
    [debts],
  )
  const sortedStakedFarmAddresses = useSortedFarmsByStartDate(stakedFarms)
  const filteredStakedFarmAddresses = useFilterFarmsByNFTBoosted(
    sortedStakedFarmAddresses,
    nftBoosted,
  )

  const createdFarms = Object.keys(farms).filter(
    (farmAddress) =>
      publicKey && farms[farmAddress].authority.equals(publicKey),
  )
  const sortedCreatedFarmAddresses = useSortedFarmsByStartDate(createdFarms)
  const filteredCreatedFarmAddresses = useFilterFarmsByNFTBoosted(
    sortedCreatedFarmAddresses,
    nftBoosted,
  )

  return (
    <CommonLayout>
      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-full px-4 py-2 flex flex-row items-center gap-2">
          <h5 className="opacity-60">Created Farms</h5>
          <div className="divider divider-horizontal m-0" />
          <p className="font-bold">
            {filteredCreatedFarmAddresses.length} Farms
          </p>
        </div>
        {filteredCreatedFarmAddresses.map((farmAddress) => (
          <LazyLoad className="col-span-full @2xl:col-span-6" key={farmAddress}>
            <FarmCard farmAddress={farmAddress} />
          </LazyLoad>
        ))}
        {!filteredCreatedFarmAddresses.length && (
          <div className="col-span-full justify-center p-4">
            <Empty />
          </div>
        )}
        <div className="col-span-full px-4 py-2 flex flex-row items-center gap-2">
          <h5 className="opacity-60">Staked Farms</h5>
          <div className="divider divider-horizontal m-0" />
          <p className="font-bold">
            {filteredStakedFarmAddresses.length} Farms
          </p>
        </div>
        {filteredStakedFarmAddresses.map((farmAddress) => (
          <LazyLoad className="col-span-full @2xl:col-span-6" key={farmAddress}>
            <FarmCard farmAddress={farmAddress} />
          </LazyLoad>
        ))}
        {!filteredStakedFarmAddresses.length && (
          <div className="col-span-full justify-center p-4">
            <Empty />
          </div>
        )}
      </div>
    </CommonLayout>
  )
}
