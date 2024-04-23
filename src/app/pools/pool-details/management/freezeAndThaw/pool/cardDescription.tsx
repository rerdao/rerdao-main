'use client'
import { PoolState, PoolStates } from '@sentre/senswap'
import classNames from 'classnames'
import isEqual from 'react-fast-compare'

import { Info } from 'lucide-react'
import { useMemo } from 'react'

export default function CardDescription({
  description,
  state = PoolStates.Uninitialized,
}: {
  description: string
  state?: PoolState
}) {
  const status = useMemo(() => {
    if (isEqual(state, PoolStates.Initialized)) return 'Active'
    if (isEqual(state, PoolStates.Frozen)) return 'Paused'
    return 'Loading'
  }, [state])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <Info className="w-4 h-4" />
        <p className="text-xs">{description}</p>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div
          className={classNames('badge badge-xs', {
            'badge-primary': isEqual(state, PoolStates.Frozen),
            'bg-accent': isEqual(state, PoolStates.Initialized),
          })}
        />
        <p className="text-sm">Current status: {status}</p>
      </div>
    </div>
  )
}
