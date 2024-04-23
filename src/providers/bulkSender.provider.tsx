'use client'
import { Fragment, ReactNode } from 'react'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { env } from '@/configs/env'

export type BulkSenderStore = {
  mintAddress: string
  setMintAddress: (mintAddress: string) => void
  data: string[][]
  setData: (data: string[][]) => void
  decimalized: boolean
  setDecimalized: (decimalized: boolean) => void
}

/**
 * Store
 */
export const useBulkSenderStore = create<BulkSenderStore>()(
  devtools(
    persist(
      (set) => ({
        mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
        setMintAddress: (mintAddress) =>
          set({ mintAddress }, false, 'setMintAddress'),
        data: [],
        setData: (data) => set({ data }, false, 'setData'),
        decimalized: false,
        setDecimalized: (decimalized) =>
          set({ decimalized }, false, 'setDecimalized'),
      }),
      {
        name: 'bulk_sender',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'bulk_sender',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export const BulkSenderProvider = ({ children }: { children: ReactNode }) => {
  return <Fragment>{children}</Fragment>
}

/**
 * Get/Set airdropped mint address
 * @returns Like-useState object
 */
export const useBulkSenderMint = () => {
  const mintAddress = useBulkSenderStore(({ mintAddress }) => mintAddress)
  const setMintAddress = useBulkSenderStore(
    ({ setMintAddress }) => setMintAddress,
  )
  return { mintAddress, setMintAddress }
}

/**
 * Get/Set airdropped data
 * @returns Like-useState object
 */
export const useBulkSenderData = () => {
  const data = useBulkSenderStore(({ data }) => data)
  const setData = useBulkSenderStore(({ setData }) => setData)
  return { data, setData }
}

/**
 * Get/Set airdropped decimalized
 * @returns Like-useState object
 */
export const useBulkSenderDecimalized = () => {
  const decimalized = useBulkSenderStore(({ decimalized }) => decimalized)
  const setDecimalized = useBulkSenderStore(
    ({ setDecimalized }) => setDecimalized,
  )
  return { decimalized, setDecimalized }
}
