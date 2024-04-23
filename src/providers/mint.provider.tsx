'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Fuse from 'fuse.js'
import useSWR from 'swr'
import { produce } from 'immer'
import axios from 'axios'

import { env } from '@/configs/env'
import mintConfig from '@/configs/mint.config'
import { getAllTokens, getPrice } from '@/helpers/stat'

export type MintStore = {
  metadata: Record<string, MintMetadata>
  upsertMetadata: (newMints: Record<string, MintMetadata>) => void
  prices: Record<string, number>
  upsertPrices: (newPrices: Record<string, number>) => void
  engine?: Fuse<MintMetadata>
  setEngine: (engine?: Fuse<MintMetadata>) => void
}

/**
 * Store
 */
export const useMintStore = create<MintStore>()(
  devtools(
    (set) => ({
      metadata: {},
      upsertMetadata: (newMints: Record<string, MintMetadata>) =>
        set(
          produce<MintStore>(({ metadata }) => {
            Object.assign(metadata, newMints)
          }),
          false,
          'upsertMetadata',
        ),
      prices: {},
      upsertPrices: (newPrices) =>
        set(
          produce<MintStore>(({ prices }) => {
            Object.assign(prices, newPrices)
          }),
          false,
          'upsertPrices',
        ),
      engine: undefined,
      setEngine: (engine?: Fuse<MintMetadata>) =>
        set({ engine }, false, 'setEngine'),
    }),
    {
      name: 'mint',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function MintProvider({ children }: { children: ReactNode }) {
  const upsertMetadata = useMintStore(({ upsertMetadata }) => upsertMetadata)
  const setEngine = useMintStore(({ setEngine }) => setEngine)

  const fetch = useCallback(async () => {
    const data = await getAllTokens()
    const fuse = new Fuse<MintMetadata>(data, {
      includeScore: true,
      keys: ['name', 'symbol'],
    })
    const payload: Record<string, MintMetadata> = {}
    data.forEach(
      ({ address, ...rest }) => (payload[address] = { address, ...rest }),
    )
    upsertMetadata(payload)
    setEngine(fuse)
  }, [upsertMetadata, setEngine])

  useEffect(() => {
    fetch()
  }, [fetch])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all mints
 * @returns Mint list
 */
export const useAllMintMetadata = () => {
  const metadata = useMintStore(({ metadata }) => Object.values(metadata))
  return metadata
}

/**
 * Get mint by address
 * @param mintAddress Mint address
 * @returns Mint
 */
export const useMintByAddress = (mintAddress: string) => {
  const metadata = useMintStore(({ metadata }) => metadata)
  const upsertMetadata = useMintStore(({ upsertMetadata }) => upsertMetadata)

  const fetch = useCallback(
    async (mintAddress: string) => {
      const mint = metadata[mintAddress]
      if (mint) return mint
      const { data } = await axios.get<MintMetadata>(
        `${mintConfig.host}/metadata/${mintAddress}`,
      )
      if (data) upsertMetadata({ [mintAddress]: data })
      return data
    },
    [metadata, upsertMetadata],
  )

  const { data: mint } = useSWR([mintAddress, 'mint'], ([mintAddress]) =>
    fetch(mintAddress),
  )

  return mint
}

/**
 * Semantic search mint
 * @returns Mint list
 */
export const useSearchMint = () => {
  const engine = useMintStore(({ engine }) => engine)
  const search = useCallback(
    (text: string) => {
      if (!engine) return []
      return engine.search(text)
    },
    [engine],
  )
  return search
}

/**
 * Get mint prices
 * @param mintAddresses Mint addresses
 * @returns Prices
 */
export const usePrices = (mintAddresses: string[]) => {
  const prices = useMintStore(({ prices }) => prices)
  const upsertPrices = useMintStore(({ upsertPrices }) => upsertPrices)

  const getPrices = useCallback(
    async (mintAddresses: string[]) => {
      const data = await Promise.all(
        mintAddresses.map(async (mintAddress) => {
          if (prices[mintAddress] !== undefined) return prices[mintAddress]
          const price = await getPrice(mintAddress)
          return price
        }),
      )
      const mapping: Record<string, number> = {}
      mintAddresses.forEach(
        (mintAddress, i) => (mapping[mintAddress] = data[i]),
      )
      upsertPrices(mapping)
      return data
    },
    [prices, upsertPrices],
  )

  const { data } = useSWR([mintAddresses, 'prices'], ([mintAddresses]) =>
    getPrices(mintAddresses),
  )

  return data
}
