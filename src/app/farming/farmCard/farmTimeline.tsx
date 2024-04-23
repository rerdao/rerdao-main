'use client'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { CSSProperties, useState } from 'react'
import { useInterval } from 'react-use'

import { useFarmByAddress } from '@/providers/farming.provider'

dayjs.extend(duration)

export type FarmTimelineProps = {
  farmAddress: string
}

export default function FarmTimeline({ farmAddress }: FarmTimelineProps) {
  const [current, setCurrent] = useState(Date.now())
  const { startDate, endDate } = useFarmByAddress(farmAddress)

  useInterval(() => setCurrent(Date.now()), 1000)

  const start = startDate.toNumber() * 1000
  const startDuration = dayjs.duration(start - current)
  const end = endDate.toNumber() * 1000
  const endDuration = dayjs.duration(end - current)

  if (end < current) return <div className="badge badge-neutral">Expired</div>
  if (start > current)
    return (
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm opacity-60">Started in</p>
        <span className="join">
          <div className="badge badge-neutral join-item">
            {startDuration.days()}D
          </div>
          <div className="badge badge-neutral join-item">
            {startDuration.hours()}h
          </div>
          <div className="badge badge-neutral join-item">
            {startDuration.minutes()}m
          </div>
        </span>
      </div>
    )
  return (
    <div className="flex flex-row items-center gap-2">
      <p className="text-sm opacity-60">Ended in</p>
      <span className="join">
        <div className="badge badge-accent join-item">
          {Math.floor(endDuration.asDays())}D
        </div>
        <div className="badge badge-accent join-item">
          {endDuration.hours()}h
        </div>
        <div className="badge badge-accent join-item">
          {endDuration.minutes()}m
        </div>
      </span>
      <div
        className="radial-progress bg-accent text-accent-content border-2 border-accent text-xs"
        style={
          {
            '--value': Math.round(((current - start) / (end - start)) * 100),
            '--thickness': '3px',
            '--size': '1rem',
          } as CSSProperties
        }
      />
    </div>
  )
}
