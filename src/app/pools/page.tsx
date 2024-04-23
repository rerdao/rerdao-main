'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Plus, Search, X } from 'lucide-react'
import LiquidityPoolPanel from './panel'
import OriginalPools from './originalPools'
import CommunityPools from './communityPools'

import { PoolFilter, useFilteredPools } from '@/hooks/pool.hook'
import { useSearchMint } from '@/providers/mint.provider'
import { usePoolsTvl } from '@/providers/stat.provider'

export default function Pools() {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState(PoolFilter.AllPools)
  const filteredPools = useFilteredPools(filter)
  const { push } = useRouter()
  const search = useSearchMint()
  const poolsTvl = usePoolsTvl()

  const searchedPools = useMemo(() => {
    if (loading || text.length <= 2) return filteredPools
    const mintAddresses = search(text).map(({ item }) => item.address)
    return filteredPools.filter(({ address, mintLpt, mints }) => {
      // Search poolAddress & minLpt
      if (address.includes(text) || mintLpt.toBase58().includes(text))
        return true
      // Search Token
      for (const mint of mints) {
        if (
          mintAddresses.includes(mint.toBase58()) ||
          mint.toBase58().includes(text)
        )
          return true
      }
      return false
    })
  }, [filteredPools, search, loading, text])

  const sortedPool = useMemo(() => {
    return searchedPools.sort(({ address: a }, { address: b }) => {
      const tvl_a = poolsTvl[a]
      const tvl_b = poolsTvl[b]

      return tvl_b - tvl_a
    })
  }, [poolsTvl, searchedPools])

  useEffect(() => {
    setLoading(true)
    const id = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(id)
  }, [text])

  return (
    <div className="max-w-[1024px] w-full grid grid-cols-12 gap-6">
      <div className="col-span-full">
        <LiquidityPoolPanel />
      </div>
      <div className="col-span-full grid grid-cols-12 gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PoolFilter)}
          className="col-span-3 select w-full bg-base-200 rounded-full"
        >
          <option value={PoolFilter.AllPools}>{PoolFilter.AllPools}</option>
          <option value={PoolFilter.MyPoolsOnly}>
            {PoolFilter.MyPoolsOnly}
          </option>
        </select>
        <div className="col-span-6 flex flex-row relative items-center">
          <Search className="h-4 w-4 absolute left-4" />
          <input
            type="text"
            className="w-full input bg-base-200 rounded-full px-10"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search"
          />
          {loading ? (
            <span className="loading loading-xs loading-spinner absolute right-4" />
          ) : (
            <X
              className="h-4 w-4 absolute right-4 cursor-pointer"
              onClick={() => setText('')}
            />
          )}
        </div>
        <button
          onClick={() => push('/pools/new-pool')}
          className="col-span-3 btn btn-primary w-full rounded-full"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:block">New Pool</span>
        </button>
      </div>
      <div className="col-span-full card bg-base-100 p-4 overflow-x-auto">
        <table className="table table-pin-rows">
          <OriginalPools pools={sortedPool} />
          <CommunityPools pools={sortedPool} />
        </table>
      </div>
    </div>
  )
}
