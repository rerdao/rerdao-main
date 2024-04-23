'use client'
import { useCallback, useState } from 'react'
import { PoolStates } from '@sentre/senswap'

import CardDescription from './cardDescription'

import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'

export type ThawPoolProps = { poolAddress: string }

export default function ThawPool({ poolAddress }: ThawPoolProps) {
  const [loading, setLoading] = useState(false)

  const { thawPool } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onThawPool = useCallback(async () => {
    setLoading(true)
    try {
      const txId = await thawPool()
      return pushMessage(
        'alert-success',
        'Successfully resume the pool. Click here to view details,',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [thawPool, pushMessage])

  return (
    <div className="flex flex-col gap-4">
      <CardDescription
        state={PoolStates.Frozen}
        description="Unfreeze a pool will active all actions"
      />

      <button
        onClick={onThawPool}
        className="btn btn-success w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Resume
      </button>
    </div>
  )
}
