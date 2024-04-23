'use client'
import { Fragment, useMemo, useState } from 'react'
import { keccak_256 } from '@noble/hashes/sha3'
import BN from 'bn.js'
import { v4 as uuid } from 'uuid'

import LazyLoad from 'react-lazy-load'
import { Dices, History, SearchCheck } from 'lucide-react'
import Empty from '@/components/empty'
import TokenCard from './tokenCard'

import { useAllMintMetadata } from '@/providers/mint.provider'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'

/**
 * Get random mints' metadata
 * @param opt.seed Deterministic randomization
 * @param opt.limit How large the list is
 * @returns Mint list
 */
export const useRandomMintMetadata = ({
  seed = '',
  limit = 50,
}: {
  seed?: string
  limit?: number
} = {}): MintMetadata[] => {
  const metadata = useAllMintMetadata()
  const _seed = useMemo(
    () => keccak_256(new TextEncoder().encode(seed || uuid())),
    [seed],
  )
  const _limit = useMemo(() => Math.max(1, limit), [limit])
  const randTokens = useMemo(() => {
    if (metadata.length < _limit) return metadata
    const red = BN.red(new BN(metadata.length))
    const index = new BN(_seed).toRed(red).toNumber()
    return metadata.slice(index, index + _limit)
  }, [metadata, _limit, _seed])
  return randTokens
}

export type TokenListProps = {
  mints?: MintMetadata[]
  mintAddress?: string
  onChange?: (mintAddress: string) => void
}

export default function TokenList({
  mints,
  mintAddress,
  onChange = () => {},
}: TokenListProps) {
  const [hidden, setHidden] = useState(true)
  const all = useAllMintMetadata()
  const myAccounts = useAllTokenAccounts()
  const randMints = useRandomMintMetadata()

  const mintAddresses = useMemo(() => all.map(({ address }) => address), [all])
  const recentMintAddresses = useMemo(() => {
    const recentAddresses = Object.values(myAccounts)
      .map(({ mint }) => mint.toBase58())
      .sort((a, b) => {
        const x = mintAddresses.includes(a) ? 1 : 0
        const y = mintAddresses.includes(b) ? 1 : 0
        return y - x
      })
    if (!hidden) return recentAddresses
    return recentAddresses.filter((address) => mintAddresses.includes(address))
  }, [mintAddresses, hidden, myAccounts])

  return (
    <div className="grid grid-cols-12 gap-2 relative max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
      {!mints && (
        <Fragment>
          <div className="sticky top-0 col-span-12 flex gap-2 items-center bg-base-100 z-[1]">
            <History className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Recent</h5>
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text opacity-60">
                  Hide unknown tokens
                </span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                />
              </label>
            </div>
          </div>
          {!recentMintAddresses.length && (
            <div className="col-span-full flex flex-row justify-center">
              <Empty />
            </div>
          )}
          {recentMintAddresses.map((address) => (
            <div key={address} className="col-span-12">
              <LazyLoad height={64}>
                <TokenCard
                  mintAddress={address}
                  onClick={() => onChange(address)}
                  active={address === mintAddress}
                  showBalance
                />
              </LazyLoad>
            </div>
          ))}
        </Fragment>
      )}
      <div className="sticky top-0 col-span-12 bg-base-100 py-2 z-[1]">
        <label className="swap">
          <input type="checkbox" checked={!mints} readOnly />
          <div className="swap-on flex gap-2 items-center">
            <Dices className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Explorer</h5>
          </div>
          <div className="swap-off flex gap-2 items-center">
            <SearchCheck className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Search Results</h5>
          </div>
        </label>
      </div>
      {(mints || randMints).map(({ address }) => (
        <div key={address} className="col-span-12">
          <LazyLoad height={64}>
            <TokenCard
              mintAddress={address}
              onClick={() => onChange(address)}
              active={address === mintAddress}
            />
          </LazyLoad>
        </div>
      ))}
    </div>
  )
}
