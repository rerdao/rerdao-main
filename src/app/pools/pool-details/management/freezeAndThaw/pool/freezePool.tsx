'use client'
import { useCallback, useState } from 'react'
import { PoolStates } from '@sentre/senswap'

import { Snowflake } from 'lucide-react'
import CardDescription from './cardDescription'

import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'

export type FreezePoolProps = { poolAddress: string }

export default function FreezePool({ poolAddress }: FreezePoolProps) {
  const [loading, setLoading] = useState(false)
  const { freezePool } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onFreezePool = useCallback(async () => {
    setLoading(true)
    try {
      const txId = await freezePool()
      return pushMessage(
        'alert-success',
        'Successfully pause the pool. Click here to view details.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
    }
  }, [freezePool, pushMessage])

  return (
    <div className="flex flex-col gap-4">
      <CardDescription
        state={PoolStates.Initialized}
        description="Pausing a pool will prevent all actions until the pool has been resumed."
      />

      <button
        onClick={onFreezePool}
        className="btn btn-error w-full rounded-full"
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          <Snowflake className="w-4 h-4" />
        )}
        Pause
      </button>
    </div>
  )
}
