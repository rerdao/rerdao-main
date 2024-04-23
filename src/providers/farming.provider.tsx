'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { FarmData, DebtData, RewardData, BoostingData } from '@sentre/farming'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { produce } from 'immer'
import { MemcmpFilter, PublicKey, SystemProgram } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnmount } from 'react-use'
import BN from 'bn.js'

import { env } from '@/configs/env'
import { useFarming } from '@/hooks/farming.hook'

export type SortState = -1 | 0 | 1
export type FarmingStore = {
  farms: Record<string, FarmData>
  upsertFarms: (newFarms: Record<string, FarmData>) => void
  debts: Record<string, DebtData>
  upsertDebts: (newDebts: Record<string, DebtData>) => void
  rewards: Record<string, RewardData>
  upsertRewards: (newRewards: Record<string, RewardData>) => void
  boostings: Record<string, BoostingData>
  upsertBoostings: (newBoostings: Record<string, BoostingData>) => void
  sortedByLiquidity: SortState
  setSortedByLiquidity: (value: SortState) => void
  sortedByApr: SortState
  setSortedByApr: (value: SortState) => void
  nftBoosted: boolean
  setNftBoosted: (value: boolean) => void
  unmount: () => void
}

/**
 * Store
 */
export const useFarmingStore = create<FarmingStore>()(
  devtools(
    (set) => ({
      farms: {},
      upsertFarms: (newFarms: Record<string, FarmData>) =>
        set(
          produce<FarmingStore>(({ farms }) => {
            Object.keys(newFarms).forEach((farmAddress) => {
              if (!farms[farmAddress])
                farms[farmAddress] = newFarms[farmAddress]
              else Object.assign(farms[farmAddress], newFarms[farmAddress])
            })
          }),
          false,
          'upsertFarms',
        ),
      debts: {},
      upsertDebts: (newDebts: Record<string, DebtData>) =>
        set(
          produce<FarmingStore>(({ debts }) => {
            Object.keys(newDebts).forEach((debtAddress) => {
              if (!debts[debtAddress])
                debts[debtAddress] = newDebts[debtAddress]
              else Object.assign(debts[debtAddress], newDebts[debtAddress])
            })
          }),
          false,
          'upsertDebts',
        ),
      rewards: {},
      upsertRewards: (newRewards: Record<string, RewardData>) =>
        set(
          produce<FarmingStore>(({ rewards }) => {
            Object.keys(newRewards).forEach((rewardAddress) => {
              if (!rewards[rewardAddress])
                rewards[rewardAddress] = newRewards[rewardAddress]
              else
                Object.assign(rewards[rewardAddress], newRewards[rewardAddress])
            })
          }),
          false,
          'upsertRewards',
        ),
      boostings: {},
      upsertBoostings: (newBoostings: Record<string, BoostingData>) =>
        set(
          produce<FarmingStore>(({ boostings }) => {
            Object.keys(newBoostings).forEach((boostingAddress) => {
              if (!boostings[boostingAddress])
                boostings[boostingAddress] = newBoostings[boostingAddress]
              else
                Object.assign(
                  boostings[boostingAddress],
                  newBoostings[boostingAddress],
                )
            })
          }),
          false,
          'upsertBoostings',
        ),
      sortedByLiquidity: 0,
      setSortedByLiquidity: (sortedByLiquidity) =>
        set({ sortedByLiquidity }, false, 'setSortedByLiquidity'),
      sortedByApr: 0,
      setSortedByApr: (sortedByApr) =>
        set({ sortedByApr }, false, 'setSortedByApr'),
      nftBoosted: false,
      setNftBoosted: (nftBoosted: boolean) =>
        set({ nftBoosted }, false, 'setNftBoosted'),
      unmount: () =>
        set(
          { farms: {}, debts: {}, rewards: {}, boostings: {} },
          false,
          'unmount',
        ),
    }),
    {
      name: 'farming',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export default function FarmingProvider({ children }: { children: ReactNode }) {
  const farming = useFarming()
  const { publicKey } = useWallet()
  const upsertFarms = useFarmingStore(({ upsertFarms }) => upsertFarms)
  const upsertDebts = useFarmingStore(({ upsertDebts }) => upsertDebts)
  const upsertRewards = useFarmingStore(({ upsertRewards }) => upsertRewards)
  const upsertBoostings = useFarmingStore(
    ({ upsertBoostings }) => upsertBoostings,
  )
  const unmount = useFarmingStore(({ unmount }) => unmount)
  const watchFarming = useCallback(
    (
      key: 'farm' | 'debt' | 'farmRewardMint' | 'farmBoostingCollection',
      upsertCallback: (data: Record<string, any>) => void,
      filter?: MemcmpFilter[],
    ) => {
      const { connection } = farming.program.provider
      const id = connection.onProgramAccountChange(
        farming.program.account.farm.programId,
        ({ accountId, accountInfo: { data } }) => {
          const accountData = farming.program.coder.accounts.decode(key, data)
          upsertCallback({ [accountId.toBase58()]: accountData })
        },
        'confirmed',
        filter,
      )
      return () => {
        connection.removeProgramAccountChangeListener(id)
      }
    },
    [farming],
  )

  const filter = useMemo(() => {
    if (!publicKey) return undefined
    return [{ memcmp: { bytes: publicKey.toBase58(), offset: 40 } }]
  }, [publicKey])

  const fetchFarms = useCallback(async () => {
    const data: Array<{ publicKey: PublicKey; account: FarmData }> =
      (await farming.program.account.farm.all()) as any
    const farms: Record<string, FarmData> = {}
    data.forEach(
      ({ publicKey, account }) => (farms[publicKey.toBase58()] = account),
    )
    return upsertFarms(farms)
  }, [farming, upsertFarms])

  useEffect(() => {
    fetchFarms()
    const unwatch = watchFarming('farm', upsertFarms)
    return unwatch
  }, [fetchFarms, upsertFarms, watchFarming])

  const fetchDebts = useCallback(async () => {
    if (!filter) return upsertDebts({})
    const data: Array<{ publicKey: PublicKey; account: DebtData }> =
      await farming.program.account.debt.all(filter)
    const debts: Record<string, DebtData> = {}
    data.forEach(
      ({ publicKey, account }) => (debts[publicKey.toBase58()] = account),
    )
    return upsertDebts(debts)
  }, [farming, filter, upsertDebts])

  useEffect(() => {
    fetchDebts()
    const unwatch = watchFarming('debt', upsertDebts, filter)
    return unwatch
  }, [fetchDebts, filter, upsertDebts, watchFarming])

  const fetchRewards = useCallback(async () => {
    const data: Array<{ publicKey: PublicKey; account: RewardData }> =
      await farming.program.account.farmRewardMint.all()
    const rewards: Record<string, RewardData> = {}
    data.forEach(
      ({ publicKey, account }) => (rewards[publicKey.toBase58()] = account),
    )
    return upsertRewards(rewards)
  }, [farming, upsertRewards])

  useEffect(() => {
    fetchRewards()
    const unwatch = watchFarming('farmRewardMint', upsertRewards)
    return unwatch
  }, [fetchRewards, upsertRewards, watchFarming])

  const fetchBoostings = useCallback(async () => {
    const data: Array<{ publicKey: PublicKey; account: BoostingData }> =
      await farming.program.account.farmBoostingCollection.all()
    const boostings: Record<string, BoostingData> = {}
    data.forEach(
      ({ publicKey, account }) => (boostings[publicKey.toBase58()] = account),
    )
    return upsertBoostings(boostings)
  }, [farming, upsertBoostings])

  useEffect(() => {
    fetchBoostings()
    const unwatch = watchFarming('farmBoostingCollection', upsertBoostings)
    return unwatch
  }, [fetchBoostings, upsertBoostings, watchFarming])

  useUnmount(unmount)

  return <Fragment>{children}</Fragment>
}

/**
 * Get all farms
 * @returns Farm list
 */
export const useAllFarms = () => {
  const farms = useFarmingStore(({ farms }) => farms)
  return farms
}

export const useFarmByAddress = (farmAddress: string) => {
  const farm = useFarmingStore(
    ({ farms }) =>
      farms[farmAddress] || {
        authority: SystemProgram.programId,
        inputMint: SystemProgram.programId,
        moMint: SystemProgram.programId,
        totalShares: new BN(0),
        totalRewards: new BN(0),
        compensation: new BN(0),
        startDate: new BN(0),
        endDate: new BN(1),
      },
  )
  return farm
}

/**
 * Get all debts
 * @returns Debt list
 */
export const useAllDebts = () => {
  const debts = useFarmingStore(({ debts }) => debts)
  return debts
}

/**
 * Get debt by farm address
 * @param farmAddress Farm address
 * @returns Debt
 */
export const useDebtByFarmAddress = (farmAddress: string) => {
  const debt = useFarmingStore(({ debts }) =>
    Object.values(debts).find(({ farm }) => farm.toBase58() === farmAddress),
  )
  return debt
}

/**
 * Get rewards by farm address
 * @param farmAddress Farm address
 * @returns Rewards
 */
export const useRewardsByFarmAddress = (farmAddress: string) => {
  const rewards = useFarmingStore(({ rewards }) =>
    Object.values(rewards).filter(
      ({ farm }) => farm.toBase58() === farmAddress,
    ),
  )
  return rewards
}

/**
 * Get all boostings
 * @returns Boosting list
 */
export const useAllBoostings = () => {
  const boostings = useFarmingStore(({ boostings }) => boostings)
  return boostings
}

/**
 * Get boosting by farm address
 * @param farmAddress Farm address
 * @returns Boosting
 */
export const useBoostingByFarmAddress = (farmAddress: string) => {
  const boosting = useFarmingStore(({ boostings }) =>
    Object.values(boostings).filter(
      ({ farm }) => farm.toBase58() === farmAddress,
    ),
  )
  return boosting
}

/**
 * Use sorted by liquidity
 */
export const useSortedByLiquidity = () => {
  const { sortedByLiquidity, setSortedByLiquidity } = useFarmingStore(
    ({ sortedByLiquidity, setSortedByLiquidity }) => ({
      sortedByLiquidity,
      setSortedByLiquidity,
    }),
  )
  return { sortedByLiquidity, setSortedByLiquidity }
}

/**
 * Use sorted by APR
 */
export const useSortedByApr = () => {
  const { sortedByApr, setSortedByApr } = useFarmingStore(
    ({ sortedByApr, setSortedByApr }) => ({
      sortedByApr,
      setSortedByApr,
    }),
  )
  return { sortedByApr, setSortedByApr }
}

/**
 * Use sorted by APR
 */
export const useNftBoosted = () => {
  const { nftBoosted, setNftBoosted } = useFarmingStore(
    ({ nftBoosted, setNftBoosted }) => ({
      nftBoosted,
      setNftBoosted,
    }),
  )
  return { nftBoosted, setNftBoosted }
}
