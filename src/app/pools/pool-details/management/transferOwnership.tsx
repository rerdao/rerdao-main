'use client'
import { useState } from 'react'

import { Info } from 'lucide-react'

import { isAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'

export type TransferOwnershipProps = {
  poolAddress: string
}

export default function TransferOwnership({
  poolAddress,
}: TransferOwnershipProps) {
  const [newOwner, setNewOwner] = useState('')
  const [loading, setLoading] = useState(false)

  const { transferOwnership } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const transferOwner = async () => {
    setLoading(true)
    if (!isAddress(newOwner)) return
    try {
      const txId = await transferOwnership(newOwner)
      return pushMessage('alert-success', 'Successfully Update Owner Pool', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
      setNewOwner('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center">
        <Info className="w-4 h-4" />
        <p className="text-sm opacity-60">
          Your current account will lose the pool control when you transfer
          ownership.
        </p>
      </div>
      <p className="text-sm">Transfer to Owner</p>
      <input
        type="text"
        placeholder="E.g. AgTMC..."
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
        className="input p-3 text-sm bg-base-200 w-full rounded-full focus:outline-none"
      />
      <button
        disabled={!newOwner}
        onClick={transferOwner}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Transfer
      </button>
    </div>
  )
}
