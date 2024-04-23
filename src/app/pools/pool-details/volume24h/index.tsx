'use client'
import { Fragment, useMemo } from 'react'

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

import { numeric } from '@/helpers/utils'
import { VolumeData, useVol24h } from '@/hooks/pool.hook'
import classNames from 'classnames'
import Empty from '@/components/empty'

export default function Volume24h({ poolAddress }: { poolAddress: string }) {
  const { vols, vol24h } = useVol24h(poolAddress)

  const vol24hIn7Date = useMemo(() => {
    if (!vols) return []
    const { volumes } = vols
    const data: VolumeData[] = []
    for (const ymd in volumes) {
      const m = ymd.slice(4, 6)
      const d = ymd.slice(6, 8)

      data.push({ data: volumes[ymd], label: `${d}/${m}` })
    }
    return data
  }, [vols])

  return (
    <div className="card rounded-box p-6 bg-base-100 border border-base-300 flex flex-col gap-6">
      <div className="flex items-center">
        <p className="flex-auto">Volume 24h</p>
        <h5>{numeric(vol24h).format('0,0.[0]a$')}</h5>
      </div>
      <div className="flex flex-row items-center justify-center h-[278px] ">
        <ResponsiveContainer className="w-full h-full">
          <BarChart data={vol24hIn7Date} className="cursor-pointer">
            <XAxis dataKey="label" className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return <Fragment />
                const [
                  {
                    payload: { label, data },
                  },
                ] = payload
                return (
                  <div className="card rounded-box p-4 bg-base-100 border-2 border-base-300 flex flex-col">
                    <p>{label}</p>
                    <p className="font-bold">
                      {numeric(data).format('$0,0.[00]')}
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="data" fill="#63E0B3" />
          </BarChart>
        </ResponsiveContainer>
        <div
          className={classNames(
            'h-full w-full flex flex-row justify-center items-center absolute top-0 left-0 backdrop-blur rounded-box',
            {
              visible: !vol24hIn7Date.length,
              invisible: !!vol24hIn7Date.length,
            },
          )}
        >
          <Empty />
        </div>
      </div>
    </div>
  )
}
