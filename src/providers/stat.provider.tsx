'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'

import { env } from '@/configs/env'
import solConfig from '@/configs/sol.config'

type VolumeData = {
  volumes: Record<string, number>
  totalVol: number
}
export type StatStore = {
  volumes: Record<string, VolumeData>
  poolsTvl: Record<string, number>
  totalTvl: number
  setTotalTvl: (tvl: number) => void
  upsertPoolTvl: (newPoolsTvl: Record<string, number>) => void
  upsertVolumes: (volumes: Record<string, VolumeData>) => void
}

/**
 * Store
 */

export const usePoolStatStore = create<StatStore>()(
  devtools(
    (set) => ({
      poolsTvl: {},
      volumes: {},
      totalTvl: 0,
      upsertPoolTvl: (poolsTvl) => set({ poolsTvl }, false, 'upsertPoolTvl'),
      upsertVolumes: (volumes) => set({ volumes }, false, 'upsertVolumes'),
      setTotalTvl: (totalTvl) => set({ totalTvl }, false, 'setTotalTvl'),
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

export function PoolStatProvider({ children }: { children: ReactNode }) {
  const upsertPoolTvl = usePoolStatStore(({ upsertPoolTvl }) => upsertPoolTvl)
  const setTotalTvl = usePoolStatStore(({ setTotalTvl }) => setTotalTvl)
  const upsertVolumes = usePoolStatStore(({ upsertVolumes }) => upsertVolumes)

  const fetchPoolsTvl = useCallback(async () => {
    try {
      // Fetch all pool tvl
      const { data: poolsTvl } = await axios.get(
        solConfig.statRpc + `stat/balansol/all-tvl`,
      )
      upsertPoolTvl(poolsTvl)

      // Fetch total balansol tvl
      const { data } = await axios.get(
        solConfig.statRpc + `stat/total-tvl/${solConfig.senswapAddress}`,
      )
      setTotalTvl(data.totalTvl)

      // Fetch all pool vol24h
      const { data: volumes } = await axios.get(
        solConfig.statRpc + `stat/balansol/all-volume`,
      )
      upsertVolumes(volumes)
    } catch (error) {
      console.log('Fetching stat error: ', error)
    }
  }, [setTotalTvl, upsertPoolTvl, upsertVolumes])

  useEffect(() => {
    fetchPoolsTvl()
  }, [fetchPoolsTvl])

  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

/**
 * Get all Pools tvl
 * @returns Pool tvl list
 */
export const usePoolsTvl = () => {
  const poolsTvl = usePoolStatStore(({ poolsTvl }) => poolsTvl)
  return poolsTvl
}

/**
 * Get Pools tvl
 * @returns Pool tvl
 */
export const usePoolTvl = (poolAddress: string) => {
  const tvl = usePoolStatStore(({ poolsTvl }) => poolsTvl[poolAddress]) || 0
  return tvl
}

/**
 * Get Pools tvl
 * @returns Pool tvl
 */
export const usePoolVolumesIn7Days = (poolAddress: string) => {
  const vols = usePoolStatStore(({ volumes }) => volumes[poolAddress]) || {
    volumes: {},
    totalVol: 0,
  }
  return vols
}

/**
 * Get total tvl
 * @returns total tvl
 */
export const useTotalPoolTvl = () => {
  const totalTvl = usePoolStatStore(({ totalTvl }) => totalTvl)
  return totalTvl
}
