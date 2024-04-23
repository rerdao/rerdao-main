'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BN } from 'bn.js'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { PoolData, PoolStates } from '@sentre/senswap'
import isEqual from 'react-fast-compare'

import { env } from '@/configs/env'
import { useSenswap } from '@/hooks/pool.hook'

const DUMMY_POOL = {
  authority: SystemProgram.programId,
  mintLpt: SystemProgram.programId,
  reserves: [new BN(0)],
  mints: [SystemProgram.programId],
  weights: [new BN(0)],
  treasuries: [new BN(0)],
  fee: new BN(0),
  tax: new BN(0),
}

export type PoolStore = {
  pools: Record<string, PoolData>
  upsertPool: (payload: Record<string, PoolData>) => void
}

/**
 * Store
 */
export const usePoolStore = create<PoolStore>()(
  devtools(
    (set) => ({
      pools: {},
      upsertPool: (payload: Record<string, PoolData>) =>
        set(
          produce<PoolStore>(({ pools }) => {
            Object.assign(pools, payload)
          }),
          false,
          'upsertPool',
        ),
    }),
    {
      name: 'pools',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export function PoolProvider({ children }: { children: ReactNode }) {
  const senswap = useSenswap()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

  const fetch = useCallback(async () => {
    const pools = await senswap.getAllPoolData()
    const payload: Record<string, PoolData> = {}
    pools.forEach(({ account, publicKey }) => {
      if (!isEqual(account.state, PoolStates.Deleted))
        payload[publicKey.toBase58()] = account
    })
    return upsertPool(payload)
  }, [senswap, upsertPool])

  const watch = useCallback(() => {
    const { connection } = senswap.program.provider
    const id = connection.onProgramAccountChange(
      senswap.program.account.pool.programId,
      ({
        accountId,
        accountInfo: { data },
      }: {
        accountId: PublicKey
        accountInfo: { data: Buffer }
      }) => {
        const accountData = senswap.program.coder.accounts.decode('pool', data)
        return upsertPool({ [accountId.toBase58()]: accountData })
      },
      'confirmed',
    )
    return () => {
      connection.removeProgramAccountChangeListener(id)
    }
  }, [senswap, upsertPool])

  useEffect(() => {
    fetch()
    return watch()
  }, [fetch, watch])

  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

/**
 * Get all Pools
 * @returns Pool list
 */
export const usePools = () => {
  const pools = usePoolStore(({ pools }) => pools)
  return pools
}

/**
 * Get pool data by pool address
 * @returns PoolData
 */
export const usePoolByAddress = (poolAddress: string) => {
  const pool = usePoolStore(({ pools }) => pools[poolAddress]) || DUMMY_POOL
  return pool
}
