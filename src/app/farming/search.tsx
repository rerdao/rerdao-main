'use client'
import { Search } from 'lucide-react'
import Sort from './sort'

import {
  useNftBoosted,
  useSortedByApr,
  useSortedByLiquidity,
} from '@/providers/farming.provider'

export default function FarmingSearch() {
  const { sortedByLiquidity, setSortedByLiquidity } = useSortedByLiquidity()
  const { sortedByApr, setSortedByApr } = useSortedByApr()
  const { nftBoosted, setNftBoosted } = useNftBoosted()

  return (
    <div className="flex flex-row gap-4 items-center flex-wrap">
      <div className="flex-auto relative flex flex-row items-center min-w-[240px]">
        <Search className="pointer-events-none w-4 h-4 absolute left-3" />
        <input
          className="input rounded-xl w-full pl-10 bg-base-200"
          placeholder="Search by name, address"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Sort
          title="Liquidity"
          value={sortedByLiquidity}
          onChange={setSortedByLiquidity}
        />
        <span className="divider divider-horizontal m-0" />
        <Sort title="APR" value={sortedByApr} onChange={setSortedByApr} />
        <span className="divider divider-horizontal m-0" />
        <label className="cursor-pointer flex flex-row gap-2 items-center">
          <p className="text-sm font-bold select-none">NFT Boosted Only</p>
          <input
            type="radio"
            name="nft-boosted-only"
            className="radio"
            checked={nftBoosted}
            onClick={() => setNftBoosted(!nftBoosted)}
            readOnly
          />
        </label>
      </div>
    </div>
  )
}
