'use client'
import { useMemo, useState } from 'react'
import classNames from 'classnames'
import isEqual from 'react-fast-compare'
import { PoolStates } from '@sentre/senswap'

import FreezePool from './pool/freezePool'
import ThawPool from './pool/thawPool'
import FreezeAndThawToken from './token'

import { usePoolByAddress } from '@/providers/pools.provider'

export type FreezeAndThawProps = {
  poolAddress: string
}

export default function FreezeAndThaw({ poolAddress }: FreezeAndThawProps) {
  const [activeTab, setActiveTab] = useState('pool')
  const { state } = usePoolByAddress(poolAddress)

  const renderedBodyComponent = useMemo(() => {
    if (activeTab !== 'pool')
      return <FreezeAndThawToken poolAddress={poolAddress} />
    if (isEqual(state, PoolStates.Frozen))
      return <ThawPool poolAddress={poolAddress} />
    return <FreezePool poolAddress={poolAddress} />
  }, [activeTab, state, poolAddress])

  return (
    <div className="flex flex-col gap-4">
      <div className="tabs tabs-boxed bg-inherit gap-4">
        <div
          onClick={() => setActiveTab('pool')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'pool',
          })}
        >
          Pool
        </div>
        <div
          onClick={() => setActiveTab('individual_token')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'individual_token',
          })}
        >
          Individual token
        </div>
      </div>
      <div>{renderedBodyComponent}</div>
    </div>
  )
}
